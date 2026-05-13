import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import {
  arabicCurriculum,
  arabicLevelMeta,
  arabicLevelOrder,
} from "@/lib/arabic/curriculum";

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

  const completedEvents = await prisma.analyticsEvent.findMany({
    where: {
      userId: user.id,
      appSlug: "arabic",
      eventType: "LESSON_COMPLETED",
    },
    select: { lessonId: true },
  });

  const completedLessonIds = new Set(
    completedEvents.map((event) => event.lessonId).filter(Boolean) as string[]
  );

  const lessons = arabicCurriculum.map((lesson) => ({
    id: lesson.id,
    level: lesson.level,
    levelTitle: lesson.levelTitle,
    moduleTitle: lesson.moduleTitle,
    lessonTitle: lesson.lessonTitle,
    scenario: lesson.scenario,
    targetSkill: lesson.targetSkill,
    arabicType: lesson.arabicType,
    order: lesson.order,
    vocabularyCount: lesson.vocabulary.length,
    quizCount: lesson.quiz.length,
    completed: completedLessonIds.has(lesson.id),
  }));

  return NextResponse.json({
    lessons,
    levels: arabicLevelOrder.map((id) => ({
      id,
      ...arabicLevelMeta[id],
    })),
    totalLessons: lessons.length,
    completedLessons: lessons.filter((lesson) => lesson.completed).length,
  });
}
