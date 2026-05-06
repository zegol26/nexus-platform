import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ManualBillingClient } from "@/components/platform/ManualBillingClient";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { getBillingSettings } from "@/lib/platform/settings";

export const dynamic = "force-dynamic";

type BillingAppAccessRow = {
  id: string;
  status: string;
  billingPlan: string | null;
  billingPeriod: string | null;
  accessExpiresAt: Date | null;
  app: {
    name: string;
    slug: string;
  };
};

type BillingPaymentRow = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  paidAt: Date | null;
  app: {
    name: string;
  };
  plan: {
    name: string;
  } | null;
};

type BillingPlanRow = {
  id: string;
  name: string;
  code: string;
  priceCents: number;
  currency: string;
  durationDays: number;
  app: {
    name: string;
  };
};

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

function formatDate(date?: Date | null) {
  if (!date) return "Not paid";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function PlatformBillingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const [user, plans, billingSettings] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        appAccess: {
          include: { app: true },
          orderBy: { createdAt: "asc" },
        },
        payments: {
          include: { app: true, plan: true },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.subscriptionPlan.findMany({
      where: { active: true },
      include: { app: true },
      orderBy: [{ appId: "asc" }, { priceCents: "asc" }],
    }),
    getBillingSettings(),
  ]);

  if (!user) {
    redirect("/login");
  }

  const appAccess = user.appAccess as BillingAppAccessRow[];
  const payments = user.payments as BillingPaymentRow[];
  const typedPlans = plans as BillingPlanRow[];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
          Billing
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Access duration and payments
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Payment validation is ready for gateway integration. Paid transactions
          extend app access according to the selected plan duration.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {appAccess.map((access: BillingAppAccessRow) => (
          <article
            key={access.id}
            className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-xl shadow-slate-950/[0.04] backdrop-blur-2xl"
          >
            <p className="text-sm font-semibold text-slate-500">
              {access.app.name}
            </p>

            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              {access.billingPlan ?? "No plan"}
            </h2>

            <div className="mt-5 space-y-2 text-sm text-slate-600">
              <p>
                Status:{" "}
                <span className="font-semibold text-slate-950">
                  {access.status}
                </span>
              </p>

              <p>
                Period:{" "}
                <span className="font-semibold text-slate-950">
                  {access.billingPeriod ?? "No period"}
                </span>
              </p>

              <p>
                Expires:{" "}
                <span className="font-semibold text-slate-950">
                  {formatDate(access.accessExpiresAt)}
                </span>
              </p>
            </div>
          </article>
        ))}
      </section>

      <ManualBillingClient
        plans={typedPlans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          code: plan.code,
          priceCents: plan.priceCents,
          currency: plan.currency,
          durationDays: plan.durationDays,
          app: { name: plan.app.name },
        }))}
        latestPayment={payments[0] ? { id: payments[0].id, status: payments[0].status } : null}
        billingSettings={billingSettings}
      />

      <section className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-xl shadow-slate-950/[0.04] backdrop-blur-2xl">
        <h2 className="text-xl font-semibold text-slate-950">
          Payment history
        </h2>

        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200/80">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">App</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Paid at</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {payments.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-slate-500" colSpan={5}>
                    No payment records yet.
                  </td>
                </tr>
              ) : (
                payments.map((payment: BillingPaymentRow) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 font-semibold text-slate-950">
                      {payment.app.name}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {payment.plan?.name ?? "Manual"}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {formatMoney(payment.amountCents, payment.currency)}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {payment.status}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(payment.paidAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
