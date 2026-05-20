import { prisma } from "@/lib/db/prisma";
import { decideAiTutorAccess, type AccessDecision } from "@/lib/nexus/access-policy";
import { PMP_APP_SLUG, PMP_GENERATOR_FEATURE } from "@/lib/pmp/prompt";

export async function ensurePmpTrial(userId: string) {
  const app = await prisma.platformApp.upsert({
    where: { slug: PMP_APP_SLUG },
    update: {
      name: "PMP Exam Prep",
      description: "PMP Exam Prep - lessons, drills, and full-length simulations.",
      status: "ACTIVE",
    },
    create: {
      slug: PMP_APP_SLUG,
      name: "PMP Exam Prep",
      description: "PMP Exam Prep - lessons, drills, and full-length simulations.",
      status: "ACTIVE",
    },
  });

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

export async function getPmpAccess(userId: string) {
  const access = await prisma.appUserAccess.findFirst({
    where: {
      userId,
      app: { slug: PMP_APP_SLUG },
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

  return { access, plan, isTrial: !isPaid, isPaid };
}

async function getOrCreatePmpFeatureUsage(userId: string) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return prisma.featureUsage.upsert({
    where: {
      userId_appSlug_feature_periodStart: {
        userId,
        appSlug: PMP_APP_SLUG,
        feature: PMP_GENERATOR_FEATURE,
        periodStart,
      },
    },
    update: {},
    create: {
      userId,
      appSlug: PMP_APP_SLUG,
      feature: PMP_GENERATOR_FEATURE,
      periodStart,
      count: 0,
    },
  });
}

export async function canGeneratePmp(userId: string): Promise<AccessDecision> {
  const access = await getPmpAccess(userId);
  const usage = await getOrCreatePmpFeatureUsage(userId);
  return decideAiTutorAccess({
    isPaid: access.isPaid,
    plan: access.plan,
    used: usage.count,
  });
}

export async function incrementPmpUsage(userId: string, amount = 1) {
  const usage = await getOrCreatePmpFeatureUsage(userId);
  return prisma.featureUsage.update({
    where: { id: usage.id },
    data: { count: { increment: amount } },
  });
}

