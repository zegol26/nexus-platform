import { prisma } from "@/lib/db/prisma";
import { decideAiTutorAccess, type AccessDecision } from "@/lib/nexus/access-policy";

export const ARABIC_APP_SLUG = "arabic";
export const ARABIC_TUTOR_FEATURE = "AI_TUTOR_QUESTION";
export const ARABIC_CONVERSATION_FEATURE = "AI_CONVERSATION_TURN";

export type { AccessDecision } from "@/lib/nexus/access-policy";

export async function getArabicAccess(userId: string) {
  const access = await prisma.appUserAccess.findFirst({
    where: {
      userId,
      app: { slug: ARABIC_APP_SLUG },
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

export async function ensureArabicTrial(userId: string) {
  const app = await prisma.platformApp.findUnique({
    where: { slug: ARABIC_APP_SLUG },
  });
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

async function getOrCreateArabicFeatureUsage(userId: string, feature: string) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return prisma.featureUsage.upsert({
    where: {
      userId_appSlug_feature_periodStart: {
        userId,
        appSlug: ARABIC_APP_SLUG,
        feature,
        periodStart,
      },
    },
    update: {},
    create: {
      userId,
      appSlug: ARABIC_APP_SLUG,
      feature,
      periodStart,
      count: 0,
    },
  });
}

export async function incrementArabicFeatureUsage(
  userId: string,
  feature: string,
  amount = 1
) {
  const usage = await getOrCreateArabicFeatureUsage(userId, feature);
  return prisma.featureUsage.update({
    where: { id: usage.id },
    data: { count: { increment: amount } },
  });
}

export async function canAskArabicTutor(userId: string): Promise<AccessDecision> {
  const access = await getArabicAccess(userId);
  const usage = await getOrCreateArabicFeatureUsage(userId, ARABIC_TUTOR_FEATURE);
  return decideAiTutorAccess({
    isPaid: access.isPaid,
    plan: access.plan,
    used: usage.count,
  });
}
