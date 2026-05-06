"use client";

import { useState } from "react";

export function MessageComposer({
  roomId,
  replyTo,
  onCancelReply,
  onSent,
}: {
  roomId: string;
  replyTo: { id: string; authorName: string; body: string } | null;
  onCancelReply: () => void;
  onSent: () => void;
}) {
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function sendMessage() {
    if (!body.trim()) return;
    setSending(true);
    setStatus("Sedang mengirim pesan...");

    const response = await fetch(`/api/platform/community/rooms/${roomId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, replyToId: replyTo?.id ?? null }),
    });
    const payload = await response.json().catch(() => ({}));

    if (response.ok) {
      setBody("");
      setStatus("");
      onCancelReply();
      onSent();
    } else {
      setStatus(payload.error ?? "Gagal mengirim pesan. Coba lagi.");
    }
    setSending(false);
  }

  return (
    <div className="sticky bottom-0 border-t border-white/10 bg-slate-950/95 p-3 backdrop-blur">
      {replyTo ? (
        <div className="mb-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-xs text-cyan-50">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">Membalas {replyTo.authorName}</p>
            <button type="button" onClick={onCancelReply} className="text-xs font-semibold text-cyan-100">
              Batal
            </button>
          </div>
          <p className="mt-1 line-clamp-2 text-slate-300">{replyTo.body}</p>
        </div>
      ) : null}
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        className="min-h-20 w-full rounded-2xl border border-white/15 bg-white/[0.07] px-3 py-2.5 text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
        placeholder="Tulis pesan sopan, relevan, dan saling membantu. Mention teman dengan format @Nama."
      />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400">{status || "Link room internal bisa dibagikan dengan format /platform/community?room=ID."}</p>
        <button
          type="button"
          onClick={sendMessage}
          disabled={sending || !body.trim()}
          className="rounded-full bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:bg-slate-600 disabled:text-slate-300"
        >
          {sending ? "Sedang mengirim pesan..." : "Kirim Pesan"}
        </button>
      </div>
    </div>
  );
}
