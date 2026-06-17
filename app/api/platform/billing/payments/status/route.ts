import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { isValidAppAccess } from "@/lib/platform/access";
import { syncMidtransPaymentStatus } from "@/lib/platform/sync-midtrans-payment";

export const dynamic = "force-dynamic";

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

  if (payment.status !== "PAID") {
    try {
      const syncResult = await syncMidtransPaymentStatus({
        orderId,
        userEmail: session?.user?.email ?? undefined,
      });

      if (syncResult.ok) {
        payment.status = syncResult.payment.status;
        payment.paidAt = syncResult.payment.paidAt;
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
