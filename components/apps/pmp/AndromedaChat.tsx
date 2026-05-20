"use client";

import { useEffect, useRef, useState } from "react";
import { AndromedaIcon } from "./AndromedaIcon";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  userQuestion?: string;
};
type Rating = "like" | "dislike" | null;

const SUGGESTIONS = [
  "RFI vs RFQ vs RFP vs IFB — kapan masing-masing dipakai?",
  "Bandingkan contract types dalam satu tabel.",
  "Risk response strategies untuk threat vs opportunity.",
  "Pareto vs fishbone — kapan pilih yang mana?",
  "EVM: CV, SV, CPI, SPI, EAC dengan contoh angka.",
  "Conflict resolution: collaborate vs compromise.",
];

function renderMarkdown(text: string) {
  // Lightweight markdown renderer — bold, code, headings, bullets, line breaks, simple tables.
  // Good enough for instructor responses; we keep it self-contained to avoid a new dependency.
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split("\n");
  const out: string[] = [];
  let inList = false;
  let inTable = false;

  function closeList() {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  }
  function closeTable() {
    if (inTable) {
      out.push("</tbody></table></div>");
      inTable = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      closeList();
      closeTable();
      out.push("");
      continue;
    }

    // Heading
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      closeList();
      closeTable();
      const level = Math.min(heading[1].length + 1, 4);
      out.push(`<h${level} class="andromeda-h">${inline(heading[2])}</h${level}>`);
      continue;
    }

    // Table — detect "| col | col |" + separator
    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      const isSeparator = cells.every((c) => /^:?-{2,}:?$/.test(c));
      if (!inTable && !isSeparator) {
        // header
        closeList();
        inTable = true;
        out.push(
          `<div class="andromeda-table-wrap"><table class="andromeda-table"><thead><tr>${cells
            .map((c) => `<th>${inline(c)}</th>`)
            .join("")}</tr></thead><tbody>`
        );
        continue;
      }
      if (inTable && isSeparator) continue;
      if (inTable) {
        out.push(
          `<tr>${cells.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`
        );
        continue;
      }
    } else if (inTable) {
      closeTable();
    }

    // Bullet
    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        out.push("<ul class=\"andromeda-list\">");
        inList = true;
      }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    } else {
      closeList();
    }

    out.push(`<p class="andromeda-p">${inline(line)}</p>`);
  }

  closeList();
  closeTable();
  return out.join("\n");
}

function inline(text: string) {
  return text
    .replace(/`([^`]+)`/g, '<code class="andromeda-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

export function AndromedaChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi. I'm **Andromeda** ✦ — your PMP study companion.\n\nPick a prompt on the left, or ask anything about the exam.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/apps/pmp/andromeda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-10) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply ?? "(no reply)",
          userQuestion: trimmed,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  function resetChat() {
    setMessages(messages.slice(0, 1));
    setError("");
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.34fr_1fr]">
      <aside className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-950/60 via-slate-950 to-cyan-950/40 p-5">
          <div className="flex items-center gap-3">
            <AndromedaIcon size={56} className="drop-shadow-[0_0_18px_rgba(167,139,250,0.7)]" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-fuchsia-200/90">
                AI Instructor
              </p>
              <h2 className="text-xl font-semibold text-white">Andromeda ✦</h2>
              <p className="text-[11px] text-slate-300">PMP study companion</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Ask anything across the syllabus — concept, scenario, or quick recall.
          </p>
          <button
            onClick={resetChat}
            className="mt-4 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10"
          >
            Reset conversation
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Quick prompts</p>
          <div className="mt-3 grid gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => send(suggestion)}
                disabled={loading}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-xs leading-5 text-slate-300 transition hover:border-fuchsia-300/40 hover:bg-white/[0.07] disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.04] p-4 text-xs leading-5 text-amber-100">
          <p className="font-semibold">PMP only</p>
          <p className="mt-1 text-amber-100/80">
            Off-topic questions will be redirected back to study.
          </p>
        </div>
      </aside>

      <div className="flex min-h-[640px] flex-col rounded-2xl border border-white/10 bg-slate-950/60 shadow-2xl shadow-violet-950/20">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2">
            <AndromedaIcon size={22} />
            <p className="text-sm font-semibold text-white">Andromeda</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-200/70">
            PMP only
          </span>
        </header>

        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
          style={{ maxHeight: "60vh" }}
        >
          {messages.map((msg, index) => (
            <ChatBubble key={index} message={msg} index={index} />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-fuchsia-200/80">
              <AndromedaIcon size={18} />
              <span>Thinking…</span>
            </div>
          )}
        </div>

        <form
          className="border-t border-white/10 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          {error && <p className="mb-2 text-xs font-semibold text-rose-300">{error}</p>}
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={2}
              placeholder="Ask Andromeda…  (Enter to send · Shift+Enter for newline)"
              className="flex-1 resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-fuchsia-300/40 focus:ring-2"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .andromeda-p {
          margin: 0.45rem 0;
          line-height: 1.7;
          font-size: 0.92rem;
          color: rgb(226 232 240);
        }
        .andromeda-h {
          margin: 1rem 0 0.4rem;
          font-weight: 600;
          color: #fff;
          font-size: 1rem;
          letter-spacing: -0.01em;
        }
        .andromeda-list {
          margin: 0.4rem 0 0.4rem 1.1rem;
          list-style: disc;
          color: rgb(226 232 240);
          font-size: 0.92rem;
          line-height: 1.7;
        }
        .andromeda-list li {
          margin: 0.2rem 0;
        }
        .andromeda-code {
          background: rgba(255, 255, 255, 0.08);
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          font-size: 0.85em;
          color: #f0abfc;
        }
        .andromeda-table-wrap {
          margin: 0.6rem 0;
          overflow-x: auto;
        }
        .andromeda-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .andromeda-table th,
        .andromeda-table td {
          padding: 0.4rem 0.6rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: left;
          color: rgb(226 232 240);
          vertical-align: top;
        }
        .andromeda-table th {
          background: rgba(167, 139, 250, 0.12);
          color: #fff;
          font-weight: 600;
        }
      `}</style>
    </section>
  );
}

