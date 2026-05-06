"use client";

import { useRef, useState } from "react";

type ListeningRow = {
  id: string;
  title: string;
  level: string;
  topic: string;
  audioUrl: string | null;
  createdAt: string | Date;
};

const LEVEL_OPTIONS = ["N5", "N4", "N3", "N2", "N1"] as const;

export function ListeningManagerClient({ initialEntries }: { initialEntries: ListeningRow[] }) {
  const audioRef = useRef<HTMLInputElement | null>(null);
  const metadataRef = useRef<HTMLInputElement | null>(null);
  const [entries, setEntries] = useState(initialEntries);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<string>("N5");
  const [topic, setTopic] = useState("");
  const [durationSec, setDurationSec] = useState("");

  function resetForm() {
    setTitle("");
    setLevel("N5");
    setTopic("");
    setDurationSec("");
    if (audioRef.current) audioRef.current.value = "";
    if (metadataRef.current) metadataRef.current.value = "";
  }

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const audio = audioRef.current?.files?.[0];
    const metadata = metadataRef.current?.files?.[0];

    if (!audio) {
      setStatus("Audio file wajib dipilih.");
      return;
    }

    if (!title.trim()) {
      setStatus("Title wajib diisi.");
      return;
    }
    if (!topic.trim()) {
      setStatus("Category wajib diisi.");
      return;
    }

    const formData = new FormData();
    formData.set("audio", audio);
    if (metadata) formData.set("metadata", metadata);
    formData.set("title", title.trim());
    formData.set("level", level.trim() || "N5");
    formData.set("topic", topic.trim());
    if (durationSec.trim()) formData.set("durationSec", durationSec.trim());

    setSubmitting(true);
    setStatus("Uploading...");

    const response = await fetch("/api/admin/listening/upload", {
      method: "POST",
      body: formData,
    });
    const payload = await response.json();

    if (response.ok) {
      setEntries((current) => [payload.passage, ...current.filter((item) => item.id !== payload.passage.id)]);
      setStatus("Listening content saved.");
      resetForm();
    } else {
      setStatus(payload.error ?? "Upload failed.");
    }

    setSubmitting(false);
  }

  async function deleteEntry(id: string) {
    setDeletingId(id);
    setStatus("Deleting...");

    const response = await fetch("/api/admin/listening/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const payload = await response.json().catch(() => ({}));

    if (response.ok) {
      setEntries((current) => current.filter((item) => item.id !== id));
      setStatus("Listening entry deleted.");
    } else {
      setStatus(payload.error ?? "Delete failed.");
    }

    setDeletingId("");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={upload} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-semibold text-slate-950">Upload New Listening Content</h2>
        <p className="mt-1 text-sm text-slate-600">
          Isi Title + Level + Category lalu pilih audio. JSON metadata bersifat opsional — gunakan
          jika ingin menyertakan transcript. Field di form jadi sumber utama; JSON mengisi field
          yang kosong dan boleh dibungkus dengan{" "}
          <code className="rounded bg-slate-200 px-1">{"{ \"articles\": [...] }"}</code>{" "}
          (satu entry per submit) atau nested di dalam{" "}
          <code className="rounded bg-slate-200 px-1">content</code>. Alias yang dikenali:{" "}
          <code className="rounded bg-slate-200 px-1">japanese / kanji</code>,{" "}
          <code className="rounded bg-slate-200 px-1">romaji</code>,{" "}
          <code className="rounded bg-slate-200 px-1">indonesia / translation / english</code>.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Title <span className="text-rose-600">*</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Contoh: Percakapan di stasiun"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Level <span className="text-rose-600">*</span>
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal"
            >
              {LEVEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Category <span className="text-rose-600">*</span>
            <input
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Contoh: daily-conversation"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Duration (detik)
            <input
              type="number"
              min={0}
              step={1}
              value={durationSec}
              onChange={(event) => setDurationSec(event.target.value)}
              placeholder="Opsional"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Audio File <span className="text-rose-600">*</span>
            <input
              ref={audioRef}
              type="file"
              accept="audio/*"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            JSON Metadata (opsional)
            <input
              ref={metadataRef}
              type="file"
              accept="application/json,.json"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={submitting}
            className="w-fit rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:bg-slate-400"
          >
            {submitting ? "Uploading..." : "Submit Listening Content"}
          </button>
          <p className="text-sm text-slate-600">{status}</p>
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-950">Existing Listening Library</h2>
        </div>
        {!entries.length ? (
          <div className="p-6 text-sm text-slate-500">No listening content yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Level</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Audio Present</th>
                  <th className="px-5 py-3">Created At</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-5 py-4 font-semibold text-slate-950">{entry.title}</td>
                    <td className="px-5 py-4 text-slate-600">{entry.level}</td>
                    <td className="px-5 py-4 text-slate-600">{entry.topic}</td>
                    <td className="px-5 py-4 text-slate-600">{entry.audioUrl ? "Yes" : "No"}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(entry.createdAt)}</td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => deleteEntry(entry.id)}
                        disabled={deletingId === entry.id}
                        className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                      >
                        {deletingId === entry.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
