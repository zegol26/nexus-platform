"use client";

import { Languages } from "lucide-react";
import { useLanguage, type UiLanguage } from "./LanguageProvider";

const OPTIONS: Array<{ value: UiLanguage; label: string }> = [
  { value: "id", label: "ID" },
  { value: "en", label: "EN" },
];

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, mounted } = useLanguage();

  return (
    <div
      role="radiogroup"
      aria-label="UI language"
      className="inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-white/80 p-1 text-slate-700 shadow-sm shadow-slate-950/[0.03]"
    >
      {!compact ? (
        <span
          aria-hidden
          className="grid h-7 w-7 place-items-center rounded-full text-slate-500"
        >
          <Languages size={15} />
        </span>
      ) : null}
      {OPTIONS.map((option) => {
        const active = mounted && language === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setLanguage(option.value)}
            className={`h-7 rounded-full px-2.5 text-[11px] font-bold tracking-[0.12em] transition ${
              active
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
