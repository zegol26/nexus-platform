import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

type ReviewBody = {
  answerId?: string;
  englishLevel?: string;
  pronunciationScore?: number;
  fluencyScore?: number;
  grammarScore?: number;
  vocabularyScore?: number;
  confidenceScore?: number;
  overallScore?: number;
  feedback?: string;
  recommendation?: string;
  visibleToUser?: boolean;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reviewer = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!reviewer) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const canReview = reviewer.role === "ADMIN" || reviewer.role === "SUPER_ADMIN" || reviewer.role === "TEACHER";
  if (!canReview) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as ReviewBody;
  const answerId = String(body.answerId ?? "");
  const feedback = String(body.feedback ?? "").trim();
  const englishLevel = String(body.englishLevel ?? "").trim();

  if (!answerId || !feedback || !englishLevel) {
    return NextResponse.json({ error: "answerId, englishLevel, and feedback are required." }, { status: 400 });
  }

  const review = await prisma.englishInterviewReview.upsert({
    where: { answerId },
    update: {
      reviewerId: reviewer.id,
      englishLevel,
      pronunciationScore: normalizeScore(body.pronunciationScore),
      fluencyScore: normalizeScore(body.fluencyScore),
      grammarScore: normalizeScore(body.grammarScore),
      vocabularyScore: normalizeScore(body.vocabularyScore),
      confidenceScore: normalizeScore(body.confidenceScore),
      overallScore: normalizeScore(body.overallScore),
      feedback,
      recommendation: body.recommendation ?? null,
      visibleToUser: body.visibleToUser ?? true,
    },
    create: {
      answerId,
      reviewerId: reviewer.id,
      englishLevel,
      pronunciationScore: normalizeScore(body.pronunciationScore),
      fluencyScore: normalizeScore(body.fluencyScore),
      grammarScore: normalizeScore(body.grammarScore),
      vocabularyScore: normalizeScore(body.vocabularyScore),
      confidenceScore: normalizeScore(body.confidenceScore),
      overallScore: normalizeScore(body.overallScore),
      feedback,
      recommendation: body.recommendation ?? null,
      visibleToUser: body.visibleToUser ?? true,
    },
  });

  await prisma.englishInterviewAnswer.update({
    where: { id: answerId },
    data: { status: "REVIEWED" },
  });

  return NextResponse.json({ review });
}

function normalizeScore(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(100, Math.round(value)));
}
