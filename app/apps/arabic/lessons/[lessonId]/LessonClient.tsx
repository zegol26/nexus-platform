"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clientTrack } from "@/lib/analytics/clientTrack";

type LessonClientProps = {
  lessonId: string;
  lessonTitle: string;
  quizCount: number;
};

export function LessonClient({ lessonId, lessonTitle, quizCount }: LessonClientProps) {
  const [completed, setCompleted] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    clientTrack({
      eventType: "PAGE_VIEW",
      appSlug: "arabic",
      pagePath: `/apps/arabic/lessons/${lessonId}`,
      lessonId,
    });
    clientTrack({
      eventType: "LESSON_STARTED",
      appSlug: "arabic",
      pagePath: `/apps/arabic/lessons/${lessonId}`,
      lessonId,
    });

    async function checkComplete() {
      const res = await fetch(`/api/apps/arabic/curriculum/${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        setCompleted(Boolean(data.completed));
      }
    }
    checkComplete();
  }, [lessonId]);

  const markComplete = async () => {
    if (marking) return;
    setMarking(true);
    const res = await fetch("/api/apps/arabic/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    });
    if (res.ok) {
      setCompleted(true);
    }
    setMarking(false);
  };

  return (
    <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
        Lanjut Praktek
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Setelah baca dialog dan vocab &quot;{lessonTitle}&quot;, lanjut praktek dengan tutor, roleplay, atau kuis.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link
          href="/apps/arabic/tutor"
          className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 text-center text-sm font-semibold text-slate-800 transition hover:border-emerald-400 hover:bg-emerald-100"
        >
          Tanya AI Tutor
        </Link>
        <Link
          href="/apps/arabic/conversation"
          className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 text-center text-sm font-semibold text-slate-800 transition hover:border-emerald-400 hover:bg-emerald-100"
        >
          AI Conversation Roleplay
        </Link>
        <Link
          href={`/apps/arabic/quiz?lessonId=${lessonId}`}
          className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 text-center text-sm font-semibold text-slate-800 transition hover:border-emerald-400 hover:bg-emerald-100"
        >
          Kuis ({quizCount} soal)
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={markComplete}
          disabled={completed || marking}
          className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
            completed
              ? "border border-emerald-300 bg-emerald-100 text-emerald-800"
              : "bg-slate-950 text-white hover:bg-emerald-700 disabled:bg-slate-400"
          }`}
        >
          {completed ? "✓ Sudah selesai" : marking ? "Menyimpan..." : "Tandai selesai"}
        </button>
        <Link
          href="/apps/arabic/curriculum"
          className="rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50"
        >
          Kembali ke Curriculum
        </Link>
      </div>
    </section>
  );
}
