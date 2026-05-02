import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { calculateN5MockReadiness } from "@/lib/nihongo/mock-tests/readiness";

type SubmittedAnswer = {
  questionId: string;
  answer: string;
};

const sectionTargets = [
  { section: "Moji-Goi", take: 15 },
  { section: "Bunpou", take: 15 },
  { section: "Dokkai", take: 10 },
];

export async function GET() {
  const auth = await getAuthorizedUser();
  if ("response" in auth) return auth.response;

  const questions = await selectMockQuestions();

  return NextResponse.json({
    readiness: auth.readiness,
    questions: questions.map((question) => ({
      id: question.id,
      section: question.section,
      subCategory: question.subCategory,
      question: question.question,
      options: Array.isArray(question.options) ? question.options : [],
      explanation: question.explanation,
    })),
    totalAvailable: await prisma.nihongoMockTestQuestion.count({
      where: { level: "JLPT N5", testType: "mock_test", isActive: true },
    }),
  });
}

export async function POST(request: Request) {
  const auth = await getAuthorizedUser();
  if ("response" in auth) return auth.response;

  const body = (await request.json()) as { answers?: SubmittedAnswer[] };
  const answers = body.answers ?? [];
  const ids = answers.map((answer) => answer.questionId);

  const questions = await prisma.nihongoMockTestQuestion.findMany({
    where: {
      id: { in: ids },
      level: "JLPT N5",
      testType: "mock_test",
      isActive: true,
    },
  });

  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const graded = answers
    .map((answer) => {
      const question = questionMap.get(answer.questionId);
      if (!question) return null;

      return {
        question,
        userAnswer: answer.answer,
        isCorrect: answer.answer === question.correctAnswer,
      };
    })
    .filter(Boolean) as Array<{
    question: (typeof questions)[number];
    userAnswer: string;
    isCorrect: boolean;
  }>;

  if (!graded.length) {
    return NextResponse.json({ error: "No valid answers submitted." }, { status: 400 });
  }

  const correctCount = graded.filter((answer) => answer.isCorrect).length;
  const scorePercent = Math.round((correctCount / graded.length) * 100);

  const attempt = await prisma.nihongoMockTestAttempt.create({
    data: {
      userId: auth.user.id,
      level: "JLPT N5",
      totalQuestions: graded.length,
      correctCount,
      scorePercent,
      answers: {
        create: graded.map((answer) => ({
          questionId: answer.question.id,
          userAnswer: answer.userAnswer,
          isCorrect: answer.isCorrect,
        })),
      },
    },
  });

  return NextResponse.json({
    attemptId: attempt.id,
    scorePercent,
    correctCount,
    totalQuestions: graded.length,
    passed: scorePercent >= 70,
    review: graded.map((answer) => ({
      questionId: answer.question.id,
      correctAnswer: answer.question.correctAnswer,
      userAnswer: answer.userAnswer,
      isCorrect: answer.isCorrect,
      explanation: answer.question.explanation,
    })),
  });
}

async function getAuthorizedUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      nihongoProfile: true,
      nihongoAssessments: {
        where: { status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    return { response: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }

  const readiness = calculateN5MockReadiness({
    role: user.role,
    latestAssessmentScore: user.nihongoAssessments[0]?.overallScore ?? null,
    profileLevel: user.nihongoProfile?.currentLevel,
  });

  if (!readiness.isReady) {
    return {
      response: NextResponse.json(
        {
          error: "JLPT N5 Mock Test is locked.",
          readiness,
        },
        { status: 403 }
      ),
    };
  }

  return { user, readiness };
}

async function selectMockQuestions() {
  const groups = await Promise.all(
    sectionTargets.map(async (target) => {
      const questions = await prisma.nihongoMockTestQuestion.findMany({
        where: {
          level: "JLPT N5",
          testType: "mock_test",
          section: target.section,
          isActive: true,
        },
        take: target.take * 4,
        orderBy: { originalId: "asc" },
      });

      return shuffle(questions).slice(0, target.take);
    })
  );

  return shuffle(groups.flat());
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
