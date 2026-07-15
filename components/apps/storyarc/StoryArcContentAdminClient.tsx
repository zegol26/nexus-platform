"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RevisionRow = {
  id: string;
  stableId: string;
  revision: number;
  title: string;
  state: string;
};

export function StoryArcContentAdminClient({ initialPackage, revisions }: { initialPackage: string; revisions: RevisionRow[] }) {
  const router = useRouter();
  const [source, setSource] = useState(initialPackage);
  const [report, setReport] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function importPackage(dryRun: boolean) {
    setBusy(true);
    try {
      const parsed = JSON.parse(source) as unknown;
      const response = await fetch("/api/admin/apps/storyarc/content/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun, package: parsed }),
      });
      const payload = await response.json();
      setReport(JSON.stringify(payload, null, 2));
      if (response.ok && !dryRun) router.refresh();
    } catch (error) {
      setReport(error instanceof Error ? error.message : "Invalid JSON package");
    } finally {
      setBusy(false);
    }
  }

  async function transition(stableId: string, state: string) {
    setBusy(true);
    const response = await fetch(`/api/admin/apps/storyarc/content/${stableId}/lifecycle`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    });
    setReport(JSON.stringify(await response.json(), null, 2));
    setBusy(false);
    if (response.ok) router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Structured package import</h2>
        <p className="mt-2 text-sm text-slate-600">Dry-run validates the complete package first. A malformed package is never partially imported.</p>
        <label className="mt-4 block text-sm font-semibold" htmlFor="storyarc-package">JSON package</label>
        <textarea id="storyarc-package" value={source} onChange={(event) => setSource(event.target.value)} rows={18} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-950 p-4 font-mono text-xs text-slate-100" />
        <div className="mt-4 flex gap-3">
          <button disabled={busy} onClick={() => importPackage(true)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">Validate / dry run</button>
          <button disabled={busy} onClick={() => importPackage(false)} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Import as draft</button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Latest revisions</h2>
        <div className="mt-4 space-y-3">
          {revisions.map((revision) => (
            <div key={revision.id} className="flex flex-col justify-between gap-3 rounded-xl bg-slate-50 p-4 md:flex-row md:items-center">
              <div><p className="font-semibold">{revision.title}</p><p className="text-xs text-slate-500">{revision.stableId}@{revision.revision} · {revision.state}</p></div>
              <div className="flex flex-wrap gap-2">
                {(["VALIDATING", "IN_REVIEW", "APPROVED", "PUBLISHED", "SUPERSEDED", "ARCHIVED"] as const).map((state) => (
                  <button key={state} disabled={busy} onClick={() => transition(revision.stableId, state)} className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold disabled:opacity-40">{state}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      {report && <pre className="max-h-[32rem] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-emerald-200">{report}</pre>}
    </div>
  );
}
