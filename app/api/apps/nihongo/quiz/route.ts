import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const count = Math.min(Math.max(Number(searchParams.get("count") ?? "10"), 1), 25);

  const cards = await prisma.nihongoFlashcard.findMany({
    where: {
      ...(level ? { level } : {}),
      ...(category ? { category } : {}),
    },
    take: 250,
    orderBy: [{ level: "asc" }, { deck: "asc" }, { createdAt: "asc" }],
  });

  const selected = shuffle(cards).slice(0, count);

  const questions = selected.map((card) => {
    const wrongAnswers = shuffle(
  cards
    .filter((item: { id: string; back: string }) => item.id !== card.id)
    .map((item: { id: string; back: string }) => item.back)
    ).slice(0, 3);

    return {
      id: card.id,
      prompt: card.front,
      deck: card.deck,
      level: card.level,
      category: card.category,
      answer: card.back,
      example: card.example,
      options: shuffle([card.back, ...wrongAnswers]),
    };
  });

  return NextResponse.json({
    questions,
    totalAvailable: cards.length,
  });
}
