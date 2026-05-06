"use client";

export type CommunityRoomSummary = {
  id: string;
  name: string;
  description: string | null;
  messageCount: number;
  updatedAt: string;
  createdBy: { name: string; role: string };
};

export function RoomList({
  rooms,
  selectedRoomId,
  isAdmin,
  onSelectRoom,
  onDeleted,
}: {
  rooms: CommunityRoomSummary[];
  selectedRoomId: string;
  isAdmin: boolean;
  onSelectRoom: (roomId: string) => void;
  onDeleted: () => void;
}) {
  async function deleteRoom(roomId: string) {
    if (!window.confirm("Hapus room ini beserta seluruh pesannya?")) return;
    const response = await fetch(`/api/platform/community/rooms/${roomId}`, { method: "DELETE" });
    if (response.ok) onDeleted();
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/90 p-3 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">Topic Nav</p>
          <h2 className="mt-1 text-base font-semibold text-white">Room Diskusi</h2>
        </div>
        <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-100">
          {rooms.length}
        </span>
      </div>

      {!rooms.length ? (
        <p className="mt-3 rounded-2xl border border-dashed border-white/15 p-3 text-xs leading-5 text-slate-400">
          Belum ada room. Mulai dari topik belajar yang ringan dan positif.
        </p>
      ) : (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 xl:grid xl:max-h-[680px] xl:overflow-y-auto xl:overflow-x-hidden xl:pr-1">
          {rooms.map((room) => {
            const active = selectedRoomId === room.id;
            const adminCreator = room.createdBy.role === "ADMIN" || room.createdBy.role === "SUPER_ADMIN";
            return (
              <div
                key={room.id}
                className={`min-w-[230px] rounded-2xl border p-3 transition xl:min-w-0 ${
                  active
                    ? "border-cyan-300/70 bg-cyan-300/12 shadow-lg shadow-cyan-950/20"
                    : "border-white/10 bg-white/[0.04] hover:border-cyan-300/40 hover:bg-white/[0.07]"
                }`}
              >
                <button type="button" onClick={() => onSelectRoom(room.id)} className="w-full text-left">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-semibold text-white">{room.name}</p>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                      {room.messageCount}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                    {room.description ?? "Diskusi belajar bersama."}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold text-slate-500">
                    {adminCreator ? "🍜 " : ""}{room.createdBy.name}
                  </p>
                </button>
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => deleteRoom(room.id)}
                    className="mt-2 rounded-full border border-rose-300/25 px-2.5 py-1 text-[11px] font-semibold text-rose-100 transition hover:bg-rose-400/15"
                  >
                    Hapus
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
