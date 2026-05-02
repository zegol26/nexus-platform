import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { recommendNihongoLessons } from "@/lib/nihongo/assessment/adaptiveCurriculum";
import { evaluateAssessment, type PronunciationEvaluation, type SubmittedAssessmentAnswer } from "@/lib/nihongo/assessment/evaluateAssessment";
import { evaluatePlacement } from "@/lib/nihongo/assessment/evaluatePlacement";
import { generatePreAssessmentQuestionBank } from "@/lib/nihongo/assessment/questionBank";
import { validateAssessmentQuestionBank } from "@/lib/nihongo/assessment/validators";

type SubmitBody = {
  answers?: SubmittedAssessmentAnswer[];
  pronunciation?: PronunciationEvaluation & {
    audioUrl?: string;
    metadata?: Record<string, unknown>;
  };
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = (await request.json()) as SubmitBody;
  const answers = body.answers ?? [];

  if (answers.length === 0) {
    return NextResponse.json({ error: "At least one answer is required." }, { status: 400 });
  }

  const bankRows = await prisma.assessmentQuestion.findMany({
    where: {
      id: {
        in: answers.map((answer) => answer.questionId),
      },
    },
  });

  if (bankRows.length > 0) {
    return submitBankAssessment({
      userId: user.id,
      answers,
      pronunciation: body.pronunciation,
      bankRows,
    });
  }

  const questions = generatePreAssessmentQuestionBank();
  const validation = validateAssessmentQuestionBank(questions);

  if (!validation.valid) {
    return NextResponse.json(
      { error: "Assessment question bank failed validation.", details: validation.errors },
      { status: 500 }
    );
  }

  const evaluation = evaluateAssessment({
    questions,
    answers,
    pronunciation: body.pronunciation,
  });

  const recommendedLessons = await recommendNihongoLessons({
    prisma,
    weaknessTags: evaluation.weaknessTags,
    limit: 5,
  });
  const recommendedLessonIds = recommendedLessons.map((lesson) => lesson.id);
  const nextLesson = recommendedLessons[0] ?? null;
  const pronunciationJson = toJsonValue(body.pronunciation ?? null);

  const assessmentSession = await prisma.nihongoAssessmentSession.create({
    data: {
      userId: user.id,
      status: "COMPLETED",
      completedAt: new Date(),
      overallScore: evaluation.overallScore,
      estimatedLevel: evaluation.estimatedLevel,
      weaknessTags: evaluation.weaknessTags,
      strengthTags: evaluation.strengthTags,
      recommendedCurriculumFocus: evaluation.recommendedCurriculumFocus,
      recommendedLessonIds,
      recommendedDailyPlan: evaluation.recommendedDailyPlan,
      aiFeedbackIndonesian: evaluation.aiFeedbackIndonesian,
      encouragementJapanese: evaluation.encouragementJapanese,
      badgeId: evaluation.badgeId,
      finalEvaluation: {
        overallScore: evaluation.overallScore,
        estimatedLevel: evaluation.estimatedLevel,
        weaknessTags: evaluation.weaknessTags,
        strengthTags: evaluation.strengthTags,
        recommendedCurriculumFocus: evaluation.recommendedCurriculumFocus,
        recommendedDailyPlan: evaluation.recommendedDailyPlan,
        pronunciation: pronunciationJson,
      } satisfies Prisma.InputJsonObject,
      pronunciationScore: body.pronunciation?.pronunciationScore,
      pronunciationFeedback: pronunciationJson,
      answers: {
        create: evaluation.answers.map((answer) => ({
          questionId: answer.question.id,
          category: answer.question.category,
          type: answer.question.type,
          prompt: answer.question.prompt,
          userAnswer: answer.userAnswer,
          correctAnswer: answer.question.correctAnswer,
          isCorrect: answer.isCorrect,
          score: answer.score,
          maxScore: answer.maxScore,
          metadata: {
            tags: answer.question.tags,
            explanationIndonesian: answer.question.explanationIndonesian,
            options: answer.question.options,
          },
        })),
      },
    },
  });

  const badge = await prisma.nihongoBadge.findUnique({
    where: { id: evaluation.badgeId },
  });

  await prisma.userNihongoProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      currentLevel: evaluation.estimatedLevel,
      targetLevel: "N4",
      weaknessTags: evaluation.weaknessTags,
      strengthTags: evaluation.strengthTags,
      recommendedLessonIds,
      recommendedCurriculumFocus: evaluation.recommendedCurriculumFocus,
      recommendedDailyPlan: evaluation.recommendedDailyPlan,
      nextLessonId: nextLesson?.id,
      badgeId: evaluation.badgeId,
      assessmentCompletedAt: assessmentSession.completedAt,
      latestAssessmentId: assessmentSession.id,
    },
    update: {
      currentLevel: evaluation.estimatedLevel,
      targetLevel: "N4",
      weaknessTags: { set: evaluation.weaknessTags },
      strengthTags: { set: evaluation.strengthTags },
      recommendedLessonIds: { set: recommendedLessonIds },
      recommendedCurriculumFocus: { set: evaluation.recommendedCurriculumFocus },
      recommendedDailyPlan: evaluation.recommendedDailyPlan,
      nextLessonId: nextLesson?.id,
      badgeId: evaluation.badgeId,
      assessmentCompletedAt: assessmentSession.completedAt,
      latestAssessmentId: assessmentSession.id,
    },
  });

  await prisma.userNihongoBadge.upsert({
    where: {
      userId_badgeId: {
        userId: user.id,
        badgeId: evaluation.badgeId,
      },
    },
    create: {
      userId: user.id,
      badgeId: evaluation.badgeId,
      assessmentSessionId: assessmentSession.id,
    },
    update: {
      assessmentSessionId: assessmentSession.id,
      assignedAt: new Date(),
    },
  });

  return NextResponse.json({
    sessionId: assessmentSession.id,
    result: {
      overallScore: evaluation.overallScore,
      estimatedLevel: evaluation.estimatedLevel,
      weaknessTags: evaluation.weaknessTags,
      strengthTags: evaluation.strengthTags,
      recommendedCurriculumFocus: evaluation.recommendedCurriculumFocus,
      recommendedDailyPlan: evaluation.recommendedDailyPlan,
      aiFeedbackIndonesian: evaluation.aiFeedbackIndonesian,
      encouragementJapanese: evaluation.encouragementJapanese,
      pronunciation: body.pronunciation ?? null,
      badge,
      recommendedLessons,
      nextLesson,
    },
  });
}

