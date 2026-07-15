import { AdminSection, EmptyState } from "@/components/admin/AdminTable";
import { prisma } from "@/lib/db/prisma";
import { setTeachingRole } from "./actions";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: { appAccess: { include: { app: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <AdminSection title="Users" description="View users, roles, plan, and access status.">
      {!users.length ? <EmptyState label="No users yet." /> : (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Access</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="p-3 font-semibold">{user.name ?? user.email}<p className="text-xs font-normal text-slate-500">{user.email}</p></td>
                  <td className="p-3">{user.role === "USER" || user.role === "TEACHER" ? <form action={setTeachingRole} className="flex items-center gap-2"><input type="hidden" name="userId" value={user.id} /><select name="role" defaultValue={user.role} className="rounded-lg border border-slate-200 bg-white px-2 py-1"><option value="USER">Learner</option><option value="TEACHER">Guru</option></select><button className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white">Save</button></form> : user.role}</td>
                  <td className="p-3">{user.appAccess.map((access) => `${access.app.slug}: ${access.billingPlan}/${access.status}`).join(", ") || "none"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminSection>
  );
}
