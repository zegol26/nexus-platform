"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNihongoTheme } from "./NihongoThemeProvider";

const nihongoMenu = [
  { label: "Dashboard", href: "/apps/nihongo/dashboard", marker: "01" },
  { label: "Pre-assessment", href: "/apps/nihongo/pre-assessment", marker: "02" },
  { label: "Curriculum", href: "/apps/nihongo/curriculum", marker: "03" },
  { label: "Flashcards", href: "/apps/nihongo/flashcards", marker: "04" },
  { label: "AI Tutor", href: "/apps/nihongo/tutor", marker: "05" },
  { label: "Quiz", href: "/apps/nihongo/quiz", marker: "06" },
  { label: "Rehearsal Lengkap N5", href: "/apps/nihongo/full-rehearsal-n5", marker: "07" },
  { label: "Game", href: "/apps/nihongo/game", marker: "08" },
  { label: "Reading", href: "/apps/nihongo/reading", marker: "09" },
  { label: "Listening", href: "/apps/nihongo/listening", marker: "10" },
  { label: "JLPT N5 Mock", href: "/apps/nihongo/mock-test/n5", marker: "11" },
];

export function NihongoSidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const { theme } = useNihongoTheme();

  const isSquid = theme === "squid";
  const isRockstar = theme === "rockstar";

  return (
    <aside
      className={`relative min-h-screen w-56 shrink-0 overflow-hidden border-r border-slate-200 bg-white px-3 py-5 ${
        mobile ? "block" : "hidden lg:block"
      }`}
    >
      {/* Theme-specific decorative watermarks */}
      {isSquid && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 select-none text-[140px] font-bold leading-none text-cyan-700/[0.06]"
          >
            ○
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 -left-4 select-none text-[160px] font-bold leading-none text-slate-300/[0.05]"
          >
            △
          </div>
        </>
      )}
      {isRockstar && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-10 select-none text-[200px] font-black leading-none text-cyan-700/[0.05]"
          >
            ★
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -left-6 select-none text-[180px] font-black leading-none text-slate-300/[0.03]"
          >
            ★
          </div>
        </>
      )}

      <Link
        href="/platform/dashboard"
        className="relative text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-700"
      >
        {isSquid && <span className="mr-1">○</span>}
        {isRockstar && <span className="mr-1">★</span>}
        Nexus Platform
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
            alt="Nexus Talenta"
            width={56}
            height={56}
            className="relative h-14 w-14 object-contain"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
            AI Language Lab
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

          // Theme-specific marker glyph
          const marker = isSquid
            ? ["○", "△", "□"][idx % 3]
            : isRockstar
              ? "★"
              : item.marker;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-cyan-50 hover:text-slate-950"
              }`}
            >
              <span
                className={`flex h-6 w-7 shrink-0 items-center justify-center rounded-sm text-[10px] font-bold transition ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-700"
                }`}
              >
                {marker}
              </span>
              <span className="flex-1 truncate">{item.label}</span>
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
