"use client";

import { useEffect, useMemo, useState } from "react";
import { UserBadgeHeader } from "@/components/nihongo/UserBadgeHeader";
import { clientTrack } from "@/lib/analytics/clientTrack";

type QuizQuestion = {
  id: string;
  prompt: string;
  deck: string;
  level: string;
  category: string;
  answer: string;
  example: string | null;
  options: string[];
};

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [wrongAnswers, setWrongAnswers] = useState<
    Array<{ topic: string; category: string; questionType: string }>
  >([]);

  const current = questions[index];
  const finished = questions.length > 0 && index >= questions.length;

  const loadQuiz = async () => {
    const params = new URLSearchParams({ count: "10" });
    if (level) params.set("level", level);
    if (category) params.set("category", category);

    const res = await fetch(`/api/apps/nihongo/quiz?${params}`);
    const data = await res.json();
    if (res.ok) {
      setQuestions(data.questions ?? []);
      setIndex(0);
      setScore(0);
      setSelected("");
      setAnswered(false);
      setWrongAnswers([]);
      clientTrack({
        eventType: "QUIZ_STARTED",
        pagePath: "/apps/nihongo/quiz",
        metadata: { level: level || null, category: category || null },
      });
    }
  };

  useEffect(() => {
    clientTrack({
      eventType: "PAGE_VIEW",
      pagePath: "/apps/nihongo/quiz",
    });

    async function loadInitialQuiz() {
      const res = await fetch("/api/apps/nihongo/quiz?count=10");
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions ?? []);
        setIndex(0);
        setScore(0);
        setSelected("");
        setAnswered(false);
        setWrongAnswers([]);
        clientTrack({
          eventType: "QUIZ_STARTED",
          pagePath: "/apps/nihongo/quiz",
          metadata: { level: null, category: null },
        });
      }
    }

    loadInitialQuiz();
  }, []);

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round((Math.min(index, questions.length) / questions.length) * 100);
  }, [index, questions.length]);

  const submitAnswer = (option: string) => {
    if (!current || answered) return;
    setSelected(option);
    setAnswered(true);
    if (option === current.answer) {
      setScore((value) => value + 1);
      awardClientReward("QUIZ_CORRECT");
    }
    if (option !== current.answer) {
      setWrongAnswers((currentWrongAnswers) => [
        ...currentWrongAnswers,
        {
          topic: current.deck,
          category: current.category,
          questionType: "flashcard_multiple_choice",
        },
      ]);
    }
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      clientTrack({
        eventType: "QUIZ_COMPLETED",
        pagePath: "/apps/nihongo/quiz",
        metadata: {
          score,
          total: questions.length,
          level: level || null,
          category: category || null,
          wrongAnswers,
        },
      });
    }

    setIndex((value) => value + 1);
    setSelected("");
    setAnswered(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <UserBadgeHeader />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
          Quiz Mode
        </p>
        <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
              Test your recall
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Quiz otomatis dari flashcards seed: kana, vocabulary, kanji, grammar, dan conversation.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              className="h-11 rounded-full border border-slate-300 px-4 text-sm font-medium outline-none focus:border-cyan-500"
            >
              <option value="">All levels</option>
              <option value="Beginner">Beginner</option>
              <option value="N5">N5</option>
              <option value="N4">N4</option>
              <option value="N3">N3</option>
              <option value="A2">A2</option>
            </select>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-11 rounded-full border border-slate-300 px-4 text-sm font-medium outline-none focus:border-cyan-500"
            >
              <option value="">All categories</option>
              <option value="kana">Kana</option>
              <option value="vocabulary">Vocabulary</option>
              <option value="kanji">Kanji</option>
              <option value="grammar">Grammar</option>
              <option value="conversation">Conversation</option>
            </select>
            <button
              type="button"
              onClick={loadQuiz}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              New quiz
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-slate-500">
            Score {score} / {questions.length}
          </div>
          <div className="h-2 w-44 rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-cyan-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {finished ? (
          <div className="py-14 text-center">
            <p className="text-5xl font-semibold text-slate-950">
              {score}/{questions.length}
            </p>
            <p className="mt-4 text-slate-600">Quiz selesai. Ambil batch baru buat drill lagi.</p>
            <button
              type="button"
              onClick={loadQuiz}
              className="mt-8 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Restart quiz
            </button>
          </div>
        ) : current ? (
          <div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">{current.level}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{current.category}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{current.deck}</span>
            </div>

            <h2 className="mt-8 text-5xl font-semibold tracking-tight text-slate-950">
              {current.prompt}
            </h2>

            <div className="mt-8 grid gap-3">
              {current.options.map((option) => {
                const isCorrect = option === current.answer;
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
                          : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-700">
                <p className="font-semibold">
                  {selected === current.answer ? "Correct." : `Answer: ${current.answer}`}
                </p>
                {current.example && <p className="mt-2">{current.example}</p>}
                <button
                  type="button"
                  onClick={next}
                  className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
                >
                  Next question
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-500">No quiz questions found. Seed flashcards first.</p>
        )}
      </section>
    </div>
  );
}

async function awardClientReward(source: "QUIZ_CORRECT") {
  try {
    await fetch("/api/apps/nihongo/game/reward", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source }),
    });
  } catch {
    // Reward failures should never interrupt learning flow.
  }
}
