"use client";

import { useEffect, useMemo, useState } from "react";
import { publicResourceLabels } from "@/lib/game/public-config";
import type { GameResources } from "@/lib/game/config";

type CasualtyEntry = {
  unitKey: string;
  unitName: string;
  before: number;
  lost: number;
  after: number;
};

type IncomingAttack = {
  id: string;
  result: string;
  attackerPower: number;
  defenderPower: number;
  createdAt: string;
  continent: string;
  stolenResourcesJson: Partial<GameResources>;
  defenderCasualtiesJson: CasualtyEntry[] | null;
  attacker: { name: string; continent: string; castleLevel: number };
};

export function AttackNotificationModal({
  incoming,
  onAcknowledge,
}: {
  incoming: IncomingAttack[];
  onAcknowledge: () => void;
}) {
  const [index, setIndex] = useState(0);
  const total = incoming.length;
  const current = incoming[index];

  useEffect(() => {
    const timer = window.setTimeout(() => setIndex(0), 0);
    return () => window.clearTimeout(timer);
  }, [incoming]);

  const stolen = useMemo(() => {
    if (!current) return [] as Array<{ key: keyof GameResources; amount: number }>;
    const entries = Object.entries(current.stolenResourcesJson ?? {}) as Array<[
      keyof GameResources,
      number
    ]>;
    return entries
      .map(([key, amount]) => ({ key, amount: Number(amount ?? 0) }))
      .filter((entry) => entry.amount > 0);
  }, [current]);

  const totalLost = useMemo(() => {
    if (!current?.defenderCasualtiesJson) return 0;
    return current.defenderCasualtiesJson.reduce((sum, item) => sum + item.lost, 0);
  }, [current]);

  if (!current) return null;

  function next() {
    if (index < total - 1) setIndex(index + 1);
    else onAcknowledge();
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-md sm:items-center">
      <div className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-rose-500/40 bg-gradient-to-b from-slate-950 via-rose-950/40 to-slate-950 p-5 text-white shadow-2xl shadow-rose-900/40 sm:p-6">
        <div className="pointer-events-none absolute inset-0 opacity-50 [background:radial-gradient(circle_at_top,rgba(244,63,94,0.25),transparent_55%)]" />
        <div className="pointer-events-none absolute -inset-px rounded-3xl border border-rose-400/30" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-rose-300">
              Kingdom Diserang
            </p>
            <p className="text-[11px] font-semibold text-rose-200/70">
              {index + 1} / {total}
            </p>
          </div>

          <h3 className="mt-2 text-2xl font-bold leading-tight">
            {current.attacker.name} menyerang!
          </h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-200/80">
            {current.attacker.continent} · Kastel Lv {current.attacker.castleLevel} · {formatRelative(current.createdAt)}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-rose-300">
                Power Battle
              </p>
              <p className="mt-2 text-base font-semibold text-white">
                ATK <span className="text-rose-200">{current.attackerPower}</span> vs DEF{" "}
                <span className="text-cyan-200">{current.defenderPower}</span>
              </p>
              <p className="mt-1 text-xs text-rose-200/80">
                Hasil: <span className="font-bold uppercase">{formatResult(current.result)}</span>
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-300">
                Pasukan Hilang
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-100">
                -{totalLost.toLocaleString("en")}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-amber-200/80">
                Total unit defender tewas
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-slate-950/60 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-300">
              Resource Dijarah
            </p>
            {stolen.length === 0 ? (
              <p className="mt-2 text-sm text-slate-300">Tidak ada resource yang berhasil dijarah.</p>
            ) : (
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                {stolen.map((entry) => (
                  <div
                    key={entry.key}
                    className="rounded-xl border border-amber-400/30 bg-gradient-to-b from-amber-500/10 to-transparent px-2 py-2 text-center"
                  >
                    <p className="font-bold text-amber-200">-{entry.amount.toLocaleString("en")}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider text-amber-100/70">
                      {publicResourceLabels[entry.key]}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {current.defenderCasualtiesJson && current.defenderCasualtiesJson.some((entry) => entry.lost > 0) ? (
            <div className="mt-4 rounded-2xl border border-rose-500/30 bg-slate-950/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-rose-300">
                Detail Kerugian Pasukan
              </p>
              <div className="mt-2 space-y-1.5 text-xs">
                {current.defenderCasualtiesJson
                  .filter((entry) => entry.lost > 0)
                  .map((entry) => (
                    <div
                      key={entry.unitKey}
                      className="flex items-center justify-between rounded-lg bg-rose-500/10 px-3 py-1.5"
                    >
                      <span className="font-semibold text-rose-100">{entry.unitName}</span>
                      <span className="font-mono text-rose-200">
                        {entry.before} → {entry.after} <span className="text-rose-400">(-{entry.lost})</span>
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onAcknowledge}
              className="rounded-full border border-slate-600 bg-slate-900/60 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300 transition hover:bg-slate-800"
            >
              Tandai semua dibaca
            </button>
            <button
              type="button"
              onClick={next}
              className="rounded-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-rose-700/40 transition hover:brightness-110"
            >
              {index < total - 1 ? "Notifikasi Berikutnya →" : "Mengerti, lanjut"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRelative(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

function formatResult(result: string) {
  return result.replaceAll("_", " ").toLowerCase();
}
