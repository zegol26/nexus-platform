"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAiChanReminders } from "@/hooks/useAiChanReminders";

const STORAGE_KEY = "nexus-ai-chan-minimized";

export function AiChanWidget() {
  const {
    activeReminder,
    activeIndex,
    reminders,
    isLoading,
    error,
    hasHighPriorityReminder,
    nextReminder,
  } = useAiChanReminders();
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsMinimized(window.localStorage.getItem(STORAGE_KEY) === "true");
      setHasHydrated(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  function toggleMinimized() {
    setIsMinimized((currentValue) => {
      const nextValue = !currentValue;
      window.localStorage.setItem(STORAGE_KEY, String(nextValue));
      return nextValue;
    });
  }

  if (!hasHydrated || (!isLoading && !activeReminder && !error)) {
    return null;
  }

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={toggleMinimized}
        className="ai-chan-enter ai-chan-bounce fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/80 bg-white/85 shadow-2xl shadow-pink-900/15 backdrop-blur-2xl transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-pink-200 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
        aria-label="Buka Ai-chan"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {hasHighPriorityReminder && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-rose-500 ai-chan-pulse sm:h-4 sm:w-4" />
        )}
        <Image
          src="/Ai-chan.png"
          alt="Ai-chan"
          width={56}
          height={56}
          className="h-12 w-12 rounded-full object-cover sm:h-14 sm:w-14"
          priority={false}
        />
      </button>
    );
  }

  const title = activeReminder?.title ?? "Ai-chan sedang bersiap";
  const message =
    activeReminder?.message ??
    "Sebentar ya, Ai-chan sedang memeriksa pengingat terbaik untukmu.";
  const totalReminders = reminders.length;

  return (
    <aside
      className="ai-chan-enter fixed bottom-4 right-4 z-50 w-[min(calc(100vw-1.5rem),20rem)] sm:bottom-6 sm:right-6 sm:w-[360px]"
      aria-label="Ai-chan assistant"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="relative overflow-visible rounded-2xl border border-white/75 bg-white/82 p-3 shadow-2xl shadow-pink-950/12 backdrop-blur-2xl sm:rounded-[1.5rem] sm:p-4">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(244,114,182,0.18),rgba(34,211,238,0.14),rgba(255,255,255,0.48))] sm:rounded-[1.5rem]" />
        <div className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 border-b border-r border-white/75 bg-white/82 backdrop-blur-2xl sm:right-12 sm:h-5 sm:w-5" />

        {hasHighPriorityReminder && (
          <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-rose-500 ai-chan-pulse sm:h-4 sm:w-4" />
        )}

        <div className="relative flex gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={toggleMinimized}
            className="ai-chan-bounce flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white/80 shadow-lg shadow-pink-950/10 transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-pink-200 sm:h-16 sm:w-16 sm:rounded-2xl"
            aria-label="Sembunyikan Ai-chan"
          >
            <Image
              src="/Ai-chan.png"
              alt="Ai-chan"
              width={64}
              height={64}
              className="h-10 w-10 rounded-lg object-cover sm:h-14 sm:w-14 sm:rounded-2xl"
              priority={false}
            />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-pink-600 sm:text-xs">
                  Ai-chan
                </p>
                <h2 className="mt-0.5 text-sm font-semibold leading-tight text-slate-950 sm:mt-1 sm:text-base sm:leading-5">
                  {title}
                </h2>
              </div>

              <button
                type="button"
                onClick={toggleMinimized}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-pink-200 sm:h-8 sm:w-8"
                aria-label="Minimalkan Ai-chan"
              >
                -
              </button>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-700 sm:mt-3 sm:text-sm sm:leading-6">
              {error ?? message}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:mt-4 sm:gap-2">
              {activeReminder?.cta && !error && (
                <Link
                  href={activeReminder.cta.href}
                  className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-pink-600 focus:outline-none focus:ring-4 focus:ring-pink-200 sm:px-4 sm:py-2 sm:text-sm"
                >
                  {activeReminder.cta.label}
                </Link>
              )}

              {totalReminders > 1 && (
                <button
                  type="button"
                  onClick={nextReminder}
                  className="rounded-full border border-slate-200 bg-white/75 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-pink-200 sm:px-4 sm:py-2 sm:text-sm"
                >
                  Pengingat {activeIndex + 1}/{totalReminders}
                </button>
              )}

              {isLoading && (
                <span className="text-[10px] font-medium text-slate-500 sm:text-xs">
                  Memuat pengingat...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
