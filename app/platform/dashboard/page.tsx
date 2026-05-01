import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { platformApps } from "@/lib/platform/app-registry";

type DashboardAppAccessRow = {
  id: string;
  status: string;
  billingPlan: string | null;
  billingPeriod: string | null;
  accessExpiresAt: Date | null;
  app: {
    slug: string;
    name: string;
    description: string | null;
  };
};

function formatDate(date?: Date | null) {
  if (!date) return "No expiry set";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function daysLeft(date?: Date | null) {
  if (!date) return null;

  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default async function PlatformDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      appAccess: {
        include: { app: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const [totalNihongoLessons, completedNihongoLessons, totalFlashcards] =
    await Promise.all([
      prisma.nihongoLesson.count(),
      prisma.nihongoLessonProgress.count({
        where: { userId: user.id, completed: true },
      }),
      prisma.nihongoFlashcard.count(),
    ]);

  const appAccess = user.appAccess as DashboardAppAccessRow[];

  const nihongoPercentage =
    totalNihongoLessons === 0
      ? 0
      : Math.round((completedNihongoLessons / totalNihongoLessons) * 100);

  const authorizedSlugs = new Set<string>(
    appAccess.map((access: DashboardAppAccessRow) => access.app.slug)
  );

  const comingSoonApps = platformApps.filter(
    (app) => !authorizedSlugs.has(app.slug)
  );

  const primaryAccess = appAccess[0];
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const initial = (user.name ?? user.email).charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-xl shadow-slate-950/[0.04] backdrop-blur-2xl">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-8 inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-700">
              Nexus Platform
            </div>

            <div className="mt-5 flex items-center gap-4">
              {user.avatarUrl || user.image ? (
                <img
                  src={user.avatarUrl ?? user.image ?? ""}
                  alt={user.name ?? user.email}
                  className="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-600 text-2xl font-semibold text-white shadow-lg shadow-blue-950/20">
                  {initial}
                </div>
              )}

              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  {user.name ?? "Nexus learner"}
                </h1>
                <p className="mt-1 text-sm text-slate-500">{user.email}</p>
              </div>
            </div>

            <p className="mt-6 max-w-2xl text-sm leading-6 text-slate-600">
              Your cockpit for app access, learning progress, billing duration,
              and study commitment.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/apps/nihongo/dashboard"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Open Nihongo
              </Link>

              <Link
                href="/apps/nihongo/quiz"
                className="rounded-full border border-white/70 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm shadow-slate-950/[0.03] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Start Quiz
              </Link>

              <Link
                href="/apps/nihongo/flashcards"
                className="rounded-full border border-white/70 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm shadow-slate-950/[0.03] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Review Flashcards
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 text-white lg:border-l lg:border-t-0 lg:p-8">
            <p className="text-sm font-medium text-slate-300">
              Primary access
            </p>

            <h2 className="mt-3 text-2xl font-semibold">
              {primaryAccess?.app.name ?? "No active app access"}
            </h2>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Plan
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {primaryAccess?.billingPlan ?? "No plan"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Access expires
                </p>

                <p className="mt-2 text-lg font-semibold">
                  {formatDate(primaryAccess?.accessExpiresAt)}
                </p>

                {daysLeft(primaryAccess?.accessExpiresAt) !== null && (
                  <p className="mt-1 text-sm text-cyan-200">
                    {daysLeft(primaryAccess?.accessExpiresAt)} days left
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-950/[0.03] backdrop-blur">
          <p className="text-sm font-medium text-slate-500">
            Authorized apps
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {appAccess.length}
          </p>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-950/[0.03] backdrop-blur">
          <p className="text-sm font-medium text-slate-500">
            Nihongo progress
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {nihongoPercentage}%
          </p>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-950/[0.03] backdrop-blur">
          <p className="text-sm font-medium text-slate-500">Lessons done</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {completedNihongoLessons}/{totalNihongoLessons}
          </p>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-950/[0.03] backdrop-blur">
          <p className="text-sm font-medium text-slate-500">Flashcards</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {totalFlashcards}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-950/[0.04] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                Your apps
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Authorized access
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {appAccess.map((access: DashboardAppAccessRow) => {
              const appMeta = platformApps.find(
                (app) => app.slug === access.app.slug
              );

              return (
                <Link
                  key={access.id}
                  href={appMeta?.href ?? "#"}
                  className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/60 hover:shadow-md md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                        {access.status}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                        {access.billingPlan ?? "No plan"}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                        {access.billingPeriod ?? "No period"}
                      </span>
                    </div>

                    <h3 className="mt-3 text-xl font-semibold text-slate-950">
                      {access.app.name}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {access.app.description}
                    </p>
                  </div>

                  <div className="text-sm font-semibold text-slate-600">
                    Expires {formatDate(access.accessExpiresAt)}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-950/[0.04] backdrop-blur-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
              Study commitment
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Reminder settings
            </h2>

            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <p>
                Status:{" "}
                <span className="font-semibold text-slate-950">
                  {user.learningReminderEnabled ? "Enabled" : "Disabled"}
                </span>
              </p>

              <p>
                Time:{" "}
                <span className="font-semibold text-slate-950">
                  {user.learningReminderTime ?? "Not set"}
                </span>
              </p>

              <p>
                Goal:{" "}
                <span className="font-semibold text-slate-950">
                  {user.learningGoal ?? "Set a weekly study target"}
                </span>
              </p>
            </div>

            <Link
              href="/platform/settings"
              className="mt-5 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Open settings
            </Link>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-950/[0.04] backdrop-blur-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
              Coming next
            </p>

            <div className="mt-4 space-y-3">
              {comingSoonApps.map((app) => (
                <div key={app.slug} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-950">{app.name}</p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {app.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {isAdmin && (
            <Link
              href="/platform/admin"
              className="block rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm transition hover:bg-blue-100"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                Admin
              </p>

              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Administer users
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Manage user access, expiry, roles, and app authorization.
              </p>
            </Link>
          )}
        </aside>
      </section>
    </div>
  );
}