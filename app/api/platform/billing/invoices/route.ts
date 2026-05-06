import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
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

  const payment = await prisma.paymentTransaction.create({
    data: {
      userId: user.id,
      appId: plan.appId,
      planId: plan.id,
      provider: "MANUAL",
      providerRef: `manual-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      status: "PENDING",
      amountCents: plan.priceCents,
      currency: plan.currency,
      durationDays: plan.durationDays,
      rawPayload: JSON.stringify({ method }),
    },
  });

  return NextResponse.json({ payment });
}
