import { NextResponse } from "next/server";
import { getGameUser } from "@/lib/game/auth";
import { getBattleLogs, getLeaderboard, getOrCreateGameKingdom } from "@/lib/game/service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getGameUser();
    if (!user) return NextResponse.json({ error: "Silakan login untuk membuka game." }, { status: 401 });
    const kingdom = await getOrCreateGameKingdom(user.id);
    const [leaderboard, battleLogs] = await Promise.all([
      getLeaderboard(),
      getBattleLogs(user.id),
    ]);
    return NextResponse.json({ user, kingdom, leaderboard: leaderboard.slice(0, 5), battleLogs });
  } catch (error) {
    console.error("[game/me]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal memuat kerajaan." },
      { status: 500 }
    );
  }
}
