"use client";

import { OnigiriBadge } from "@/components/platform/community/OnigiriBadge";

export type CommunityMessage = {
  id: string;
  body: string;
  createdAt: string;
  replyTo: { id: string; body: string; authorName: string } | null;
  linkedRoom: { id: string; name: string } | null;
  onigiriCount: number;
  likedByMe: boolean;
  author: {
    name: string;
    avatarUrl: string | null;
    role: string;
    learningBadge: string;
    onigiriBadge: string;
  };
};

export function ChatMessageCard({
  message,
  onReply,
  onRoomOpen,
  onToggleOnigiri,
  onDelete,
  savingOnigiri,
  isAdmin,
}: {
  message: CommunityMessage;
  onReply: (message: CommunityMessage) => void;
  onRoomOpen: (roomId: string) => void;
  onToggleOnigiri: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  savingOnigiri: boolean;
  isAdmin: boolean;
}) {
  const initial = message.author.name.charAt(0).toUpperCase();
  const authorIsAdmin = message.author.role === "ADMIN" || message.author.role === "SUPER_ADMIN";

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-white shadow-sm backdrop-blur transition hover:border-cyan-300/25">
      <div className="flex gap-3">
        {message.author.avatarUrl ? (
          <img src={message.author.avatarUrl} alt={message.author.name} className="h-9 w-9 rounded-xl object-cover" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300 text-sm font-semibold text-slate-950">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{message.author.name}</p>
            {authorIsAdmin ? <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">🍜 Admin</span> : null}
            <OnigiriBadge badge={message.author.onigiriBadge} />
          </div>
          <p className="mt-0.5 text-[11px] font-semibold text-cyan-100">{message.author.learningBadge}</p>

          {message.replyTo ? (
            <div className="mt-3 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-xs text-slate-200">
              <p className="font-semibold text-cyan-100">Balasan untuk {message.replyTo.authorName}</p>
              <p className="mt-1 line-clamp-2">{message.replyTo.body}</p>
            </div>
          ) : null}

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-100">{highlightMentions(message.body)}</p>

          {message.linkedRoom ? (
            <button
              type="button"
              onClick={() => onRoomOpen(message.linkedRoom?.id ?? "")}
              className="mt-3 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-3 text-left text-xs font-semibold text-cyan-50 transition hover:bg-cyan-300/20"
            >
              Buka Room: {message.linkedRoom.name}
            </button>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
            <button type="button" onClick={() => onReply(message)} className="hover:text-cyan-100">
              Balas
            </button>
            <button
              type="button"
              disabled={savingOnigiri}
              onClick={() => onToggleOnigiri(message.id)}
              className={`rounded-full px-3 py-1 transition ${
                message.likedByMe ? "bg-amber-100 text-amber-800" : "bg-white/10 text-slate-200 hover:bg-white/20"
              }`}
            >
              {savingOnigiri ? "Sedang menyimpan onigiri..." : `Onigiri ${message.onigiriCount}`}
            </button>
            {isAdmin ? (
              <button type="button" onClick={() => onDelete(message.id)} className="text-rose-100 hover:text-rose-200">
                Hapus Pesan
              </button>
            ) : null}
            <span>{formatTime(message.createdAt)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function highlightMentions(body: string) {
  const parts = body.split(/(@[\p{L}\p{N}_-]+)/gu);
  return parts.map((part, index) =>
    part.startsWith("@") ? (
      <span key={`${part}-${index}`} className="font-semibold text-cyan-200">
        {part}
      </span>
    ) : (
      part
    )
  );
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
