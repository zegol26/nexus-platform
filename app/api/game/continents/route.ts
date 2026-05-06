import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { continents } from "@/lib/game/config";
import { getGameUser } from "@/lib/game/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getGameUser();
  if (!user) return NextResponse.json({ error: "Silakan login untuk melihat continent." }, { status: 401 });
  const grouped = await prisma.gameKingdom.groupBy({ by: ["continent"], _count: { continent: true } });
  const counts = new Map(grouped.map((item) => [item.continent, item._count.continent]));
  return NextResponse.json({
    continents: continents.map((name) => ({ name, population: counts.get(name) ?? 0 })),
  });
}
