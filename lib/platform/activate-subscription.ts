import { prisma } from "@/lib/db/prisma";

export async function activatePaidAccess(paymentId: string) {
  const payment = await prisma.paymentTransaction.findUnique({
    where: { id: paymentId },
    include: { plan: true },
  });

  if (!payment) return null;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + payment.durationDays);
  const billingPlan = payment.plan?.code ?? "MANUAL";
  const billingPeriod = payment.plan?.billingPeriod ?? `${payment.durationDays}_DAYS`;

  await prisma.appUserAccess.upsert({
    where: { userId_appId: { userId: payment.userId, appId: payment.appId } },
    update: {
      status: "ACTIVE",
      billingPlan,
      billingPeriod,
      accessStartsAt: new Date(),
      accessExpiresAt: expiresAt,
    },
    create: {
      userId: payment.userId,
      appId: payment.appId,
      status: "ACTIVE",
      billingPlan,
      billingPeriod,
      accessExpiresAt: expiresAt,
    },
  });

  await prisma.subscription.create({
    data: {
      userId: payment.userId,
      appId: payment.appId,
      planId: payment.planId,
      status: "ACTIVE",
      startedAt: new Date(),
      expiresAt,
    },
  });

  return { payment, expiresAt };
}
