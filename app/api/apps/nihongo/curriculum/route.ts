import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { canAccessLesson } from "@/lib/nexus/access-guards";

const alwaysAccessibleLessonSlugs = new Set([
  "hiragana-foundation",
  "katakana-foundation",
  "kanji-n5-foundation",
  "kanji-n4-foundation",
]);

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  const lessons = await prisma.nihongoLesson.findMany({
    orderBy: {
      order: "asc",
    },
  });

  const progress = await prisma.nihongoLessonProgress.findMany({
    where: {
      userId: user.id,
      completed: true,
    },
  });

  const completedLessonIds = new Set<string>(
  progress.map((p: { lessonId: string }) => p.lessonId)
  );

  const accessDecisions = await Promise.all(
    lessons.map((lesson: { order: number; slug: string | null }) =>
      lesson.slug && alwaysAccessibleLessonSlugs.has(lesson.slug)
        ? { allowed: true, plan: "FOUNDATION" }
        : canAccessLesson(user.id, lesson.order)
    )
  );

  const lessonsWithProgress = lessons.map((lesson: { id: string }, index: number) => ({
    ...lesson,
    completed: completedLessonIds.has(lesson.id),
    access: accessDecisions[index],
  }));

  return NextResponse.json({
    lessons: lessonsWithProgress,
  });
}
