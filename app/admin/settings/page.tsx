import { AdminSection } from "@/components/admin/AdminTable";
import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";
import { prisma } from "@/lib/db/prisma";
import { ensureSubscriptionPlanCatalog } from "@/lib/platform/plan-catalog";
import { ensurePlatformSettings, getBillingSettings } from "@/lib/platform/settings";

export default async function AdminSettingsPage() {
  await ensurePlatformSettings();
  await ensureSubscriptionPlanCatalog();

  const [apps, plans, billingSettings] = await Promise.all([
    prisma.platformApp.findMany({ orderBy: { slug: "asc" } }),
    prisma.subscriptionPlan.findMany({
      include: { app: true },
      orderBy: [{ appId: "asc" }, { durationDays: "asc" }],
    }),
    getBillingSettings(),
  ]);

  return (
    <AdminSection title="Settings" description="View platform app and plan configuration.">
      <div className="grid gap-4">
        <div>
          <h3 className="font-semibold">Apps</h3>
          <div className="mt-2 flex flex-wrap gap-2">{apps.map((app) => <span key={app.id} className="rounded-full bg-slate-100 px-3 py-1 text-sm">{app.slug}: {app.status}</span>)}</div>
        </div>
        <div>
          <h3 className="font-semibold">Plans</h3>
          <div className="mt-2 grid gap-2">{plans.map((plan) => <p key={plan.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">{plan.app.slug} - {plan.code} - {plan.billingPeriod} - {plan.currency} {plan.priceCents / 100}</p>)}</div>
        </div>
        <AdminSettingsClient
          plans={plans.map((plan) => ({
            id: plan.id,
            appName: plan.app.name,
            name: plan.name,
            code: plan.code,
            priceCents: plan.priceCents,
            durationDays: plan.durationDays,
            billingPeriod: plan.billingPeriod,
            active: plan.active,
          }))}
          billingSettings={billingSettings}
        />
      </div>
    </AdminSection>
  );
}
