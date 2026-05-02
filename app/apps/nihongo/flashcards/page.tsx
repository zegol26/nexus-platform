"use client";

import { useEffect, useMemo, useState } from "react";
import { UserBadgeHeader } from "@/components/nihongo/UserBadgeHeader";

type Flashcard = {
  id: string;
  category: string;
  deck: string;
  level: string;
  front: string;
  back: string;
  example: string | null;
};

type FlashcardPayload = {
  flashcards: Flashcard[];
  decks: string[];
  levels: string[];
  total: number;
};

export default function FlashcardsPage() {
  const [payload, setPayload] = useState<FlashcardPayload>({
    flashcards: [],
    decks: [],
    levels: [],
    total: 0,
  });
  const [deck, setDeck] = useState("");
  const [level, setLevel] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    async function loadFlashcards() {
      const params = new URLSearchParams({ limit: "120" });
      if (deck) params.set("deck", deck);
      if (level) params.set("level", level);

      const res = await fetch(`/api/apps/nihongo/flashcards?${params}`);
      const data = await res.json();

      if (res.ok) {
        setPayload(data);
        setActiveIndex(0);
        setFlipped(false);
      }
    }

    loadFlashcards();
  }, [deck, level]);

  const activeCard = payload.flashcards[activeIndex];
  const progress = useMemo(() => {
    if (!payload.flashcards.length) return 0;
    return Math.round(((activeIndex + 1) / payload.flashcards.length) * 100);
  }, [activeIndex, payload.flashcards.length]);

  const nextCard = () => {
    setActiveIndex((index) =>
      payload.flashcards.length ? (index + 1) % payload.flashcards.length : 0
    );
    setFlipped(false);
  };

  const previousCard = () => {
    setActiveIndex((index) =>
      payload.flashcards.length
        ? (index - 1 + payload.flashcards.length) % payload.flashcards.length
        : 0
    );
    setFlipped(false);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <UserBadgeHeader />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
          Flashcard Studio
        </p>
        <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
              Review Japanese with focused decks
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Filter by deck or level, flip the card, then move through the practice stack.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              className="h-11 rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-500"
            >
              <option value="">All levels</option>
              {payload.levels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={deck}
              onChange={(event) => setDeck(event.target.value)}
              className="h-11 rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-500"
            >
              <option value="">All decks</option>
              {payload.decks.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <button
          type="button"
          onClick={() => setFlipped((value) => !value)}
          className="min-h-[360px] rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:border-cyan-200 hover:shadow-md"
        >
          {activeCard ? (
            <div className="flex h-full flex-col justify-between">
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">
                  {activeCard.level}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  {activeCard.category}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  {activeCard.deck}
                </span>
              </div>

              <div className="py-12">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {flipped ? "Answer" : "Prompt"}
                </p>
                <div className="mt-5 text-5xl font-semibold tracking-tight text-slate-950">
                  {flipped ? activeCard.back : activeCard.front}
                </div>
                {flipped && activeCard.example && (
                  <p className="mt-8 max-w-2xl text-base leading-7 text-slate-600">
                    {activeCard.example}
                  </p>
                )}
              </div>

              <p className="text-sm font-medium text-slate-500">
                Click card to {flipped ? "hide answer" : "flip answer"}
              </p>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              No flashcards found.
            </div>
          )}
        </button>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm font-medium text-slate-300">Current stack</p>
            <p className="mt-3 text-4xl font-semibold">{payload.flashcards.length}</p>
            <p className="mt-2 text-sm text-slate-300">
              showing from {payload.total} matching cards
            </p>
            <div className="mt-5 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={previousCard}
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={nextCard}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Next
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
