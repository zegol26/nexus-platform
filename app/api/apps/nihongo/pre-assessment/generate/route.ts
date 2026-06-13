import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import {
  generatePreAssessmentQuestionBank,
  getFallbackAssessmentQuestions,
  preAssessmentListeningQuestions,
  pronunciationPrompt,
} from "@/lib/nihongo/assessment/questionBank";
import { validateAssessmentQuestionBank } from "@/lib/nihongo/assessment/validators";
import { prisma } from "@/lib/db/prisma";
import { generateAssessmentForLevel, type AssessmentTargetLevel } from "@/lib/nihongo/assessment/generateAssessmentForLevel";
import {
  anonymousRateLimitResponse,
  checkAnonymousRateLimit,
  getAnonymousClientKey,
} from "@/lib/nexus/anonymous-rate-limit";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    const rateLimit = checkAnonymousRateLimit({
      key: getAnonymousClientKey(request, "nihongo-trial:assessment-generate"),
      limit: 20,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      return anonymousRateLimitResponse(rateLimit.resetAt);
    }
  }

  const targetLevel = getTargetLevel(request);

  try {
    const bankQuestions = await generateAssessmentForLevel(prisma, targetLevel, {
      mode: "pre_assessment",
    });

    const questions = [
      ...bankQuestions.map((question) => ({
        id: question.id,
        category: mapSkillToCategory(question.skill),
        type: question.questionType === "reading_mcq" ? "reading_multiple_choice" : "multiple_choice",
        prompt: question.prompt,
        instructionIndonesian: getInstruction(question.skill),
        options: question.options,
        level: question.level,
        tags: question.tags,
        passage: question.passage
          ? {
              japanese: question.passage,
              kanaSupport: undefined,
              indonesianHint:
                question.skill === "reading"
                  ? "Pilih jawaban yang sesuai dengan isi teks."
                  : undefined,
            }
          : undefined,
      })),
      ...preAssessmentListeningQuestions.map((question) => ({
        id: question.id,
        category: question.category,
        type: question.type,
        prompt: question.prompt,
        instructionIndonesian: question.instructionIndonesian,
        options: question.options,
        level: question.level,
        tags: question.tags,
        audioUrl: question.audioUrl,
      })),
    ];

    return NextResponse.json({
      source: "question_bank",
      targetLevel,
      questions,
      pronunciationPrompt,
      distribution: {
        byLevel: countBy(questions, (question) => question.level),
        bySkill: countBy(questions, (question) => String(question.category)),
      },
    });
  } catch (error) {
    console.error("QUESTION_BANK_GENERATE_FAILED", error);
  }

  const questions = generatePreAssessmentQuestionBank();
  const validation = validateAssessmentQuestionBank(questions);
  const safeQuestions = validation.valid ? questions : getFallbackAssessmentQuestions();

  return NextResponse.json({
    questions: safeQuestions.map((question) => ({
      id: question.id,
      category: question.category,
      type: question.type,
      prompt: question.prompt,
      instructionIndonesian: question.instructionIndonesian,
      options: question.options,
      level: question.level,
      tags: question.tags,
      audioUrl: question.audioUrl,
      passage: question.passage,
    })),
    pronunciationPrompt,
    validation: {
      valid: validation.valid,
      errors: validation.valid ? [] : validation.errors,
    },
  });
}

function getTargetLevel(request: Request): AssessmentTargetLevel {
  const url = new URL(request.url);
  return url.searchParams.get("targetLevel") === "N4" ? "N4" : "N5";
}

function mapSkillToCategory(skill: string) {
  if (skill === "particle") return "particles";
  if (skill === "kanji") return "kanji";
  if (skill === "reading") return "reading";
  if (skill === "grammar") return "tense_forms";
  return "kana";
}

function getInstruction(skill: string) {
  if (skill === "particle") return "Pilih partikel yang tepat.";
  if (skill === "reading") return "Baca teks pendek, lalu jawab pertanyaan yang spesifik.";
  if (skill === "kanji") return "Pilih arti atau bacaan yang tepat.";
  if (skill === "grammar") return "Pilih bentuk grammar yang tepat.";
  return "Pilih jawaban yang paling tepat.";
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}
