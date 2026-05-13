import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { arabicCurriculum } from "@/lib/arabic/curriculum";
import { trackEvent } from "@/lib/analytics/trackEvent";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [lessonEvents, quizEvents, tutorEvents, conversationEvents] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: {
        userId: user.id,
        appSlug: "arabic",
        eventType: "LESSON_COMPLETED",
      },
      select: { lessonId: true, createdAt: true },
    }),
    prisma.analyticsEvent.findMany({
      where: {
        userId: user.id,
        appSlug: "arabic",
        eventType: "QUIZ_COMPLETED",
      },
      select: { metadata: true, createdAt: true },
    }),
    prisma.analyticsEvent.count({
      where: {
        userId: user.id,
        appSlug: "arabic",
        eventType: "AI_TUTOR_MESSAGE",
      },
    }),
    prisma.analyticsEvent.count({
      where: {
        userId: user.id,
        appSlug: "arabic",
        eventType: "LESSON_STARTED",
        pagePath: "/apps/arabic/conversation",
      },
    }),
  ]);

  const completedLessonIds = new Set(
    lessonEvents.map((event) => event.lessonId).filter(Boolean) as string[]
  );

  const totalLessons = arabicCurriculum.length;
  const completedCount = completedLessonIds.size;
  const percentage =
    totalLessons > 0
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;

  const skillBreakdown = arabicCurriculum.reduce(
    (acc, lesson) => {
      const skill = lesson.targetSkill;
      if (!acc[skill]) acc[skill] = { total: 0, completed: 0 };
      acc[skill].total += 1;
      if (completedLessonIds.has(lesson.id)) acc[skill].completed += 1;
      return acc;
    },
    {} as Record<string, { total: number; completed: number }>
  );

  const quizScores = quizEvents
    .map((event) => {
      const meta = event.metadata as { score?: number; total?: number } | null;
      if (!meta || typeof meta.score !== "number" || typeof meta.total !== "number" || meta.total === 0) {
        return null;
      }
      return (meta.score / meta.total) * 100;
    })
    .filter((value): value is number => value !== null);

  const averageQuizScore =
    quizScores.length > 0
      ? Math.round(quizScores.reduce((sum, value) => sum + value, 0) / quizScores.length)
      : 0;

  return NextResponse.json({
    totalLessons,
    completedLessons: completedCount,
    percentage,
    skillBreakdown,
    averageQuizScore,
    quizSessions: quizEvents.length,
    tutorMessages: tutorEvents,
    conversationSessions: conversationEvents,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId : null;
  if (!lessonId) {
    return NextResponse.json({ error: "lessonId required" }, { status: 400 });
  }

  const lesson = arabicCurriculum.find((current) => current.id === lessonId);
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  await trackEvent({
    userId: user.id,
    eventType: "LESSON_COMPLETED",
    appSlug: "arabic",
    pagePath: `/apps/arabic/lessons/${lessonId}`,
    lessonId,
    metadata: {
      level: lesson.level,
      moduleTitle: lesson.moduleTitle,
      targetSkill: lesson.targetSkill,
    },
  });

  return NextResponse.json({ ok: true });
}
