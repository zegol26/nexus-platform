import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getGameUser } from "@/lib/game/auth";
import { getOrCreateGameKingdom } from "@/lib/game/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getGameUser();
  if (!user) return NextResponse.json({ error: "Silakan login untuk equip card." }, { status: 401 });
  const kingdom = await getOrCreateGameKingdom(user.id);
  const body = (await request.json().catch(() => null)) as { cardKey?: unknown } | null;
  const cardKey = typeof body?.cardKey === "string" ? body.cardKey : "";
  const card = await prisma.gameUserCard.findUnique({ where: { kingdomId_cardKey: { kingdomId: kingdom.id, cardKey } } });
  if (!card) return NextResponse.json({ error: "Card belum dimiliki." }, { status: 404 });
  await prisma.gameUserCard.update({ where: { id: card.id }, data: { equipped: !card.equipped } });
  return NextResponse.json({ ok: true });
}
