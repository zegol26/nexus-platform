import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withRouteMetrics } from "@/lib/observability/route-metrics";
import { activatePaidAccessForPayment } from "@/lib/platform/activate-subscription";
import {
  getMidtransMode,
  getMidtransRuntimeMode,
  getMidtransServerKey,
  mapMidtransStatus,
  verifyMidtransSignature,
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

export async function POST(req: Request) {
  return withRouteMetrics(
    {
      route: "/api/platform/billing/midtrans/webhook",
      method: "POST",
      routeType: "payment",
      riskLevel: "medium",
    },
    () => handleMidtransWebhook(req)
  );
}

async function handleMidtransWebhook(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    order_id?: string;
    transaction_status?: string;
    fraud_status?: string;
    status_code?: string;
    gross_amount?: string;
    signature_key?: string;
  } | null;

  if (!body?.order_id || !body.transaction_status) {
    return NextResponse.json({ error: "Invalid Midtrans payload" }, { status: 400 });
  }

  const paymentForMode = await prisma.paymentTransaction.findUnique({
    where: {
      provider_providerRef: {
        provider: "MIDTRANS",
        providerRef: body.order_id,
      },
    },
    select: { id: true, paidAt: true, rawPayload: true, status: true },
  });

  if (!paymentForMode) {
    console.warn("midtrans_webhook_unknown_order", { orderId: body.order_id });
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const rawPaymentPayload = parseRawPayload(paymentForMode?.rawPayload ?? null);
  const paymentMode =
    typeof rawPaymentPayload.midtransMode === "string"
      ? rawPaymentPayload.midtransMode
      : null;
  const billingSettings = paymentMode ? null : await getBillingSettings();
  const mode = paymentMode
    ? getMidtransMode(paymentMode)
    : getMidtransRuntimeMode(billingSettings?.midtransMode);
  const serverKey = getMidtransServerKey(mode);
  if (!serverKey) {
    return NextResponse.json({ error: "Midtrans server key is not configured" }, { status: 503 });
  }

  const signatureOk =
    body.status_code &&
    body.gross_amount &&
    body.signature_key &&
    verifyMidtransSignature({
      orderId: body.order_id,
      statusCode: body.status_code,
      grossAmount: body.gross_amount,
      signatureKey: body.signature_key,
      serverKey,
    });

  if (!signatureOk) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const mappedStatus = mapMidtransStatus(body.transaction_status, body.fraud_status);
  const status =
    paymentForMode.status === "PAID" && mappedStatus !== "PAID"
      ? "PAID"
      : mappedStatus;

  await prisma.$transaction(async (tx) => {
    const payment = await tx.paymentTransaction.update({
      where: { id: paymentForMode.id },
      data: {
        status,
        paidAt: status === "PAID" ? paymentForMode.paidAt ?? new Date() : null,
        rawPayload: JSON.stringify({
          ...rawPaymentPayload,
          midtransMode: mode,
          notification: body,
          transaction_status: body.transaction_status,
          fraud_status: body.fraud_status ?? null,
        }),
      },
    });

    if (status === "PAID") {
      await activatePaidAccessForPayment(tx, payment.id);
    }
  });

  return NextResponse.json({ ok: true, status });
}
