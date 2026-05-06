import { NextResponse } from "next/server";
import { getGameUser } from "@/lib/game/auth";
import { upgradeCastle } from "@/lib/game/service";

export const runtime = "nodejs";

export async function POST() {
  const user = await getGameUser();
  if (!user) return NextResponse.json({ error: "Silakan login untuk upgrade castle." }, { status: 401 });
  try {
    return NextResponse.json({ kingdom: await upgradeCastle(user.id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upgrade gagal." }, { status: 400 });
  }
}
