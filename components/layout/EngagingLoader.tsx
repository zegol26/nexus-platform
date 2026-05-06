"use client";

import { useEffect, useState } from "react";

const defaultMessages = [
  "Lagi nyiapin pelajaran kamu...",
  "Aichan lagi mikir keras 🤔",
  "Menyusun urutan latihan supaya pas di otak kamu...",
  "Sebentar ya, AI lagi mengetik dengan jari kecilnya...",
  "Mengasah pena untuk catatan terbaikmu...",
  "Mencari pelajaran yang paling cocok buat hari ini...",
];

type LoaderTheme = "claude" | "squid";

const themePalette: Record<
  LoaderTheme,
  {
    bg: string;
    accent: string;
    accentSoft: string;
    accentInk: string;
    title: string;
    body: string;
    glyph: string;
    serif?: string;
  }
> = {
  claude: {
    bg: "transparent",
    accent: "#cc785c",
    accentSoft: "rgba(204, 120, 92, 0.3)",
    accentInk: "#ffffff",
    title: "#141413",
    body: "#6c6a64",
    glyph: "愛",
  },
  squid: {
    bg: "transparent",
    accent: "#ED1A7F",
    accentSoft: "rgba(237, 26, 127, 0.35)",
    accentInk: "#ffffff",
    title: "#ffffff",
    body: "rgba(255,255,255,0.65)",
    glyph: "○",
  },
};

export function EngagingLoader({
  messages = defaultMessages,
  title = "Sebentar ya",
  intervalMs = 1800,
  fullScreen = false,
  theme = "claude",
}: {
  messages?: string[];
  title?: string;
  intervalMs?: number;
  fullScreen?: boolean;
  theme?: LoaderTheme;
}) {
  const [index, setIndex] = useState(0);
  const palette = themePalette[theme];

  useEffect(() => {
    if (messages.length <= 1) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [messages, intervalMs]);

  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-5 ${
        fullScreen ? "min-h-[60vh]" : "py-12"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span
          className="absolute inset-0 animate-ping rounded-full"
          style={{ backgroundColor: palette.accentSoft }}
        />
        <span
          className="absolute inset-2 rounded-full"
          style={{ backgroundColor: palette.accent, opacity: 0.6 }}
        />
        <span
          className="relative flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold"
          style={{
            backgroundColor: palette.accent,
            color: palette.accentInk,
            fontFamily: palette.serif,
          }}
        >
          {palette.glyph}
        </span>
      </div>

      <div className="flex flex-col items-center gap-1.5 text-center">
        <p
          className="text-xl tracking-wide"
          style={{
            color: palette.title,
            fontFamily: palette.serif ?? undefined,
          }}
        >
          {title}
        </p>
        <p
          key={index}
          className="max-w-md text-[13px] tracking-wide transition-opacity duration-500 ease-out"
          style={{ color: palette.body }}
        >
          {messages[index]}
        </p>
      </div>

      <div className="flex gap-1.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-1.5 w-1.5 animate-bounce rounded-full"
            style={{
              backgroundColor: palette.accent,
              animationDelay: `${delay}ms`,
            }}
          />
        ))}
      </div>

      {theme === "squid" && (
        <div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.32em]">
          <span style={{ color: palette.accent }}>○</span>
          <span style={{ color: "#00B894" }}>△</span>
          <span style={{ color: "white", opacity: 0.7 }}>□</span>
        </div>
      )}
    </div>
  );
}
