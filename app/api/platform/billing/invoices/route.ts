import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { withRouteMetrics } from "@/lib/observability/route-metrics";
import { getBillingSettings } from "@/lib/platform/settings";
import {
  createMidtransSnapTransaction,
  getMidtransClientKey,
  getMidtransMode,
  isMidtransEnabled,
  validateMidtransEnvironmentKeys,
} from "@/lib/platform/midtrans";

export async function POST(req: Request) {
  return withRouteMetrics(
    {
      route: "/api/platform/billing/invoices",
      method: "POST",
      routeType: "payment",
      riskLevel: "medium",
    },
    () => createInvoice(req)
  );
}

async function createInvoice(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const planId = String(body.planId ?? "");
  const method = "MIDTRANS";

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
    include: { app: true },
  });

  if (!plan || !plan.active) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const provider = "MIDTRANS";
  const billingSettings = await getBillingSettings();
  const mode = getMidtransMode(billingSettings.midtransMode);
  if (!isMidtransEnabled(billingSettings.midtransEnabled)) {
    return NextResponse.json(
      {
        error:
          "Pembayaran online sedang ditutup sementara. Silakan hubungi admin Nexus Talenta Indonesia.",
      },
      { status: 409 }
    );
  }
  const keyValidation = validateMidtransEnvironmentKeys(mode);
  if (!keyValidation.ok) {
    return NextResponse.json(
      { error: "Konfigurasi pembayaran belum siap. Silakan hubungi admin Nexus Talenta Indonesia." },
      { status: 409 }
    );
  }

  const providerRef = `nexus-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const payment = await prisma.paymentTransaction.create({
    data: {
      userId: user.id,
      appId: plan.appId,
      planId: plan.id,
      provider,
      providerRef,
      status: "PENDING",
      amountCents: plan.priceCents,
      currency: plan.currency,
      durationDays: plan.durationDays,
      rawPayload: JSON.stringify({ method }),
    },
  });

  try {
    const snap = await createMidtransSnapTransaction(mode, {
      orderId: providerRef,
      grossAmount: Math.round(plan.priceCents / 100),
      customer: {
        firstName: user.name,
        email: user.email,
      },
      item: {
        id: plan.code,
        price: Math.round(plan.priceCents / 100),
        quantity: 1,
        name: `${plan.app.name} - ${plan.name}`,
      },
    });

    await prisma.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        rawPayload: JSON.stringify({
          method,
          midtransMode: mode,
          snapToken: snap.token,
          redirectUrl: snap.redirect_url,
        }),
      },
    });

    return NextResponse.json({
      payment,
      midtrans: {
        mode,
        token: snap.token,
        redirectUrl: snap.redirect_url,
        clientKeyConfigured: Boolean(getMidtransClientKey(mode)),
      },
    });
  } catch (error) {
    await prisma.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        status: "REJECTED",
        rawPayload: JSON.stringify({
          method,
          midtransMode: mode,
          error: error instanceof Error ? error.message : "Midtrans checkout failed",
        }),
      },
    });

    return NextResponse.json(
      {
        error: "Checkout pembayaran belum bisa dibuat. Silakan coba lagi atau hubungi admin.",
      },
      { status: 502 }
    );
  }
}
