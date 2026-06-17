import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { isValidAppAccess } from "@/lib/platform/access";
import { activatePaidAccessForPayment } from "@/lib/platform/activate-subscription";
import {
  getMidtransMode,
  getMidtransRuntimeMode,
  getMidtransTransactionStatus,
  mapMidtransStatus,
} from "@/lib/platform/midtrans";
import { getBillingSettings } from "@/lib/platform/settings";

export const dynamic = "force-dynamic";

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

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId")?.trim();

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const payment = await prisma.paymentTransaction.findFirst({
    where: {
      provider: "MIDTRANS",
      providerRef: orderId,
      ...(session?.user?.email ? { user: { email: session.user.email } } : {}),
    },
    select: {
      id: true,
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
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const rawPayload = parseRawPayload(payment.rawPayload);
  const paymentMode =
    typeof rawPayload.midtransMode === "string" ? rawPayload.midtransMode : null;
  const billingSettings = paymentMode ? null : await getBillingSettings();
  const mode = paymentMode
    ? getMidtransMode(paymentMode)
    : getMidtransRuntimeMode(billingSettings?.midtransMode);

  if (payment.status !== "PAID") {
    try {
      const providerStatus = await getMidtransTransactionStatus(mode, payment.providerRef ?? orderId);
      const transactionStatus = providerString(providerStatus, "transaction_status");
      const fraudStatus = providerString(providerStatus, "fraud_status");
      const grossAmount = providerString(providerStatus, "gross_amount");
      const providerOrderId = providerString(providerStatus, "order_id");
      const amountMatches =
        grossAmount !== undefined &&
        Math.round(Number(grossAmount)) === Math.round(payment.amountCents / 100);

      if (providerOrderId === payment.providerRef && transactionStatus && amountMatches) {
        const mappedStatus = mapMidtransStatus(transactionStatus, fraudStatus);

        await prisma.$transaction(async (tx) => {
          const updatedPayment = await tx.paymentTransaction.update({
            where: { id: payment.id },
            data: {
              status: mappedStatus,
              paidAt:
                mappedStatus === "PAID"
                  ? payment.paidAt ?? new Date()
                  : null,
              rawPayload: JSON.stringify({
                ...rawPayload,
                midtransMode: mode,
                statusInquiry: providerStatus,
                transaction_status: transactionStatus,
                fraud_status: fraudStatus ?? null,
              }),
            },
          });

          if (mappedStatus === "PAID") {
            await activatePaidAccessForPayment(tx, updatedPayment.id);
          }
        });

        payment.status = mappedStatus;
        payment.paidAt = mappedStatus === "PAID" ? payment.paidAt ?? new Date() : null;
      }
    } catch (error) {
      console.warn("midtrans_status_inquiry_failed", {
        orderId,
        message: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  const access = await prisma.appUserAccess.findUnique({
    where: {
      userId_appId: {
        userId: payment.userId,
        appId: payment.appId,
      },
    },
    select: {
      status: true,
      accessExpiresAt: true,
      sourcePaymentId: true,
    },
  });

  const accessActive = isValidAppAccess(access);

  return NextResponse.json({
    orderId: payment.providerRef,
    paymentStatus: payment.status,
    paidAt: payment.paidAt,
    app: payment.app,
    accessActive,
    accessStatus: access?.status ?? null,
    loginRequired: !session?.user?.email,
  });
}
