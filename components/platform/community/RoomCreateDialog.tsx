"use client";

import { useState } from "react";

export function RoomCreateDialog({
  canCreateRoom,
  onCreated,
}: {
  canCreateRoom: boolean;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [creating, setCreating] = useState(false);

  async function createRoom() {
    setCreating(true);
    setStatus("Sedang membuat room...");
    const response = await fetch("/api/platform/community/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const payload = await response.json().catch(() => ({}));

    if (response.ok) {
      setName("");
      setDescription("");
      setOpen(false);
      setStatus("");
      onCreated();
    } else {
      setStatus(payload.error ?? "Gagal membuat room. Coba lagi.");
    }
    setCreating(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!canCreateRoom}
        title={!canCreateRoom ? "Kamu bisa membuat room setelah mencapai level Flashcard Spark." : "Buat room"}
        className="w-full rounded-full bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 sm:w-auto"
      >
        Buat Room
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-cyan-300/20 bg-slate-950 p-5 text-white shadow-2xl shadow-cyan-950/20">
            <h2 className="text-xl font-semibold">Buat Room Baru</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold">
                Nama room
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="rounded-2xl border border-white/15 bg-white/[0.07] px-3 py-2.5 text-sm outline-none focus:border-cyan-300"
                  placeholder="Contoh: Latihan Partikel N5"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Deskripsi
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-24 rounded-2xl border border-white/15 bg-white/[0.07] px-3 py-2.5 text-sm outline-none focus:border-cyan-300"
                  placeholder="Topik diskusi room ini."
                />
              </label>
            </div>
            {status ? <p className="mt-4 text-sm text-cyan-100">{status}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={createRoom}
                disabled={creating}
                className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:bg-slate-500"
              >
                {creating ? "Sedang membuat room..." : "Simpan Room"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