async function submitBankAssessment(params: {
  userId: string;
  answers: SubmittedAssessmentAnswer[];
  pronunciation?: SubmitBody["pronunciation"];
  bankRows: Array<{
    id: string;
    level: string;
    skill: string;
    questionType: string;
    prompt: string;
    passage: string | null;
    options: unknown;
    correctAnswer: string;
    explanation: string;
    difficulty: number;
    tags: string[];
  }>;
}) {
  const questions = params.bankRows.map((row) => ({
    id: row.id,
    level: row.level,
    skill: row.skill,
    questionType: row.questionType,
    prompt: row.prompt,
    passage: row.passage,
    options: Array.isArray(row.options) ? row.options.map(String) : [],
    correctAnswer: row.correctAnswer,
    explanation: row.explanation,
    difficulty: row.difficulty,
    tags: row.tags,
  }));
  const targetLevel = questions.some((question) => question.level === "N5") ? "N5" : "N4";
  const placement = evaluatePlacement({
    targetLevel,
    questions,
    answers: params.answers,
  });
  const answerMap = new Map(params.answers.map((answer) => [answer.questionId, answer.answer]));
  const weaknessTags = Object.entries(placement.scoreBySkill)
    .filter(([, score]) => score < 70)
    .map(([skill]) => skill);
  const strengthTags = Object.entries(placement.scoreBySkill)
    .filter(([, score]) => score >= 80)
    .map(([skill]) => skill);
  const badgeId = mapPlacementToBadge(placement.readinessLabel);
  const pronunciationJson = toJsonValue(params.pronunciation ?? null);
  const recommendedLessons = await recommendNihongoLessons({
    prisma,
    weaknessTags,
    limit: 5,
  });
  const recommendedLessonIds = recommendedLessons.map((lesson) => lesson.id);
  const nextLesson = recommendedLessons[0] ?? null;

  const assessmentSession = await prisma.nihongoAssessmentSession.create({
    data: {
      userId: params.userId,
      status: "COMPLETED",
      completedAt: new Date(),
      overallScore: placement.totalScore,
      estimatedLevel: placement.readinessLabel,
      weaknessTags,
      strengthTags,
      recommendedCurriculumFocus: weaknessTags.length ? weaknessTags : ["reading", "grammar"],
      recommendedLessonIds,
      recommendedDailyPlan: buildPlacementDailyPlan(placement.readinessLabel, weaknessTags),
      aiFeedbackIndonesian: `Placement kamu: ${placement.readinessLabel}. Skor total ${placement.totalScore}/100.`,
      encouragementJapanese: "少しずつ進めば、必ず上手になります。",
      badgeId,
      finalEvaluation: {
        placement,
        pronunciation: pronunciationJson,
      } satisfies Prisma.InputJsonObject,
      pronunciationScore: params.pronunciation?.pronunciationScore ?? undefined,
      pronunciationFeedback: pronunciationJson,
      answers: {
        create: questions.map((question) => {
          const userAnswer = answerMap.get(question.id) ?? "";
          const isCorrect = userAnswer === question.correctAnswer;
          return {
            questionId: question.id,
            category: question.skill,
            type: question.questionType,
            prompt: question.prompt,
            userAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect,
            score: isCorrect ? 1 : 0,
            maxScore: 1,
            metadata: {
              level: question.level,
              skill: question.skill,
              explanationIndonesian: question.explanation,
              options: question.options,
            },
          };
        }),
      },
    },
  });

  const badge = await prisma.nihongoBadge.findUnique({ where: { id: badgeId } });

  await prisma.userNihongoProfile.upsert({
    where: { userId: params.userId },
    create: {
      userId: params.userId,
      currentLevel: placement.readinessLabel,
      targetLevel: "N4",
      weaknessTags,
      strengthTags,
      recommendedLessonIds,
      recommendedCurriculumFocus: weaknessTags.length ? weaknessTags : ["reading", "grammar"],
      recommendedDailyPlan: buildPlacementDailyPlan(placement.readinessLabel, weaknessTags),
      nextLessonId: nextLesson?.id,
      badgeId,
      assessmentCompletedAt: assessmentSession.completedAt,
      latestAssessmentId: assessmentSession.id,
    },
    update: {
      currentLevel: placement.readinessLabel,
      weaknessTags: { set: weaknessTags },
      strengthTags: { set: strengthTags },
      recommendedLessonIds: { set: recommendedLessonIds },
      recommendedCurriculumFocus: { set: weaknessTags.length ? weaknessTags : ["reading", "grammar"] },
      recommendedDailyPlan: buildPlacementDailyPlan(placement.readinessLabel, weaknessTags),
      nextLessonId: nextLesson?.id,
      badgeId,
      assessmentCompletedAt: assessmentSession.completedAt,
      latestAssessmentId: assessmentSession.id,
    },
  });

  await prisma.userNihongoBadge.upsert({
    where: { userId_badgeId: { userId: params.userId, badgeId } },
    create: { userId: params.userId, badgeId, assessmentSessionId: assessmentSession.id },
    update: { assessmentSessionId: assessmentSession.id, assignedAt: new Date() },
  });

  return NextResponse.json({
    sessionId: assessmentSession.id,
    result: {
      overallScore: placement.totalScore,
      estimatedLevel: placement.readinessLabel,
      placement,
      scoreBySkill: placement.scoreBySkill,
      scoreByLevel: placement.scoreByLevel,
      bridgeScore: placement.bridgeScore,
      recommendedLevel: placement.recommendedLevel,
      weaknessTags,
      strengthTags,
      recommendedCurriculumFocus: weaknessTags.length ? weaknessTags : ["reading", "grammar"],
      recommendedDailyPlan: buildPlacementDailyPlan(placement.readinessLabel, weaknessTags),
      aiFeedbackIndonesian: `Placement kamu: ${placement.readinessLabel}. Skor total ${placement.totalScore}/100.`,
      encouragementJapanese: "少しずつ進めば、必ず上手になります。",
      pronunciation: params.pronunciation ?? null,
      badge,
      recommendedLessons,
      nextLesson,
    },
  });
}

function mapPlacementToBadge(label: string) {
  if (label === "N4 Strong") return "mastery-fighter";
  if (label === "N4 Mid Ready") return "adventure-captain";
  if (label === "N4 Foundation") return "limitless-sensei";
  if (label === "N5 Strong") return "rising-teammate";
  return "determined-ninja";
}

function buildPlacementDailyPlan(label: string, weaknessTags: string[]) {
  const weak = weaknessTags[0] ?? "grammar";
  if (label.includes("N4")) return `15 menit review ${weak}, 15 menit N4 bridge practice, lalu 10 menit reading/listening.`;
  return `15 menit N5 ${weak}, 10 menit vocabulary/kanji, lalu 10 menit latihan kalimat pendek.`;
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}
