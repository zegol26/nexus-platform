import { NextResponse } from "next/server";
import { getGameUser } from "@/lib/game/auth";
import { attackKingdom } from "@/lib/game/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getGameUser();
  if (!user) return NextResponse.json({ error: "Silakan login untuk battle." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { targetKingdomId?: unknown } | null;
  const targetKingdomId = typeof body?.targetKingdomId === "string" ? body.targetKingdomId : "";
  try {
    return NextResponse.json({ battle: await attackKingdom(user.id, targetKingdomId) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Battle gagal." }, { status: 400 });
  }
}
