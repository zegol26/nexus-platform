import { NextResponse } from "next/server";
import { getGameUser } from "@/lib/game/auth";
import { getOrCreateGameKingdom } from "@/lib/game/service";

export const runtime = "nodejs";

export async function POST() {
  const user = await getGameUser();
  if (!user) return NextResponse.json({ error: "Silakan login untuk membuat kingdom." }, { status: 401 });
  return NextResponse.json({ kingdom: await getOrCreateGameKingdom(user.id) });
}
