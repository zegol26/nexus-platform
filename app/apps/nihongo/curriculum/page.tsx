"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  level: string;
  order: number;
  track: string | null;
  module: string | null;
  lessonType: string | null;
  completed: boolean;
};

export default function CurriculumPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLevel, setActiveLevel] = useState("All");

  useEffect(() => {
    async function loadCurriculum() {
      const res = await fetch("/api/apps/nihongo/curriculum");
      const data = await res.json();

      if (res.ok) {
        setLessons(data.lessons);
      }
    }

    loadCurriculum();
  }, []);

  const levels = useMemo(
    () => ["All", ...Array.from(new Set(lessons.map((lesson) => lesson.level)))],
    [lessons]
  );

  const filteredLessons = lessons.filter(
    (lesson) => activeLevel === "All" || lesson.level === activeLevel
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col justify-between gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
            Curriculum Roadmap
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            JLPT and JFT learning path
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Start dari kana foundation, naik ke N5/N4 grammar, lalu masuk ke conversation praktis untuk kerja dan daily life.
          </p>
        </div>
        <Link
          href="/apps/nihongo/dashboard"
          className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Back to dashboard
        </Link>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => setActiveLevel(level)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeLevel === level
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:bg-cyan-50"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      <section className="grid gap-4">
        {filteredLessons.map((lesson) => (
          <article
            key={lesson.id}
            className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md md:grid-cols-[96px_1fr_auto] md:items-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">
              {String(lesson.order).padStart(2, "0")}
            </div>

            <div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">
                  {lesson.level}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  {lesson.module ?? "Roadmap"}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  {lesson.lessonType ?? "lesson"}
                </span>
                {lesson.completed && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                    Completed
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">
                {lesson.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {lesson.description}
              </p>
            </div>

            <Link
              href={`/apps/nihongo/curriculum/${lesson.id}`}
              className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              {lesson.completed ? "Review" : "Start"}
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
