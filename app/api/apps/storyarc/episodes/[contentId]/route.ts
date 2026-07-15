import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser } from "@/lib/storyarc/access";
import {
  applyStoryArcEpisodeCommand,
  getStoryArcEpisodeProgress,
  parseStoryArcEpisodePayload,
  type StoryArcEpisodeCommand,
} from "@/lib/storyarc/game/episode-progress";
import { createInitialStoryArcPlayerState } from "@/lib/storyarc/game/state";
import { playerRowToSnapshot, snapshotCreateData, snapshotUpdateData } from "@/lib/storyarc/game/persistence";

export const dynamic = "force-dynamic";

async function publishedEpisode(contentId: string, revisionId?: string) {
  return prisma.storyArcContentRevision.findFirst({
    where: {
      ...(revisionId ? { id: revisionId } : {}),
      state: "PUBLISHED",
      item: { stableId: contentId, track: "STORY_MODE" },
    },
    include: { item: true },
    orderBy: { revision: "desc" },
  });
}

export async function GET(_request: Request, { params }: { params: Promise<{ contentId: string }> }) {
  const user = await getStoryArcSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { contentId } = await params;
  const revision = await publishedEpisode(contentId);
  if (!revision) return NextResponse.json({ error: "Published StoryArc episode not found." }, { status: 404 });

  try {
    const payload = parseStoryArcEpisodePayload(revision.payload);
    const initial = createInitialStoryArcPlayerState();
    const row = await prisma.storyArcPlayerState.upsert({
      where: { userId: user.id },
      create: snapshotCreateData(user.id, initial),
      update: {},
    });
    const snapshot = playerRowToSnapshot(row);
    return NextResponse.json({
      content: { stableId: contentId, revisionId: revision.id, revision: revision.revision, title: revision.title, payload },
      player: { id: user.id, name: (user.name ?? "Nexus learner").slice(0, 48) },
      state: snapshot,
      progress: getStoryArcEpisodeProgress(snapshot, contentId, payload.scene.entryNodeId),
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load the published episode." }, { status: 422 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ contentId: string }> }) {
  const user = await getStoryArcSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { contentId } = await params;
  const body = await request.json().catch(() => null);
  const revisionId = typeof body?.revisionId === "string" ? body.revisionId : "";
  const expectedVersion = Number(body?.expectedVersion);
  const idempotencyKey = typeof body?.idempotencyKey === "string" ? body.idempotencyKey.trim() : "";
  const command = body?.command as StoryArcEpisodeCommand | undefined;
  if (!revisionId || !Number.isInteger(expectedVersion) || idempotencyKey.length < 8 || idempotencyKey.length > 120 || !command || !["choice", "continue", "hotspot", "replay"].includes(command.type)) {
    return NextResponse.json({ error: "Invalid StoryArc episode command." }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const revision = await tx.storyArcContentRevision.findFirst({
        where: { id: revisionId, state: "PUBLISHED", item: { stableId: contentId, track: "STORY_MODE" } },
      });
      if (!revision) throw new Error("The source StoryArc episode is not published.");
      const payload = parseStoryArcEpisodePayload(revision.payload);
      const initial = createInitialStoryArcPlayerState();
      const row = await tx.storyArcPlayerState.upsert({
        where: { userId: user.id },
        create: snapshotCreateData(user.id, initial),
        update: {},
      });
      const current = playerRowToSnapshot(row);
      const currentProgress = getStoryArcEpisodeProgress(current, contentId, payload.scene.entryNodeId);
      const prior = await tx.storyArcPlayerTransition.findUnique({ where: { userId_idempotencyKey: { userId: user.id, idempotencyKey } } });
      if (prior) return { duplicate: true, state: current, progress: currentProgress, feedback: "This action was already saved." };
      if (current.stateVersion !== expectedVersion) return { conflict: true as const, state: current, progress: currentProgress };

      const applied = applyStoryArcEpisodeCommand({ snapshot: current, stableId: contentId, payload, command });
      if (applied.duplicate) return { duplicate: true, state: current, progress: applied.progress, feedback: applied.feedback };
      const updated = await tx.storyArcPlayerState.updateMany({
        where: { id: row.id, stateVersion: expectedVersion },
        data: snapshotUpdateData(applied.snapshot),
      });
      if (updated.count !== 1) return { conflict: true as const, state: current, progress: currentProgress };
      await tx.storyArcPlayerTransition.create({
        data: {
          userId: user.id,
          playerStateId: row.id,
          idempotencyKey,
          actionType: applied.actionType,
          sourceRevisionId: revision.id,
          sourceNodeId: applied.sourceNodeId,
          payload: { command },
          xpDelta: applied.xpDelta,
          stateVersionAfter: applied.snapshot.stateVersion,
        },
      });
      return { duplicate: false, state: applied.snapshot, progress: applied.progress, feedback: applied.feedback };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if ("conflict" in result && result.conflict) return NextResponse.json({ error: "State version conflict", ...result }, { status: 409 });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "The command was already recorded. Reload the episode." }, { status: 409 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save StoryArc episode progress." }, { status: 422 });
  }
}
