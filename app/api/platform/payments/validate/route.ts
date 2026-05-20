import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withRouteMetrics } from "@/lib/observability/route-metrics";
import { activatePaidAccess } from "@/lib/platform/activate-subscription";

export async function POST(req: Request) {
  return withRouteMetrics(
    {
      route: "/api/platform/payments/validate",
      method: "POST",
      routeType: "payment",
      riskLevel: "medium",
    },
    () => validatePayment(req)
  );
}

async function validatePayment(req: Request) {
  const body = await req.json();
  const provider = String(body.provider ?? "MANUAL");
  const providerRef = String(body.providerRef ?? "");
  const userId = String(body.userId ?? "");
  const appId = String(body.appId ?? "");
  const planId = body.planId ? String(body.planId) : null;
  const status = String(body.status ?? "PAID");

  if (!providerRef || !userId || !appId) {
    return NextResponse.json(
      { error: "providerRef, userId, and appId are required" },
      { status: 400 }
    );
  }

  const plan = planId
    ? await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
    : await prisma.subscriptionPlan.findFirst({ where: { appId, active: true } });

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const paidAt = status === "PAID" ? new Date() : null;

  const payment = await prisma.paymentTransaction.upsert({
    where: {
      provider_providerRef: { provider, providerRef },
    },
    update: {
      status,
      paidAt,
      rawPayload: JSON.stringify(body),
    },
    create: {
      provider,
      providerRef,
      userId,
      appId,
      planId: plan.id,
      status,
      amountCents: plan.priceCents,
      currency: plan.currency,
      durationDays: plan.durationDays,
      paidAt,
      rawPayload: JSON.stringify(body),
    },
  });

  if (status === "PAID") {
    await activatePaidAccess(payment.id);
  }

  return NextResponse.json({ payment });
}
