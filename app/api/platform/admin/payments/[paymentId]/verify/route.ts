import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { activatePaidAccess } from "@/lib/platform/activate-subscription";
import { normalizePaymentVerificationAction } from "@/lib/platform/payment-policy";

export async function POST(
  req: Request,
  context: { params: Promise<{ paymentId: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = session?.user ? (session.user as { role?: string }).role : undefined;

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { paymentId } = await context.params;
  const body = await req.json();
  const status = normalizePaymentVerificationAction(body.action);

  const actor = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
    : null;

  const payment = await prisma.paymentTransaction.findUnique({
    where: { id: paymentId },
    include: { plan: true, proof: true },
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const updatedPayment = await prisma.paymentTransaction.update({
    where: { id: payment.id },
    data: {
      status,
      paidAt: status === "PAID" ? new Date() : null,
    },
  });

  if (payment.proof) {
    await prisma.paymentProof.update({
      where: { paymentId: payment.id },
      data: {
        status,
        reviewedBy: actor?.id ?? null,
        reviewedAt: new Date(),
      },
    });
  }

  if (status === "PAID") {
    await activatePaidAccess(payment.id);
  }

  return NextResponse.json({ payment: updatedPayment });
}
