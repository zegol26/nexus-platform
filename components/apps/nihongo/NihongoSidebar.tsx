"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUiText, type UiTextKey } from "@/components/i18n/dictionary";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { SquidIcon } from "@/components/ui/SquidIcon";
import { useNihongoTheme } from "./NihongoThemeProvider";

const nihongoMenu = [
  { labelKey: "nav.dashboard", href: "/apps/nihongo/dashboard", marker: "01" },
  { labelKey: "nihongo.preAssessment", href: "/apps/nihongo/pre-assessment", marker: "02" },
  { labelKey: "nihongo.curriculum", href: "/apps/nihongo/curriculum", marker: "03" },
  { labelKey: "nihongo.flashcards", href: "/apps/nihongo/flashcards", marker: "04" },
  { labelKey: "nihongo.aiTutor", href: "/apps/nihongo/tutor", marker: "05" },
  { labelKey: "nihongo.quiz", href: "/apps/nihongo/quiz", marker: "06" },
  { labelKey: "nihongo.rehearsalN5", href: "/apps/nihongo/full-rehearsal-n5", marker: "07" },
  { labelKey: "nihongo.rehearsalN4", href: "/apps/nihongo/full-rehearsal-n4", marker: "08" },
  { labelKey: "nav.game", href: "/apps/nihongo/game", marker: "09" },
  { labelKey: "nihongo.reading", href: "/apps/nihongo/reading", marker: "10" },
  { labelKey: "nihongo.listening", href: "/apps/nihongo/listening", marker: "11" },
  { labelKey: "nihongo.mockN5", href: "/apps/nihongo/mock-test/n5", marker: "12" },
  { labelKey: "nihongo.mockN4", href: "/apps/nihongo/mock-test/n4", marker: "13" },
] satisfies Array<{ labelKey: UiTextKey; href: string; marker: string }>;

const squidShapes = ["circle", "triangle", "square"] as const;
const trialUnlockedHrefs = new Set([
  "/apps/nihongo/pre-assessment",
  "/apps/nihongo/flashcards",
  "/apps/nihongo/quiz",
]);

export function NihongoSidebar({ mobile = false, trialMode = false }: { mobile?: boolean; trialMode?: boolean }) {
  const pathname = usePathname();
  const { theme } = useNihongoTheme();
  const { language } = useLanguage();

  const isSquid = theme === "squid";
  const isRockstar = theme === "rockstar";
  const brandGlyph = isSquid ? "O" : isRockstar ? "*" : "";
  const topWatermark = isSquid ? "O" : isRockstar ? "*" : "";
  const bottomWatermark = isSquid ? "^" : isRockstar ? "*" : "";

  return (
    <aside
      className={`relative min-h-screen w-56 shrink-0 overflow-hidden border-r border-slate-200 bg-white px-3 py-5 ${
        mobile ? "block" : "hidden lg:block"
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute select-none leading-none ${
          isRockstar
            ? "-right-8 -top-10 text-[200px] font-black text-cyan-700/[0.05]"
            : "-right-6 -top-6 text-[140px] font-bold text-cyan-700/[0.06]"
        }`}
      >
        {topWatermark}
      </div>
      <div
        aria-hidden
        className={`pointer-events-none absolute select-none leading-none ${
          isRockstar
            ? "-bottom-12 -left-6 text-[180px] font-black text-slate-300/[0.03]"
            : "-bottom-10 -left-4 text-[160px] font-bold text-slate-300/[0.05]"
        }`}
      >
        {bottomWatermark}
      </div>

      <Link
        href={trialMode ? "/overview/nihongo" : "/platform/dashboard"}
        className="relative inline-flex items-center text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-700"
      >
        <span aria-hidden className="mr-1 inline-block w-3">
          {brandGlyph}
        </span>
        <span>Nexus Platform</span>
      </Link>

      <div className="relative mt-3 flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
        <div className="relative shrink-0">
          <span
            aria-hidden
            className="absolute -inset-2.5 rounded-full bg-cyan-500/20 blur-xl"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Nexustalenta.svg"
            alt="Nexus AI"
            width={56}
            height={56}
            className="relative h-14 w-14 object-contain"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
            Nihongo
          </p>
          <h2 className="mt-0.5 text-sm font-bold leading-tight tracking-tight text-slate-950">
            Nexus AI <span className="text-cyan-700">Nihongo</span>
          </h2>
        </div>
      </div>

      <div className="relative mt-4 mb-2 flex items-center gap-2 px-1">
        <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-400">
          Modul
        </span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <nav className="relative space-y-0.5">
        {nihongoMenu.map((item, idx) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          const isLocked = trialMode && !trialUnlockedHrefs.has(item.href);

          const squidShape = squidShapes[idx % squidShapes.length];
          const marker = isRockstar ? "*" : item.marker;

          return (
            <Link
              key={item.href}
              href={isLocked ? "/checkout" : item.href}
              aria-current={isActive ? "page" : undefined}
              aria-disabled={isLocked ? true : undefined}
              className={`group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-cyan-600 text-white shadow-sm"
                  : isLocked
                    ? "text-slate-400 hover:bg-amber-50 hover:text-slate-700"
                  : "text-slate-600 hover:bg-cyan-50 hover:text-slate-950"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold transition ${
                  isActive
                    ? "bg-white/20 text-white ring-1 ring-white/25"
                    : "bg-slate-100 text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-700"
                }`}
              >
                {isSquid ? (
                  <SquidIcon shape={squidShape} active={isActive} />
                ) : (
                  marker
                )}
              </span>
              <span className="flex-1 truncate">
                {getUiText(item.labelKey, language)}
              </span>
              {isLocked ? (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700 ring-1 ring-amber-100">
                  Lock
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-5 mb-2 h-px bg-slate-200" />

      <p className="relative px-2 text-[9px] font-medium uppercase tracking-[0.28em] text-slate-400">
        © Nexus AI Nihongo
      </p>
    </aside>
  );
}



