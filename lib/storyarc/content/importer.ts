import { createHash } from "node:crypto";
import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { validateStoryArcContentPackage } from "./schema";

export type StoryArcImportReport = {
  ok: boolean;
  dryRun: boolean;
  packageId: string | null;
  validation: ReturnType<typeof validateStoryArcContentPackage>;
  creates: string[];
  unchanged: string[];
  conflicts: string[];
};

function revisionHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function asJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function importStoryArcContentPackage(
  input: unknown,
  options: { dryRun: boolean; actorId: string },
  db: PrismaClient = prisma,
): Promise<StoryArcImportReport> {
  const validation = validateStoryArcContentPackage(input);
  const report: StoryArcImportReport = {
    ok: validation.valid,
    dryRun: options.dryRun,
    packageId: validation.packageId,
    validation,
    creates: [],
    unchanged: [],
    conflicts: [],
  };

  if (!validation.valid || !validation.package) return report;
  const pkg = validation.package;

  const existing = await db.storyArcContentItem.findMany({
    where: { stableId: { in: pkg.items.map((item) => item.stableId) } },
    include: { revisions: true },
  });
  const existingByStableId = new Map(existing.map((item) => [item.stableId, item]));

  for (const item of pkg.items) {
    const key = `${item.stableId}@${item.revision}`;
    const hash = revisionHash(item);
    const prior = existingByStableId.get(item.stableId)?.revisions.find((revision) => revision.revision === item.revision);
    if (!prior) report.creates.push(key);
    else if (prior.contentHash === hash) report.unchanged.push(key);
    else report.conflicts.push(key);
  }

  if (report.conflicts.length > 0) {
    report.ok = false;
    return report;
  }
  if (options.dryRun) return report;

  await db.$transaction(async (tx) => {
    const source = await tx.storyArcCurriculumSource.upsert({
      where: { sourceKey: pkg.curriculum.sourceKey },
      create: {
        sourceKey: pkg.curriculum.sourceKey,
        title: pkg.curriculum.sourceTitle,
        authority: pkg.curriculum.sourceAuthority,
        reference: pkg.curriculum.sourceReference,
        verificationNote: pkg.curriculum.sourceVerificationNote,
      },
      update: {
        title: pkg.curriculum.sourceTitle,
        authority: pkg.curriculum.sourceAuthority,
        reference: pkg.curriculum.sourceReference,
        verificationNote: pkg.curriculum.sourceVerificationNote,
      },
    });

    const curriculumVersion = await tx.storyArcCurriculumVersion.upsert({
      where: { sourceId_versionKey: { sourceId: source.id, versionKey: pkg.curriculum.versionKey } },
      create: { sourceId: source.id, versionKey: pkg.curriculum.versionKey, title: pkg.curriculum.versionTitle },
      update: { title: pkg.curriculum.versionTitle },
    });

    const competencyIds = new Map<string, string>();
    for (const competency of pkg.competencies) {
      const stored = await tx.storyArcCompetency.upsert({
        where: {
          curriculumVersionId_competencyKey: {
            curriculumVersionId: curriculumVersion.id,
            competencyKey: competency.competencyKey,
          },
        },
        create: {
          curriculumVersionId: curriculumVersion.id,
          competencyKey: competency.competencyKey,
          title: competency.title,
          description: competency.description,
          authoritativeRef: competency.authoritativeRef,
        },
        update: {
          title: competency.title,
          description: competency.description,
          authoritativeRef: competency.authoritativeRef,
        },
      });
      competencyIds.set(competency.competencyKey, stored.id);
    }

    const objectiveIds = new Map<string, string>();
    for (const objective of pkg.objectives) {
      const competencyId = competencyIds.get(objective.competencyKey);
      if (!competencyId) throw new Error(`Validated competency disappeared: ${objective.competencyKey}`);
      const stored = await tx.storyArcLearningObjective.upsert({
        where: {
          curriculumVersionId_objectiveKey: {
            curriculumVersionId: curriculumVersion.id,
            objectiveKey: objective.objectiveKey,
          },
        },
        create: {
          curriculumVersionId: curriculumVersion.id,
          competencyId,
          objectiveKey: objective.objectiveKey,
          title: objective.title,
          primarySkill: objective.primarySkill,
        },
        update: {
          competencyId,
          title: objective.title,
          primarySkill: objective.primarySkill,
        },
      });
      objectiveIds.set(objective.objectiveKey, stored.id);
    }

    for (const item of pkg.items) {
      const hash = revisionHash(item);
      const storedItem = await tx.storyArcContentItem.upsert({
        where: { stableId: item.stableId },
        create: {
          stableId: item.stableId,
          curriculumVersionId: curriculumVersion.id,
          kind: item.kind,
          grade: item.grade,
          track: item.track,
          phase: item.phase,
        },
        update: {},
      });
      const prior = await tx.storyArcContentRevision.findUnique({
        where: { itemId_revision: { itemId: storedItem.id, revision: item.revision } },
      });
      if (prior) {
        if (prior.contentHash !== hash) throw new Error(`Revision conflict for ${item.stableId}@${item.revision}`);
        continue;
      }
      const revision = await tx.storyArcContentRevision.create({
        data: {
          itemId: storedItem.id,
          revision: item.revision,
          schemaVersion: pkg.schemaVersion,
          contentHash: hash,
          title: item.title,
          state: "DRAFT",
          primarySkill: item.primarySkill,
          supportingSkills: item.supportingSkills,
          payload: asJson(item.content),
          validationReport: asJson({ errors: validation.errors, warnings: validation.warnings }),
          sourceMetadata: asJson(item.sourceMetadata),
          createdById: options.actorId,
        },
      });
      await tx.storyArcRevisionObjective.createMany({
        data: item.objectiveKeys.map((objectiveKey, index) => ({
          revisionId: revision.id,
          objectiveId: objectiveIds.get(objectiveKey) as string,
          isPrimary: index === 0,
        })),
      });
    }
  });

  return report;
}
