import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { conceptQuestions } from "@/lib/nihongo/quiz/conceptQuestions";
import {
  anonymousRateLimitResponse,
  checkAnonymousRateLimit,
  getAnonymousClientKey,
} from "@/lib/nexus/anonymous-rate-limit";

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

function getIndonesianMeaning(back: string) {
  const parts = back.split(" - ");

  return parts[parts.length - 1]?.trim() || back;
}

function getStoryContext(card: QuizCard) {
  if (card.level === "A2") {
    if (card.deck.toLowerCase().includes("workplace")) {
      return "Situasi kerja: kamu perlu memahami ucapan rekan atau atasan dengan sopan.";
    }

    if (card.deck.toLowerCase().includes("shopping")) {
      return "Situasi belanja: kamu sedang berinteraksi dengan staf toko di Jepang.";
    }

    return "Situasi harian: kamu berada di Jepang dan perlu memahami ungkapan praktis ini.";
  }

  if (card.level === "N4") {
    return "Konteks N4: fokus pada maksud kalimat, pola grammar, dan pilihan bahasa yang natural.";
  }

  if (card.level === "N5") {
    return "Konteks N5: baca perlahan dan pahami fungsi kata/pola dasar dalam kalimat sederhana.";
  }

  return "Konteks belajar: pilih jawaban yang paling tepat berdasarkan materi kartu ini.";
}

function buildPrompt(card: QuizCard) {
  const context = getStoryContext(card);

  if (card.category === "grammar") {
    return `${context}\n\nPola: ${card.front}\nApa fungsi atau arti pola ini dalam bahasa Indonesia?`;
  }

  if (card.category === "conversation") {
    return `${context}\n\nUngkapan: ${card.front}\nDalam situasi nyata, maksud ungkapan ini apa?`;
  }

  if (card.category === "vocabulary") {
    return `${context}\n\nKosakata: ${card.front}\nApa arti yang paling tepat dalam bahasa Indonesia?`;
  }

  if (card.category === "kanji") {
    return `${context}\n\nKanji: ${card.front}\nPilih bacaan/arti yang paling tepat.`;
  }

  if (card.category === "kana") {
    return `Latihan kana: huruf ${card.front}\nPilih bunyi atau fungsi yang paling tepat.`;
  }

  return `${context}\n\n${card.front}\nPilih jawaban yang paling tepat.`;
}

function buildExplanation(card: QuizCard) {
  const meaning = getIndonesianMeaning(card.back);
  const example = card.example ? ` Contoh: ${card.example}.` : "";

  if (card.category === "grammar") {
    return `Penjelasan: ${card.front} dipakai untuk makna "${meaning}". Perhatikan bentuk kata sebelum pola ini dan nuansa kalimatnya.${example}`;
  }

  if (card.category === "conversation") {
    return `Penjelasan: ungkapan ini berarti "${meaning}" dan dipakai dalam konteks percakapan yang sopan/natural.${example}`;
  }

  if (card.category === "vocabulary") {
    return `Penjelasan: ${card.front} berarti "${meaning}". Hafalkan bersama contoh kalimat supaya tidak hanya ingat terjemahan lepas.${example}`;
  }

  if (card.category === "kanji") {
    return `Penjelasan: jawaban yang tepat adalah "${card.back}". Untuk kanji, biasakan mengingat bacaan lewat kata contoh, bukan bentuknya saja.${example}`;
  }

  return `Penjelasan: jawaban yang tepat adalah "${card.back}".${example}`;
}

function buildFlashcardQuestions(cards: QuizCard[], count: number) {
  const selected: QuizCard[] = shuffle(cards).slice(0, count);

  return selected.map((card: QuizCard) => {
    const preferredDistractors = cards.filter(
      (item: QuizCard) =>
        item.id !== card.id &&
        item.level === card.level &&
        item.category === card.category
    );

    const fallbackDistractors = cards.filter(
      (item: QuizCard) => item.id !== card.id
    );

    const wrongAnswers = shuffle(
      (preferredDistractors.length >= 3
        ? preferredDistractors
        : fallbackDistractors
      ).map((item: QuizCard) => item.back)
    ).slice(0, 3);

    return {
      id: card.id,
      prompt: buildPrompt(card),
      deck: card.deck,
      level: card.level,
      category: card.category,
      answer: card.back,
      example: buildExplanation(card),
      options: shuffle([card.back, ...wrongAnswers]),
    };
  });
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    const rateLimit = checkAnonymousRateLimit({
      key: getAnonymousClientKey(request, "nihongo-trial:quiz"),
      limit: 60,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      return anonymousRateLimitResponse(rateLimit.resetAt);
    }
  }

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

  const matchingConceptQuestions = conceptQuestions.filter(
    (question) =>
      (!level || question.level === level) &&
      (!category || question.category === category)
  );

  if (matchingConceptQuestions.length > 0) {
    const shouldMixHalfConceptHalfFlashcard =
      level === "Beginner" || level === "N3";

    if (shouldMixHalfConceptHalfFlashcard && cards.length > 0) {
      const conceptCount = Math.ceil(count / 2);
      const flashcardCount = count - conceptCount;
      const conceptBatch = shuffle(matchingConceptQuestions).slice(
        0,
        conceptCount
      );
      const flashcardBatch = buildFlashcardQuestions(cards, flashcardCount);
      const questions = shuffle([...conceptBatch, ...flashcardBatch]).slice(
        0,
        count
      );

      return NextResponse.json({
        questions,
        totalAvailable: matchingConceptQuestions.length + cards.length,
      });
    }

    const questions = shuffle(matchingConceptQuestions).slice(0, count);

    return NextResponse.json({
      questions,
      totalAvailable: matchingConceptQuestions.length,
    });
  }

  const questions = buildFlashcardQuestions(cards, count);

  return NextResponse.json({
    questions,
    totalAvailable: cards.length,
  });
}
