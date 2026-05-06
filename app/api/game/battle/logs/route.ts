import { NextResponse } from "next/server";
import { getGameUser } from "@/lib/game/auth";
import { getBattleLogs } from "@/lib/game/service";

export const runtime = "nodejs";

export async function GET() {
  const user = await getGameUser();
  if (!user) return NextResponse.json({ error: "Silakan login untuk melihat battle logs." }, { status: 401 });
  return NextResponse.json({ battleLogs: await getBattleLogs(user.id) });
}
