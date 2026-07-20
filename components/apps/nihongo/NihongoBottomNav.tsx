"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpenText,
  Gamepad2,
  GraduationCap,
  Headphones,
  Home,
  LayoutGrid,
  MessageCircleQuestion,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";

/**
 * Bottom tab navigation for the Nexus AI Nihongo app shell.
 * Replaces the old fixed 224px sidebar with a single, simplified bar
 * pinned to the bottom of the viewport on every breakpoint so the
 * learning surface above it stays full-screen and distraction-free.
 *
 * Four direct tabs cover the primary "story path" loop (Home -> Latihan
 * -> Progress) plus a "Lainnya" sheet that groups every secondary
 * surface (flashcards, tutor, reading, listening, game, rehearsal,
 * mock tests) instead of listing 13 flat items like the old sidebar.
 */

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: typeof Home;
  matchPrefixes: string[];
};

const primaryTabs: NavItem[] = [
  {
    key: "home",
    label: "Home",
    href: "/apps/nihongo/dashboard",
    icon: Home,
    matchPrefixes: ["/apps/nihongo/dashboard"],
  },
  {
    key: "latihan",
    label: "Latihan",
    href: "/apps/nihongo/curriculum",
    icon: BookOpenText,
    matchPrefixes: ["/apps/nihongo/curriculum"],
  },
  {
    key: "progress",
    label: "Progress",
    href: "/apps/nihongo/badges",
    icon: Trophy,
    matchPrefixes: ["/apps/nihongo/badges", "/apps/nihongo/mock-test"],
  },
];

type MoreLink = {
  label: string;
  href: string;
  icon: typeof Home;
  locked?: boolean;
};

const moreLinks: MoreLink[] = [
  { label: "Flashcards", href: "/apps/nihongo/flashcards", icon: LayoutGrid },
  { label: "Quiz", href: "/apps/nihongo/quiz", icon: MessageCircleQuestion },
  { label: "AI Tutor", href: "/apps/nihongo/tutor", icon: Sparkles },
  { label: "Reading", href: "/apps/nihongo/reading", icon: BookOpenText },
  { label: "Listening", href: "/apps/nihongo/listening", icon: Headphones },
  { label: "Nexus Kingdoms", href: "/apps/nihongo/game", icon: Gamepad2 },
  { label: "Pre-Assessment", href: "/apps/nihongo/pre-assessment", icon: GraduationCap },
  { label: "Rehearsal N5", href: "/apps/nihongo/full-rehearsal-n5", icon: BookOpenText },
  { label: "Rehearsal N4", href: "/apps/nihongo/full-rehearsal-n4", icon: BookOpenText },
  { label: "Mock Test N5", href: "/apps/nihongo/mock-test/n5", icon: Trophy },
  { label: "Mock Test N4", href: "/apps/nihongo/mock-test/n4", icon: Trophy },
];

const trialUnlockedHrefs = new Set([
  "/apps/nihongo/pre-assessment",
  "/apps/nihongo/flashcards",
  "/apps/nihongo/quiz",
]);

export function NihongoBottomNav({ trialMode = false }: { trialMode?: boolean }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [moreOpen]);

  const isMoreActive = moreLinks.some(
    (item) => pathname === item.href || pathname?.startsWith(item.href + "/")
  );

  return (
    <>
      {moreOpen ? (
        <div className="fixed inset-0 z-40" role="dialog" aria-label="Menu lainnya">
          <button
            type="button"
            aria-label="Tutup menu"
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto rounded-t-3xl border-t border-slate-200 bg-white pb-[calc(env(safe-area-inset-bottom)+84px)] shadow-2xl shadow-slate-950/25">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Lainnya
              </p>
              <button
                type="button"
                aria-label="Tutup"
                onClick={() => setMoreOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
              {moreLinks.map((item) => {
                const isLocked = trialMode && !trialUnlockedHrefs.has(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={isLocked ? "/checkout" : item.href}
                    className="flex min-w-0 flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 transition hover:border-cyan-300 hover:bg-cyan-50"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 truncate">{item.label}</span>
                    {isLocked ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700 ring-1 ring-amber-100">
                        Lock
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <nav
        aria-label="Navigasi Nihongo"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-lg"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-xl items-stretch justify-between px-2">
          {primaryTabs.map((item) => {
            const isActive = item.matchPrefixes.some(
              (prefix) => pathname === prefix || pathname?.startsWith(prefix + "/")
            );
            const isLocked = trialMode && !trialUnlockedHrefs.has(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={isLocked ? "/checkout" : item.href}
                aria-current={isActive ? "page" : undefined}
                className="flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-semibold"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                    isActive ? "bg-cyan-600 text-white shadow-sm" : "text-slate-500"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <span className={isActive ? "text-cyan-700" : "text-slate-500"}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen((prev) => !prev)}
            aria-expanded={moreOpen}
            aria-label="Menu lainnya"
            className="flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-semibold"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                moreOpen || isMoreActive ? "bg-cyan-600 text-white shadow-sm" : "text-slate-500"
              }`}
            >
              <LayoutGrid className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className={moreOpen || isMoreActive ? "text-cyan-700" : "text-slate-500"}>
              Lainnya
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
