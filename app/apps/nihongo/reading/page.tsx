"use client";

import { useState } from "react";

type ReadingPractice = {
  title: string;
  passage: string;
  vocabulary: unknown[];
  questions: unknown[];
  answerKey: unknown[];
  note?: string;
};

function displayItem(item: unknown) {
  if (typeof item === "string") return item;
  if (typeof item === "number") return String(item);
  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;
    const word = record.word ?? record.term ?? record.japanese ?? record.vocab;
    const reading = record.reading ?? record.romaji ?? record.kana;
    const meaning = record.meaning ?? record.translation ?? record.indonesian ?? record.arti;

    return [word, reading, meaning]
      .filter(Boolean)
      .map(String)
      .join(" = ");
  }

  return "";
}

export default function ReadingPage() {
  const [level, setLevel] = useState("N5");
  const [topic, setTopic] = useState("daily life");
  const [practice, setPractice] = useState<ReadingPractice | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  const generate = async () => {
    setLoading(true);
    setShowAnswers(false);
    const res = await fetch("/api/apps/nihongo/reading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, topic }),
    });
    const data = await res.json();
    if (res.ok) setPractice(data);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
          Reading Practice
        </p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
              Read Japanese with guided questions
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Generate short passages by level and topic, then review vocabulary and comprehension answers.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[120px_1fr_auto]">
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              className="h-11 rounded-full border border-slate-300 px-4 text-sm font-medium outline-none focus:border-cyan-500"
            >
              <option value="N5">N5</option>
              <option value="N4">N4</option>
              <option value="N3">N3</option>
            </select>
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="h-11 rounded-full border border-slate-300 px-4 text-sm font-medium outline-none focus:border-cyan-500"
              placeholder="topic"
            />
            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:bg-slate-400"
            >
              {loading ? "Loading..." : "Generate"}
            </button>
          </div>
        </div>
      </section>

      {practice ? (
        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold text-slate-950">{practice.title}</h2>
            <p className="mt-6 whitespace-pre-wrap text-2xl leading-10 text-slate-950">
              {practice.passage}
            </p>
            {practice.note && (
              <p className="mt-6 rounded-2xl bg-cyan-50 p-4 text-sm leading-6 text-cyan-800">
                {practice.note}
              </p>
            )}
          </article>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-950">Vocabulary</h3>
              <div className="mt-4 space-y-2">
                {practice.vocabulary.map((item, index) => (
                  <p key={`vocab-${index}`} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {displayItem(item)}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-950">Questions</h3>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-700">
                {practice.questions.map((item, index) => (
                  <li key={`question-${index}`}>{displayItem(item)}</li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => setShowAnswers((value) => !value)}
                className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                {showAnswers ? "Hide answers" : "Show answers"}
              </button>
              {showAnswers && (
                <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-emerald-700">
                  {practice.answerKey.map((item, index) => (
                    <li key={`answer-${index}`}>{displayItem(item)}</li>
                  ))}
                </ol>
              )}
            </div>
          </aside>
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-500">
          Pick a level and generate your first reading practice.
        </section>
      )}
    </div>
  );
}
