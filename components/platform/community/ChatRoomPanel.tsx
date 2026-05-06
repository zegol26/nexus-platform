"use client";

import { useEffect, useState } from "react";
import { ChatMessageCard, type CommunityMessage } from "@/components/platform/community/ChatMessageCard";
import { LoadingState } from "@/components/platform/community/LoadingState";
import { MessageComposer } from "@/components/platform/community/MessageComposer";
import type { CommunityRoomSummary } from "@/components/platform/community/RoomList";

export function ChatRoomPanel({
  room,
  isAdmin,
  onRoomOpen,
}: {
  room: CommunityRoomSummary | null;
  isAdmin: boolean;
  onRoomOpen: (roomId: string) => void;
}) {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [replyTo, setReplyTo] = useState<CommunityMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingOnigiriId, setSavingOnigiriId] = useState("");

  async function loadMessages() {
    if (!room) return;
    setLoading(true);
    setError("");
    const response = await fetch(`/api/platform/community/rooms/${room.id}/messages`);
    const payload = await response.json().catch(() => ({}));
    if (response.ok) {
      setMessages(payload.messages ?? []);
    } else {
      setError(payload.error ?? "Gagal memuat data. Coba lagi.");
    }
    setLoading(false);
  }

  useEffect(() => {
    const firstLoad = window.setTimeout(() => {
      loadMessages();
    }, 0);
    const timer = window.setInterval(loadMessages, 15000);
    return () => {
      window.clearTimeout(firstLoad);
      window.clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id]);

  async function toggleOnigiri(messageId: string) {
    setSavingOnigiriId(messageId);
    const response = await fetch(`/api/platform/community/messages/${messageId}/onigiri`, { method: "POST" });
    if (response.ok) await loadMessages();
    setSavingOnigiriId("");
  }

  async function deleteMessage(messageId: string) {
    if (!window.confirm("Hapus pesan ini dari komunitas?")) return;
    const response = await fetch(`/api/platform/community/messages/${messageId}`, { method: "DELETE" });
    if (response.ok) await loadMessages();
  }

  if (!room) {
    return (
      <section className="flex min-h-[520px] items-center justify-center rounded-3xl border border-white/10 bg-slate-950/90 p-8 text-center text-slate-200 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
        <div>
          <h2 className="text-xl font-semibold text-white">Pilih room diskusi</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Room akan tampil di sini setelah kamu memilih dari daftar.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-cyan-300/15 bg-slate-950/95 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
      <div className="border-b border-white/10 bg-white/[0.03] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">Room Aktif</p>
        <h2 className="mt-1 text-xl font-semibold text-white">{room.name}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-400">{room.description ?? "Diskusi belajar bersama."}</p>
      </div>

      <div className="max-h-[620px] space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_28%)] p-3 sm:p-4">
        {loading ? <LoadingState label="Sedang memuat percakapan..." /> : null}
        {error ? <div className="rounded-2xl border border-rose-300/30 bg-rose-300/10 p-3 text-xs text-rose-100">{error}</div> : null}
        {!loading && !messages.length ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-400">
            Belum ada percakapan. Jadilah yang pertama memulai diskusi positif.
          </div>
        ) : null}
        {messages.map((message) => (
          <ChatMessageCard
            key={message.id}
            message={message}
            onReply={setReplyTo}
            onRoomOpen={onRoomOpen}
            onToggleOnigiri={toggleOnigiri}
            onDelete={deleteMessage}
            savingOnigiri={savingOnigiriId === message.id}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      <MessageComposer
        roomId={room.id}
        replyTo={replyTo ? { id: replyTo.id, authorName: replyTo.author.name, body: replyTo.body } : null}
        onCancelReply={() => setReplyTo(null)}
        onSent={loadMessages}
      />
    </section>
  );
}
