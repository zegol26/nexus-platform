"use client";

import { useState } from "react";
import type { RehearsalSection } from "@/app/apps/nihongo/full-rehearsal-n5/n5RehearsalData";

const categoryLabels: Record<RehearsalSection["category"], string> = {
  grammar: "Tata Bahasa",
  vocabulary: "Kosakata",
  kanji: "Kanji",
  conversation: "Percakapan",
  exercise: "Latihan",
  review: "Review",
};

type RehearsalSectionCardProps = {
  section: RehearsalSection;
  reviewed: boolean;
  onToggleReviewed: (id: string) => void;
};

export function RehearsalSectionCard({
  section,
  reviewed,
  onToggleReviewed,
}: RehearsalSectionCardProps) {
  const [open, setOpen] = useState(section.order <= 3);
  const [visibleAnswers, setVisibleAnswers] = useState<Set<number>>(new Set());
  const [selectedChoices, setSelectedChoices] = useState<Record<number, string>>({});

  const toggleAnswer = (index: number) => {
    setVisibleAnswers((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full flex-col gap-4 p-5 text-left sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
              Section {String(section.order).padStart(2, "0")}
            </span>
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
              {categoryLabels[section.category]}
            </span>
            {reviewed ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Sudah direview
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 text-xl font-semibold text-slate-950">{section.title}</h2>
          {section.subtitle ? (
            <p className="mt-1 text-sm leading-6 text-slate-500">{section.subtitle}</p>
          ) : null}
        </div>
        <span className="text-sm font-semibold text-cyan-700">
          {open ? "Tutup materi" : "Buka materi"}
        </span>
      </button>

      {open ? (
        <div className="border-t border-slate-100 p-5">
          <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
            {section.explanation}
          </p>

          {section.patterns.length ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                Pola penting
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="border-t border-slate-200 bg-white text-xs uppercase tracking-[0.16em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Label</th>
                      <th className="px-4 py-3">Pola Jepang</th>
                      <th className="px-4 py-3">Romaji</th>
                      <th className="px-4 py-3">Makna</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {section.patterns.map((pattern) => (
                      <tr key={`${section.id}-${pattern.label}`}>
                        <td className="px-4 py-3 font-semibold text-slate-700">{pattern.label}</td>
                        <td className="px-4 py-3 text-lg font-semibold text-slate-950">{pattern.japanese}</td>
                        <td className="px-4 py-3 text-slate-500">{pattern.romaji ?? "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{pattern.meaningId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {section.examples.length ? (
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {section.examples.map((example, index) => (
                <div key={`${section.id}-example-${index}`} className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                  <p className="text-xl font-semibold leading-9 text-slate-950">{example.japanese}</p>
                  {example.hiragana ? <p className="mt-2 text-sm text-cyan-900">{example.hiragana}</p> : null}
                  {example.romaji ? <p className="mt-1 text-sm text-cyan-800">{example.romaji}</p> : null}
                  <p className="mt-3 text-sm leading-6 text-slate-600">{example.meaningId}</p>
                </div>
              ))}
            </div>
          ) : null}

          {section.exercises.length ? (
            <div className="mt-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Latihan cepat
              </h3>
              {section.exercises.map((exercise, index) => {
                const selected = selectedChoices[index];
                const answerVisible = visibleAnswers.has(index);
                const isCorrect = selected && selected === exercise.answer;

                return (
                  <div key={`${section.id}-exercise-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold leading-6 text-slate-800">{exercise.prompt}</p>

                    {exercise.type === "multiple_choice" && exercise.choices ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {exercise.choices.map((choice) => (
                          <button
                            key={choice}
                            type="button"
                            onClick={() =>
                              setSelectedChoices((current) => ({
                                ...current,
                                [index]: choice,
                              }))
                            }
                            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                              selected === choice
                                ? "border-cyan-400 bg-cyan-50 text-cyan-900"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-cyan-50"
                            }`}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {selected ? (
                      <p className={`mt-3 text-sm font-semibold ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                        {isCorrect
                          ? "Bagus, jawaban kamu benar."
                          : "Belum tepat. Coba cek kembali pola kalimatnya."}
                      </p>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => toggleAnswer(index)}
                      className="mt-3 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {answerVisible ? "Sembunyikan Jawaban" : "Lihat Jawaban"}
                    </button>

                    {answerVisible ? (
                      <div className="mt-3 rounded-xl bg-white p-3 text-sm leading-6 text-slate-700">
                        <p>
                          <span className="font-semibold text-slate-950">Jawaban: </span>
                          {exercise.answer ?? "Lihat pembahasan."}
                        </p>
                        {exercise.explanation ? <p className="mt-1">{exercise.explanation}</p> : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => onToggleReviewed(section.id)}
            className={`mt-5 rounded-full px-5 py-3 text-sm font-semibold transition ${
              reviewed
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "bg-slate-950 text-white hover:bg-cyan-700"
            }`}
          >
            {reviewed ? "Batalkan Review" : "Tandai Sudah Direview"}
          </button>
        </div>
      ) : null}
    </article>
  );
}
