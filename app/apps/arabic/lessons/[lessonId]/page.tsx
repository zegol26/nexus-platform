import Link from "next/link";
import { notFound } from "next/navigation";
import { getArabicLesson } from "@/lib/arabic/curriculum";
import { LessonClient } from "./LessonClient";

export const dynamic = "force-dynamic";

export default async function ArabicLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = getArabicLesson(lessonId);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <nav className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
        <Link href="/apps/arabic/curriculum" className="hover:underline">
          Curriculum
        </Link>
        <span className="mx-2 text-slate-300">/</span>
        <span className="text-slate-500">{lesson.moduleTitle}</span>
      </nav>

      <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
          {lesson.levelTitle} · {lesson.moduleTitle}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {lesson.lessonTitle}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          {lesson.scenario}
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
            {lesson.arabicType.toUpperCase()}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            Skill: {lesson.targetSkill}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            {lesson.vocabulary.length} kosakata · {lesson.quiz.length} kuis
          </span>
        </div>
      </header>

      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Penjelasan
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-700">{lesson.explanationId}</p>
        {lesson.saudiNote && (
          <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <p className="font-semibold uppercase tracking-[0.2em] text-amber-700">
              Saudi note
            </p>
            <p className="mt-2">{lesson.saudiNote}</p>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Kosakata
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {lesson.vocabulary.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4"
            >
              <p dir="rtl" className="text-2xl font-semibold leading-relaxed text-slate-950">
                {item.arabic}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {item.transliteration}
              </p>
              <p className="mt-1 text-sm text-slate-700">{item.meaningId}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                    item.type === "saudi"
                      ? "bg-amber-50 text-amber-700"
                      : item.type === "mixed"
                        ? "bg-cyan-50 text-cyan-700"
                        : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {item.type}
                </span>
                {item.usageNote && (
                  <span className="text-xs text-slate-500">{item.usageNote}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Dialog
        </h2>
        <div className="mt-4 space-y-3">
          {lesson.dialogue.map((line, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-emerald-100 bg-white p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                {line.speaker}
              </p>
              <p dir="rtl" className="mt-2 text-2xl font-semibold leading-relaxed text-slate-950">
                {line.arabic}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600">{line.transliteration}</p>
              <p className="mt-1 text-sm text-slate-700">{line.meaningId}</p>
              <span
                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                  line.type === "saudi"
                    ? "bg-amber-50 text-amber-700"
                    : line.type === "mixed"
                      ? "bg-cyan-50 text-cyan-700"
                      : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {line.type}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Latihan Praktik
        </h2>
        <ul className="mt-4 space-y-2 text-base text-slate-700">
          {lesson.practicePrompts.map((prompt, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                {idx + 1}
              </span>
              <span className="leading-7">{prompt}</span>
            </li>
          ))}
        </ul>
      </section>

      <LessonClient
        lessonId={lesson.id}
        lessonTitle={lesson.lessonTitle}
        quizCount={lesson.quiz.length}
      />
    </div>
  );
}
