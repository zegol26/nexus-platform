"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StoryArcLibraryDeleteButton({ documentId, title }: { documentId: string; title: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (!window.confirm(`Delete “${title}” from this class library?`)) return;
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/apps/storyarc/library/${encodeURIComponent(documentId)}`, { method: "DELETE" });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Document could not be deleted.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Document could not be deleted.");
      setDeleting(false);
    }
  }

  return <span className="grid gap-1"><button type="button" disabled={deleting} onClick={remove} className="rounded-lg border border-rose-300/20 px-3 py-2 text-xs font-black text-rose-200 hover:bg-rose-300/10 disabled:opacity-50">{deleting ? "Deleting..." : "Delete"}</button>{error ? <small role="alert" className="text-[10px] text-amber-300">{error}</small> : null}</span>;
}
