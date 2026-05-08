"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { publicHeroCatalog } from "@/lib/game/public-config";

const auraDot: Record<string, string> = {
  cyan: "bg-cyan-400 shadow-cyan-400/60",
  rose: "bg-rose-400 shadow-rose-400/60",
  emerald: "bg-emerald-400 shadow-emerald-400/60",
  violet: "bg-violet-400 shadow-violet-400/60",
  amber: "bg-amber-300 shadow-amber-300/60",
};

const auraRing: Record<string, string> = {
  cyan: "ring-cyan-400/70 from-cyan-500/40 to-sky-500/30",
  rose: "ring-rose-400/70 from-rose-500/40 to-orange-500/30",
  emerald: "ring-emerald-400/70 from-emerald-500/40 to-teal-500/30",
  violet: "ring-violet-400/70 from-violet-500/40 to-indigo-500/30",
  amber: "ring-amber-300/70 from-amber-400/40 to-orange-500/30",
};

export function HeroSelectionModal({
  defaultHeroKey,
  onConfirm,
}: {
  defaultHeroKey?: string;
  onConfirm: (heroKey: string) => Promise<void> | void;
}) {
  const [selected, setSelected] = useState<string>(defaultHeroKey ?? publicHeroCatalog[0].key);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultHeroKey) setSelected(defaultHeroKey);
  }, [defaultHeroKey]);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunci hero.");
    } finally {
      setSubmitting(false);
    }
  }

  const current = publicHeroCatalog.find((hero) => hero.key === selected) ?? publicHeroCatalog[0];

  return (
    <div className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-slate-950/90 p-4 backdrop-blur-md sm:items-center">
      <div className="relative my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-amber-300/40 bg-gradient-to-b from-slate-950 via-indigo-950/50 to-slate-950 text-white shadow-2xl shadow-amber-700/30">
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_60%)]" />
        <div className="pointer-events-none absolute -inset-px rounded-3xl border border-white/5" />

        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_280px] lg:p-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-amber-300">
              Ritual Penobatan Hero
            </p>
            <h3 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
              Pilih hero untuk memimpin kerajaanmu
            </h3>
            <p className="mt-2 text-xs leading-5 text-slate-300/90 sm:text-sm">
              Sistem sudah memilihkan hero acak untukmu. Kamu boleh menerima takdir ini, atau
              mengganti dengan salah satu dari lima legenda di bawah.{" "}
              <span className="font-bold text-amber-200">Pilihan ini hanya bisa dilakukan satu kali.</span>
            </p>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {publicHeroCatalog.map((hero) => {
                const active = hero.key === selected;
                const ring = auraRing[hero.aura] ?? auraRing.cyan;
                return (
                  <button
                    key={hero.key}
                    type="button"
                    onClick={() => setSelected(hero.key)}
                    className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3 text-left transition ${
                      active
                        ? `border-amber-300/70 bg-gradient-to-br ${ring} ring-2 ring-offset-2 ring-offset-slate-950 shadow-lg shadow-amber-700/30`
                        : "border-slate-700 bg-slate-900/40 hover:border-amber-300/50 hover:bg-slate-900/60"
                    }`}
                  >
                    <span className={`relative flex h-14 w-14 shrink-0 overflow-hidden rounded-xl border ${active ? "border-amber-300/60" : "border-slate-700"} bg-slate-950`}>
                      <Image
                        src={hero.image}
                        alt={hero.name}
                        fill
                        sizes="56px"
                        className="object-cover object-top"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full shadow-[0_0_8px] ${auraDot[hero.aura] ?? auraDot.cyan}`} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200/80">
                          {hero.title}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-sm font-bold text-white">{hero.name}</span>
                      <span className="mt-0.5 block text-[11px] font-semibold text-slate-300/80">
                        {hero.style}
                      </span>
                    </span>
                    {active ? (
                      <span className="absolute right-2 top-2 rounded-full bg-amber-300 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-950">
                        Pilihan
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-2xl border border-amber-300/30 bg-slate-950/70 p-4">
            <div className="relative h-48 overflow-hidden rounded-xl bg-gradient-to-b from-slate-900 to-slate-950">
              <Image
                key={current.image}
                src={current.image}
                alt={current.name}
                fill
                sizes="280px"
                className="object-contain object-bottom hero-float-bounce"
              />
              <span
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(60% 50% at 50% 60%, rgba(251,191,36,0.28), transparent 70%)",
                  filter: "blur(20px)",
                }}
              />
            </div>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">
              {current.title}
            </p>
            <h4 className="mt-1 text-lg font-black text-white">{current.name}</h4>
            <p className="mt-1 text-xs leading-5 text-slate-300/90">{current.bestFor}</p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-rose-400/30 bg-rose-950/30 px-3 py-2 text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-rose-300">ATK Bonus</p>
                <p className="mt-1 text-base font-black text-rose-100">×{current.attackBonus.toFixed(2)}</p>
              </div>
              <div className="rounded-xl border border-cyan-400/30 bg-cyan-950/30 px-3 py-2 text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-300">DEF Bonus</p>
                <p className="mt-1 text-base font-black text-cyan-100">×{current.defenseBonus.toFixed(2)}</p>
              </div>
            </div>
          </aside>
        </div>

        {error ? (
          <div className="relative mx-5 mb-3 rounded-2xl border border-rose-400/40 bg-rose-950/40 px-4 py-2 text-xs font-semibold text-rose-100 sm:mx-7">
            {error}
          </div>
        ) : null}

        <div className="relative flex flex-col gap-3 border-t border-amber-300/20 bg-slate-950/70 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-[11px] font-semibold text-slate-400">
            Pilihan ini permanen. Pastikan sebelum konfirmasi.
          </p>
          <button
            type="button"
            disabled={submitting}
            onClick={handleConfirm}
            className="w-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-700/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "Mengunci..." : `Tetapkan ${current.name}`}
          </button>
        </div>
      </div>
    </div>
  );
}
