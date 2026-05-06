import { NextResponse } from "next/server";
import { getGameUser } from "@/lib/game/auth";
import { learningRewards } from "@/lib/game/config";
import { claimLearningReward, getOrCreateGameKingdom } from "@/lib/game/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getGameUser();
  if (!user) return NextResponse.json({ error: "Silakan login untuk klaim reward." }, { status: 401 });
  await getOrCreateGameKingdom(user.id);

  const body = (await request.json().catch(() => null)) as { rewardType?: unknown; sourceRef?: unknown } | null;
  const rewardType = typeof body?.rewardType === "string" ? body.rewardType : "";
  const sourceRef = typeof body?.sourceRef === "string" ? body.sourceRef : "";
  if (!(rewardType in learningRewards) || !sourceRef) {
    return NextResponse.json({ error: "Reward tidak valid." }, { status: 400 });
  }

  const result = await claimLearningReward({
    userId: user.id,
    rewardType: rewardType as keyof typeof learningRewards,
    sourceRef,
  });
  return NextResponse.json(result);
}
