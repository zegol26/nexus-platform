"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "pmp-disclaimer-dismissed-v1";

export function PmpDisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!hydrated || dismissed) return null;

  return (
    <div className="rounded-2xl border border-amber-300/25 bg-amber-300/[0.05] p-4 text-xs leading-5 text-amber-100">
      <div className="flex items-start gap-3">
        <span className="text-base leading-none">⚠️</span>
        <div className="flex-1">
          <p className="font-semibold uppercase tracking-[0.18em] text-amber-200">
            Disclaimer — independent prep tool
          </p>
          <p className="mt-1 text-amber-100/85">
            Nexus PMP Academy <strong>tidak terasosiasi, di-endorse, atau di-afiliasi</strong> oleh
            Project Management Institute® (PMI®). PMP®, PMBOK®, dan ECO® adalah trademark milik PMI.
            Aplikasi ini adalah tools independen untuk persiapan PMP exam — semua content (course,
            knowledge base, simulasi, Andromeda AI) ditulis original oleh tim Nexus dan tidak menjamin
            kelulusan exam.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, "1");
            setDismissed(true);
          }}
          className="rounded-md border border-amber-300/30 px-2.5 py-1 text-[11px] font-bold text-amber-100/90 transition hover:bg-amber-300/10"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}
