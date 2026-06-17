import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { syncMidtransPaymentStatus } from "@/lib/platform/sync-midtrans-payment";

export async function POST(
  _req: Request,
  context: { params: Promise<{ paymentId: string }> }
) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { paymentId } = await context.params;
  const result = await syncMidtransPaymentStatus({ paymentId });

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        checks: "checks" in result ? result.checks : undefined,
        providerStatus: "providerStatus" in result ? result.providerStatus : undefined,
      },
      { status: result.statusCode }
    );
  }

  return NextResponse.json({
    payment: result.payment,
    providerStatus: result.providerStatus,
  });
}
