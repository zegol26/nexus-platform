"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  level: string;
  order: number;
  module: string | null;
  lessonType: string | null;
  completed: boolean;
};

type CurriculumProgress = {
  totalLessons: number;
  completedLessons: number;
  percentage: number;
};

type FlashcardPayload = {
  total: number;
  decks: string[];
  levels: string[];
};

export default function DashboardPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<CurriculumProgress>({
    totalLessons: 0,
    completedLessons: 0,
    percentage: 0,
  });
  const [flashcards, setFlashcards] = useState<FlashcardPayload>({
    total: 0,
    decks: [],
    levels: [],
  });

  useEffect(() => {
    async function loadData() {
      const [curriculumRes, progressRes, flashcardRes] = await Promise.all([
        fetch("/api/apps/nihongo/curriculum"),
        fetch("/api/apps/nihongo/curriculum/progress/summary"),
        fetch("/api/apps/nihongo/flashcards?limit=1"),
      ]);

      if (curriculumRes.ok) {
        const data = await curriculumRes.json();
        setLessons(data.lessons ?? []);
      }

      if (progressRes.ok) {
        setProgress(await progressRes.json());
      }

      if (flashcardRes.ok) {
        setFlashcards(await flashcardRes.json());
      }
    }

    loadData();
  }, []);

  const nextLesson = useMemo(
    () => lessons.find((lesson) => !lesson.completed) ?? lessons[0],
    [lessons]
  );

  const levelCount = useMemo(() => {
    return lessons.reduce<Record<string, number>>((acc, lesson) => {
      acc[lesson.level] = (acc[lesson.level] ?? 0) + 1;
      return acc;
    }, {});
  }, [lessons]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <img
              src="/nexus-ai-logo.png"
              alt="Nexus AI"
              className="mb-8 h-28 w-auto rounded-2xl object-contain shadow-sm ring-1 ring-slate-200"
            />
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Nexus AI Nihongo
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Your Japanese learning cockpit is ready.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Ikutin roadmap JLPT/JFT, review flashcards, dan lanjutkan lesson berikutnya dari satu dashboard yang rapi.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={nextLesson ? `/apps/nihongo/curriculum/${nextLesson.id}` : "/apps/nihongo/curriculum"}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700"
              >
                Continue Lesson
              </Link>
              <Link
                href="/apps/nihongo/flashcards"
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                Review Flashcards
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-950 p-6 text-white lg:border-l lg:border-t-0 lg:p-8">
            <p className="text-sm font-medium text-slate-300">Progress</p>
            <div className="mt-4 text-6xl font-semibold tracking-tight">
              {progress.percentage}%
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {progress.completedLessons} of {progress.totalLessons} lessons completed.
            </p>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-cyan-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Curriculum</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {progress.totalLessons}
          </p>
          <p className="mt-1 text-sm text-slate-500">seeded lessons</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Flashcards</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {flashcards.total}
          </p>
          <p className="mt-1 text-sm text-slate-500">cards across {flashcards.decks.length} decks</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Coverage</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {Object.keys(levelCount).length}
          </p>
          <p className="mt-1 text-sm text-slate-500">levels in roadmap</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Next up
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
            {nextLesson?.title ?? "No lesson yet"}
          </h2>
          <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
            {nextLesson?.description ?? "Run the curriculum seed to load lessons."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">
              {nextLesson?.level ?? "-"}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              {nextLesson?.module ?? "Roadmap"}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              {nextLesson?.lessonType ?? "lesson"}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Roadmap mix
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Level distribution
              </h2>
            </div>
            <Link href="/apps/nihongo/curriculum" className="text-sm font-semibold text-cyan-700">
              Open curriculum
            </Link>
          </div>
          <div className="mt-6 space-y-3">
            {Object.entries(levelCount).map(([level, count]) => (
              <div key={level}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{level}</span>
                  <span className="text-slate-500">{count} lessons</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-cyan-500"
                    style={{ width: `${(count / Math.max(lessons.length, 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
