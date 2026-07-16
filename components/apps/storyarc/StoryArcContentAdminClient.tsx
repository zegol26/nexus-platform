"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RevisionRow = {
  id: string;
  stableId: string;
  revision: number;
  title: string;
  state: string;
  track: string;
  grade: string;
};

type Metrics = {
  totalPublished: number;
  draft: number;
  inReview: number;
  approved: number;
  schoolCore: number;
  storyMode: number;
  examLab: number;
  grade10: number;
  grade11: number;
  grade12: number;
};

type PublishedEpisode = {
  id: string;
  episode: number;
  stableId: string;
  title: string;
};

const nextStates: Record<string, string[]> = {
  DRAFT: ["VALIDATING"],
  VALIDATING: ["DRAFT", "IN_REVIEW"],
  IN_REVIEW: ["DRAFT", "APPROVED"],
  APPROVED: ["PUBLISHED"],
  PUBLISHED: ["SUPERSEDED", "ARCHIVED"],
  SUPERSEDED: ["ARCHIVED"],
  ARCHIVED: [],
};

const stateStyle: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  VALIDATING: "bg-amber-100 text-amber-800",
  IN_REVIEW: "bg-violet-100 text-violet-800",
  APPROVED: "bg-blue-100 text-blue-800",
  PUBLISHED: "bg-emerald-100 text-emerald-800",
  SUPERSEDED: "bg-orange-100 text-orange-800",
  ARCHIVED: "bg-rose-100 text-rose-800",
};

