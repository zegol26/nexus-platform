import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser } from "@/lib/storyarc/access";
import { createInitialStoryArcPlayerState, applyStoryArcPlayerAction, isStoryArcPlayerAction, StoryArcTransitionError } from "@/lib/storyarc/game/state";
import { playerRowToSnapshot, snapshotCreateData, snapshotUpdateData } from "@/lib/storyarc/game/persistence";
import { STORYARC_DEMO_STABLE_ID } from "@/lib/storyarc/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getStoryArcSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const state = await prisma.storyArcPlayerState.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ state: state ? playerRowToSnapshot(state) : createInitialStoryArcPlayerState() });
}

export async function POST(request: Request) {
  const user = await getStoryArcSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const action = body?.action;
  const idempotencyKey = typeof body?.idempotencyKey === "string" ? body.idempotencyKey.trim() : "";
  const expectedVersion = Number(body?.expectedVersion);
  const revisionId = typeof body?.revisionId === "string" ? body.revisionId : "";
  if (!isStoryArcPlayerAction(action) || idempotencyKey.length < 8 || idempotencyKey.length > 120 || !Number.isInteger(expectedVersion) || !revisionId) {
    return NextResponse.json({ error: "Invalid StoryArc state command." }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const prior = await tx.storyArcPlayerTransition.findUnique({
        where: { userId_idempotencyKey: { userId: user.id, idempotencyKey } },
      });
      if (prior) {
        const row = await tx.storyArcPlayerState.findUniqueOrThrow({ where: { userId: user.id } });
        return { duplicate: true, state: playerRowToSnapshot(row), displayEvents: [] };
      }

      const revision = await tx.storyArcContentRevision.findFirst({
        where: {
          id: revisionId,
          state: "PUBLISHED",
          item: { stableId: STORYARC_DEMO_STABLE_ID },
        },
      });
      if (!revision) throw new StoryArcTransitionError("The source content revision is not published.");

      const initial = createInitialStoryArcPlayerState();
      const row = await tx.storyArcPlayerState.upsert({
        where: { userId: user.id },
        create: snapshotCreateData(user.id, initial),
        update: {},
      });
      const current = playerRowToSnapshot(row);
      if (current.stateVersion !== expectedVersion) {
        return { conflict: true as const, state: current };
      }
      const transition = applyStoryArcPlayerAction(current, action);
      const updated = await tx.storyArcPlayerState.updateMany({
        where: { id: row.id, stateVersion: expectedVersion },
        data: snapshotUpdateData(transition.state),
      });
      if (updated.count !== 1) return { conflict: true as const, state: current };

      await tx.storyArcPlayerTransition.create({
        data: {
          userId: user.id,
          playerStateId: row.id,
          idempotencyKey,
          actionType: action,
          sourceRevisionId: revision.id,
          sourceNodeId: action,
          payload: { action },
          xpDelta: transition.xpDelta,
          stateVersionAfter: transition.state.stateVersion,
        },
      });
      for (const unlock of transition.unlocks) {
        await tx.storyArcLearnerUnlock.upsert({
          where: { userId_kind_entryKey: { userId: user.id, kind: unlock.kind, entryKey: unlock.entryKey } },
          create: {
            userId: user.id,
            kind: unlock.kind,
            entryKey: unlock.entryKey,
            sourceRevisionId: revision.id,
            sourceIntentKey: unlock.sourceIntentKey,
            futureRecallKey: unlock.futureRecallKey,
          },
          update: {},
        });
      }
      return { duplicate: false, state: transition.state, displayEvents: transition.displayEvents };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if ("conflict" in result && result.conflict) {
      return NextResponse.json({ error: "State version conflict", state: result.state }, { status: 409 });
    }
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof StoryArcTransitionError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const row = await prisma.storyArcPlayerState.findUnique({ where: { userId: user.id } });
      return NextResponse.json({ duplicate: true, state: row ? playerRowToSnapshot(row) : null, displayEvents: [] });
    }
    console.error("StoryArc state save failed", error);
    return NextResponse.json({ error: "Unable to save StoryArc state." }, { status: 500 });
  }
}
