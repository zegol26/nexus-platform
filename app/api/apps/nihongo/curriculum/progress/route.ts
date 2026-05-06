import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { awardGameReward } from "@/lib/gamification/kingdom";
import { claimLearningReward } from "@/lib/game/service";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { lessonId } = await req.json();

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

  const existingProgress = await prisma.nihongoLessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId,
      },
    },
    select: { completed: true },
  });

  const progress = await prisma.nihongoLessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId,
      },
    },
    update: {
      completed: true,
    },
    create: {
      userId: user.id,
      lessonId,
      completed: true,
    },
  });

  await trackEvent({
    userId: user.id,
    eventType: "LESSON_COMPLETED",
    lessonId,
    pagePath: `/apps/nihongo/curriculum/${lessonId}`,
  });

  if (!existingProgress?.completed) {
    await awardGameReward({
      userId: user.id,
      source: "LESSON_COMPLETE",
    });
    await claimLearningReward({
      userId: user.id,
      rewardType: "LESSON_COMPLETED",
      sourceRef: lessonId,
    }).catch(() => null);
  }

  return NextResponse.json({ progress });
}
