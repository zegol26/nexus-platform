"use client";

import { useEffect, useState } from "react";
import { clientTrack } from "@/lib/analytics/clientTrack";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const quickPrompts = [
  "Ajarkan salam pagi dan malam dalam Arab, plus versi Saudi.",
  "Bagaimana cara order nasi ayam dan air di Saudi dengan أبغى?",
  "Saya kerja di pabrik. Ajarkan 5 instruksi atasan paling sering.",
  "Apa beda Fusha dan Saudi? Beri 3 contoh nyata.",
];

async function callTutor(message: string) {
  const res = await fetch("/api/apps/arabic/tutor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, mode: "text" }),
  });
  const data = await res.json();
  return {
    ok: res.ok,
    reply: typeof data?.reply === "string" ? (data.reply as string) : null,
    error: typeof data?.error === "string" ? (data.error as string) : null,
  };
}

export default function ArabicTutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Halo, saya tutor Arab kamu di Nexus AI Arabic. Bahas grammar, kosakata harian, percakapan Saudi, kerja, umrah, atau travel. Tanya bebas pakai Bahasa Indonesia ya.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clientTrack({
      eventType: "PAGE_VIEW",
      appSlug: "arabic",
      pagePath: "/apps/arabic/tutor",
    });
  }, []);

  const sendMessage = async (raw = input) => {
    const trimmed = raw.trim();
    if (!trimmed || loading) return;

    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    const { ok, reply, error } = await callTutor(trimmed);
    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: ok ? reply ?? "Tutor gagal menjawab." : error ?? "Tutor gagal menjawab.",
      },
    ]);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="flex min-h-[720px] flex-col rounded-3xl border border-emerald-100 bg-white shadow-sm">
          <div className="border-b border-emerald-100 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
              AI Tutor
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              Tanya, latih, dan praktek Bahasa Arab
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Fokus untuk pelajar Indonesia di Saudi: kerja, umrah, travel, dan dialek harian Saudi.
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
                      : "border border-emerald-100 bg-emerald-50/40 text-slate-800"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
                Tutor lagi nyusun jawaban...
              </div>
            )}
          </div>

          <div className="border-t border-emerald-100 p-4 sm:p-5">
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
                className="min-h-14 flex-1 resize-none rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                placeholder="Tanya grammar, minta latihan, atau simulasi percakapan..."
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={loading}
                className="self-end rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-slate-400"
              >
                Send
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Quick prompts</h2>
            <div className="mt-4 space-y-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 text-sm leading-6 text-amber-900">
            <p className="font-semibold uppercase tracking-[0.2em] text-amber-700">Tips</p>
            <p className="mt-2">
              Pakai Indonesia sehari-hari untuk tanya. Setiap kalimat Arab yang dijawab tutor selalu
              dilengkapi <em>transliterasi</em> dan arti, plus label Fusha / Saudi / Mixed.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
