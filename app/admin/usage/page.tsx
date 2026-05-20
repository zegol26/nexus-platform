import { AdminSection, EmptyState } from "@/components/admin/AdminTable";
import { prisma } from "@/lib/db/prisma";
import {
  estimateTutorTurnCostUsd,
  formatJpy,
  jpyPerUsd,
  usdToJpy,
} from "@/lib/analytics/cost";

type TutorMetadata = {
  messageLength?: number;
  replyLength?: number;
  mode?: "text" | "voice";
  scope?: "free_chat" | "lesson";
  ttsProvider?: "openai" | "elevenlabs";
  audioSeconds?: number;
};

export default async function AdminUsagePage() {
  // FeatureUsage is the daily counter (used by trial quotas + cost
  // monitoring). AnalyticsEvent.AI_TUTOR_MESSAGE rows carry the full
  // turn payload so we can estimate spend per message.
  const [featureUsage, tutorEvents, voiceCount, routeMetrics] = await Promise.all([
    prisma.featureUsage.findMany({
      include: { user: { select: { email: true, role: true } } },
      orderBy: [{ updatedAt: "desc" }],
      take: 200,
    }),
    prisma.analyticsEvent.findMany({
      where: { eventType: "AI_TUTOR_MESSAGE" },
      select: {
        id: true,
        userId: true,
        metadata: true,
        createdAt: true,
        user: { select: { email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 1200,
    }),
    prisma.featureUsage.aggregate({
      where: { feature: "VOICE_CONVERSATION" },
      _sum: { count: true },
    }),
    prisma.serverRouteMetric.findMany({
      orderBy: [{ riskLevel: "asc" }, { totalDurationMs: "desc" }],
      take: 80,
    }),
  ]);

  // Per-user cost rollup.
  type UserCostRow = {
    userId: string;
    email: string;
    role: string | null;
    textTurns: number;
    voiceTurns: number;
    totalUsd: number;
    totalJpy: number;
    lastTurnAt: Date | null;
  };
  const perUser = new Map<string, UserCostRow>();
  let totalUsd = 0;
  let textTurns = 0;
  let voiceTurns = 0;

  for (const event of tutorEvents) {
    const meta = (event.metadata ?? {}) as TutorMetadata;
    const cost = estimateTutorTurnCostUsd({
      messageLength: meta.messageLength ?? 0,
      replyLength: meta.replyLength ?? 0,
      mode: meta.mode === "voice" ? "voice" : "text",
      ttsProvider: meta.ttsProvider,
      audioSeconds: meta.audioSeconds,
    });
    totalUsd += cost;
    if (meta.mode === "voice") voiceTurns += 1;
    else textTurns += 1;

    if (!event.userId || !event.user) continue;
    const existing = perUser.get(event.userId) ?? {
      userId: event.userId,
      email: event.user.email,
      role: event.user.role ?? null,
      textTurns: 0,
      voiceTurns: 0,
      totalUsd: 0,
      totalJpy: 0,
      lastTurnAt: null,
    };
    existing.totalUsd += cost;
    if (meta.mode === "voice") existing.voiceTurns += 1;
    else existing.textTurns += 1;
    if (!existing.lastTurnAt || event.createdAt > existing.lastTurnAt) {
      existing.lastTurnAt = event.createdAt;
    }
    perUser.set(event.userId, existing);
  }

  for (const row of perUser.values()) {
    row.totalJpy = usdToJpy(row.totalUsd);
  }

  const userRows = Array.from(perUser.values()).sort(
    (a, b) => b.totalUsd - a.totalUsd
  );

  const totalJpy = usdToJpy(totalUsd);
  const ratePerUsd = jpyPerUsd();
  const totalTurns = tutorEvents.length;
  const voiceUsageTotal = voiceCount._sum.count ?? 0;

  return (
    <div className="space-y-6">
      <AdminSection
        title="Cost Summary"
        description={`Total estimated AI spend across all users (top ${tutorEvents.length} recent tutor turns). Settlement rate: ¥${ratePerUsd.toLocaleString("ja-JP")} / USD (override via JPY_PER_USD env).`}
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <KpiTile label="Total cost (JPY)" value={formatJpy(totalJpy)} />
          <KpiTile
            label="Total cost (USD)"
            value={`$${totalUsd.toFixed(4)}`}
          />
          <KpiTile label="Tutor turns" value={String(totalTurns)} />
          <KpiTile
            label="Text / Voice"
            value={`${textTurns} / ${voiceTurns}`}
          />
        </div>
      </AdminSection>

      <AdminSection
        title="Fluid CPU Route Meter"
        description="Lightweight sampled route timing. It is a proxy for server pressure, not the exact Vercel account-level Fluid Active CPU number."
      >
        {routeMetrics.length === 0 ? (
          <EmptyState label="No sampled route metrics yet. Metrics appear after instrumented routes receive traffic." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-slate-400">
                <tr>
                  <th className="px-3 py-2">Route</th>
                  <th className="px-3 py-2">Risk</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Hits</th>
                  <th className="px-3 py-2">Avg</th>
                  <th className="px-3 py-2">Max</th>
                  <th className="px-3 py-2">Slow / Error</th>
                  <th className="px-3 py-2">Window</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {routeMetrics.map((metric) => {
                  const avg = metric.count > 0 ? Math.round(metric.totalDurationMs / metric.count) : 0;
                  return (
                    <tr key={metric.id}>
                      <td className="px-3 py-3 font-semibold text-slate-950">{metric.method} {metric.route}</td>
                      <td className="px-3 py-3 text-slate-600">{metric.riskLevel}</td>
                      <td className="px-3 py-3 text-slate-600">{metric.routeType}</td>
                      <td className="px-3 py-3 text-slate-600">{metric.count}</td>
                      <td className="px-3 py-3 text-slate-600">{avg}ms</td>
                      <td className="px-3 py-3 text-slate-600">{metric.maxDurationMs}ms</td>
                      <td className="px-3 py-3 text-slate-600">{metric.slowCount} / {metric.errorCount}</td>
                      <td className="px-3 py-3 text-slate-500">{metric.windowStart.toLocaleString("id-ID")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminSection>

      <AdminSection
        title="Per-User Cost"
        description="Estimated AI spend per user from AI Tutor + Voice. Sorted by total spend."
      >
        {userRows.length === 0 ? (
          <EmptyState label="No tutor activity tracked yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-slate-400">
                <tr>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Text</th>
                  <th className="px-3 py-2">Voice</th>
                  <th className="px-3 py-2">Cost (JPY)</th>
                  <th className="px-3 py-2">Cost (USD)</th>
                  <th className="px-3 py-2">Last turn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userRows.map((row) => (
                  <tr key={row.userId}>
                    <td className="px-3 py-3 font-semibold text-slate-950">
                      {row.email}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {row.role ?? "USER"}
                    </td>
                    <td className="px-3 py-3 text-slate-600">{row.textTurns}</td>
                    <td className="px-3 py-3 text-slate-600">{row.voiceTurns}</td>
                    <td className="px-3 py-3 font-semibold text-slate-950">
                      {formatJpy(row.totalJpy)}
                    </td>
                    <td className="px-3 py-3 text-slate-500">
                      ${row.totalUsd.toFixed(4)}
                    </td>
                    <td className="px-3 py-3 text-slate-500">
                      {row.lastTurnAt
                        ? row.lastTurnAt.toLocaleString("id-ID")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSection>

      <AdminSection
        title="Feature Usage Counters"
        description={`Daily-window counters from FeatureUsage. Voice conversations all-time: ${voiceUsageTotal}.`}
      >
        {featureUsage.length === 0 ? (
          <EmptyState label="No FeatureUsage rows yet — counters increment on the next chat or voice turn." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {featureUsage.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 p-4 text-sm"
              >
                <p className="font-semibold text-slate-950">
                  {item.feature}: {item.count}
                </p>
                <p className="mt-1 text-slate-500">
                  {item.user.email} · {item.appSlug ?? "nihongo"} ·{" "}
                  {item.periodStart.toISOString().slice(0, 10)}
                </p>
              </div>
            ))}
          </div>
        )}
      </AdminSection>
    </div>
  );
}

function KpiTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
