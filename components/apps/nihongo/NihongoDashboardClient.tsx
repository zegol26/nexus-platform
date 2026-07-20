"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clientTrack } from "@/lib/analytics/clientTrack";

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

type NihongoProfilePayload = {
  currentLevel: string;
  weaknessTags: string[];
  strengthTags: string[];
  recommendedDailyPlan: string | null;
  badge: {
    nameIndonesian: string;
    nameJapanese: string;
    motivationalMessage: string;
    imageUrl: string | null;
    iconUrl: string | null;
  } | null;
  nextLesson: {
    id: string;
    title: string;
    level: string;
    module: string | null;
  } | null;
};

type MockReadinessPayload = {
  isAdmin: boolean;
  isReady: boolean;
  readinessScore: number;
  threshold: number;
  message: string;
};

/**
 * Nexus AI Nihongo home screen.
 *
 * Redesigned as a single-column "story mode" entry point: one clear
 * next step at the top, a horizontal path preview underneath, and a
 * couple of compact status chips below. Deliberately kept to a small
 * number of blocks (see docs/DESIGN.md dashboard rules) so the screen
 * reads as calm and uncluttered instead of a dense admin-style grid.
 */
export function NihongoDashboardClient() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<CurriculumProgress>({
    totalLessons: 0,
    completedLessons: 0,
    percentage: 0,
  });
  const [profile, setProfile] = useState<NihongoProfilePayload | null>(null);
  const [mockReadiness, setMockReadiness] = useState<MockReadinessPayload | null>(null);
  const [badgeImageFailed, setBadgeImageFailed] = useState(false);

  useEffect(() => {
    clientTrack({
      eventType: "PAGE_VIEW",
      pagePath: "/apps/nihongo/dashboard",
    });

    async function loadData() {
      const [curriculumRes, progressRes, profileRes] = await Promise.all([
        fetch("/api/apps/nihongo/curriculum"),
        fetch("/api/apps/nihongo/curriculum/progress/summary"),
        fetch("/api/apps/nihongo/pre-assessment/profile"),
      ]);

      if (curriculumRes.ok) {
        const data = await curriculumRes.json();
        setLessons(data.lessons ?? []);
      }

      if (progressRes.ok) {
        setProgress(await progressRes.json());
      }

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.profile ?? null);
        setMockReadiness(data.jlptN5MockReadiness ?? null);
      }
    }

    loadData();
  }, []);

  const nextLesson = useMemo(
    () => profile?.nextLesson ?? lessons.find((lesson) => !lesson.completed) ?? lessons[0],
    [lessons, profile]
  );

  const nextLessonDescription: string | null =
    nextLesson && "description" in nextLesson
      ? (nextLesson.description as string | null)
      : "Rekomendasi dari hasil pre-assessment.";

  const badgeImageUrl = badgeImageFailed ? null : profile?.badge?.imageUrl ?? profile?.badge?.iconUrl;

  const upcomingLessons = useMemo(() => {
    const sorted = [...lessons].sort((a, b) => a.order - b.order);
    const startIndex = nextLesson
      ? Math.max(sorted.findIndex((lesson) => lesson.id === nextLesson.id), 0)
      : 0;
    return sorted.slice(startIndex, startIndex + 6);
  }, [lessons, nextLesson]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
          Nexus AI Nihongo
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Selamat datang kembali.
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">
          Satu langkah berikutnya di perjalanan belajar Anda.
        </p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            {nextLesson?.level ?? "Mulai"}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {progress.completedLessons}/{progress.totalLessons} selesai
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-semibold leading-snug text-slate-950">
          {nextLesson?.title ?? "Curriculum belum tersedia"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {nextLessonDescription ?? "Selesaikan pre-assessment untuk rekomendasi personal."}
        </p>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-cyan-500 transition-[width]"
            style={{ width: `${Math.min(progress.percentage, 100)}%` }}
          />
        </div>

        <Link
          href={nextLesson ? `/apps/nihongo/curriculum/${nextLesson.id}` : "/apps/nihongo/curriculum"}
          className="mt-5 flex w-full items-center justify-center rounded-2xl bg-cyan-600 px-5 py-3.5 text-center text-base font-semibold text-white shadow-sm transition hover:bg-cyan-700"
        >
          Lanjutkan Pelajaran
        </Link>
      </section>

      {upcomingLessons.length > 0 ? (
        <section className="min-w-0">
          <div className="mb-2.5 flex items-center justify-between px-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Perjalanan belajar
            </p>
            <Link href="/apps/nihongo/curriculum" className="text-xs font-semibold text-cyan-700">
              Lihat semua
            </Link>
          </div>
          <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
            {upcomingLessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/apps/nihongo/curriculum/${lesson.id}`}
                className={`min-w-[168px] shrink-0 rounded-2xl border p-3.5 transition ${
                  lesson.completed
                    ? "border-emerald-200 bg-emerald-50"
                    : lesson.id === nextLesson?.id
                      ? "border-cyan-300 bg-cyan-50"
                      : "border-slate-200 bg-white hover:border-cyan-200"
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
                    lesson.completed ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {lesson.level}
                </span>
                <p
                  className={`mt-1.5 line-clamp-2 text-sm font-semibold leading-snug ${
                    lesson.completed ? "text-emerald-700" : "text-slate-900"
                  }`}
                >
                  {lesson.title}
                </p>
                {lesson.completed ? (
                  <span className="mt-2 inline-block text-[11px] font-semibold text-emerald-700">
                    Selesai
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-2 gap-3">
        <Link
          href="/apps/nihongo/badges"
          className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-cyan-200"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Badge
          </p>
          <div className="mt-2 flex items-center gap-2.5">
            {badgeImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={badgeImageUrl}
                alt={profile?.badge?.nameIndonesian ?? "Badge"}
                onError={() => setBadgeImageFailed(true)}
                className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-cyan-100"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-sm font-semibold text-white">
                {profile?.badge?.nameIndonesian?.slice(0, 1) ?? "?"}
              </div>
            )}
            <p className="min-w-0 truncate text-sm font-semibold text-slate-900">
              {profile?.badge?.nameIndonesian ?? "Belum ada"}
            </p>
          </div>
        </Link>

        <Link
          href="/apps/nihongo/mock-test/n5"
          className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-cyan-200"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            JLPT N5 Readiness
          </p>
          <div className="mt-2 flex items-center gap-2.5">
            <p className="text-xl font-semibold text-slate-950">
              {mockReadiness?.readinessScore ?? 0}%
            </p>
            <p className="min-w-0 truncate text-xs text-slate-500">
              {mockReadiness?.isReady ? "Siap mock test" : "Menuju siap"}
            </p>
          </div>
        </Link>
      </section>

      <section className="flex gap-2.5">
        <Link
          href="/apps/nihongo/flashcards"
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50"
        >
          Flashcards
        </Link>
        <Link
          href="/apps/nihongo/tutor"
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50"
        >
          Tanya Aichan
        </Link>
      </section>
    </div>
  );
}
