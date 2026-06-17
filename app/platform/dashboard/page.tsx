import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateGameProfile } from "@/lib/gamification/kingdom";
import { platformApps } from "@/lib/platform/app-registry";
import { filterValidAppAccess, isAdminRole } from "@/lib/platform/access";
import { syncPendingMidtransPaymentsForUser } from "@/lib/platform/sync-midtrans-payment";
import { KingdomCard } from "@/components/nihongo/game/KingdomCard";
import { CertificateAction } from "@/components/certificates/CertificateAction";

export const dynamic = "force-dynamic";

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

type DashboardPlanRow = {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  durationDays: number;
  billingPeriod: string;
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

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

function promoMoney(amountCents: number, currency: string) {
  return formatMoney(amountCents, currency);
}

function originalMoney(amountCents: number, currency: string) {
  return formatMoney(amountCents * 2, currency);
}

export default async function PlatformDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  await syncPendingMidtransPaymentsForUser(session.user.email);

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

  const [totalNihongoLessons, completedNihongoLessons, totalFlashcards, gameProfile, monthlyPlans] =
    await Promise.all([
      prisma.nihongoLesson.count(),
      prisma.nihongoLessonProgress.count({
        where: { userId: user.id, completed: true },
      }),
      prisma.nihongoFlashcard.count(),
      getOrCreateGameProfile(user.id),
      prisma.subscriptionPlan.findMany({
        where: {
          active: true,
          billingPeriod: "MONTHLY",
          app: { status: "ACTIVE" },
        },
        include: { app: true },
        orderBy: [{ appId: "asc" }],
      }),
    ]);

  const isAdmin = isAdminRole(user.role);
  const rawAppAccess = user.appAccess as DashboardAppAccessRow[];
  const appAccess = isAdmin ? rawAppAccess : filterValidAppAccess(rawAppAccess);

  const nihongoPercentage =
    totalNihongoLessons === 0
      ? 0
      : Math.round((completedNihongoLessons / totalNihongoLessons) * 100);

  const authorizedSlugs = new Set<string>(
    appAccess.map((access: DashboardAppAccessRow) => access.app.slug)
  );

  const comingSoonApps = isAdmin
    ? platformApps.filter((app) => !authorizedSlugs.has(app.slug))
    : [];

  const primaryAccess = appAccess[0];
  const hasNihongoAccess = authorizedSlugs.has("nihongo") || isAdmin;
  const initial = (user.name ?? user.email).charAt(0).toUpperCase();
  const typedMonthlyPlans = monthlyPlans as DashboardPlanRow[];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-2xl shadow-blue-950/[0.08] backdrop-blur-2xl">
        <div className="grid gap-0 lg:grid-cols-[1.06fr_0.94fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-8 inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-blue-700">
              Nexus Talenta Indonesia Academy
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
                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  {user.name ?? "Nexus learner"}
                </h1>
                <p className="mt-1 text-sm text-slate-500">{user.email}</p>
              </div>
            </div>

            <p className="mt-6 max-w-2xl text-sm leading-6 text-slate-600">
              Ruang kendali belajar kamu: akses aplikasi, progres Nihongo, billing,
              promo aktif, dan rekomendasi layanan Nexus ditampilkan langsung tanpa
              harus menebak menu berikutnya.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={hasNihongoAccess ? "/apps/nihongo/dashboard" : "/platform/programs"}
                className="rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                {hasNihongoAccess ? "Buka Nihongo" : "Lihat Program"}
              </Link>

              {hasNihongoAccess && (
                <Link
                  href="/apps/nihongo/quiz"
                  className="rounded-full border border-blue-100 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm shadow-slate-950/[0.03] transition hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  Mulai Quiz
                </Link>
              )}

              {hasNihongoAccess && (
                <Link
                  href="/apps/nihongo/flashcards"
                  className="rounded-full border border-blue-100 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm shadow-slate-950/[0.03] transition hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  Review Flashcards
                </Link>
              )}

              {hasNihongoAccess && <CertificateAction appSlug="nihongo" compact />}
            </div>
          </div>

          <div className="border-t border-white/10 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 text-white lg:border-l lg:border-t-0 lg:p-8">
            <p className="text-sm font-medium text-slate-300">
              Akses utama
            </p>

            <h2 className="mt-3 text-2xl font-semibold">
              {primaryAccess?.app.name ?? "No active app access"}
            </h2>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Paket
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {primaryAccess?.billingPlan ?? "No plan"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Masa akses
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

            <div className="mt-5 rounded-2xl bg-white p-4 text-slate-950">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                Promo launch
              </p>
              <h3 className="mt-2 text-2xl font-black">NEXUSJEPANG 50%</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Harga paket yang tampil sudah termasuk diskon 50%.
              </p>
              <Link
                href="/platform/programs"
                className="mt-4 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-black text-white transition hover:bg-blue-700"
              >
                Lihat program
              </Link>
            </div>
          </div>
        </div>
      </section>

      <KingdomCard profile={gameProfile} />

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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {typedMonthlyPlans.map((plan) => (
          <Link
            key={plan.id}
            href={`/platform/billing?plan=${plan.id}`}
            className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-950/[0.04] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/60"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
              Monthly plan
            </p>
            <h2 className="mt-3 text-xl font-black text-slate-950">{plan.app.name}</h2>
            <p className="mt-2 min-h-18 text-sm leading-6 text-slate-600">
              {plan.app.description}
            </p>
            <div className="mt-5">
              <p className="text-2xl font-black text-blue-700">
                {promoMoney(plan.priceCents, plan.currency)}
              </p>
              <p className="text-xs text-slate-400 line-through">
                {originalMoney(plan.priceCents, plan.currency)}
              </p>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-950/[0.04] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                Your apps
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Layanan aktif kamu
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {appAccess.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50/70 p-6">
                <h3 className="text-xl font-black text-slate-950">
                  Belum ada akses aktif
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Pilih program di checkout atau hubungi admin untuk membuka akses
                  Nexus AI Nihongo, English, Arabic, atau PMP.
                </p>
                <Link href="/checkout" className="mt-4 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white">
                  Order program
                </Link>
              </div>
            ) : appAccess.map((access: DashboardAppAccessRow) => {
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
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-950/[0.04] backdrop-blur-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
              Program order
            </p>

            <h2 className="mt-2 text-xl font-black text-slate-950">Order langsung dari platform</h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Pilih paket resmi dari data platform, lalu lanjut ke billing
              dengan paket yang kamu pilih.
            </p>

            <Link
              href="/platform/programs"
              className="mt-5 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Buka program
            </Link>
          </div>

          {isAdmin && (
            <div className="rounded-[2rem] border border-blue-200 bg-blue-50 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                Promo admin
              </p>
              <h2 className="mt-2 text-xl font-black text-slate-950">Campaign gimmick</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Setup NEXUSJEPANG, diskon launch, audience, dan status promo dari admin UI.
              </p>
              <Link
                href="/platform/admin/promos"
                className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Kelola promo
              </Link>
            </div>
          )}

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

          {comingSoonApps.length > 0 && (
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
          )}

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
