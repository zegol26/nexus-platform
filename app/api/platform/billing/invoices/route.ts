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
  const method = String(body.method ?? "BANK_TRANSFER");

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
    include: { app: true },
  });

  if (!plan || !plan.active) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const provider = method === "MIDTRANS" ? "MIDTRANS" : "MANUAL";
  const billingSettings =
    provider === "MIDTRANS" ? await getBillingSettings() : null;
  const mode = getMidtransMode(billingSettings?.midtransMode);
  if (provider === "MIDTRANS" && !isMidtransEnabled(billingSettings?.midtransEnabled)) {
    return NextResponse.json(
      {
        error:
          "Midtrans masih nonaktif untuk UAT. Aktifkan di Admin Settings setelah sandbox key diisi.",
      },
      { status: 409 }
    );
  }

  const providerRef =
    provider === "MIDTRANS"
      ? `nexus-${Date.now()}-${Math.random().toString(16).slice(2)}`
      : `manual-${Date.now()}-${Math.random().toString(16).slice(2)}`;

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

  if (provider !== "MIDTRANS") {
    return NextResponse.json({ payment });
  }

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
        error:
          error instanceof Error
            ? error.message
            : "Midtrans checkout belum bisa dibuat.",
      },
      { status: 502 }
    );
  }
}
