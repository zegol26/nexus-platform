import { AdminSection, EmptyState } from "@/components/admin/AdminTable";
import { prisma } from "@/lib/db/prisma";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    include: { user: true, app: true, plan: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <AdminSection title="Subscriptions" description="View trial, active, expired, and canceled subscriptions.">
      {!subscriptions.length ? <EmptyState label="No subscriptions yet." /> : (
        <div className="grid gap-3">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
              <p className="font-semibold">{subscription.user.email} - {subscription.app.name}</p>
              <p className="mt-1 text-slate-500">{subscription.status} - {subscription.plan?.name ?? "Trial"} - expires {subscription.expiresAt?.toLocaleDateString() ?? "never"}</p>
            </div>
          ))}
        </div>
      )}
    </AdminSection>
  );
}
