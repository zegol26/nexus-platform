"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PronunciationRecorder } from "@/components/apps/nihongo/PronunciationRecorder";

type Question = {
  id: string;
  category: "kana" | "kanji" | "particles" | "tense_forms" | "reading" | "listening";
  type: "multiple_choice" | "audio_multiple_choice" | "reading_multiple_choice";
  prompt: string;
  instructionIndonesian: string;
  options: string[];
  level: string;
  tags: string[];
  audioUrl?: string;
  passage?: {
    japanese: string;
    kanaSupport?: string;
    indonesianHint?: string;
  };
};

type PronunciationPrompt = {
  prompt: string;
  kanaSupport: string;
  instructionIndonesian: string;
};

type PronunciationEvaluation = {
  audioUrl?: string;
  metadata?: Record<string, unknown>;
  pronunciationScore: number | null;
  fluencyScore: number | null;
  accuracyScore: number | null;
  missingWords: string[];
  misreadWords: string[];
  feedbackIndonesian: string;
  recommendedPractice: string[];
  status?: "evaluated" | "not_tested" | "provider_not_configured" | "pending" | "error";
};

type AssessmentResult = {
  overallScore: number;
  estimatedLevel: string;
  scoreBySkill?: Record<string, number>;
  scoreByLevel?: Record<string, number>;
  bridgeScore?: number | null;
  recommendedLevel?: string;
  weaknessTags: string[];
  strengthTags: string[];
  recommendedCurriculumFocus: string[];
  recommendedDailyPlan: string;
  aiFeedbackIndonesian: string;
  encouragementJapanese: string;
  pronunciation: PronunciationEvaluation | null;
  badge: {
    id: string;
    nameIndonesian: string;
    nameJapanese: string;
    archetype: string;
    levelRequirement: string;
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

const steps = [
  { key: "welcome", label: "Welcome" },
  { key: "kana", label: "Kana" },
  { key: "kanji", label: "Kanji" },
  { key: "grammar", label: "Grammar" },
  { key: "reading", label: "Reading" },
  { key: "listening", label: "Listening" },
  { key: "pronunciation", label: "Speaking" },
  { key: "loading", label: "Evaluasi" },
  { key: "result", label: "Hasil" },
];

export default function NihongoPreAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pronunciationPrompt, setPronunciationPrompt] = useState<PronunciationPrompt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pronunciation, setPronunciation] = useState<PronunciationEvaluation | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAssessment() {
      try {
        const response = await fetch("/api/apps/nihongo/pre-assessment/generate");
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Assessment belum bisa dimuat.");
        }

        setQuestions(payload.questions ?? []);
        setPronunciationPrompt(payload.pronunciationPrompt ?? null);
      } catch {
        setError("Assessment belum bisa dimuat. Coba refresh halaman ini.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAssessment();
  }, []);

  const groupedQuestions = useMemo(() => {
    return {
      kana: questions.filter((question) => question.category === "kana"),
      kanji: questions.filter((question) => question.category === "kanji"),
      grammar: questions.filter((question) => question.category === "particles" || question.category === "tense_forms"),
      reading: questions.filter((question) => question.category === "reading"),
      listening: questions.filter((question) => question.category === "listening"),
    };
  }, [questions]);

  const progress = Math.round(((currentStep + 1) / steps.length) * 100);

  function answerQuestion(questionId: string, answer: string) {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
  }

  function canContinue() {
    const key = steps[currentStep]?.key;
    if (key === "welcome" || key === "result") return true;
    if (key === "pronunciation") return Boolean(pronunciation);
    if (key === "loading") return false;

    const currentQuestions = groupedQuestions[key as keyof typeof groupedQuestions] ?? [];
    return currentQuestions.every((question) => answers[question.id]);
  }

  async function submitAssessment() {
    setIsSubmitting(true);
    setError(null);
    setCurrentStep(7);

    try {
      const response = await fetch("/api/apps/nihongo/pre-assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
          pronunciation,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Hasil belum bisa disimpan.");
      }

      setResult(payload.result);
      setCurrentStep(8);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Hasil belum bisa disimpan.");
      setCurrentStep(6);
    } finally {
      setIsSubmitting(false);
    }
  }

  function goNext() {
    if (currentStep === 6) {
      void submitAssessment();
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Nexus AI Nihongo</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950">Menyiapkan assessment...</h1>
          <p className="mt-2 text-sm text-slate-500">Sebentar, kami sedang menata soal terbaik untuk memetakan level awalmu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Pre-assessment</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Mulai dari jalur yang pas untukmu</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Jawabanmu akan dipakai untuk mempersonalisasi roadmap, lesson berikutnya, fokus harian, dan badge belajar.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
            <p className="text-xs font-medium text-slate-300">Progress</p>
            <p className="mt-1 text-3xl font-semibold">{progress}%</p>
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-9">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                index <= currentStep ? "bg-cyan-50 text-cyan-800" : "bg-slate-100 text-slate-500"
              }`}
            >
              {index + 1}. {step.label}
            </div>
          ))}
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        {currentStep === 0 ? (
          <WelcomeStep />
        ) : currentStep === 1 ? (
          <QuestionStep title="Kana Recognition" copy="Kita cek hiragana, katakana, dan romaji dasar." questions={groupedQuestions.kana} answers={answers} onAnswer={answerQuestion} />
        ) : currentStep === 2 ? (
          <QuestionStep title="Basic Kanji" copy="Kanji yang dipakai masih sekitar N5/N4 umum." questions={groupedQuestions.kanji} answers={answers} onAnswer={answerQuestion} />
        ) : currentStep === 3 ? (
          <QuestionStep title="Particles and Forms" copy="Bagian ini menguji partikel valid serta bentuk kata kerja dan kata sifat dasar." questions={groupedQuestions.grammar} answers={answers} onAnswer={answerQuestion} />
        ) : currentStep === 4 ? (
          <QuestionStep title="Reading Comprehension" copy="Baca teks pendek, lalu pilih jawaban yang paling tepat." questions={groupedQuestions.reading} answers={answers} onAnswer={answerQuestion} />
        ) : currentStep === 5 ? (
          <QuestionStep title="Listening Comprehension" copy="Audio disiapkan lewat audioUrl. Jika file belum tersedia, gunakan teks placeholder untuk MVP." questions={groupedQuestions.listening} answers={answers} onAnswer={answerQuestion} />
        ) : currentStep === 6 ? (
          <PronunciationStep prompt={pronunciationPrompt} evaluation={pronunciation} onEvaluation={setPronunciation} />
        ) : currentStep === 7 ? (
          <LoadingStep />
        ) : (
          <ResultStep result={result} />
        )}
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))}
          disabled={currentStep === 0 || currentStep >= 7}
          className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Kembali
        </button>

        {currentStep < 8 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!canContinue() || isSubmitting}
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {currentStep === 6 ? "Lihat Hasil Saya" : "Lanjut"}
          </button>
        ) : (
          <Link
            href="/apps/nihongo/dashboard"
            className="rounded-full bg-slate-950 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700"
          >
            Masuk Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Selamat datang</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Assessment singkat, jalur belajar lebih tajam.</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Kamu akan melewati kana, kanji dasar, grammar, reading, listening, dan pronunciation. Hasilnya tidak untuk menghakimi,
          tapi untuk memilih lesson awal, fokus latihan, dan badge motivasi yang cocok.
        </p>
      </div>
      <div className="rounded-2xl bg-cyan-50 p-5">
        <p className="text-sm font-semibold text-cyan-800">Yang akan kamu dapatkan</p>
        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
          <p>Level estimasi dari Absolute Beginner sampai N4 Candidate.</p>
          <p>Tag kekuatan dan kelemahan yang bisa langsung dilatih.</p>
          <p>Rekomendasi lesson, daily plan, dan badge original anime-inspired.</p>
        </div>
      </div>
    </div>
  );
}

function QuestionStep({
  title,
  copy,
  questions,
  answers,
  onAnswer,
}: {
  title: string;
  copy: string;
  questions: Question[];
  answers: Record<string, string>;
  onAnswer: (questionId: string, answer: string) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
      <div className="mt-6 space-y-5">
        {questions.map((question, index) => (
          <div key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Soal {index + 1}</p>
                <p className="mt-2 text-sm font-medium text-slate-700">{question.instructionIndonesian}</p>
              </div>
              <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                {question.level}
              </span>
            </div>

            {question.passage ? (
              <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-lg leading-8 text-slate-950">{question.passage.japanese}</p>
                {question.passage.kanaSupport ? <p className="mt-2 text-sm leading-6 text-slate-500">{question.passage.kanaSupport}</p> : null}
                {question.passage.indonesianHint ? <p className="mt-2 text-xs font-medium text-cyan-700">{question.passage.indonesianHint}</p> : null}
              </div>
            ) : question.type === "audio_multiple_choice" ? (
              <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-200">
                {question.audioUrl ? (
                  <audio controls src={question.audioUrl} className="w-full">
                    <track kind="captions" />
                  </audio>
                ) : null}
                <p className="mt-3 text-sm text-slate-500">{question.prompt}</p>
              </div>
            ) : (
              <p className="mt-4 rounded-xl bg-white p-4 text-3xl font-semibold text-slate-950 ring-1 ring-slate-200">{question.prompt}</p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {question.options.map((option) => {
                const selected = answers[question.id] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onAnswer(question.id, option)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      selected
                        ? "border-cyan-500 bg-cyan-50 text-cyan-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PronunciationStep({
  prompt,
  evaluation,
  onEvaluation,
}: {
  prompt: PronunciationPrompt | null;
  evaluation: PronunciationEvaluation | null;
  onEvaluation: (evaluation: PronunciationEvaluation) => void;
}) {
  if (!prompt) {
    return <p className="text-sm text-slate-600">Prompt pronunciation belum tersedia.</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Pronunciation Recording</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{prompt.instructionIndonesian}</p>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xl leading-9 text-slate-950">{prompt.prompt}</p>
          <p className="mt-3 text-sm leading-7 text-slate-500">{prompt.kanaSupport}</p>
        </div>
      </div>
      <div>
        <PronunciationRecorder expectedText={prompt.prompt} onEvaluation={onEvaluation} />
        {evaluation ? (
          <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
            Audio diterima. {formatPronunciationStatus(evaluation)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LoadingStep() {
  return (
    <div className="py-12 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">AI evaluation</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-950">Menganalisis jawabanmu...</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
        Sistem menghitung skor deterministik dulu, lalu menyusun feedback dan rekomendasi belajar yang aman untuk levelmu.
      </p>
    </div>
  );
}

function ResultStep({ result }: { result: AssessmentResult | null }) {
  if (!result) {
    return <p className="text-sm text-slate-600">Hasil belum tersedia.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl bg-slate-950 p-6 text-white">
          <p className="text-sm font-medium text-slate-300">Overall score</p>
          <p className="mt-3 text-6xl font-semibold">{result.overallScore}</p>
          <p className="mt-3 text-lg font-semibold text-cyan-200">{result.estimatedLevel}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Feedback</p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{result.aiFeedbackIndonesian}</p>
          <p className="mt-3 text-base font-semibold text-slate-950">{result.encouragementJapanese}</p>
        </div>
      </div>

      {result.badge ? (
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-800">Badge baru</p>
          <div className="mt-3 flex items-center gap-4">
            {result.badge.imageUrl || result.badge.iconUrl ? (
              <img
                src={result.badge.imageUrl ?? result.badge.iconUrl ?? ""}
                alt={result.badge.nameIndonesian}
                className="h-16 w-16 rounded-2xl object-cover ring-1 ring-cyan-200"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-600 text-xl font-semibold text-white">
                {result.badge.nameIndonesian.slice(0, 1)}
              </div>
            )}
            <div>
              <h2 className="text-3xl font-semibold text-slate-950">{result.badge.nameIndonesian}</h2>
              <p className="mt-1 text-xl text-slate-700">{result.badge.nameJapanese}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">{result.badge.motivationalMessage}</p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <ResultTagCard label="Kekuatan" tags={result.strengthTags} />
        <ResultTagCard label="Fokus latihan" tags={result.weaknessTags} />
        <ResultTagCard label="Urutan materi" tags={result.recommendedCurriculumFocus} />
      </div>

      {result.scoreBySkill ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Placement detail</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries(result.scoreBySkill).map(([skill, score]) => (
              <div key={skill} className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <span className="font-semibold text-slate-800">{skill}</span>
                <span className="float-right text-slate-600">{score}/100</span>
              </div>
            ))}
          </div>
          {typeof result.bridgeScore === "number" ? (
            <p className="mt-4 text-sm font-semibold text-cyan-800">N4 bridge score: {result.bridgeScore}/100</p>
          ) : null}
          {result.recommendedLevel ? (
            <p className="mt-2 text-sm text-slate-600">Recommended placement: {result.recommendedLevel}</p>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Daily plan</p>
        <p className="mt-3 text-sm leading-7 text-slate-700">{result.recommendedDailyPlan}</p>
        {result.nextLesson ? (
          <p className="mt-3 text-sm text-slate-500">
            Lesson berikutnya: <span className="font-semibold text-slate-800">{result.nextLesson.title}</span>
          </p>
        ) : null}
      </div>

      {result.pronunciation ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Pronunciation</p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{formatPronunciationStatus(result.pronunciation)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{result.pronunciation.feedbackIndonesian}</p>
        </div>
      ) : null}
    </div>
  );
}

function formatPronunciationStatus(evaluation: PronunciationEvaluation) {
  if (typeof evaluation.pronunciationScore === "number") {
    return `Pronunciation score: ${evaluation.pronunciationScore}/100.`;
  }

  if (evaluation.status === "provider_not_configured") {
    return "Pronunciation scoring provider not configured.";
  }

  return "Pronunciation not tested yet.";
}

function ResultTagCard({ label, tags }: { label: string; tags: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(tags.length > 0 ? tags : ["balanced"]).map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
