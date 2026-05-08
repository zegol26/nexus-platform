import { NextResponse } from "next/server";
import { getGameUser } from "@/lib/game/auth";
import { getIncomingAttacks } from "@/lib/game/service";

export const runtime = "nodejs";

export async function GET() {
  const user = await getGameUser();
  if (!user) return NextResponse.json({ error: "Silakan login untuk membaca notifikasi." }, { status: 401 });
  const incoming = await getIncomingAttacks(user.id);
  return NextResponse.json({ incoming });
}
