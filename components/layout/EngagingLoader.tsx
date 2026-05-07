"use client";

import { useEffect, useState } from "react";

const defaultMessages = [
  "Lagi nyiapin pelajaran kamu...",
  "Aichan lagi mikir keras...",
  "Menyusun urutan latihan supaya pas di otak kamu...",
  "Sebentar ya, AI lagi mengetik dengan jari kecilnya...",
  "Mengasah pena untuk catatan terbaikmu...",
  "Mencari pelajaran yang paling cocok buat hari ini...",
];

export function EngagingLoader({
  messages = defaultMessages,
  title = "Sebentar ya",
  intervalMs = 1800,
  fullScreen = false,
}: {
  messages?: string[];
  title?: string;
  intervalMs?: number;
  fullScreen?: boolean;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [messages, intervalMs]);

  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-4 ${
        fullScreen ? "min-h-[60vh]" : "py-12"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-cyan-500/30" />
        <span className="absolute inset-2 rounded-full bg-cyan-500/60" />
        <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-cyan-600 text-xs font-bold text-white">
          ✦
        </span>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-xl font-semibold text-slate-950">{title}</p>
        <p
          key={index}
          className="text-sm text-slate-600 transition-opacity duration-500 ease-out"
        >
          {messages[index]}
        </p>
      </div>

      <div className="flex gap-1">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-600"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