function friendlyLabel(value: string) {
  return value
    .replace("GRADE_", "Kelas ")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function StoryArcContentAdminClient({
  initialPackage,
  metrics,
  publishedStory,
  revisions,
}: {
  initialPackage: string;
  metrics: Metrics;
  publishedStory: PublishedEpisode[];
  revisions: RevisionRow[];
}) {
  const router = useRouter();
  const [source, setSource] = useState(initialPackage);
  const [report, setReport] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function requestJson(url: string, init: RequestInit) {
    setBusy(true);
    try {
      const response = await fetch(url, init);
      const payload = await response.json();
      setReport(JSON.stringify(payload, null, 2));
      if (response.ok) router.refresh();
      return response.ok;
    } catch (error) {
      setReport(error instanceof Error ? error.message : "Permintaan gagal.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function release(action: "check" | "publish") {
    const ok = await requestJson("/api/admin/apps/storyarc/content/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        confirmation: action === "publish" ? "PUBLISH_STORYARC_90" : undefined,
      }),
    });
    if (ok && action === "publish") setConfirmed(false);
  }

  async function importPackage(dryRun: boolean) {
    try {
      const parsed = JSON.parse(source) as unknown;
      await requestJson("/api/admin/apps/storyarc/content/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun, package: parsed }),
      });
    } catch (error) {
      setReport(error instanceof Error ? error.message : "Paket JSON tidak valid.");
    }
  }

  async function transition(stableId: string, state: string) {
    await requestJson(`/api/admin/apps/storyarc/content/${stableId}/lifecycle`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    });
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.3fr_.7fr] lg:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
              Canonical release
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Terbitkan katalog resmi 90 item</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Sistem memeriksa sembilan paket, konflik revisi, dan error deterministik
              sebelum menulis data. Publish bersifat idempotent: item yang sudah terbit
              tidak diduplikasi, dan revisi lama disimpan sebagai riwayat.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => release("check")}
                className="rounded-full border border-cyan-300/50 bg-cyan-300/10 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20 disabled:opacity-50"
              >
                {busy ? "Memproses..." : "1. Check release"}
              </button>
              <button
                type="button"
                disabled={busy || !confirmed}
                onClick={() => release("publish")}
                className="rounded-full bg-lime-300 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                2. Publish 90 item
              </button>
            </div>
            <label className="mt-4 flex max-w-xl items-start gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="mt-1 size-4 accent-lime-300"
              />
              <span>
                Saya memahami bahwa publish membuat konten terlihat oleh learner, tetapi
                tidak menggantikan approval akademik, audio final, accessibility, atau IP.
              </span>
            </label>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold text-slate-300">Release readiness</p>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-4xl font-bold">{metrics.totalPublished}</span>
              <span className="pb-1 text-sm text-slate-400">/ 90 published</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-lime-300"
                style={{ width: `${Math.min(100, (metrics.totalPublished / 90) * 100)}%` }}
              />
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/5 p-3">
                <dt className="text-xs text-slate-400">Draft</dt>
                <dd className="mt-1 font-bold">{metrics.draft}</dd>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <dt className="text-xs text-slate-400">Review</dt>
                <dd className="mt-1 font-bold">{metrics.inReview}</dd>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <dt className="text-xs text-slate-400">Approved</dt>
                <dd className="mt-1 font-bold">{metrics.approved}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "School Core", value: metrics.schoolCore, target: 45, accent: "bg-cyan-500" },
          { label: "Story Mode", value: metrics.storyMode, target: 27, accent: "bg-violet-500" },
          { label: "Exam Lab", value: metrics.examLab, target: 18, accent: "bg-fuchsia-500" },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`h-1.5 w-12 rounded-full ${item.accent}`} />
            <p className="mt-4 text-sm font-semibold text-slate-600">{item.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">
              {item.value}
              <span className="ml-1 text-base font-medium text-slate-400">/ {item.target}</span>
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Published inventory
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">Katalog learner</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1.5">Kelas 10: {metrics.grade10}/30</span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5">Kelas 11: {metrics.grade11}/30</span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5">Kelas 12: {metrics.grade12}/30</span>
          </div>
        </div>
      </section>

      <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
        <summary className="cursor-pointer list-none p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Admin only</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">
                Published Story Map · {publishedStory.length} episode
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 group-open:rotate-180">
              ↓
            </span>
          </div>
        </summary>
        <div className="grid gap-2 border-t border-slate-100 p-5 md:grid-cols-2 xl:grid-cols-3">
          {publishedStory.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada episode yang diterbitkan.</p>
          ) : (
            publishedStory.map((revision) => (
              <div key={revision.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-blue-700">
                  EP {String(revision.episode).padStart(2, "0")} · {revision.stableId}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">{revision.title}</p>
              </div>
            ))
          )}
        </div>
      </details>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
            Revision queue
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Revisi terbaru</h2>
          <p className="mt-1 text-sm text-slate-600">
            Hanya transisi lifecycle yang valid untuk status saat ini yang ditampilkan.
          </p>
        </div>
        <div className="mt-4 space-y-3">
          {revisions.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              Belum ada revisi. Jalankan check lalu publish canonical release.
            </p>
          ) : (
            revisions.map((revision) => (
              <div
                key={revision.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 lg:flex-row lg:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{revision.title}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        stateStyle[revision.state] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {friendlyLabel(revision.state)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {revision.stableId}@{revision.revision} · {friendlyLabel(revision.track)} ·{" "}
                    {friendlyLabel(revision.grade)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(nextStates[revision.state] ?? []).map((state) => (
                    <button
                      type="button"
                      key={state}
                      disabled={busy}
                      onClick={() => transition(revision.stableId, state)}
                      className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 disabled:opacity-40"
                    >
                      → {friendlyLabel(state)}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
        <summary className="cursor-pointer list-none p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Advanced tool
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">Import paket JSON manual</h2>
              <p className="mt-1 text-sm text-slate-600">
                Untuk editor teknis dan paket di luar canonical release.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 group-open:rotate-180">
              ↓
            </span>
          </div>
        </summary>
        <div className="border-t border-slate-100 p-5">
          <label className="block text-sm font-semibold text-slate-800" htmlFor="storyarc-package">
            JSON package
          </label>
          <textarea
            id="storyarc-package"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            rows={14}
            spellCheck={false}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-950 p-4 font-mono text-xs text-slate-100"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => importPackage(true)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Validate / dry run
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => importPackage(false)}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Import as draft
            </button>
          </div>
        </div>
      </details>

      {report && (
        <section aria-live="polite">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Operation report</h2>
            <button
              type="button"
              onClick={() => setReport("")}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              Tutup
            </button>
          </div>
          <pre className="max-h-[32rem] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-emerald-200">
            {report}
          </pre>
        </section>
      )}
    </div>
  );
}
