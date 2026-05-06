import { prisma } from "@/lib/db/prisma";
import {
  AccessDecision,
  TRIAL_FLASHCARD_LIMIT,
  decideAiTutorAccess,
  decideFlashcardAccess,
  decideLessonAccess,
  decideReadingAccess,
} from "@/lib/nexus/access-policy";

export type { AccessDecision } from "@/lib/nexus/access-policy";

export async function getNihongoAccess(userId: string) {
  const access = await prisma.appUserAccess.findFirst({
    where: {
      userId,
      app: { slug: "nihongo" },
      status: "ACTIVE",
    },
    include: { app: true },
    orderBy: { createdAt: "desc" },
  });

  const plan = access?.billingPlan ?? "TRIAL";
  const isPaid =
    plan !== "TRIAL" &&
    Boolean(access) &&
    (!access?.accessExpiresAt || access.accessExpiresAt > new Date());

  return {
    access,
    plan,
    isTrial: !isPaid,
    isPaid,
  };
}

export async function ensureNihongoTrial(userId: string) {
  const app = await prisma.platformApp.findUnique({ where: { slug: "nihongo" } });
  if (!app) return null;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.subscription.upsert({
    where: { id: `${userId}:${app.id}:trial` },
    update: {},
    create: {
      id: `${userId}:${app.id}:trial`,
      userId,
      appId: app.id,
      status: "TRIAL",
      expiresAt,
    },
  });

  return prisma.appUserAccess.upsert({
    where: { userId_appId: { userId, appId: app.id } },
    update: {},
    create: {
      userId,
      appId: app.id,
      status: "ACTIVE",
      billingPlan: "TRIAL",
      billingPeriod: "TRIAL",
      accessExpiresAt: expiresAt,
    },
  });
}

export async function canAccessLesson(userId: string, lessonOrder: number): Promise<AccessDecision> {
  const access = await getNihongoAccess(userId);
  return decideLessonAccess({ isPaid: access.isPaid, plan: access.plan, lessonOrder });
}

export async function canUseFlashcard(userId: string, requestedLimit = TRIAL_FLASHCARD_LIMIT): Promise<AccessDecision> {
  const access = await getNihongoAccess(userId);
  return decideFlashcardAccess({ isPaid: access.isPaid, plan: access.plan, requestedLimit });
}

export async function canAskAiTutor(userId: string): Promise<AccessDecision> {
  const access = await getNihongoAccess(userId);
  const usage = await getOrCreateFeatureUsage(userId, "AI_TUTOR_QUESTION");
  return decideAiTutorAccess({ isPaid: access.isPaid, plan: access.plan, used: usage.count });
}

export async function canAccessReading(userId: string): Promise<AccessDecision> {
  const access = await getNihongoAccess(userId);
  return decideReadingAccess({ isTrial: access.isTrial, plan: access.plan });
}

export async function incrementFeatureUsage(userId: string, feature: string, amount = 1) {
  const usage = await getOrCreateFeatureUsage(userId, feature);
  return prisma.featureUsage.update({
    where: { id: usage.id },
    data: { count: { increment: amount } },
  });
}

async function getOrCreateFeatureUsage(userId: string, feature: string) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return prisma.featureUsage.upsert({
    where: {
      userId_appSlug_feature_periodStart: {
        userId,
        appSlug: "nihongo",
        feature,
        periodStart,
      },
    },
    update: {},
    create: {
      userId,
      appSlug: "nihongo",
      feature,
      periodStart,
      count: 0,
    },
  });
}
