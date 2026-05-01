import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

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

  const lessonsWithProgress = lessons.map(
  (lesson: { id: string }) => ({
    ...lesson,
    completed: completedLessonIds.has(lesson.id),
  })
  );

  return NextResponse.json({
    lessons: lessonsWithProgress,
  });
}