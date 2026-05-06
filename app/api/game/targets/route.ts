import { NextResponse } from "next/server";
import { getGameUser } from "@/lib/game/auth";
import { getTargets } from "@/lib/game/service";

export const runtime = "nodejs";

export async function GET() {
  const user = await getGameUser();
  if (!user) return NextResponse.json({ error: "Silakan login untuk scouting target." }, { status: 401 });
  return NextResponse.json({ targets: await getTargets(user.id) });
}
