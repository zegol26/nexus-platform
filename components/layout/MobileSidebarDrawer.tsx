"use client";

import { useState } from "react";

export function MobileSidebarDrawer({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={`Open ${label} navigation`}
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-lg shadow-slate-950/10 lg:hidden"
      >
        <span className="space-y-1.5">
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setOpen(false)}
          />

          <div className="absolute inset-y-0 left-0 w-[min(22rem,88vw)] overflow-y-auto bg-white shadow-2xl shadow-slate-950/25">
            <div className="sticky top-0 z-10 flex justify-end border-b border-slate-200 bg-white/95 p-3 backdrop-blur">
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-xl font-semibold text-slate-700"
              >
                x
              </button>
            </div>
            {children}
          </div>
        </div>
      ) : null}
    </>
  );
}
