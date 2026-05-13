"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clientTrack } from "@/lib/analytics/clientTrack";

type Lesson = {
  id: string;
  level: string;
  levelTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  scenario: string;
  targetSkill: string;
  arabicType: string;
  order: number;
  vocabularyCount: number;
  quizCount: number;
  completed: boolean;
};

type Level = {
  id: string;
  title: string;
  subtitle: string;
};

const skillLabel: Record<string, string> = {
  daily: "Daily",
  work: "Work",
  umrah: "Umrah",
  travel: "Travel",
  dialect: "Dialect",
};

const typeBadge: Record<string, string> = {
  fusha: "bg-emerald-50 text-emerald-700",
  saudi: "bg-amber-50 text-amber-700",
  mixed: "bg-cyan-50 text-cyan-700",
};

export default function ArabicCurriculumPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [activeLevel, setActiveLevel] = useState("All");
  const [activeSkill, setActiveSkill] = useState("All");

  useEffect(() => {
    clientTrack({
      eventType: "PAGE_VIEW",
      appSlug: "arabic",
      pagePath: "/apps/arabic/curriculum",
    });

    async function load() {
      const res = await fetch("/api/apps/arabic/curriculum");
      if (res.ok) {
        const data = await res.json();
        setLessons(data.lessons ?? []);
        setLevels(data.levels ?? []);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return lessons.filter((lesson) => {
      if (activeLevel !== "All" && lesson.level !== activeLevel) return false;
      if (activeSkill !== "All" && lesson.targetSkill !== activeSkill) return false;
      return true;
    });
  }, [lessons, activeLevel, activeSkill]);

  const grouped = useMemo(() => {
    const byLevel: Record<string, Lesson[]> = {};
    for (const lesson of filtered) {
      if (!byLevel[lesson.level]) byLevel[lesson.level] = [];
      byLevel[lesson.level].push(lesson);
    }
    return byLevel;
  }, [filtered]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col justify-between gap-5 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Curriculum Roadmap
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            6 Level · 17 Modul · Saudi Practical
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Foundation → daily life → kerja → umrah → travel → dialek Saudi. Setiap lesson punya kosakata, dialog, dan kuis pendek.
          </p>
        </div>
        <Link
          href="/apps/arabic/dashboard"
          className="rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-emerald-50"
        >
          Back to dashboard
        </Link>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveLevel("All")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeLevel === "All"
              ? "bg-slate-950 text-white"
              : "border border-emerald-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"
          }`}
        >
          All levels
        </button>
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => setActiveLevel(level.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeLevel === level.id
                ? "bg-slate-950 text-white"
                : "border border-emerald-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"
            }`}
          >
            {level.title}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {["All", "daily", "work", "umrah", "travel", "dialect"].map((skill) => (
          <button
            key={skill}
            onClick={() => setActiveSkill(skill)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              activeSkill === skill
                ? "bg-emerald-600 text-white"
                : "border border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50"
            }`}
          >
            {skill === "All" ? "All skills" : skillLabel[skill] ?? skill}
          </button>
        ))}
      </div>

      <div className="space-y-10">
        {levels.map((level) => {
          const items = grouped[level.id];
          if (!items || items.length === 0) return null;
          return (
            <section key={level.id}>
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  {level.title}
                </p>
                <p className="mt-1 text-sm text-slate-600">{level.subtitle}</p>
              </div>
              <div className="grid gap-4">
                {items
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((lesson) => (
                    <article
                      key={lesson.id}
                      className="grid gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md md:grid-cols-[96px_1fr_auto] md:items-center"
                    >
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">
                        {String(lesson.order).padStart(2, "0")}
                      </div>

                      <div>
                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                          <span className={`rounded-full px-3 py-1 ${typeBadge[lesson.arabicType] ?? "bg-slate-100 text-slate-600"}`}>
                            {lesson.arabicType.toUpperCase()}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                            {lesson.moduleTitle}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                            {skillLabel[lesson.targetSkill] ?? lesson.targetSkill}
                          </span>
                          {lesson.completed && (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                              Completed
                            </span>
                          )}
                        </div>
                        <h2 className="mt-3 text-xl font-semibold text-slate-950">
                          {lesson.lessonTitle}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {lesson.scenario}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {lesson.vocabularyCount} kosakata · {lesson.quizCount} kuis
                        </p>
                      </div>

                      <Link
                        href={`/apps/arabic/lessons/${lesson.id}`}
                        className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        {lesson.completed ? "Review" : "Start"}
                      </Link>
                    </article>
                  ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
