import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deck = searchParams.get("deck");
  const level = searchParams.get("level");
  const limit = Number(searchParams.get("limit") ?? "80");

  const where = {
    ...(deck ? { deck } : {}),
    ...(level ? { level } : {}),
  };

  const [flashcards, decks, levels, total] = await Promise.all([
    prisma.nihongoFlashcard.findMany({
      where,
      orderBy: [{ level: "asc" }, { deck: "asc" }, { createdAt: "asc" }],
      take: Math.min(Math.max(limit, 1), 200),
    }),
    prisma.nihongoFlashcard.findMany({
      distinct: ["deck"],
      select: { deck: true },
      orderBy: { deck: "asc" },
    }),
    prisma.nihongoFlashcard.findMany({
      distinct: ["level"],
      select: { level: true },
      orderBy: { level: "asc" },
    }),
    prisma.nihongoFlashcard.count({ where }),
  ]);

  return NextResponse.json({
    flashcards,
    decks: decks.map((item: { deck: string }) => item.deck),
    levels: levels.map((item: { level: string }) => item.level),
    total,
  });
}
