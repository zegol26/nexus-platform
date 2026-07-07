"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { JohnVoicePanel } from "./JohnVoicePanel";
import { JohnAvatar } from "./JohnAvatar";
import { clientTrack } from "@/lib/analytics/clientTrack";
import { JOHN_TUTOR_CONFIG } from "@/lib/english/john-tutor-config";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  voice?: boolean;
};

type RoleplayContext = {
  personaSlug: string;
  personaName: string;
  scenario: string;
  goal: string;
  cefrLevel: string;
};

async function callJohn(args: {
  message: string;
  mode: "text" | "voice";
  history: ChatMessage[];
  cefrLevel: string;
  personaSlug?: string | null;
}) {
  const res = await fetch("/api/apps/english/john", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: args.message,
      mode: args.mode,
      tutorId: JOHN_TUTOR_CONFIG.tutorId,
      subject: JOHN_TUTOR_CONFIG.subject,
      courseId: JOHN_TUTOR_CONFIG.courseId,
      inputLanguage: JOHN_TUTOR_CONFIG.inputLanguage,
      outputLanguage: JOHN_TUTOR_CONFIG.outputLanguage,
      uiLanguage: JOHN_TUTOR_CONFIG.uiLanguage,
      allowMixedLanguage: JOHN_TUTOR_CONFIG.allowMixedLanguage,
      cefrLevel: args.cefrLevel,
      personaSlug: args.personaSlug ?? null,
      history: args.history.map((turn) => ({
        role: turn.role,
        content: turn.content,
      })),
    }),
  });
  const data = await res.json();
  return {
    ok: res.ok,
    reply: typeof data?.reply === "string" ? (data.reply as string) : null,
    error: typeof data?.error === "string" ? (data.error as string) : null,
  };
}

const QUICK_PROMPTS = [
  "Help me practice introducing myself for a remote job interview.",
  "Give me 5 polite ways to disagree at work.",
  "Coach me through ordering food in a restaurant.",
  "I want to practice telling a short story about my weekend.",
];

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;

type Props = {
  initialRoleplay?: RoleplayContext;
};

export function JohnChatClient({ initialRoleplay }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialRoleplay) {
      return [
        {
          role: "assistant",
          content: `Roleplay started. You're talking with ${initialRoleplay.personaName}. Goal: ${initialRoleplay.goal}\n\nScenario: ${initialRoleplay.scenario}\n\nWhen you're ready, reply to start the scene.`,
        },
      ];
    }
    return [
      {
        role: "assistant",
        content:
          "Hey, I'm John — your conversational English coach here on Nexus AI English. Tell me your CEFR level (or pick one above) and what you'd like to practice today. We can do free chat, a roleplay, or quick drills.",
      },
    ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cefrLevel, setCefrLevel] = useState<string>(initialRoleplay?.cefrLevel ?? "B1");
  const [personaSlug] = useState<string | null>(initialRoleplay?.personaSlug ?? null);

  useEffect(() => {
    clientTrack({
      eventType: "PAGE_VIEW",
      pagePath: "/apps/english/john",
      metadata: { personaSlug, cefrLevel },
    });
  }, [personaSlug, cefrLevel]);

  const sendMessage = async (message = input) => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    const nextHistory: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);

    const { ok, reply, error } = await callJohn({
      message: trimmed,
      mode: "text",
      history: messages,
      cefrLevel,
      personaSlug,
    });
    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: ok ? (reply ?? "John didn't reply.") : (error ?? "John didn't reply."),
      },
    ]);
    setLoading(false);
  };

  const handleVoiceTranscript = useCallback(
    async (transcript: string): Promise<string | null> => {
      let snapshotHistory: ChatMessage[] = [];
      setMessages((current) => {
        snapshotHistory = current;
        return [...current, { role: "user", content: transcript, voice: true }];
      });

      const { ok, reply, error } = await callJohn({
        message: transcript,
        mode: "voice",
        history: snapshotHistory,
        cefrLevel,
        personaSlug,
      });
      const replyText = ok && reply ? reply : (error ?? "John didn't reply.");
      setMessages((current) => [
        ...current,
        { role: "assistant", content: replyText, voice: true },
      ]);
      return ok && reply ? reply : null;
    },
    [cefrLevel, personaSlug]
  );

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_48%,#f8fafc_100%)] px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <JohnAvatar size={64} className="ring-2 ring-blue-200" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
                  Nexus AI English · John
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  Conversational English Coach
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  John is a 40-something English coach. Practice free chat,
                  roleplays, or quick coaching drills — by text or by voice.
                </p>
              </div>
            </div>
            <Link
              href="/apps/english/dashboard"
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Back to English Hub
            </Link>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="flex min-h-[640px] flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-5 sm:p-6">
              <p className="text-sm font-semibold text-slate-700">CEFR level</p>
              <div className="flex flex-wrap gap-2">
                {CEFR_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setCefrLevel(lvl)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      cefrLevel === lvl
                        ? "bg-blue-700 text-white shadow"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              {personaSlug && initialRoleplay && (
                <span className="ml-auto rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  Roleplay · {initialRoleplay.personaName}
                </span>
              )}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
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
                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-800">
                  John is putting together a reply...
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
                  className="min-h-14 flex-1 resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  placeholder="Ask John a question, request a drill, or start a roleplay..."
                />
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={loading}
                  className="self-end rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:bg-slate-400"
                >
                  Send
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <JohnVoicePanel onUserTranscript={handleVoiceTranscript} />

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Quick prompts</h2>
              <div className="mt-4 space-y-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
              <p className="font-semibold">Tip from John</p>
              <p className="mt-2 leading-6">
                Voice mode is the fastest path to fluency — record short
                replies, then read my correction out loud once before moving
                on.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
