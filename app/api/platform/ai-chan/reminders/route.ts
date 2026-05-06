import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { generateAiChanReminders } from "@/lib/ai-chan/reminder-engine";

export const dynamic = "force-dynamic";

const TRIAL_USAGE_QUOTA = 50;

function getMostRecentDate(dates: Array<Date | null | undefined>) {
  return dates.reduce<Date | null>((latestDate, date) => {
    if (!date) return latestDate;
    if (!latestDate || date > latestDate) return date;
    return latestDate;
  }, null);
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      appAccess: {
        include: { app: true },
        orderBy: { createdAt: "asc" },
      },
      subscriptions: {
        orderBy: { updatedAt: "desc" },
      },
      nihongoProfile: {
        include: { nextLesson: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [unpaidPayment, completedProgress, latestProgress, trialUsage] =
    await Promise.all([
      prisma.paymentTransaction.findFirst({
        where: {
          userId: user.id,
          status: { in: ["PENDING", "WAITING_VERIFICATION", "EXPIRED"] },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.nihongoLessonProgress.findMany({
        where: { userId: user.id, completed: true },
        select: { lessonId: true },
      }),
      prisma.nihongoLessonProgress.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      prisma.featureUsage.findMany({
        where: {
          userId: user.id,
          appSlug: "nihongo",
        },
        select: { count: true },
      }),
    ]);

  const completedLessonIds = completedProgress.map((progress) => progress.lessonId);
  const profileNextLesson = user.nihongoProfile?.nextLesson;
  const nextLesson =
    profileNextLesson && !completedLessonIds.includes(profileNextLesson.id)
      ? profileNextLesson
      : await prisma.nihongoLesson.findFirst({
          where:
            completedLessonIds.length > 0
              ? { id: { notIn: completedLessonIds } }
              : undefined,
          orderBy: { order: "asc" },
        });

  const primarySubscription =
    user.subscriptions.find((subscription) =>
      ["EXPIRED", "TRIAL", "ACTIVE"].includes(subscription.status)
    ) ?? user.subscriptions[0];
  const primaryAccess = user.appAccess[0];
  const isTrial =
    primarySubscription?.status === "TRIAL" ||
    primaryAccess?.billingPlan?.toUpperCase() === "TRIAL";
  const usageCount = trialUsage.reduce(
    (totalCount, usage) => totalCount + usage.count,
    0
  );
  const lastOpenedAt = getMostRecentDate(
    user.appAccess.map((access) => access.lastOpenedAt)
  );
  const lastActiveAt = getMostRecentDate([
    lastOpenedAt,
    latestProgress?.updatedAt,
    user.updatedAt,
  ]);

  const reminders = generateAiChanReminders({
    user: {
      name: user.name,
      email: user.email,
    },
    subscription: {
      status: primarySubscription?.status,
      expiresAt: primarySubscription?.expiresAt ?? primaryAccess?.accessExpiresAt,
      hasUnpaidPayment: Boolean(unpaidPayment),
    },
    trial: {
      isTrial,
      usageCount,
      quota: TRIAL_USAGE_QUOTA,
    },
    nextLesson: nextLesson
      ? {
          id: nextLesson.id,
          title: nextLesson.title,
          href: `/apps/nihongo/curriculum/${nextLesson.id}`,
        }
      : null,
    lastActiveAt,
  });

  return NextResponse.json({ reminders });
}
