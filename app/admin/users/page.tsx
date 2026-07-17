import { AdminSection, EmptyState } from "@/components/admin/AdminTable";
import { prisma } from "@/lib/db/prisma";
import { isValidAppAccess } from "@/lib/platform/access";
import { setStoryArcAccess, setTeachingRole } from "./actions";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: { appAccess: { include: { app: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <AdminSection title="Users" description="View users, roles, plan, and access status.">
      {!users.length ? <EmptyState label="No users yet." /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">StoryArc access</th><th className="p-3">All access</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const storyArcAccess = user.appAccess.find((access) => access.app.slug === "storyarc");
                const hasStoryArcAccess = isValidAppAccess(storyArcAccess);
                return <tr key={user.id}>
                  <td className="p-3 font-semibold">{user.name ?? user.email}<p className="text-xs font-normal text-slate-500">{user.email}</p></td>
                  <td className="p-3">{user.role === "USER" || user.role === "TEACHER" ? <form action={setTeachingRole} className="flex items-center gap-2"><input type="hidden" name="userId" value={user.id} /><select name="role" defaultValue={user.role} className="rounded-lg border border-slate-200 bg-white px-2 py-1"><option value="USER">Learner</option><option value="TEACHER">Guru</option></select><button className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white">Save</button></form> : user.role}</td>
                  <td className="min-w-72 p-3">
                    <p className={`text-xs font-semibold ${hasStoryArcAccess ? "text-emerald-700" : "text-slate-500"}`}>
                      {hasStoryArcAccess
                        ? `ACTIVE · ${storyArcAccess?.accessExpiresAt ? `until ${storyArcAccess.accessExpiresAt.toISOString().slice(0, 10)}` : "never expires"}`
                        : storyArcAccess?.status ?? "NOT ASSIGNED"}
                    </p>
                    <form action={setStoryArcAccess} className="mt-2 flex flex-wrap items-center gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      {!hasStoryArcAccess ? <select name="durationDays" defaultValue="365" aria-label={`StoryArc access duration for ${user.email}`} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"><option value="30">30 days</option><option value="90">90 days</option><option value="365">365 days</option></select> : null}
                      <button name="accessAction" value={hasStoryArcAccess ? "revoke" : "grant"} className={`rounded-lg px-3 py-1 text-xs font-semibold text-white ${hasStoryArcAccess ? "bg-rose-600 hover:bg-rose-700" : "bg-cyan-700 hover:bg-cyan-800"}`}>
                        {hasStoryArcAccess ? "Revoke StoryArc" : "Grant StoryArc"}
                      </button>
                    </form>
                  </td>
                  <td className="p-3">{user.appAccess.map((access) => `${access.app.slug}: ${access.billingPlan}/${access.status}`).join(", ") || "none"}</td>
                </tr>
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminSection>
  );
}
