"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ListeningContent } from "@/lib/nihongo/listening";
import { clientTrack } from "@/lib/analytics/clientTrack";

type ListeningPracticeClientProps = {
  item: ListeningContent;
  initiallyCompleted: boolean;
};

export function ListeningPracticeClient({ item, initiallyCompleted }: ListeningPracticeClientProps) {
  const [showRomaji, setShowRomaji] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    clientTrack({
      eventType: "LISTENING_STARTED",
      pagePath: `/apps/nihongo/listening/${item.id}`,
      lessonId: item.id,
      metadata: { title: item.title, level: item.level, category: item.category },
    });
  }, [item.category, item.id, item.level, item.title]);

  async function markComplete() {
    if (saving || completed) return;

    setSaving(true);
    const response = await fetch("/api/apps/nihongo/listening/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    });

    if (response.ok) {
      setCompleted(true);
      clientTrack({
        eventType: "LISTENING_COMPLETED",
        pagePath: `/apps/nihongo/listening/${item.id}`,
        lessonId: item.id,
        metadata: { title: item.title, level: item.level, category: item.category },
      });
    }

    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/apps/nihongo/listening"
          className="w-fit rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to listening roadmap
        </Link>
        <div className="flex flex-wrap gap-2">
          <ToggleButton active={showRomaji} label="Romaji" onClick={() => setShowRomaji((value) => !value)} />
          <ToggleButton
            active={showTranslation}
            label="Indonesian"
            onClick={() => setShowTranslation((value) => !value)}
          />
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[linear-gradient(135deg,#111827,#0e7490,#0f766e)] p-6 text-white sm:p-8">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/15 px-3 py-1">{item.level}</span>
            <span className="rounded-full bg-white/15 px-3 py-1">{item.category}</span>
            <span className="rounded-full bg-white/15 px-3 py-1">
              {item.durationSec ? `${Math.ceil(item.durationSec / 60)} min` : "Audio practice"}
            </span>
          </div>
          <h1 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight sm:text-4xl">{item.title}</h1>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] sm:p-8">
          <article className="space-y-4">
            {item.audioUrl ? (
              <audio controls src={item.audioUrl} className="w-full rounded-2xl">
                <track kind="captions" />
              </audio>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                Audio belum tersedia untuk materi ini.
              </div>
            )}

            <div className="space-y-3">
              {item.lines.map((line, index) => (
                <div key={`${item.id}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xl leading-9 text-slate-950">{line.kanji}</p>
                  {showRomaji && line.romaji ? (
                    <p className="mt-3 text-sm leading-6 text-cyan-800">{line.romaji}</p>
                  ) : null}
                  {showTranslation && line.translation ? (
                    <p className="mt-2 text-sm leading-6 text-slate-600">{line.translation}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </article>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Practice Status</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{completed ? "Completed" : "In progress"}</p>
            <button
              type="button"
              onClick={markComplete}
              disabled={saving || completed}
              className="mt-5 w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:bg-emerald-600"
            >
              {completed ? "Completed" : saving ? "Saving..." : "Mark Complete"}
            </button>
          </aside>
        </div>
      </section>
    </div>
  );
}

function ToggleButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-slate-950 text-white"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}
