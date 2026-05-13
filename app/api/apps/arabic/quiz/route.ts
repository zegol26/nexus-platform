import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import {
  getArabicQuizQuestions,
  shuffleArabicQuiz,
  validateArabicQuizQuestion,
} from "@/lib/arabic/quiz";
import type {
  ArabicLevelId,
  ArabicQuizQuestionType,
  ArabicTargetSkill,
} from "@/lib/arabic/types";

export const dynamic = "force-dynamic";

const ALLOWED_LEVELS: ArabicLevelId[] = [
  "L1_FOUNDATION",
  "L2_DAILY",
  "L3_WORK",
  "L4_UMRAH",
  "L5_TRAVEL",
  "L6_DIALECT",
];
const ALLOWED_SKILLS: ArabicTargetSkill[] = ["daily", "work", "umrah", "travel", "dialect"];
const ALLOWED_QUESTION_TYPES: ArabicQuizQuestionType[] = [
  "vocabulary",
  "meaning",
  "situation",
  "dialogue",
  "work_instruction",
  "umrah",
  "saudi_expression",
];

function asLevel(value: string | null): ArabicLevelId | undefined {
  if (!value) return undefined;
  return ALLOWED_LEVELS.includes(value as ArabicLevelId)
    ? (value as ArabicLevelId)
    : undefined;
}

function asSkill(value: string | null): ArabicTargetSkill | undefined {
  if (!value) return undefined;
  return ALLOWED_SKILLS.includes(value as ArabicTargetSkill)
    ? (value as ArabicTargetSkill)
    : undefined;
}

function asQuestionType(value: string | null): ArabicQuizQuestionType | undefined {
  if (!value) return undefined;
  return ALLOWED_QUESTION_TYPES.includes(value as ArabicQuizQuestionType)
    ? (value as ArabicQuizQuestionType)
    : undefined;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const level = asLevel(searchParams.get("level"));
  const targetSkill = asSkill(searchParams.get("skill"));
  const questionType = asQuestionType(searchParams.get("type"));
  const count = Math.min(
    Math.max(Number(searchParams.get("count") ?? "10"), 1),
    25
  );

  const pool = getArabicQuizQuestions({
    level,
    targetSkill,
    questionType,
  });

  const validPool = pool.filter(
    (question) => validateArabicQuizQuestion(question).length === 0
  );

  const questions = shuffleArabicQuiz(validPool)
    .slice(0, count)
    .map((question) => ({
      id: question.id,
      lessonId: question.lessonId,
      questionType: question.questionType,
      prompt: question.promptId,
      arabicText: question.arabicText,
      transliteration: question.transliteration,
      options: shuffleArabicQuiz(question.options),
      correctAnswer: question.correctAnswer,
      explanation: question.explanationId,
      difficulty: question.difficulty,
    }));

  return NextResponse.json({
    questions,
    totalAvailable: validPool.length,
  });
}
