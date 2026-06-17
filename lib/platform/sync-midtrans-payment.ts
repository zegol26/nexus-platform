import { prisma } from "@/lib/db/prisma";
import { activatePaidAccessForPayment } from "@/lib/platform/activate-subscription";
import {
  getMidtransMode,
  getMidtransRuntimeMode,
  getMidtransTransactionStatus,
  mapMidtransStatus,
} from "@/lib/platform/midtrans";
import { getBillingSettings } from "@/lib/platform/settings";

function parseRawPayload(rawPayload: string | null) {
  if (!rawPayload) return {};
  try {
    return JSON.parse(rawPayload) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function providerString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value : undefined;
}

export async function syncMidtransPaymentStatus({
  paymentId,
  orderId,
  userEmail,
}: {
  paymentId?: string;
  orderId?: string;
  userEmail?: string;
}) {
  const payment = await prisma.paymentTransaction.findFirst({
    where: {
      ...(paymentId ? { id: paymentId } : {}),
      ...(orderId ? { provider: "MIDTRANS", providerRef: orderId } : {}),
      ...(userEmail ? { user: { email: userEmail } } : {}),
    },
    select: {
      id: true,
      provider: true,
      providerRef: true,
      status: true,
      paidAt: true,
      amountCents: true,
      rawPayload: true,
      appId: true,
      app: {
        select: {
          slug: true,
          name: true,
        },
      },
      userId: true,
    },
  });

  if (!payment) {
    return { ok: false as const, error: "Payment not found", statusCode: 404 };
  }

  if (payment.provider !== "MIDTRANS" || !payment.providerRef) {
    return { ok: false as const, error: "Payment is not a Midtrans order", statusCode: 400 };
  }

  const rawPayload = parseRawPayload(payment.rawPayload);
  const paymentMode =
    typeof rawPayload.midtransMode === "string" ? rawPayload.midtransMode : null;
  const billingSettings = paymentMode ? null : await getBillingSettings();
  const mode = paymentMode
    ? getMidtransMode(paymentMode)
    : getMidtransRuntimeMode(billingSettings?.midtransMode);

  const providerStatus = await getMidtransTransactionStatus(mode, payment.providerRef);
  const transactionStatus = providerString(providerStatus, "transaction_status");
  const fraudStatus = providerString(providerStatus, "fraud_status");
  const grossAmount = providerString(providerStatus, "gross_amount");
  const providerOrderId = providerString(providerStatus, "order_id");
  const amountMatches =
    grossAmount !== undefined &&
    Math.round(Number(grossAmount)) === Math.round(payment.amountCents / 100);

  if (providerOrderId !== payment.providerRef || !transactionStatus || !amountMatches) {
    return {
      ok: false as const,
      error: "Midtrans order or amount did not match local payment",
      statusCode: 409,
      payment,
      providerStatus,
      checks: {
        providerOrderMatches: providerOrderId === payment.providerRef,
        amountMatches,
      },
    };
  }

  const mappedStatus =
    payment.status === "PAID" && mapMidtransStatus(transactionStatus, fraudStatus) !== "PAID"
      ? "PAID"
      : mapMidtransStatus(transactionStatus, fraudStatus);

  await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        status: mappedStatus,
        paidAt: mappedStatus === "PAID" ? payment.paidAt ?? new Date() : null,
        rawPayload: JSON.stringify({
          ...rawPayload,
          midtransMode: mode,
          statusInquiry: providerStatus,
          transaction_status: transactionStatus,
          fraud_status: fraudStatus ?? null,
          payment_type: providerString(providerStatus, "payment_type") ?? null,
          status_code: providerString(providerStatus, "status_code") ?? null,
        }),
      },
    });

    if (mappedStatus === "PAID") {
      await activatePaidAccessForPayment(tx, updatedPayment.id);
    }
  });

  return {
    ok: true as const,
    payment: {
      ...payment,
      status: mappedStatus,
      paidAt: mappedStatus === "PAID" ? payment.paidAt ?? new Date() : null,
    },
    providerStatus: {
      transaction_status: transactionStatus,
      fraud_status: fraudStatus ?? null,
      payment_type: providerString(providerStatus, "payment_type") ?? null,
      status_code: providerString(providerStatus, "status_code") ?? null,
      order_id: providerOrderId,
      gross_amount: grossAmount,
    },
  };
}

export async function syncPendingMidtransPaymentsForUser(userEmail: string, limit = 3) {
  const pendingPayments = await prisma.paymentTransaction.findMany({
    where: {
      provider: "MIDTRANS",
      providerRef: { not: null },
      status: { in: ["PENDING", "WAITING_VERIFICATION"] },
      user: { email: userEmail },
    },
    select: { id: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  for (const payment of pendingPayments) {
    try {
      await syncMidtransPaymentStatus({ paymentId: payment.id, userEmail });
    } catch (error) {
      console.warn("midtrans_user_auto_sync_failed", {
        paymentId: payment.id,
        message: error instanceof Error ? error.message : "unknown",
      });
    }
  }
}

export async function syncRecentPendingMidtransPayments(limit = 10) {
  const pendingPayments = await prisma.paymentTransaction.findMany({
    where: {
      provider: "MIDTRANS",
      providerRef: { not: null },
      status: { in: ["PENDING", "WAITING_VERIFICATION"] },
    },
    select: { id: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  for (const payment of pendingPayments) {
    try {
      await syncMidtransPaymentStatus({ paymentId: payment.id });
    } catch (error) {
      console.warn("midtrans_admin_auto_sync_failed", {
        paymentId: payment.id,
        message: error instanceof Error ? error.message : "unknown",
      });
    }
  }
}
