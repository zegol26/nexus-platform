"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUiText, type UiTextKey } from "@/components/i18n/dictionary";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const arabicMenu = [
  { labelKey: "nav.dashboard", href: "/apps/arabic/dashboard", marker: "01" },
  { labelKey: "arabic.curriculum", href: "/apps/arabic/curriculum", marker: "02" },
  { labelKey: "arabic.aiTutor", href: "/apps/arabic/tutor", marker: "03" },
  { labelKey: "arabic.conversation", href: "/apps/arabic/conversation", marker: "04" },
  { labelKey: "arabic.quiz", href: "/apps/arabic/quiz", marker: "05" },
  { labelKey: "arabic.progress", href: "/apps/arabic/progress", marker: "06" },
] satisfies Array<{ labelKey: UiTextKey; href: string; marker: string }>;

export function ArabicSidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const { language } = useLanguage();

  return (
    <aside
      className={`relative min-h-screen w-56 shrink-0 overflow-hidden border-r border-emerald-100 bg-white px-3 py-5 ${
        mobile ? "block" : "hidden lg:block"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 select-none text-[140px] font-bold leading-none text-emerald-700/[0.06]"
      >
        *
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -left-4 select-none text-[160px] font-bold leading-none text-emerald-200/[0.5]"
      >
        *
      </div>

      <Link
        href="/platform/dashboard"
        className="relative inline-flex items-center text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-700"
      >
        <span aria-hidden className="mr-1 inline-block w-3">
          *
        </span>
        <span>Nexus Platform</span>
      </Link>

      <div className="relative mt-3 flex items-center gap-2.5 rounded-lg border border-emerald-100 bg-emerald-50/60 p-2.5">
        <div className="relative shrink-0">
          <span
            aria-hidden
            className="absolute -inset-2.5 rounded-full bg-emerald-400/20 blur-xl"
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
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
            AI Language Lab
          </p>
          <h2 className="mt-0.5 text-sm font-bold leading-tight tracking-tight text-slate-950">
            Nexus AI <span className="text-emerald-700">Arabic</span>
          </h2>
        </div>
      </div>

      <div className="relative mt-4 mb-2 flex items-center gap-2 px-1">
        <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-400">
          {getUiText("nav.module", language)}
        </span>
        <span className="h-px flex-1 bg-emerald-100" />
      </div>

      <nav className="relative space-y-0.5">
        {arabicMenu.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-slate-950"
              }`}
            >
              <span
                className={`flex h-6 w-7 shrink-0 items-center justify-center rounded-sm text-[10px] font-bold transition ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100"
                }`}
              >
                {item.marker}
              </span>
              <span className="flex-1 truncate">
                {getUiText(item.labelKey, language)}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-5 mb-2 h-px bg-emerald-100" />

      <p className="relative px-2 text-[9px] font-medium uppercase tracking-[0.28em] text-slate-400">
        Nexus AI Arabic
      </p>
    </aside>
  );
}
