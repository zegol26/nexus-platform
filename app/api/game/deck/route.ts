import { NextResponse } from "next/server";
import { getGameUser } from "@/lib/game/auth";
import { deckCards } from "@/lib/game/config";
import { getOrCreateGameKingdom } from "@/lib/game/service";

export const runtime = "nodejs";

export async function GET() {
  const user = await getGameUser();
  if (!user) return NextResponse.json({ error: "Silakan login untuk membuka deck." }, { status: 401 });
  const kingdom = await getOrCreateGameKingdom(user.id);
  return NextResponse.json({ catalog: deckCards, cards: kingdom.cards });
}
