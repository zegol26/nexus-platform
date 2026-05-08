"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { UserBadgeHeader } from "@/components/nihongo/UserBadgeHeader";

type MockQuestion = {
  id: string;
  section: string;
  subCategory: string;
  question: string;
  options: string[];
  explanation: string;
};

type Readiness = {
  isAdmin: boolean;
  isReady: boolean;
  readinessScore: number;
  threshold: number;
  message: string;
};

type Result = {
  attemptId: string;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  review: Array<{
    questionId: string;
    correctAnswer: string;
    userAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }>;
};

export default function JLPTN4MockTestPage() {
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMockTest() {
      setLoading(true);
      setError("");

      const response = await fetch("/api/apps/nihongo/mock-tests/n4");
      const payload = await response.json();

      if (!response.ok) {
        setReadiness(payload.readiness ?? null);
        setError(payload.error ?? "Mock test belum bisa dibuka.");
      } else {
        setReadiness(payload.readiness);
        setQuestions(payload.questions ?? []);
      }

      setLoading(false);
    }

    loadMockTest();
  }, []);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  async function submitTest() {
    if (answeredCount < questions.length) {
      setError("Jawab semua pertanyaan dulu sebelum submit.");
      return;
    }

    setSubmitting(true);
    setError("");

    const response = await fetch("/api/apps/nihongo/mock-tests/n4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: questions.map((question) => ({
          questionId: question.id,
          answer: answers[question.id],
        })),
      }),
    });
    const payload = await response.json();

    if (response.ok) {
      setResult(payload);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setError(payload.error ?? "Submit gagal.");
    }

    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <UserBadgeHeader />
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">JLPT N4 Mock Test</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950">Menyiapkan soal...</h1>
        </section>
      </div>
    );
  }

  if (error && !questions.length) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <UserBadgeHeader />
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Locked</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950">JLPT N4 Mock Test belum terbuka</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
            {readiness?.message ?? "Selesaikan pre-assessment dulu untuk menghitung readiness kamu."}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-amber-800">
            Target unlock: {readiness?.threshold ?? 70}% readiness. N4 lebih panjang, jadi rehearsal N4 disiapkan untuk
            pemanasan sebelum masuk simulasi penuh.
          </p>
          <Link
            href="/apps/nihongo/full-rehearsal-n4"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            Buka Rehearsal N4
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <UserBadgeHeader />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">JLPT N4 Mock Test</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Simulasi Ujian N4</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {readiness?.isAdmin
                ? "Admin mode: kamu bisa akses semua soal untuk review bank mock test."
                : readiness?.message}
            </p>
          </div>
          <div className="rounded-xl bg-cyan-50 px-5 py-4 text-sm font-semibold text-cyan-800">
            Ready {readiness?.readinessScore ?? 0}% / {readiness?.threshold ?? 70}%
          </div>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-500">
          {answeredCount}/{questions.length} dijawab
        </p>
      </section>

      {result && <ResultCard result={result} />}

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <section className="space-y-4">
        {questions.map((question, index) => (
          <article key={question.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {question.section} / {question.subCategory}
              </p>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {index + 1}
              </span>
            </div>
            <p className="mt-4 text-lg font-semibold leading-8 text-slate-950">{stripMarkdownBold(question.question)}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {question.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                    answers[question.id] === option
                      ? "border-cyan-500 bg-cyan-50 text-cyan-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>

      <div className="sticky bottom-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
        <button
          type="button"
          onClick={submitTest}
          disabled={submitting || !questions.length}
          className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "Mengecek jawaban..." : "Submit JLPT N4 Mock Test"}
        </button>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: Result }) {
  return (
    <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-800">Result</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-950">{result.scorePercent}/100</h2>
      <p className="mt-2 text-sm text-slate-700">
        Benar {result.correctCount} dari {result.totalQuestions}.{" "}
        {result.passed ? "Mantap, kamu sudah terlihat siap untuk N4." : "Masih ada ruang latihan, tapi arah belajarnya sudah kebaca."}
      </p>
    </section>
  );
}

function stripMarkdownBold(value: string) {
  return value.replace(/\*\*/g, "");
}
