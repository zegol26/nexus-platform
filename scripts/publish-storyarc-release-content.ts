import "dotenv/config";
import { prisma } from "../lib/db/prisma";
import { canTransitionStoryArcContent, type StoryArcContentStateKey } from "../lib/storyarc/content/lifecycle";

const importActorId = "codex-storyarc-release-repair-20260714";
const lifecycle: StoryArcContentStateKey[] = ["VALIDATING", "IN_REVIEW", "APPROVED", "PUBLISHED"];

function hasValidationErrors(report: unknown) {
  if (!report || typeof report !== "object") return true;
  const errors = (report as { errors?: unknown }).errors;
  return !Array.isArray(errors) || errors.length > 0;
}

async function main() {
  try {
    const targetStableIds = (process.env.STORYARC_STABLE_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true, email: true },
      orderBy: { createdAt: "asc" },
    });
    if (!admin) throw new Error("An admin user is required to approve the StoryArc release.");

    const drafts = await prisma.storyArcContentRevision.findMany({
      where: {
        state: "DRAFT",
        createdById: importActorId,
        ...(targetStableIds.length > 0
          ? { item: { stableId: { in: targetStableIds } } }
          : {}),
      },
      include: { item: true },
      orderBy: [{ item: { stableId: "asc" } }, { revision: "asc" }],
    });
    if (drafts.length === 0) {
      console.log(JSON.stringify({ published: 0, message: "No imported StoryArc release drafts remain." }, null, 2));
      return;
    }
    if (targetStableIds.length === 0 && drafts.length !== 90) {
      throw new Error(`Expected 90 imported release drafts, found ${drafts.length}.`);
    }
    if (targetStableIds.length > 0) {
      const found = new Set(drafts.map((revision) => revision.item.stableId));
      const missing = targetStableIds.filter((stableId) => !found.has(stableId));
      if (missing.length > 0) throw new Error(`Missing targeted drafts: ${missing.join(", ")}.`);
    }
    const invalid = drafts.filter((revision) => hasValidationErrors(revision.validationReport));
    if (invalid.length > 0) throw new Error(`${invalid.length} StoryArc drafts have blocking validation errors.`);

    const now = new Date();
    await prisma.$transaction(async (tx) => {
      for (const revision of drafts) {
        let current = revision.state as StoryArcContentStateKey;
        for (const target of lifecycle) {
          if (!canTransitionStoryArcContent(current, target)) {
            throw new Error(`Invalid lifecycle transition ${revision.item.stableId}: ${current} -> ${target}`);
          }
          if (target === "PUBLISHED") {
            await tx.storyArcContentRevision.updateMany({
              where: { itemId: revision.itemId, state: "PUBLISHED", id: { not: revision.id } },
              data: { state: "SUPERSEDED", retiredAt: now },
            });
          }
          await tx.storyArcContentRevision.update({
            where: { id: revision.id },
            data: {
              state: target,
              reviewedById: target === "APPROVED" ? admin.id : undefined,
              reviewedAt: target === "APPROVED" ? now : undefined,
              approvedById: target === "APPROVED" ? admin.id : undefined,
              approvedAt: target === "APPROVED" ? now : undefined,
              publishedAt: target === "PUBLISHED" ? now : undefined,
            },
          });
          current = target;
        }
      }
    });

    const published = await prisma.storyArcContentRevision.count({ where: { state: "PUBLISHED" } });
    const byTrack = await prisma.storyArcContentRevision.groupBy({
      by: ["state"],
      where: { state: "PUBLISHED" },
      _count: true,
    });
    console.log(JSON.stringify({
      published: drafts.length,
      canonicalPublished: published,
      approvedBy: admin.email,
      stateCounts: byTrack,
    }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

void main();
