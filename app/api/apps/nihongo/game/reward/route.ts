import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { awardGameReward, type GameRewardSource } from "@/lib/gamification/kingdom";
import { claimLearningReward } from "@/lib/game/service";

export const runtime = "nodejs";

const allowedSources = new Set<GameRewardSource>([
  "FLASHCARD_CORRECT",
  "QUIZ_CORRECT",
]);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    source?: unknown;
    quantity?: unknown;
    sourceRef?: unknown;
  } | null;

  const source = typeof body?.source === "string" ? body.source : "";
  if (!allowedSources.has(source as GameRewardSource)) {
    return NextResponse.json({ error: "Unsupported reward source." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const quantity = typeof body?.quantity === "number" ? body.quantity : 1;
  const result = await awardGameReward({
    userId: user.id,
    source: source as GameRewardSource,
    quantity,
  });

  const rewardType = source === "FLASHCARD_CORRECT" ? "FLASHCARD_CORRECT" : "QUIZ_CORRECT";
  const sourceRef =
    typeof body?.sourceRef === "string" && body.sourceRef.trim()
      ? body.sourceRef.trim()
      : `${source}:${Date.now()}`;
  await claimLearningReward({
    userId: user.id,
    rewardType,
    sourceRef,
  }).catch(() => null);

  return NextResponse.json(result);
}
