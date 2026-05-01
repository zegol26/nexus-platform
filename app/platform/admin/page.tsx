import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { AdminAccessPanel } from "@/components/platform/AdminAccessPanel";

export default async function PlatformAdminPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user ? (session.user as { role?: string }).role : undefined;

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/platform/dashboard");
  }

  const [users, apps, lessons, payments, audits] = await Promise.all([
    prisma.user.findMany({
      include: {
        appAccess: {
          include: { app: true },
          orderBy: { createdAt: "desc" },
        },
        lessonAccess: {
          include: { lesson: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.platformApp.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.nihongoLesson.findMany({ orderBy: { order: "asc" } }),
    prisma.paymentTransaction.findMany({
      include: { user: true, app: true, plan: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.accessGrantAudit.findMany({
      include: { actor: true, app: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-xl shadow-slate-950/[0.04] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
          Admin
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Access and payment control
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Grant/revoke app access, lesson access, and review payment validation state.
        </p>
      </section>

      <AdminAccessPanel
        users={users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          appAccess: user.appAccess.map((access) => ({
            appId: access.appId,
            status: access.status,
            accessExpiresAt: access.accessExpiresAt?.toISOString() ?? null,
            app: {
              id: access.app.id,
              name: access.app.name,
              slug: access.app.slug,
            },
          })),
          lessonAccess: user.lessonAccess.map((access) => ({
            lessonId: access.lessonId,
            status: access.status,
            expiresAt: access.expiresAt?.toISOString() ?? null,
            lesson: {
              id: access.lesson.id,
              title: access.lesson.title,
              level: access.lesson.level,
              order: access.lesson.order,
            },
          })),
        }))}
        apps={apps.map((app) => ({
          id: app.id,
          name: app.name,
          slug: app.slug,
        }))}
        lessons={lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          level: lesson.level,
          order: lesson.order,
        }))}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-950/[0.04] backdrop-blur">
          <h2 className="text-xl font-semibold text-slate-950">Latest payments</h2>
          <div className="mt-4 space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-2xl bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-950">
                  {payment.user.email} • {payment.app.name}
                </p>
                <p className="mt-1 text-slate-500">
                  {payment.status} • {payment.currency} {payment.amountCents / 100} •{" "}
                  {payment.plan?.name ?? "No plan"}
                </p>
              </div>
            ))}
            {!payments.length && <p className="text-sm text-slate-500">No payments yet.</p>}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-950/[0.04] backdrop-blur">
          <h2 className="text-xl font-semibold text-slate-950">Access audit</h2>
          <div className="mt-4 space-y-3">
            {audits.map((audit) => (
              <div key={audit.id} className="rounded-2xl bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-950">{audit.action}</p>
                <p className="mt-1 text-slate-500">
                  by {audit.actor?.email ?? "system"} • {audit.createdAt.toLocaleString()}
                </p>
              </div>
            ))}
            {!audits.length && <p className="text-sm text-slate-500">No audit events yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
