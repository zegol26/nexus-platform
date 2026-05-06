"use client";

import { useEffect, useMemo, useState } from "react";
import { ChatRoomPanel } from "@/components/platform/community/ChatRoomPanel";
import { CommunityInfoCard } from "@/components/platform/community/CommunityInfoCard";
import { CommunityRulesCard } from "@/components/platform/community/CommunityRulesCard";
import { LoadingState } from "@/components/platform/community/LoadingState";
import { RoomCreateDialog } from "@/components/platform/community/RoomCreateDialog";
import { RoomList, type CommunityRoomSummary } from "@/components/platform/community/RoomList";

export function CommunityPage() {
  const [rooms, setRooms] = useState<CommunityRoomSummary[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [canCreateRoom, setCanCreateRoom] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRooms() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/platform/community/rooms");
    const payload = await response.json().catch(() => ({}));
    if (response.ok) {
      const nextRooms = payload.rooms ?? [];
      setRooms(nextRooms);
      setCanCreateRoom(Boolean(payload.canCreateRoom));
      setIsAdmin(Boolean(payload.isAdmin));
      setHint(payload.createRoomHint ?? "");
      setSelectedRoomId((current) => current || nextRooms[0]?.id || "");
    } else {
      setError(payload.error ?? "Gagal memuat data. Coba lagi.");
    }
    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadRooms();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? null,
    [rooms, selectedRoomId]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5 text-slate-100">
      <section className="overflow-hidden rounded-3xl border border-cyan-300/20 bg-slate-950 shadow-2xl shadow-cyan-950/20">
        <div className="bg-[radial-gradient(circle_at_16%_0%,rgba(34,211,238,0.24),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(99,102,241,0.2),transparent_28%),linear-gradient(135deg,#020617,#0f172a_48%,#071a2f)] p-5 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Nexus Platform
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Komunitas Board
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Tempat berdiskusi, bertanya, dan saling mendukung perjalanan belajar.
              </p>
            </div>
            <div className="w-full max-w-sm">
              <RoomCreateDialog canCreateRoom={canCreateRoom} onCreated={loadRooms} />
              {hint ? <p className="mt-2 text-xs font-semibold text-amber-200">{hint}</p> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <CommunityInfoCard canCreateRoom={canCreateRoom} />
        <CommunityRulesCard />
      </section>

      <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-5 xl:self-start">
          <RoomList
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            isAdmin={isAdmin}
            onSelectRoom={setSelectedRoomId}
            onDeleted={loadRooms}
          />
        </aside>

        <main className="space-y-4">
          {loading ? <LoadingState label="Sedang memuat komunitas..." /> : null}
          {loading ? <LoadingState label="Sedang memuat room..." /> : null}
          {error ? (
            <div className="rounded-2xl border border-rose-400/40 bg-rose-950/80 p-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
          <ChatRoomPanel room={selectedRoom} isAdmin={isAdmin} onRoomOpen={setSelectedRoomId} />
        </main>
      </section>
    </div>
  );
}