function ChatBubble({ message, index }: { message: ChatMessage; index: number }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] rounded-2xl rounded-br-sm bg-cyan-300/15 px-4 py-3 text-sm leading-6 text-cyan-50 ring-1 ring-cyan-300/30">
          {message.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <AndromedaIcon size={28} className="mt-1 shrink-0 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
      <div className="max-w-[90%] flex-1">
        <div
          className="rounded-2xl rounded-tl-sm bg-white/[0.04] px-4 py-3 text-sm leading-6 text-slate-100 ring-1 ring-white/10"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
        />
        {/* Skip feedback for the welcome message (index 0) */}
        {index > 0 && (
          <FeedbackBar
            content={message.content}
            userQuestion={message.userQuestion ?? null}
            sourceRef={`andromeda#${index}`}
          />
        )}
      </div>
    </div>
  );
}

function FeedbackBar({
  content,
  userQuestion,
  sourceRef,
}: {
  content: string;
  userQuestion: string | null;
  sourceRef: string;
}) {
  const [rating, setRating] = useState<Rating>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function send(nextRating: "like" | "dislike", withComment?: string) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/apps/pmp/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: nextRating,
          content,
          sourceType: "andromeda_chat",
          sourceRef,
          userQuestion,
          comment: withComment ?? null,
        }),
      });
      if (res.ok) {
        setRating(nextRating);
        if (withComment) setSubmitted(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <p className="mt-1.5 text-[11px] text-emerald-300/80">
        ✓ Thanks — feedback logged.
      </p>
    );
  }

  return (
    <div className="mt-1.5">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => send("like")}
          disabled={submitting}
          aria-label="Like response"
          className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs transition ${
            rating === "like"
              ? "border-emerald-300/60 bg-emerald-300/15 text-emerald-200"
              : "border-white/10 bg-white/5 text-slate-400 hover:text-emerald-300"
          }`}
        >
          👍
        </button>
        <button
          type="button"
          onClick={() => {
            setRating("dislike");
            setShowComment(true);
            send("dislike");
          }}
          disabled={submitting}
          aria-label="Dislike response"
          className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs transition ${
            rating === "dislike"
              ? "border-rose-300/60 bg-rose-300/15 text-rose-200"
              : "border-white/10 bg-white/5 text-slate-400 hover:text-rose-300"
          }`}
        >
          👎
        </button>
        {rating && !showComment && (
          <button
            type="button"
            onClick={() => setShowComment(true)}
            className="ml-1 text-[11px] text-slate-400 hover:text-fuchsia-200"
          >
            + add a note
          </button>
        )}
      </div>
      {showComment && (
        <div className="mt-2 flex items-end gap-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="What could be better?"
            className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none ring-fuchsia-300/40 focus:ring-2"
            maxLength={2000}
          />
          <button
            type="button"
            disabled={!comment.trim() || submitting || !rating}
            onClick={() => send(rating ?? "dislike", comment.trim())}
            className="rounded-lg bg-fuchsia-400 px-3 py-2 text-xs font-bold text-slate-950 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
