import { AdminSection, EmptyState } from "@/components/admin/AdminTable";
import { prisma } from "@/lib/db/prisma";
import { PMP_NEXUS_COURSE } from "@/lib/pmp/course";
import { computeProgressSnapshot, READINESS_CHECKLIST } from "@/lib/pmp/progress";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function AdminPmpAnalyticsPage() {
  const now = new Date();
  const last7d = new Date(now.getTime() - 7 * DAY_MS);
  const last30d = new Date(now.getTime() - 30 * DAY_MS);

  const pmpApp = await prisma.platformApp.findUnique({ where: { slug: "pmp" } });

  const [
    pmpAccessCount,
    activeUsers7d,
    activeUsers30d,
    feedbackTotals,
    recentDislikes,
    topLiked,
    topDisliked,
    brainDumpCount,
    brainDumpUserCount,
    progressEntries,
    readinessEntries,
    activeUsersList,
  ] = await Promise.all([
    pmpApp
      ? prisma.appUserAccess.count({
          where: { appId: pmpApp.id, status: "ACTIVE" },
        })
      : Promise.resolve(0),
    pmpApp
      ? prisma.appUserAccess.count({
          where: {
            appId: pmpApp.id,
            status: "ACTIVE",
            lastOpenedAt: { gte: last7d },
          },
        })
      : Promise.resolve(0),
    pmpApp
      ? prisma.appUserAccess.count({
          where: {
            appId: pmpApp.id,
            status: "ACTIVE",
            lastOpenedAt: { gte: last30d },
          },
        })
      : Promise.resolve(0),
    prisma.pmpAiFeedback.groupBy({
      by: ["rating"],
      _count: { _all: true },
    }),
    prisma.pmpAiFeedback.findMany({
      where: { rating: "dislike", createdAt: { gte: last30d } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.pmpAiFeedback.findMany({
      where: { rating: "like" },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.pmpAiFeedback.findMany({
      where: { rating: "dislike" },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.pmpBrainDump.count(),
    prisma.pmpBrainDump
      .findMany({ distinct: ["userId"], select: { userId: true } })
      .then((rows) => rows.length),
    prisma.pmpLessonProgress.findMany(),
    prisma.pmpReadinessItem.findMany({ where: { isComplete: true } }),
    pmpApp
      ? prisma.appUserAccess.findMany({
          where: { appId: pmpApp.id, status: "ACTIVE" },
          include: { user: { select: { id: true, email: true, name: true } } },
          orderBy: { lastOpenedAt: "desc" },
          take: 50,
        })
      : Promise.resolve([]),
  ]);

  const likes =
    feedbackTotals.find((f) => f.rating === "like")?._count._all ?? 0;
  const dislikes =
    feedbackTotals.find((f) => f.rating === "dislike")?._count._all ?? 0;
  const totalFeedback = likes + dislikes;
  const satisfaction = totalFeedback === 0 ? 0 : Math.round((likes / totalFeedback) * 100);

  // Build per-user progress map.
  const lessonByUser = new Map<string, typeof progressEntries>();
  for (const entry of progressEntries) {
    const arr = lessonByUser.get(entry.userId) ?? [];
    arr.push(entry);
    lessonByUser.set(entry.userId, arr);
  }
  const readinessByUser = new Map<string, typeof readinessEntries>();
  for (const entry of readinessEntries) {
    const arr = readinessByUser.get(entry.userId) ?? [];
    arr.push(entry);
    readinessByUser.set(entry.userId, arr);
  }

  type UserRow = {
    userId: string;
    name: string | null;
    email: string;
    lastOpenedAt: Date | null;
    completed: number;
    inProgress: number;
    percentComplete: number;
    readinessPercent: number;
    overallPercent: number;
  };

  const userRows: UserRow[] = activeUsersList.map((access) => {
    const lessons = lessonByUser.get(access.user.id) ?? [];
    const completedIds = lessons
      .filter((l) => l.status === "completed")
      .map((l) => l.lessonId);
    const inProgressIds = lessons
      .filter((l) => l.status === "in_progress")
      .map((l) => l.lessonId);
    const readinessIds = (readinessByUser.get(access.user.id) ?? []).map(
      (r) => r.itemKey
    );
    const snapshot = computeProgressSnapshot({
      completedLessonIds: completedIds,
      inProgressLessonIds: inProgressIds,
      readinessCompletedKeys: readinessIds,
    });
    return {
      userId: access.user.id,
      name: access.user.name,
      email: access.user.email,
      lastOpenedAt: access.lastOpenedAt,
      completed: snapshot.completedLessons,
      inProgress: snapshot.inProgressLessons,
      percentComplete: snapshot.percentComplete,
      readinessPercent: snapshot.readinessPercent,
      overallPercent: snapshot.overallPercent,
    };
  });

  userRows.sort((a, b) => b.overallPercent - a.overallPercent);

  return (
    <div className="space-y-6">
      <AdminSection
        title="PMP Exam Prep Analytics"
        description="Usage and learner-progress metrics."
      >
        <div className="grid gap-3 md:grid-cols-4">
          <StatCard label="Active users" value={pmpAccessCount} />
          <StatCard label="Active 7d" value={activeUsers7d} />
          <StatCard label="Active 30d" value={activeUsers30d} />
          <StatCard
            label="Brain dumps"
            value={`${brainDumpCount}`}
            sub={`${brainDumpUserCount} users`}
          />
        </div>
      </AdminSection>

      <AdminSection
        title="Andromeda AI feedback"
        description="Like / dislike captured from AI-generated chat responses."
      >
        <div className="grid gap-3 md:grid-cols-4">
          <StatCard label="Total feedback" value={totalFeedback} />
          <StatCard label="👍 Likes" value={likes} tone="emerald" />
          <StatCard label="👎 Dislikes" value={dislikes} tone="rose" />
          <StatCard label="Satisfaction" value={`${satisfaction}%`} tone="violet" />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <FeedbackList title="Most recent 👍 likes" rows={topLiked} />
          <FeedbackList title="Most recent 👎 dislikes" rows={topDisliked} />
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
            Dislikes with comments (last 30 days)
          </h3>
          {recentDislikes.length === 0 ? (
            <div className="mt-3">
              <EmptyState label="No dislikes with comments in the last 30 days." />
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {recentDislikes.map((fb) => (
                <li key={fb.id} className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose-700">
                    {new Date(fb.createdAt).toLocaleString("id-ID")}
                  </p>
                  {fb.userQuestion && (
                    <p className="mt-1 text-xs italic text-rose-900/80">
                      Q: {fb.userQuestion.slice(0, 200)}
                    </p>
                  )}
                  <p className="mt-2 line-clamp-3 text-sm text-rose-950">{fb.contentExcerpt}</p>
                  {fb.comment && (
                    <p className="mt-2 rounded-md bg-white/80 p-2 text-xs text-rose-900">
                      💬 {fb.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </AdminSection>

      <AdminSection
        title="Per-user learning progress"
        description={`Composite of ${PMP_NEXUS_COURSE.length} lessons and ${READINESS_CHECKLIST.length} checklist items, sorted by overall %.`}
      >
        {userRows.length === 0 ? (
          <EmptyState label="No active PMP users yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  <th className="py-2 pr-3">User</th>
                  <th className="py-2 pr-3">Lessons</th>
                  <th className="py-2 pr-3">Course %</th>
                  <th className="py-2 pr-3">Readiness %</th>
                  <th className="py-2 pr-3">Overall %</th>
                  <th className="py-2 pr-3">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {userRows.map((row) => (
                  <tr key={row.userId} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-3">
                      <div className="font-semibold text-slate-900">{row.name ?? "—"}</div>
                      <div className="text-xs text-slate-500">{row.email}</div>
                    </td>
                    <td className="py-2 pr-3 text-slate-700">
                      {row.completed} done · {row.inProgress} in-progress
                    </td>
                    <td className="py-2 pr-3">
                      <PercentCell percent={row.percentComplete} />
                    </td>
                    <td className="py-2 pr-3">
                      <PercentCell percent={row.readinessPercent} />
                    </td>
                    <td className="py-2 pr-3 font-bold">
                      <PercentCell percent={row.overallPercent} bold />
                    </td>
                    <td className="py-2 pr-3 text-xs text-slate-500">
                      {row.lastOpenedAt
                        ? new Date(row.lastOpenedAt).toLocaleString("id-ID")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSection>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone = "slate",
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "slate" | "emerald" | "rose" | "violet";
}) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
      : tone === "rose"
        ? "border-rose-200 bg-rose-50 text-rose-950"
        : tone === "violet"
          ? "border-violet-200 bg-violet-50 text-violet-950"
          : "border-slate-200 bg-white text-slate-950";
  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function PercentCell({ percent, bold = false }: { percent: number; bold?: boolean }) {
  const color =
    percent >= 75
      ? "text-emerald-700"
      : percent >= 40
        ? "text-amber-700"
        : "text-rose-700";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full ${
            percent >= 75
              ? "bg-emerald-500"
              : percent >= 40
                ? "bg-amber-500"
                : "bg-rose-500"
          }`}
          style={{ width: `${Math.max(percent, 4)}%` }}
        />
      </div>
      <span className={`${color} ${bold ? "font-bold" : ""}`}>{percent}%</span>
    </div>
  );
}

function FeedbackList({
  title,
  rows,
}: {
  title: string;
  rows: Array<{
    id: string;
    contentExcerpt: string;
    userQuestion: string | null;
    createdAt: Date;
  }>;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">{title}</h3>
      {rows.length === 0 ? (
        <div className="mt-3">
          <EmptyState label="No feedback yet." />
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((fb) => (
            <li key={fb.id} className="rounded-xl border border-slate-200 bg-white p-3 text-xs">
              <p className="font-bold text-slate-500">
                {new Date(fb.createdAt).toLocaleString("id-ID")}
              </p>
              {fb.userQuestion && (
                <p className="mt-1 italic text-slate-600">Q: {fb.userQuestion.slice(0, 140)}</p>
              )}
              <p className="mt-1 line-clamp-2 text-slate-700">{fb.contentExcerpt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
