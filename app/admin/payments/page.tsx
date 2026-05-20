import Link from "next/link";
import { AdminPaymentActions } from "@/components/admin/AdminPaymentActions";
import { AdminSection, EmptyState } from "@/components/admin/AdminTable";
import { prisma } from "@/lib/db/prisma";

export default async function AdminPaymentsPage() {
  const payments = await prisma.paymentTransaction.findMany({
    include: { user: true, app: true, plan: true, proof: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <AdminSection title="Payments" description="Verify manual payments and monitor Midtrans transactions.">
      {!payments.length ? <EmptyState label="No payments yet." /> : (
        <div className="grid gap-3">
          {payments.map((payment) => (
            <div key={payment.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-semibold">{payment.user.email} - {payment.app.name}</p>
                  <p className="text-sm text-slate-500">{payment.plan?.name ?? "Manual"} - {payment.currency} {payment.amountCents / 100} - {payment.status}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {payment.provider} {payment.providerRef ? `- ${payment.providerRef}` : ""}
                  </p>
                  {payment.proof ? (
                    <Link href={payment.proof.fileUrl} className="mt-2 inline-flex text-sm font-semibold text-blue-700" target="_blank">
                      Open payment proof
                    </Link>
                  ) : <p className="mt-2 text-sm text-amber-700">No proof uploaded.</p>}
                </div>
                <AdminPaymentActions paymentId={payment.id} paymentStatus={payment.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminSection>
  );
}
