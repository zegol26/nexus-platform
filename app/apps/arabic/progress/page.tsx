"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clientTrack } from "@/lib/analytics/clientTrack";

type ProgressData = {
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  skillBreakdown: Record<string, { total: number; completed: number }>;
  averageQuizScore: number;
  quizSessions: number;
  tutorMessages: number;
  conversationSessions: number;
};

type LessonSummary = {
  id: string;
  lessonTitle: string;
  moduleTitle: string;
  levelTitle: string;
  completed: boolean;
  order: number;
};

const skillLabel: Record<string, string> = {
  daily: "Daily Survival",
  work: "Arabic for Work",
  umrah: "Arabic for Umrah",
  travel: "Travel Arabic",
  dialect: "Saudi Dialect",
};

export default function ArabicProgressPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);

  useEffect(() => {
    clientTrack({
      eventType: "PAGE_VIEW",
      appSlug: "arabic",
      pagePath: "/apps/arabic/progress",
    });

    async function load() {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/apps/arabic/progress"),
        fetch("/api/apps/arabic/curriculum"),
      ]);

      if (pRes.ok) setProgress(await pRes.json());
      if (cRes.ok) {
        const data = await cRes.json();
        setLessons(data.lessons ?? []);
      }
    }
    load();
  }, []);

  const nextLesson = lessons.find((lesson) => !lesson.completed) ?? lessons[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Progress
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Statistik Belajar Kamu
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Lihat capaian lesson, skor quiz rata-rata, sesi tutor, dan progres per kategori (daily, work, umrah, travel, dialect).
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Overall"
          value={`${progress?.percentage ?? 0}%`}
          sub={`${progress?.completedLessons ?? 0}/${progress?.totalLessons ?? 0} lesson`}
        />
        <StatCard
          label="Quiz Rata-rata"
          value={`${progress?.averageQuizScore ?? 0}%`}
          sub={`${progress?.quizSessions ?? 0} sesi`}
        />
        <StatCard
          label="AI Tutor"
          value={`${progress?.tutorMessages ?? 0}`}
          sub="pesan ke tutor"
        />
        <StatCard
          label="AI Conversation"
          value={`${progress?.conversationSessions ?? 0}`}
          sub="sesi roleplay"
        />
      </section>

      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Progress per Kategori
        </h2>
        <div className="mt-5 space-y-4">
          {Object.entries(skillLabel).map(([skill, label]) => {
            const stat = progress?.skillBreakdown?.[skill];
            const total = stat?.total ?? 0;
            const completed = stat?.completed ?? 0;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return (
              <div key={skill}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{label}</span>
                  <span className="text-slate-500">
                    {completed}/{total} ({pct}%)
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-emerald-50">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {nextLesson && (
        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Next recommended
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
            {nextLesson.lessonTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {nextLesson.moduleTitle} · {nextLesson.levelTitle}
          </p>
          <Link
            href={`/apps/arabic/lessons/${nextLesson.id}`}
            className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Lanjutkan
          </Link>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{sub}</p>
    </div>
  );
}
