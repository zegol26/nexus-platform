"use client";

import { useEffect, useState } from "react";
import { clientTrack } from "@/lib/analytics/clientTrack";
import { arabicConversationScenarios } from "@/lib/arabic/scenarios";

type Turn = {
  role: "user" | "assistant";
  content: string;
};

async function callConversation(payload: {
  scenarioId: string;
  message?: string;
  history?: Turn[];
  requestSummary?: boolean;
}) {
  const res = await fetch("/api/apps/arabic/conversation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return {
    ok: res.ok,
    reply: typeof data?.reply === "string" ? (data.reply as string) : null,
    error: typeof data?.error === "string" ? (data.error as string) : null,
  };
}

export default function ArabicConversationPage() {
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [history, setHistory] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    clientTrack({
      eventType: "PAGE_VIEW",
      appSlug: "arabic",
      pagePath: "/apps/arabic/conversation",
    });
  }, []);

  const startScenario = async (id: string) => {
    setScenarioId(id);
    setHistory([]);
    setSummary(null);
    setLoading(true);
    const { ok, reply, error } = await callConversation({ scenarioId: id, history: [] });
    setHistory([
      {
        role: "assistant",
        content: ok ? reply ?? "Gagal memuat skenario." : error ?? "Gagal memuat skenario.",
      },
    ]);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!scenarioId) return;
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newHistory: Turn[] = [...history, { role: "user", content: trimmed }];
    setHistory(newHistory);
    setInput("");
    setLoading(true);

    const { ok, reply, error } = await callConversation({
      scenarioId,
      message: trimmed,
      history: newHistory,
    });
    setHistory((current) => [
      ...current,
      {
        role: "assistant",
        content: ok ? reply ?? "Gagal mengirim." : error ?? "Gagal mengirim.",
      },
    ]);
    setLoading(false);
  };

  const requestSummary = async () => {
    if (!scenarioId || loading) return;
    setLoading(true);
    const { ok, reply, error } = await callConversation({
      scenarioId,
      history,
      requestSummary: true,
    });
    setSummary(ok ? reply : error);
    setLoading(false);
  };

  const exitScenario = () => {
    setScenarioId(null);
    setHistory([]);
    setSummary(null);
  };

  const activeScenario = arabicConversationScenarios.find((scenario) => scenario.id === scenarioId);

  if (!scenarioId) {
    return (
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
            AI Conversation
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Roleplay percakapan Saudi nyata
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Pilih satu skenario. Tutor akan main peran sebagai lawan bicara, koreksi kalimatmu, dan kasih ringkasan di akhir.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {arabicConversationScenarios.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              onClick={() => startScenario(scenario.id)}
              className="rounded-2xl border border-emerald-100 bg-white p-5 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {scenario.formality === "polite" ? "Formal / Fusha" : "Casual / Saudi"}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">{scenario.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{scenario.description}</p>
              <p
                dir="rtl"
                className="mt-3 text-base font-semibold leading-relaxed text-emerald-800"
              >
                {scenario.openingLine.arabic}
              </p>
              <p className="text-xs text-slate-500">{scenario.openingLine.transliteration}</p>
            </button>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Skenario
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">
              {activeScenario?.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{activeScenario?.arabicContext}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={requestSummary}
              disabled={loading || history.length < 2}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-slate-300"
            >
              Selesai & Ringkasan
            </button>
            <button
              type="button"
              onClick={exitScenario}
              className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50"
            >
              Ganti Skenario
            </button>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-emerald-100 bg-white shadow-sm">
        <div className="space-y-4 p-5 sm:p-6">
          {history.map((turn, index) => (
            <div
              key={`${turn.role}-${index}`}
              className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-5 py-4 text-sm leading-7 ${
                  turn.role === "user"
                    ? "bg-slate-950 text-white"
                    : "border border-emerald-100 bg-emerald-50/40 text-slate-800"
                }`}
                dir={turn.role === "assistant" ? "auto" : "ltr"}
              >
                {turn.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
              Tutor sedang merespons...
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
              placeholder="Tulis jawaban dalam Arab atau Indonesia..."
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={loading}
              className="self-end rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-slate-400"
            >
              Kirim
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Tip: kirim 5–7 turn lalu klik "Selesai & Ringkasan" untuk dapat koreksi lengkap.
          </p>
        </div>
      </section>

      {summary && (
        <section className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-sm sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
            Ringkasan Sesi
          </h2>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-7 text-amber-900">
            {summary}
          </pre>
        </section>
      )}
    </div>
  );
}
