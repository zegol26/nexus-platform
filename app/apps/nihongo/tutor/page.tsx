"use client";

import { useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const quickPrompts = [
  "Ajarkan pola は dan が dengan contoh sederhana.",
  "Buat latihan N5 tentang kata kerja ます.",
  "Jelaskan perbedaan あります dan います.",
  "Bantu saya latihan percakapan kerja di Jepang.",
];

export default function TutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Halo, gue Nexus AI Nihongo Tutor. Tulis pertanyaan Jepang lo, nanti gue jawab pakai penjelasan Indonesia, romaji, dan contoh kalimat.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message = input) => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/apps/nihongo/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmed }),
    });

    const data = await res.json();
    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: res.ok ? data.reply : data.error || "Tutor failed.",
      },
    ]);
    setLoading(false);
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_360px]">
      <section className="flex min-h-[720px] flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
            AI Tutor
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Ask, drill, and practice Japanese
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Tutor ini fokus ke pelajar Indonesia: JLPT, JFT, grammar, kana, kanji, dan conversation kerja.
          </p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-5 py-4 text-sm leading-7 ${
                  message.role === "user"
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-800"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-5 py-4 text-sm font-medium text-cyan-800">
              Tutor lagi nyusun jawaban...
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 p-4 sm:p-5">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              className="min-h-14 flex-1 resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              placeholder="Tanya grammar, minta latihan, atau simulasi percakapan..."
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={loading}
              className="self-end rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:bg-slate-400"
            >
              Send
            </button>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Quick prompts</h2>
          <div className="mt-4 space-y-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
