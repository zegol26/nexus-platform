"use client";

import { SquidIcon } from "@/components/ui/SquidIcon";
import {
  useNihongoTheme,
  type NihongoTheme,
} from "./NihongoThemeProvider";

const THEME_OPTIONS: Array<{
  value: NihongoTheme;
  short: string;
  glyph: "nexus" | "squid" | "rockstar";
  title: string;
}> = [
  { value: "nexus", short: "NX", glyph: "nexus", title: "Nexus (default)" },
  { value: "squid", short: "SQ", glyph: "squid", title: "Squid Game" },
  { value: "rockstar", short: "RS", glyph: "rockstar", title: "Rockstar" },
];

export function NihongoThemeToggle() {
  const { theme, setTheme, mounted } = useNihongoTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center gap-0.5 rounded-md border border-current/20 bg-white/5 p-0.5"
    >
      {THEME_OPTIONS.map((option) => {
        const isActive = mounted && theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            title={option.title}
            onClick={() => setTheme(option.value)}
            className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
              isActive
                ? "bg-current/15 text-current shadow-sm"
                : "text-current/60 hover:text-current"
            }`}
          >
            <span
              aria-hidden
              className="grid h-4 w-4 place-items-center text-[12px]"
            >
              {option.glyph === "squid" ? (
                <SquidIcon shape="circle" active={isActive} />
              ) : option.glyph === "rockstar" ? (
                "*"
              ) : (
                "N"
              )}
            </span>
            <span className="hidden sm:inline">{option.short}</span>
          </button>
        );
      })}
    </div>
  );
}
