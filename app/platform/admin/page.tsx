import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { AdminAccessPanel } from "@/components/platform/AdminAccessPanel";

type AdminAppAccessRow = {
  appId: string;
  status: string;
  accessExpiresAt: Date | null;
  app: {
    id: string;
    name: string;
    slug: string;
  };
};

type AdminLessonAccessRow = {
  lessonId: string;
  status: string;
  expiresAt: Date | null;
  lesson: {
    id: string;
    title: string;
    level: string;
    order: number;
  };
};

type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  appAccess: AdminAppAccessRow[];
  lessonAccess: AdminLessonAccessRow[];
};

type AdminAppRow = {
  id: string;
  name: string;
  slug: string;
};

type AdminLessonRow = {
  id: string;
  title: string;
  level: string;
  order: number;
};

type AdminPaymentRow = {
  id: string;
  status: string;
  currency: string;
  amountCents: number;
  user: {
    email: string;
  };
  app: {
    name: string;
  };
  plan: {
    name: string;
  } | null;
};

type AdminAuditRow = {
  id: string;
  action: string;
  createdAt: Date;
  actor: {
    email: string;
  } | null;
};

export default async function PlatformAdminPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user ? (session.user as { role?: string }).role : undefined;

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/platform/dashboard");
  }

  const [users, apps, lessons, payments, audits, mockQuestionCount] = await Promise.all([
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
    prisma.nihongoMockTestQuestion.count({
      where: { level: "JLPT N5", testType: "mock_test", isActive: true },
    }),
  ]);

  const typedUsers = users as AdminUserRow[];
  const typedApps = apps as AdminAppRow[];
  const typedLessons = lessons as AdminLessonRow[];
  const typedPayments = payments as AdminPaymentRow[];
  const typedAudits = audits as AdminAuditRow[];

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

      <section className="rounded-[2rem] border border-cyan-200 bg-cyan-50 p-6 shadow-xl shadow-cyan-950/[0.04]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
              Nihongo Admin Tools
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              JLPT N5 Mock Test Bank
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {mockQuestionCount} active questions seeded. Admin can open the mock test even before 70% readiness.
            </p>
          </div>
          <Link
            href="/apps/nihongo/mock-test/n5"
            className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            Open JLPT Mock Test
          </Link>
        </div>
      </section>

      <AdminAccessPanel
        users={typedUsers.map((user: AdminUserRow) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          appAccess: user.appAccess.map((access: AdminAppAccessRow) => ({
            appId: access.appId,
            status: access.status,
            accessExpiresAt: access.accessExpiresAt?.toISOString() ?? null,
            app: {
              id: access.app.id,
              name: access.app.name,
              slug: access.app.slug,
            },
          })),
          lessonAccess: user.lessonAccess.map((access: AdminLessonAccessRow) => ({
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
        apps={typedApps.map((app: AdminAppRow) => ({
          id: app.id,
          name: app.name,
          slug: app.slug,
        }))}
        lessons={typedLessons.map((lesson: AdminLessonRow) => ({
          id: lesson.id,
          title: lesson.title,
          level: lesson.level,
          order: lesson.order,
        }))}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-950/[0.04] backdrop-blur">
          <h2 className="text-xl font-semibold text-slate-950">
            Latest payments
          </h2>

          <div className="mt-4 space-y-3">
            {typedPayments.map((payment: AdminPaymentRow) => (
              <div
                key={payment.id}
                className="rounded-2xl bg-slate-50 p-4 text-sm"
              >
                <p className="font-semibold text-slate-950">
                  {payment.user.email} • {payment.app.name}
                </p>

                <p className="mt-1 text-slate-500">
                  {payment.status} • {payment.currency}{" "}
                  {payment.amountCents / 100} • {payment.plan?.name ?? "No plan"}
                </p>
              </div>
            ))}

            {!typedPayments.length && (
              <p className="text-sm text-slate-500">No payments yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-950/[0.04] backdrop-blur">
          <h2 className="text-xl font-semibold text-slate-950">
            Access audit
          </h2>

          <div className="mt-4 space-y-3">
            {typedAudits.map((audit: AdminAuditRow) => (
              <div
                key={audit.id}
                className="rounded-2xl bg-slate-50 p-4 text-sm"
              >
                <p className="font-semibold text-slate-950">{audit.action}</p>

                <p className="mt-1 text-slate-500">
                  by {audit.actor?.email ?? "system"} •{" "}
                  {audit.createdAt.toLocaleString()}
                </p>
              </div>
            ))}

            {!typedAudits.length && (
              <p className="text-sm text-slate-500">No audit events yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
