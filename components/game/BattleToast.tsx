"use client";

import { useEffect, useMemo, useState } from "react";

export type BattleToastKind =
  | "SHIELD_ACTIVE"
  | "COOLDOWN_ACTIVE"
  | "CONTINENT_LOCKED"
  | "INVALID_TARGET"
  | "ERROR";

export type BattleToastData = {
  id: string;
  kind: BattleToastKind;
  title: string;
  message: string;
  meta?: {
    shieldUntil?: string;
    cooldownEnds?: string;
    defenderName?: string;
    requiredLevel?: number;
    currentLevel?: number;
  };
  durationMs?: number;
};

const TONE: Record<BattleToastKind, {
  icon: string;
  ring: string;
  bg: string;
  iconBg: string;
  title: string;
  bar: string;
}> = {
  SHIELD_ACTIVE: {
    icon: "🛡️",
    ring: "border-cyan-400/50",
    bg: "from-cyan-950/90 via-slate-950 to-slate-950",
    iconBg: "from-cyan-400 to-sky-500",
    title: "text-cyan-200",
    bar: "from-cyan-400 to-sky-500",
  },
  COOLDOWN_ACTIVE: {
    icon: "⏳",
    ring: "border-amber-400/50",
    bg: "from-amber-950/90 via-slate-950 to-slate-950",
    iconBg: "from-amber-400 to-orange-500",
    title: "text-amber-200",
    bar: "from-amber-400 to-orange-500",
  },
  CONTINENT_LOCKED: {
    icon: "🗺️",
    ring: "border-violet-400/50",
    bg: "from-violet-950/90 via-slate-950 to-slate-950",
    iconBg: "from-violet-400 to-indigo-500",
    title: "text-violet-200",
    bar: "from-violet-400 to-indigo-500",
  },
  INVALID_TARGET: {
    icon: "⚠️",
    ring: "border-rose-400/50",
    bg: "from-rose-950/90 via-slate-950 to-slate-950",
    iconBg: "from-rose-400 to-orange-500",
    title: "text-rose-200",
    bar: "from-rose-400 to-orange-500",
  },
  ERROR: {
    icon: "✕",
    ring: "border-rose-400/50",
    bg: "from-rose-950/90 via-slate-950 to-slate-950",
    iconBg: "from-rose-400 to-rose-700",
    title: "text-rose-200",
    bar: "from-rose-400 to-rose-700",
  },
};

export function BattleToastStack({
  toasts,
  onDismiss,
}: {
  toasts: BattleToastData[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[110] flex w-[min(calc(100vw-2rem),22rem)] flex-col gap-3 sm:right-6 sm:top-24">
      {toasts.map((toast) => (
        <BattleToast key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function BattleToast({ toast, onDismiss }: { toast: BattleToastData; onDismiss: () => void }) {
  const tone = TONE[toast.kind] ?? TONE.ERROR;
  const duration = toast.durationMs ?? 7000;
  const [progress, setProgress] = useState(100);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const start = Date.now();
    const initial = progress;
    let raf = 0;
    const tick = () => {
      const elapsed = Date.now() - start;
      const next = Math.max(0, initial - (elapsed / duration) * 100);
      setProgress(next);
      if (next <= 0) {
        onDismiss();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const detail = useMemo(() => buildDetail(toast), [toast]);

  return (
    <div
      role="status"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${tone.ring} bg-gradient-to-br ${tone.bg} text-white shadow-2xl shadow-slate-950/60 backdrop-blur-md transition hover:-translate-y-0.5 toast-slide-in`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
      <div className="relative flex gap-3 p-3.5">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${tone.iconBg} text-xl shadow-inner`}>
          <span aria-hidden="true">{tone.icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${tone.title}`}>
            {toast.title}
          </p>
          <p className="mt-0.5 text-sm font-semibold leading-snug text-white">
            {toast.message}
          </p>
          {detail ? (
            <p className="mt-1 text-[11px] leading-5 text-slate-300/90">{detail}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Tutup notifikasi"
          className="-mr-1 -mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          ×
        </button>
      </div>
      <div className="relative h-1 w-full bg-slate-800/70">
        <div
          className={`h-full bg-gradient-to-r ${tone.bar} transition-[width] duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function buildDetail(toast: BattleToastData) {
  const meta = toast.meta;
  if (!meta) return null;
  if (toast.kind === "SHIELD_ACTIVE" && meta.shieldUntil) {
    return `Shield ${meta.defenderName ?? "target"} aktif sampai ${formatRelativeTo(meta.shieldUntil)} (${formatClock(meta.shieldUntil)}). Coba target lain dulu.`;
  }
  if (toast.kind === "COOLDOWN_ACTIVE" && meta.cooldownEnds) {
    return `Cooldown 6 jam — bisa attack ${meta.defenderName ?? "target"} ini lagi ${formatRelativeTo(meta.cooldownEnds)} (${formatClock(meta.cooldownEnds)}).`;
  }
  if (toast.kind === "CONTINENT_LOCKED" && typeof meta.requiredLevel === "number") {
    return `Naikkan kastel ke Lv ${meta.requiredLevel} (sekarang Lv ${meta.currentLevel ?? "?"}) untuk membuka cross-continent attack.`;
  }
  return null;
}

function formatRelativeTo(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "sebentar lagi";
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `dalam ${minutes} menit`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `dalam ${hours} jam`;
  const days = Math.round(hours / 24);
  return `dalam ${days} hari`;
}

function formatClock(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}
