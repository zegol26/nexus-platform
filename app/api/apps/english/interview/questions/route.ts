import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const canReview = user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "TEACHER";

  const [questions, answers, pendingReviews] = await Promise.all([
    prisma.englishInterviewQuestion.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
    prisma.englishInterviewAnswer.findMany({
      where: { userId: user.id },
      include: {
        review: true,
      },
      orderBy: { submittedAt: "desc" },
    }),
    canReview
      ? prisma.englishInterviewAnswer.findMany({
          include: {
            user: { select: { name: true, email: true } },
            question: true,
            review: true,
          },
          orderBy: { submittedAt: "desc" },
          take: 50,
        })
      : Promise.resolve([]),
  ]);

  return NextResponse.json({
    canReview,
    questions: questions.map((question) => ({
      id: question.id,
      order: question.order,
      prompt: question.prompt,
      focusArea: question.focusArea,
      expectedDuration: question.expectedDuration,
      audioUrl: `/api/apps/english/interview/questions/${question.id}/audio`,
      audioReady: Boolean(question.audioBase64),
      audioProvider: question.audioProvider,
    })),
    answers: answers.map((answer) => ({
      id: answer.id,
      questionId: answer.questionId,
      durationSec: answer.durationSec,
      submittedAt: answer.submittedAt,
      status: answer.status,
      review: answer.review,
    })),
    reviewQueue: pendingReviews.map((answer) => ({
      id: answer.id,
      userName: answer.user.name,
      userEmail: answer.user.email,
      questionPrompt: answer.question.prompt,
      questionFocusArea: answer.question.focusArea,
      durationSec: answer.durationSec,
      submittedAt: answer.submittedAt,
      audioUrl: `/api/apps/english/interview/answers/${answer.id}/audio`,
      review: answer.review,
    })),
  });
}
