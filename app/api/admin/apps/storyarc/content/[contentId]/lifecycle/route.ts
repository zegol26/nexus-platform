import { NextResponse } from "next/server";
import type { StoryArcContentState } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";
import { canTransitionStoryArcContent, type StoryArcContentStateKey } from "@/lib/storyarc/content/lifecycle";

function hasValidationErrors(report: unknown) {
  if (!report || typeof report !== "object") return true;
  const errors = (report as { errors?: unknown }).errors;
  return !Array.isArray(errors) || errors.length > 0;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ contentId: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { contentId } = await params;
  const body = await request.json().catch(() => null);
  const target = body?.state as StoryArcContentStateKey;
  if (!target) return NextResponse.json({ error: "Target state is required" }, { status: 400 });

  const revision = await prisma.storyArcContentRevision.findFirst({
    where: { item: { stableId: contentId } },
    orderBy: { revision: "desc" },
  });
  if (!revision) return NextResponse.json({ error: "Content not found" }, { status: 404 });
  const current = revision.state as StoryArcContentStateKey;
  if (!canTransitionStoryArcContent(current, target)) {
    return NextResponse.json({ error: `Invalid lifecycle transition ${current} -> ${target}` }, { status: 409 });
  }
  if ((target === "IN_REVIEW" || target === "APPROVED" || target === "PUBLISHED") && hasValidationErrors(revision.validationReport)) {
    return NextResponse.json({ error: "A clean deterministic validation report is required." }, { status: 422 });
  }

  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    if (target === "PUBLISHED") {
      await tx.storyArcContentRevision.updateMany({
        where: { itemId: revision.itemId, state: "PUBLISHED", id: { not: revision.id } },
        data: { state: "SUPERSEDED", retiredAt: now },
      });
    }
    return tx.storyArcContentRevision.update({
      where: { id: revision.id },
      data: {
        state: target as StoryArcContentState,
        reviewedById: target === "APPROVED" ? admin.id : revision.reviewedById,
        reviewedAt: target === "APPROVED" ? now : revision.reviewedAt,
        approvedById: target === "APPROVED" ? admin.id : revision.approvedById,
        approvedAt: target === "APPROVED" ? now : revision.approvedAt,
        publishedAt: target === "PUBLISHED" ? now : revision.publishedAt,
        retiredAt: target === "ARCHIVED" ? now : revision.retiredAt,
      },
    });
  });
  return NextResponse.json({ revision: updated });
}
