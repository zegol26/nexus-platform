"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function MobileSidebarDrawer({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      setOpen(false);
    }
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        aria-label={`Open ${label} navigation`}
        aria-expanded={open}
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

          <div
            className="absolute inset-y-0 left-0 w-[min(20rem,86vw)] overflow-y-auto bg-white shadow-2xl shadow-slate-950/25"
            onClick={(event) => {
              const target = event.target as HTMLElement | null;
              if (target?.closest("a")) {
                setOpen(false);
              }
            }}
          >
            <div className="sticky top-0 z-10 flex justify-end border-b border-slate-200 bg-white/95 p-2 backdrop-blur">
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-lg font-semibold text-slate-700"
              >
                ×
              </button>
            </div>
            {children}
          </div>
        </div>
      ) : null}
    </>
  );
}
