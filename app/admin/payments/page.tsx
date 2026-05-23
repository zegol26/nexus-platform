import Link from "next/link";
import { AdminSection, EmptyState } from "@/components/admin/AdminTable";
import { MidtransPaymentControl } from "@/components/admin/MidtransPaymentControl";
import { prisma } from "@/lib/db/prisma";
import { ensurePlatformSettings, getBillingSettings } from "@/lib/platform/settings";

function parsePayload(rawPayload: string | null) {
  if (!rawPayload) return {};
  try {
    return JSON.parse(rawPayload) as Record<string, unknown>;
  } catch {
    return { note: rawPayload };
  }
}

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function AdminPaymentsPage() {
  await ensurePlatformSettings();
  const [payments, billingSettings] = await Promise.all([
    prisma.paymentTransaction.findMany({
      include: { user: true, app: true, plan: true, proof: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    getBillingSettings(),
  ]);
  const paymentsByMonth = payments.reduce<
    Array<{ key: string; label: string; totalCents: number; paidCount: number; payments: typeof payments }>
  >((groups, payment) => {
    const key = monthKey(payment.createdAt);
    const existing = groups.find((group) => group.key === key);
    const target =
      existing ??
      {
        key,
        label: monthLabel(payment.createdAt),
        totalCents: 0,
        paidCount: 0,
        payments: [],
      };

    target.totalCents += payment.amountCents;
    if (payment.status === "PAID") target.paidCount += 1;
    target.payments.push(payment);

    if (!existing) groups.push(target);
    return groups;
  }, []);

  return (
    <AdminSection title="Payments" description="Control checkout availability and monitor Midtrans transaction activity.">
      <div className="grid gap-4">
        <MidtransPaymentControl billingSettings={billingSettings} compact />

        {!payments.length ? <EmptyState label="No payments yet." /> : (
          <div className="grid gap-4">
            {paymentsByMonth.map((group, groupIndex) => (
              <details
                key={group.key}
                open={groupIndex === 0}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <summary className="flex cursor-pointer list-none flex-col gap-2 bg-slate-50 px-4 py-4 transition hover:bg-blue-50 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{group.label}</p>
                    <p className="text-xs text-slate-500">
                      {group.payments.length} transaksi - {group.paidCount} paid
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                      Gross {formatMoney(group.totalCents, "IDR")}
                    </span>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                      Click to expand
                    </span>
                  </div>
                </summary>

                <div className="grid gap-3 p-3">
                  {group.payments.map((payment) => {
              const payload = parsePayload(payment.rawPayload);
              const redirectUrl = typeof payload.redirectUrl === "string" ? payload.redirectUrl : "";
              const transactionStatus =
                typeof payload.transaction_status === "string" ? payload.transaction_status : "";
              const paymentType = typeof payload.payment_type === "string" ? payload.payment_type : "";
              const fraudStatus = typeof payload.fraud_status === "string" ? payload.fraud_status : "";
              const statusCode = typeof payload.status_code === "string" ? payload.status_code : "";
              const mode = typeof payload.midtransMode === "string" ? payload.midtransMode : "";

              return (
                <div key={payment.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{payment.user.email}</p>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {payment.status}
                        </span>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          {payment.provider}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {payment.app.name} - {payment.plan?.name ?? "Manual"} - {formatMoney(payment.amountCents, payment.currency)}
                      </p>
                      <div className="mt-3 grid gap-2 text-xs text-slate-500 md:grid-cols-2 xl:grid-cols-4">
                        <p><span className="font-bold text-slate-700">Order:</span> {payment.providerRef ?? payment.id}</p>
                        <p><span className="font-bold text-slate-700">Mode:</span> {mode || "n/a"}</p>
                        <p><span className="font-bold text-slate-700">Midtrans:</span> {transactionStatus || "created"}</p>
                        <p><span className="font-bold text-slate-700">Payment type:</span> {paymentType || "not selected"}</p>
                        <p><span className="font-bold text-slate-700">Fraud:</span> {fraudStatus || "n/a"}</p>
                        <p><span className="font-bold text-slate-700">Status code:</span> {statusCode || "n/a"}</p>
                        <p><span className="font-bold text-slate-700">Created:</span> {payment.createdAt.toLocaleString("id-ID")}</p>
                        <p><span className="font-bold text-slate-700">Updated:</span> {payment.updatedAt.toLocaleString("id-ID")}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        {redirectUrl ? (
                          <Link href={redirectUrl} className="font-semibold text-blue-700" target="_blank">
                            Open Midtrans checkout
                          </Link>
                        ) : null}
                        {payment.proof ? (
                          <Link href={payment.proof.fileUrl} className="font-semibold text-blue-700" target="_blank">
                            Open payment proof
                          </Link>
                        ) : null}
                      </div>
                    </div>
                    <div className="max-w-xs rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                      Status pembayaran diperbarui dari Midtrans gateway/webhook.
                      Action manual tidak ditampilkan di console ini.
                    </div>
                  </div>
                </div>
              );
            })}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </AdminSection>
  );
}
