"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SHAPES = ["○", "△", "□"] as const;

const nihongoMenu = [
  { label: "Dashboard", href: "/apps/nihongo/dashboard" },
  { label: "Pre-assessment", href: "/apps/nihongo/pre-assessment" },
  { label: "Curriculum", href: "/apps/nihongo/curriculum" },
  { label: "Flashcards", href: "/apps/nihongo/flashcards" },
  { label: "AI Tutor", href: "/apps/nihongo/tutor" },
  { label: "Quiz", href: "/apps/nihongo/quiz" },
  { label: "Rehearsal Lengkap N5", href: "/apps/nihongo/full-rehearsal-n5" },
  { label: "Game", href: "/apps/nihongo/game" },
  { label: "Reading", href: "/apps/nihongo/reading" },
  { label: "Listening", href: "/apps/nihongo/listening" },
  { label: "JLPT N5 Mock", href: "/apps/nihongo/mock-test/n5" },
];

export function NihongoSidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={`relative min-h-screen w-56 shrink-0 overflow-hidden border-r border-[#ED1A7F]/30 bg-[#0a0a0a] px-3 py-5 ${
        mobile ? "block" : "hidden lg:block"
      }`}
    >
      {/* faint decorative watermark shapes */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 select-none text-[140px] font-bold leading-none text-[#ED1A7F]/[0.06]"
      >
        ○
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -left-4 select-none text-[160px] font-bold leading-none text-[#00B894]/[0.05]"
      >
        △
      </div>

      <Link
        href="/platform/dashboard"
        className="relative text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ED1A7F]"
      >
        Nexus Platform
      </Link>

      <div className="relative mt-4 flex items-center gap-2.5 rounded-lg border border-[#ED1A7F]/25 bg-[#141416] p-2.5">
        <div className="relative shrink-0">
          <span
            aria-hidden
            className="absolute -inset-2.5 rounded-full bg-[#ED1A7F]/30 blur-xl"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Nexustalenta.svg"
            alt="Nexus Talenta"
            width={72}
            height={72}
            className="relative h-[72px] w-[72px] object-contain drop-shadow-[0_6px_14px_rgba(237,26,127,0.45)]"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#ED1A7F]">
            AI Language Lab
          </p>
          <h2 className="mt-0.5 text-sm font-bold leading-tight tracking-tight text-white">
            Nexus AI <span className="text-[#ED1A7F]">Nihongo</span>
          </h2>
        </div>
      </div>

      <div className="relative mt-5 mb-2 flex items-center gap-2 px-1">
        <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/40">
          Modul
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-[#ED1A7F]/50 to-transparent" />
      </div>

      <nav className="relative space-y-0.5">
        {nihongoMenu.map((item, idx) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          const shape = SHAPES[idx % SHAPES.length];

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-semibold tracking-wide transition ${
                isActive
                  ? "bg-[#ED1A7F] text-white shadow-[0_0_18px_rgba(237,26,127,0.4)]"
                  : "text-white/75 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <span
                className={`flex h-6 w-7 shrink-0 items-center justify-center rounded-sm text-[11px] font-bold transition ${
                  isActive
                    ? "bg-black/30 text-white"
                    : "border border-white/15 text-[#ED1A7F] group-hover:border-[#ED1A7F]/60 group-hover:text-[#ED1A7F]"
                }`}
              >
                {shape}
              </span>
              <span className="flex-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-5 mb-2 h-px bg-gradient-to-r from-transparent via-[#00B894]/30 to-transparent" />

      <p className="relative px-2 text-[9px] font-medium uppercase tracking-[0.28em] text-white/30">
        © Nexus AI Nihongo
      </p>
    </aside>
  );
}
