import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function activatePaidAccess(paymentId: string) {
  return prisma.$transaction((tx) => activatePaidAccessForPayment(tx, paymentId));
}

export async function activatePaidAccessForPayment(
  tx: Prisma.TransactionClient,
  paymentId: string
) {
  const payment = await tx.paymentTransaction.findUnique({
    where: { id: paymentId },
    include: { plan: true },
  });

  if (!payment) return null;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + payment.durationDays);
  const billingPlan = payment.plan?.code ?? "MANUAL";
  const billingPeriod = payment.plan?.billingPeriod ?? `${payment.durationDays}_DAYS`;

  await tx.appUserAccess.upsert({
    where: { userId_appId: { userId: payment.userId, appId: payment.appId } },
    update: {
      status: "ACTIVE",
      billingPlan,
      billingPeriod,
      accessStartsAt: new Date(),
      accessExpiresAt: expiresAt,
      sourcePaymentId: payment.id,
    },
    create: {
      userId: payment.userId,
      appId: payment.appId,
      status: "ACTIVE",
      billingPlan,
      billingPeriod,
      accessExpiresAt: expiresAt,
      sourcePaymentId: payment.id,
    },
  });

  await tx.subscription.upsert({
    where: { sourcePaymentId: payment.id },
    update: {
      status: "ACTIVE",
      startedAt: new Date(),
      expiresAt,
    },
    create: {
      userId: payment.userId,
      appId: payment.appId,
      planId: payment.planId,
      sourcePaymentId: payment.id,
      status: "ACTIVE",
      startedAt: new Date(),
      expiresAt,
    },
  });

  return { payment, expiresAt };
}
