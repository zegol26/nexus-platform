"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <aside
      className={`min-h-screen w-56 shrink-0 border-r border-slate-200 bg-white/90 px-3 py-5 shadow-sm backdrop-blur ${
        mobile ? "block" : "hidden lg:block"
      }`}
    >
      <Link
        href="/platform/dashboard"
        className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400"
      >
        Nexus Platform
      </Link>

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-950 p-3 text-white">
        <div className="mb-2 flex items-center justify-center rounded-lg bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/nexus-ai-logo.png"
            alt="Nexus AI"
            className="h-12 w-auto object-contain"
          />
        </div>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-300">
          AI Language Lab
        </p>
        <h2 className="mt-1 text-base font-semibold tracking-tight">
          Nexus AI Nihongo
        </h2>
      </div>

      <nav className="mt-4 space-y-0.5">
        {nihongoMenu.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-cyan-100 text-cyan-900 shadow-sm"
                  : "text-slate-600 hover:bg-cyan-50 hover:text-slate-950"
              }`}
            >
              <span
                className={`flex h-6 w-7 items-center justify-center rounded-md text-[10px] font-bold transition ${
                  isActive
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-700"
                }`}
              >
                {item.marker}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
