import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { isValidAppAccess } from "@/lib/platform/access";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId")?.trim();

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const payment = await prisma.paymentTransaction.findFirst({
    where: {
      provider: "MIDTRANS",
      providerRef: orderId,
      user: { email: session.user.email },
    },
    select: {
      id: true,
      providerRef: true,
      status: true,
      paidAt: true,
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
  });
}
