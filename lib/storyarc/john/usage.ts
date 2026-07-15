import { prisma } from "@/lib/db/prisma";
import { STORYARC_APP_SLUG } from "@/lib/storyarc/constants";
import { STORYARC_JOHN_DAILY_LIMIT, storyArcJohnDayWindow } from "./quota-policy";

export const STORYARC_JOHN_FEATURE = "STORYARC_AI_TUTOR";

export type StoryArcJohnUsage = {
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
  resetsAt: string;
  reason?: string;
};

function decision(count: number, periodEnd: Date): StoryArcJohnUsage {
  const used = Math.min(count, STORYARC_JOHN_DAILY_LIMIT);
  const remaining = Math.max(0, STORYARC_JOHN_DAILY_LIMIT - used);
  return {
    allowed: remaining > 0,
    limit: STORYARC_JOHN_DAILY_LIMIT,
    used,
    remaining,
    resetsAt: periodEnd.toISOString(),
    ...(remaining === 0
      ? { reason: "Batas 5 percakapan dengan John hari ini sudah tercapai." }
      : {}),
  };
}

export async function getStoryArcJohnUsage(userId: string, now = new Date()) {
  const { periodStart, periodEnd } = storyArcJohnDayWindow(now);
  const usage = await prisma.featureUsage.upsert({
    where: {
      userId_appSlug_feature_periodStart: {
        userId,
        appSlug: STORYARC_APP_SLUG,
        feature: STORYARC_JOHN_FEATURE,
        periodStart,
      },
    },
    create: {
      userId,
      appSlug: STORYARC_APP_SLUG,
      feature: STORYARC_JOHN_FEATURE,
      periodStart,
      periodEnd,
    },
    update: { periodEnd },
    select: { count: true },
  });
  return decision(usage.count, periodEnd);
}

export async function consumeStoryArcJohnRequest(userId: string, now = new Date()) {
  const { periodStart, periodEnd } = storyArcJohnDayWindow(now);
  return prisma.$transaction(async (tx) => {
    const usage = await tx.featureUsage.upsert({
      where: {
        userId_appSlug_feature_periodStart: {
          userId,
          appSlug: STORYARC_APP_SLUG,
          feature: STORYARC_JOHN_FEATURE,
          periodStart,
        },
      },
      create: {
        userId,
        appSlug: STORYARC_APP_SLUG,
        feature: STORYARC_JOHN_FEATURE,
        periodStart,
        periodEnd,
      },
      update: { periodEnd },
      select: { id: true, count: true },
    });

    if (usage.count >= STORYARC_JOHN_DAILY_LIMIT) {
      return { ...decision(usage.count, periodEnd), consumed: false };
    }

    const consumed = await tx.featureUsage.updateMany({
      where: { id: usage.id, count: { lt: STORYARC_JOHN_DAILY_LIMIT } },
      data: { count: { increment: 1 } },
    });
    if (consumed.count === 0) {
      const current = await tx.featureUsage.findUniqueOrThrow({
        where: { id: usage.id },
        select: { count: true },
      });
      return { ...decision(current.count, periodEnd), consumed: false };
    }

    return { ...decision(usage.count + 1, periodEnd), consumed: true };
  });
}
