import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser } from "@/lib/storyarc/access";
import { STORYARC_DEMO_STABLE_ID } from "@/lib/storyarc/constants";
import { createInitialStoryArcPlayerState } from "@/lib/storyarc/game/state";
import { playerRowToSnapshot, snapshotCreateData } from "@/lib/storyarc/game/persistence";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getStoryArcSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const revision = await prisma.storyArcContentRevision.findFirst({
    where: { state: "PUBLISHED", item: { stableId: STORYARC_DEMO_STABLE_ID } },
    include: { item: true },
    orderBy: { revision: "desc" },
  });
  if (!revision) {
    return NextResponse.json({ error: "The published School Gate foundation fixture is not available." }, { status: 503 });
  }

  const initial = createInitialStoryArcPlayerState();
  const playerState = await prisma.storyArcPlayerState.upsert({
    where: { userId: user.id },
    create: snapshotCreateData(user.id, initial),
    update: {},
  });

  return NextResponse.json({
    content: {
      stableId: revision.item.stableId,
      revisionId: revision.id,
      revision: revision.revision,
      title: revision.title,
      payload: revision.payload,
    },
    player: { id: user.id, name: (user.name ?? "Nexus learner").slice(0, 48) },
    state: playerRowToSnapshot(playerState),
  }, { headers: { "Cache-Control": "private, no-store" } });
}
