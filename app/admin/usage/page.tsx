import { AdminSection, EmptyState } from "@/components/admin/AdminTable";
import { prisma } from "@/lib/db/prisma";

export default async function AdminUsagePage() {
  const usage = await prisma.featureUsage.findMany({
    include: { user: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <AdminSection title="Usage" description="View AI and feature usage counters.">
      {!usage.length ? <EmptyState label="No usage tracked yet." /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {usage.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
              <p className="font-semibold">{item.feature}: {item.count}</p>
              <p className="mt-1 text-slate-500">{item.user.email} - {item.appSlug}</p>
            </div>
          ))}
        </div>
      )}
    </AdminSection>
  );
}
