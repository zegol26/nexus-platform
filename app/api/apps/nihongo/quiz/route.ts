import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

type QuizCard = {
  id: string;
  front: string;
  back: string;
  deck: string;
  level: string;
  category: string;
  example: string | null;
  createdAt: Date;
};

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const count = Math.min(
    Math.max(Number(searchParams.get("count") ?? "10"), 1),
    25
  );

  const cards: QuizCard[] = await prisma.nihongoFlashcard.findMany({
    where: {
      ...(level ? { level } : {}),
      ...(category ? { category } : {}),
    },
    take: 250,
    orderBy: [{ level: "asc" }, { deck: "asc" }, { createdAt: "asc" }],
  });

  const selected: QuizCard[] = shuffle(cards).slice(0, count);

  const questions = selected.map((card: QuizCard) => {
    const wrongAnswers = shuffle(
      cards
        .filter((item: QuizCard) => item.id !== card.id)
        .map((item: QuizCard) => item.back)
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