"use client";

import { useEffect, useMemo, useState } from "react";
import { clientTrack } from "@/lib/analytics/clientTrack";

type QuizQuestion = {
  id: string;
  lessonId: string;
  questionType: string;
  prompt: string;
  arabicText?: string;
  transliteration?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
};

const levelLabels: Record<string, string> = {
  L1_FOUNDATION: "Foundation",
  L2_DAILY: "Daily Life",
  L3_WORK: "Work",
  L4_UMRAH: "Umrah",
  L5_TRAVEL: "Travel",
  L6_DIALECT: "Saudi Dialect",
};

export default function ArabicQuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [level, setLevel] = useState("");
  const [skill, setSkill] = useState("");
  const [loading, setLoading] = useState(false);

  const current = questions[index];
  const finished = questions.length > 0 && index >= questions.length;

  const loadQuiz = async () => {
    setLoading(true);
    const params = new URLSearchParams({ count: "10" });
    if (level) params.set("level", level);
    if (skill) params.set("skill", skill);

    const res = await fetch(`/api/apps/arabic/quiz?${params}`);
    const data = await res.json();
    if (res.ok) {
      setQuestions(data.questions ?? []);
      setIndex(0);
      setScore(0);
      setSelected("");
      setAnswered(false);
      clientTrack({
        eventType: "QUIZ_STARTED",
        appSlug: "arabic",
        pagePath: "/apps/arabic/quiz",
        metadata: { level: level || null, skill: skill || null },
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    clientTrack({
      eventType: "PAGE_VIEW",
      appSlug: "arabic",
      pagePath: "/apps/arabic/quiz",
    });
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round((Math.min(index, questions.length) / questions.length) * 100);
  }, [index, questions.length]);

  const submitAnswer = (option: string) => {
    if (!current || answered) return;
    setSelected(option);
    setAnswered(true);
    if (option === current.correctAnswer) {
      setScore((value) => value + 1);
    }
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      clientTrack({
        eventType: "QUIZ_COMPLETED",
        appSlug: "arabic",
        pagePath: "/apps/arabic/quiz",
        metadata: {
          score,
          total: questions.length,
          level: level || null,
          skill: skill || null,
        },
      });
    }
    setIndex((value) => value + 1);
    setSelected("");
    setAnswered(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Quiz Mode
        </p>
        <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
              Test pemahamanmu
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Kuis pilihan ganda dari curriculum: skenario nyata kerja, umrah, travel, dan dialek Saudi.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              className="h-11 rounded-full border border-emerald-200 px-4 text-sm font-medium outline-none focus:border-emerald-500"
            >
              <option value="">All levels</option>
              {Object.entries(levelLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={skill}
              onChange={(event) => setSkill(event.target.value)}
              className="h-11 rounded-full border border-emerald-200 px-4 text-sm font-medium outline-none focus:border-emerald-500"
            >
              <option value="">All skills</option>
              <option value="daily">Daily</option>
              <option value="work">Work</option>
              <option value="umrah">Umrah</option>
              <option value="travel">Travel</option>
              <option value="dialect">Dialect</option>
            </select>
            <button
              type="button"
              onClick={loadQuiz}
              disabled={loading}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-slate-400"
            >
              New quiz
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-slate-500">
            Score {score} / {questions.length}
          </div>
          <div className="h-2 w-44 rounded-full bg-emerald-50">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {finished ? (
          <div className="py-14 text-center">
            <p className="text-5xl font-semibold text-slate-950">
              {score}/{questions.length}
            </p>
            <p className="mt-4 text-slate-600">
              Quiz selesai. Ambil batch baru untuk drill lagi.
            </p>
            <button
              type="button"
              onClick={loadQuiz}
              className="mt-8 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Restart quiz
            </button>
          </div>
        ) : current ? (
          <div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                {current.questionType}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                {current.difficulty}
              </span>
            </div>

            {current.arabicText && (
              <p
                dir="rtl"
                className="mt-6 text-4xl font-semibold leading-relaxed text-emerald-900"
              >
                {current.arabicText}
              </p>
            )}
            {current.transliteration && (
              <p className="mt-1 text-sm text-slate-500">{current.transliteration}</p>
            )}

            <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
              {current.prompt}
            </h2>

            <div className="mt-8 grid gap-3">
              {current.options.map((option) => {
                const isCorrect = option === current.correctAnswer;
                const isSelected = option === selected;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => submitAnswer(option)}
                    className={`rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition ${
                      answered && isCorrect
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : answered && isSelected
                          ? "border-red-300 bg-red-50 text-red-800"
                          : "border-emerald-100 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="mt-6 rounded-2xl bg-emerald-50/60 p-5 text-sm leading-6 text-slate-700">
                <p className="font-semibold">
                  {selected === current.correctAnswer
                    ? "Benar!"
                    : `Jawaban: ${current.correctAnswer}`}
                </p>
                <p className="mt-2">{current.explanation}</p>
                <button
                  type="button"
                  onClick={next}
                  className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Next question
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-500">
            {loading ? "Memuat kuis..." : "Belum ada soal. Atur filter lalu klik New quiz."}
          </p>
        )}
      </section>
    </div>
  );
}
