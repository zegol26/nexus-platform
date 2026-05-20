"use client";

import { useEffect, useState } from "react";
import { READINESS_CHECKLIST } from "@/lib/pmp/progress";

type ReadinessItem = { itemKey: string; isComplete: boolean };

type Props = {
  onProgressChange?: () => void;
};

export function PmpReadinessChecklist({ onProgressChange }: Props) {
  const [items, setItems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/apps/pmp/readiness");
        if (cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          const map: Record<string, boolean> = {};
          for (const item of (data.items ?? []) as ReadinessItem[]) {
            map[item.itemKey] = item.isComplete;
          }
          setItems(map);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle(itemKey: string, nextValue: boolean) {
    setItems((prev) => ({ ...prev, [itemKey]: nextValue }));
    await fetch("/api/apps/pmp/readiness", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemKey, isComplete: nextValue }),
    });
    onProgressChange?.();
  }

  const groups = ["Prep", "Knowledge", "Practice", "Exam Day"] as const;
  const completedCount = Object.values(items).filter(Boolean).length;
  const total = READINESS_CHECKLIST.length;
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-200">
            Readiness Checklist ✦
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Persiapan exam — {completedCount}/{total} done
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-44 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-sm font-bold text-white">{percent}%</span>
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-slate-400">Memuat checklist...</p>
      ) : (
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {groups.map((group) => {
            const groupItems = READINESS_CHECKLIST.filter((c) => c.group === group);
            if (groupItems.length === 0) return null;
            return (
              <div key={group}>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                  {group}
                </p>
                <ul className="mt-2 space-y-2">
                  {groupItems.map((item) => {
                    const checked = items[item.key] ?? false;
                    return (
                      <li key={item.key}>
                        <label
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-2.5 transition ${
                            checked
                              ? "border-emerald-300/30 bg-emerald-300/5"
                              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => toggle(item.key, e.target.checked)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-slate-950 text-emerald-300 focus:ring-emerald-300/50"
                          />
                          <span className="flex-1">
                            <span
                              className={`block text-sm font-semibold ${
                                checked ? "text-emerald-100 line-through opacity-75" : "text-white"
                              }`}
                            >
                              {item.title}
                            </span>
                            <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">
                              {item.description}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
