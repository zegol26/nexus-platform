"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type StorageProvider = "DATABASE" | "VERCEL_BLOB";

export function StoryArcPdfReader({
  documentId,
  title,
  fileName,
  storageProvider,
}: {
  documentId: string;
  title: string;
  fileName: string;
  storageProvider: StorageProvider;
}) {
  const [page, setPage] = useState(1);
  const [secureUrl, setSecureUrl] = useState("");
  const [secureError, setSecureError] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    if (storageProvider !== "VERCEL_BLOB") return;
    const controller = new AbortController();
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    async function authorizeDownload() {
      setSecureError("");
      try {
        const response = await fetch(`/api/apps/storyarc/library/${encodeURIComponent(documentId)}/download`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = await response.json() as { error?: string; url?: string; expiresAt?: string };
        if (!response.ok || !payload.url || !payload.expiresAt) {
          throw new Error(payload.error ?? "Secure PDF access failed.");
        }
        if (controller.signal.aborted) return;
        setSecureUrl(payload.url);
        const refreshInMs = Math.max(30_000, new Date(payload.expiresAt).getTime() - Date.now() - 30_000);
        refreshTimer = setTimeout(() => setRefreshVersion((value) => value + 1), refreshInMs);
      } catch (error) {
        if (!controller.signal.aborted) {
          setSecureError(error instanceof Error ? error.message : "Secure PDF access failed.");
        }
      }
    }

    void authorizeDownload();
    return () => {
      controller.abort();
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [documentId, refreshVersion, storageProvider]);

  const databaseUrl = `/api/apps/storyarc/library/${encodeURIComponent(documentId)}`;
  const sourceUrl = storageProvider === "DATABASE" ? databaseUrl : secureUrl;
  const pdfUrl = sourceUrl ? `${sourceUrl}#page=${page}&view=FitH` : "";

  function updatePage(value: number) {
    if (Number.isInteger(value) && value >= 1) setPage(value);
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#07112d] shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#101b42] p-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-300">PDF READER</p>
          <h1 className="truncate text-lg font-black text-white">{title}</h1>
          <p className="truncate text-xs text-slate-400">{fileName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => updatePage(page - 1)} disabled={page === 1} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white disabled:opacity-30">← Previous</button>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-300">
            Page
            <input aria-label="PDF page number" type="number" min={1} value={page} onChange={(event) => updatePage(Number(event.target.value))} className="w-20 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-300" />
          </label>
          <button type="button" onClick={() => updatePage(page + 1)} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white">Next →</button>
          {storageProvider === "DATABASE" ? (
            <Link href={`${databaseUrl}?download=1`} className="storyarc-primary-button">Download</Link>
          ) : secureUrl ? (
            <a href={secureUrl} download={fileName} className="storyarc-primary-button">Download</a>
          ) : null}
        </div>
      </div>
      {secureError ? (
        <div className="grid min-h-[620px] place-items-center bg-slate-950 p-6 text-center">
          <div>
            <p role="alert" className="text-sm font-bold text-amber-300">{secureError}</p>
            <button type="button" onClick={() => setRefreshVersion((value) => value + 1)} className="storyarc-primary-button mt-4">Refresh secure link</button>
          </div>
        </div>
      ) : pdfUrl ? (
        <iframe key={`${documentId}-${page}-${refreshVersion}`} src={pdfUrl} title={`PDF reader: ${title}, page ${page}`} className="h-[72vh] min-h-[620px] w-full bg-white" />
      ) : (
        <div className="grid min-h-[620px] place-items-center bg-slate-950 text-sm font-bold text-cyan-200" role="status">Authorizing secure PDF reader...</div>
      )}
    </div>
  );
}
