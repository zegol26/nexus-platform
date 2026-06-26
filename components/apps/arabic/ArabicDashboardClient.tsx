"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArabicBrandMark } from "@/components/apps/arabic/ArabicBrandMark";
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
  level: string;
  levelTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  targetSkill: string;
  arabicType: string;
  completed: boolean;
  order: number;
};

const skillLabel: Record<string, string> = {
  daily: "Daily Survival",
  work: "Work Arabic",
  umrah: "Umrah Arabic",
  travel: "Travel Arabic",
  dialect: "Saudi Dialect",
};

export function ArabicDashboardClient() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);

  useEffect(() => {
    clientTrack({
      eventType: "PAGE_VIEW",
      appSlug: "arabic",
      pagePath: "/apps/arabic/dashboard",
    });

    async function load() {
      const [progressRes, curriculumRes] = await Promise.all([
        fetch("/api/apps/arabic/progress"),
        fetch("/api/apps/arabic/curriculum"),
      ]);

      if (progressRes.ok) {
        setProgress(await progressRes.json());
      }
      if (curriculumRes.ok) {
        const data = await curriculumRes.json();
        setLessons(data.lessons ?? []);
      }
    }

    load();
  }, []);

  const nextLesson = lessons.find((lesson) => !lesson.completed) ?? lessons[0];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-7 inline-flex items-center gap-5">
              <ArabicBrandMark size="lg" />
              <span className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-[0.32em] text-emerald-700">
                  Nexus AI
                </span>
                <span className="text-2xl font-bold tracking-tight text-slate-950">
                  Arabic
                </span>
                <span className="mt-1 text-[11px] font-medium text-slate-400">
                  Saudi daily Arabic for Indonesian
                </span>
              </span>
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Nexus AI Arabic
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Belajar Arab praktis untuk kerja, umrah, dan travel.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Mulai dari sapa Saudi, naik taksi, ngobrol dengan atasan kerja, sampai tanya arah di Masjidil Haram — semua dalam satu cockpit.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={
                  nextLesson
                    ? `/apps/arabic/lessons/${nextLesson.id}`
                    : "/apps/arabic/curriculum"
                }
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Continue Lesson
              </Link>
              <Link
                href="/apps/arabic/tutor"
                className="rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                Tanya Tutor
              </Link>
            </div>
          </div>

          <div className="border-t border-emerald-100 bg-slate-950 p-6 text-white lg:border-l lg:border-t-0 lg:p-8">
            <p className="text-sm font-medium text-emerald-200">Progress</p>
            <div className="mt-4 text-6xl font-semibold tracking-tight">
              {progress?.percentage ?? 0}%
            </div>
            <p className="mt-3 text-sm leading-6 text-emerald-100/80">
              {(progress?.completedLessons ?? 0)} of {progress?.totalLessons ?? 0} lessons completed.
            </p>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-300"
                style={{ width: `${progress?.percentage ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Daily Survival", skill: "daily", href: "/apps/arabic/curriculum?skill=daily" },
          { title: "Arabic for Work", skill: "work", href: "/apps/arabic/curriculum?skill=work" },
          { title: "Arabic for Umrah", skill: "umrah", href: "/apps/arabic/curriculum?skill=umrah" },
          { title: "Travel Arabic", skill: "travel", href: "/apps/arabic/curriculum?skill=travel" },
        ].map((card) => {
          const stat = progress?.skillBreakdown?.[card.skill];
          const total = stat?.total ?? 0;
          const completed = stat?.completed ?? 0;
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
          return (
            <Link
              key={card.skill}
              href={card.href}
              className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {skillLabel[card.skill]}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-slate-950">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-600">
                {completed}/{total} lesson selesai
              </p>
              <div className="mt-3 h-2 rounded-full bg-emerald-50">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/apps/arabic/tutor"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm transition hover:border-emerald-400"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">AI Tutor</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">Tanya Tutor Arab</h3>
          <p className="mt-2 text-sm text-slate-600">
            Tanya grammar, kosakata, atau Saudi expression dengan tutor Indonesia.
          </p>
        </Link>
        <Link
          href="/apps/arabic/conversation"
          className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm transition hover:border-emerald-400"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">AI Conversation</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">Latihan Roleplay</h3>
          <p className="mt-2 text-sm text-slate-600">
            10 skenario nyata: imigrasi, taksi, hotel, masjid, kerja.
          </p>
        </Link>
        <Link
          href="/apps/arabic/quiz"
          className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm transition hover:border-emerald-400"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Quiz</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">Test Hafalan</h3>
          <p className="mt-2 text-sm text-slate-600">
            Cek pemahaman dengan kuis pilihan ganda berbasis skenario.
          </p>
        </Link>
        <Link
          href="/apps/arabic/progress"
          className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm transition hover:border-emerald-400"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Progress</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">Lihat Statistik</h3>
          <p className="mt-2 text-sm text-slate-600">
            Skor quiz rata-rata, sesi tutor, dan rekomendasi lesson berikutnya.
          </p>
        </Link>
      </section>

      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Next up
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              {nextLesson?.lessonTitle ?? "Curriculum belum ter-load"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {nextLesson?.moduleTitle ?? "—"} · {nextLesson?.levelTitle ?? "—"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
              {nextLesson?.arabicType ?? "—"}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              {skillLabel[nextLesson?.targetSkill ?? ""] ?? "—"}
            </span>
            {nextLesson && (
              <Link
                href={`/apps/arabic/lessons/${nextLesson.id}`}
                className="rounded-full bg-slate-950 px-4 py-2 text-white transition hover:bg-emerald-700"
              >
                Buka Lesson
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
