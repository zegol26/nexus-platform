import type { StoryArcContentState } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { importStoryArcContentPackage, type StoryArcImportReport } from "./importer";
import {
  STORYARC_CANONICAL_RELEASE_PACKAGES,
  STORYARC_CANONICAL_RELEASE_SIZE,
} from "./release-packages";

type ReleasePackageReport = Pick<
  StoryArcImportReport,
  "ok" | "packageId" | "creates" | "unchanged" | "conflicts"
> & {
  file: string;
  errors: number;
  warnings: number;
};

type ReleaseResult = {
  mode: "CHECK" | "PUBLISH";
  ok: boolean;
  packages: ReleasePackageReport[];
  catalog: {
    expected: number;
    targeted: number;
    published: number;
    byTrack: Record<string, number>;
    byGrade: Record<string, number>;
  };
};

const publishableStates: StoryArcContentState[] = [
  "DRAFT",
  "VALIDATING",
  "IN_REVIEW",
  "APPROVED",
  "PUBLISHED",
];

function summarizeReport(file: string, report: StoryArcImportReport): ReleasePackageReport {
  return {
    file,
    ok: report.ok,
    packageId: report.packageId,
    creates: report.creates,
    unchanged: report.unchanged,
    conflicts: report.conflicts,
    errors: report.validation.errors.length,
    warnings: report.validation.warnings.length,
  };
}

function releaseIdentities() {
  return STORYARC_CANONICAL_RELEASE_PACKAGES.flatMap(({ content }) =>
    content.items.map((item) => ({ stableId: item.stableId, revision: item.revision })),
  );
}

function countBy(values: string[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

async function getReleaseCatalog() {
  const identities = releaseIdentities();
  const revisions = await prisma.storyArcContentRevision.findMany({
    where: {
      OR: identities.map(({ stableId, revision }) => ({
        revision,
        item: { stableId },
      })),
    },
    include: { item: true },
    orderBy: [{ item: { stableId: "asc" } }, { revision: "asc" }],
  });

  return {
    revisions,
    catalog: {
      expected: STORYARC_CANONICAL_RELEASE_SIZE,
      targeted: revisions.length,
      published: revisions.filter((revision) => revision.state === "PUBLISHED").length,
      byTrack: countBy(
        revisions
          .filter((revision) => revision.state === "PUBLISHED")
          .map((revision) => revision.item.track),
      ),
      byGrade: countBy(
        revisions
          .filter((revision) => revision.state === "PUBLISHED")
          .map((revision) => revision.item.grade),
      ),
    },
  };
}

export async function checkStoryArcCanonicalRelease(adminId: string): Promise<ReleaseResult> {
  const reports: ReleasePackageReport[] = [];
  for (const { file, content } of STORYARC_CANONICAL_RELEASE_PACKAGES) {
    const report = await importStoryArcContentPackage(content, {
      dryRun: true,
      actorId: adminId,
    });
    reports.push(summarizeReport(file, report));
  }

  const { catalog } = await getReleaseCatalog();
  return {
    mode: "CHECK",
    ok: reports.every((report) => report.ok),
    packages: reports,
    catalog,
  };
}

export async function publishStoryArcCanonicalRelease(adminId: string): Promise<ReleaseResult> {
  const check = await checkStoryArcCanonicalRelease(adminId);
  if (!check.ok) {
    throw new Error("Canonical release validation failed. No content was imported.");
  }

  const reports: ReleasePackageReport[] = [];
  for (const { file, content } of STORYARC_CANONICAL_RELEASE_PACKAGES) {
    const report = await importStoryArcContentPackage(content, {
      dryRun: false,
      actorId: adminId,
    });
    if (!report.ok) {
      throw new Error(`Canonical release import failed for ${file}.`);
    }
    reports.push(summarizeReport(file, report));
  }

  const before = await getReleaseCatalog();
  if (before.revisions.length !== STORYARC_CANONICAL_RELEASE_SIZE) {
    throw new Error(
      `Expected ${STORYARC_CANONICAL_RELEASE_SIZE} canonical revisions, found ${before.revisions.length}.`,
    );
  }

  const invalidState = before.revisions.find(
    (revision) => !publishableStates.includes(revision.state),
  );
  if (invalidState) {
    throw new Error(
      `${invalidState.item.stableId}@${invalidState.revision} cannot be republished from ${invalidState.state}.`,
    );
  }

  const invalidValidation = before.revisions.find((revision) => {
    const errors =
      revision.validationReport &&
      typeof revision.validationReport === "object" &&
      !Array.isArray(revision.validationReport)
        ? (revision.validationReport as { errors?: unknown }).errors
        : null;
    return !Array.isArray(errors) || errors.length > 0;
  });
  if (invalidValidation) {
    throw new Error(
      `${invalidValidation.item.stableId}@${invalidValidation.revision} has blocking validation errors.`,
    );
  }

  const idsByState = (states: StoryArcContentState[]) =>
    before.revisions
      .filter((revision) => states.includes(revision.state))
      .map((revision) => revision.id);
  const targetIds = before.revisions.map((revision) => revision.id);
  const itemIds = before.revisions.map((revision) => revision.itemId);
  const now = new Date();

  await prisma.$transaction(
    async (tx) => {
      const draftIds = idsByState(["DRAFT"]);
      if (draftIds.length > 0) {
        await tx.storyArcContentRevision.updateMany({
          where: { id: { in: draftIds } },
          data: { state: "VALIDATING" },
        });
      }

      const validatingIds = idsByState(["DRAFT", "VALIDATING"]);
      if (validatingIds.length > 0) {
        await tx.storyArcContentRevision.updateMany({
          where: { id: { in: validatingIds } },
          data: { state: "IN_REVIEW" },
        });
      }

      const reviewIds = idsByState(["DRAFT", "VALIDATING", "IN_REVIEW"]);
      if (reviewIds.length > 0) {
        await tx.storyArcContentRevision.updateMany({
          where: { id: { in: reviewIds } },
          data: {
            state: "APPROVED",
            reviewedById: adminId,
            reviewedAt: now,
            approvedById: adminId,
            approvedAt: now,
          },
        });
      }

      const publishIds = idsByState(["DRAFT", "VALIDATING", "IN_REVIEW", "APPROVED"]);
      if (publishIds.length > 0) {
        await tx.storyArcContentRevision.updateMany({
          where: {
            itemId: { in: itemIds },
            state: "PUBLISHED",
            id: { notIn: targetIds },
          },
          data: { state: "SUPERSEDED", retiredAt: now },
        });
        await tx.storyArcContentRevision.updateMany({
          where: { id: { in: publishIds } },
          data: { state: "PUBLISHED", publishedAt: now },
        });
      }
    },
    { maxWait: 10_000, timeout: 30_000 },
  );

  const after = await getReleaseCatalog();
  if (after.catalog.published !== STORYARC_CANONICAL_RELEASE_SIZE) {
    throw new Error(
      `Publication verification failed: ${after.catalog.published}/${STORYARC_CANONICAL_RELEASE_SIZE} published.`,
    );
  }

  return {
    mode: "PUBLISH",
    ok: true,
    packages: reports,
    catalog: after.catalog,
  };
}
