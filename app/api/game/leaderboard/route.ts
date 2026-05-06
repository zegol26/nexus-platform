import { NextResponse } from "next/server";
import { getGameUser } from "@/lib/game/auth";
import { getLeaderboard } from "@/lib/game/service";

export const runtime = "nodejs";

export async function GET() {
  const user = await getGameUser();
  if (!user) return NextResponse.json({ error: "Silakan login untuk melihat leaderboard." }, { status: 401 });
  return NextResponse.json({ leaderboard: await getLeaderboard() });
}
