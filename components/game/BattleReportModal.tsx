"use client";

import { useMemo } from "react";
import { publicResourceLabels } from "@/lib/game/public-config";
import type { GameResources } from "@/lib/game/config";

type CasualtyEntry = {
  unitKey: string;
  unitName: string;
  before: number;
  lost: number;
  after: number;
};

export type BattleReport = {
  id: string;
  result: string;
  attackerPower: number;
  defenderPower: number;
  stolen: Partial<GameResources>;
  attackerCasualties: CasualtyEntry[];
  defenderCasualties: CasualtyEntry[];
  snapshotJson?: { defenderName?: string; ratio?: number; stealPercent?: number };
};

const RESOURCE_ICONS: Record<keyof GameResources, string> = {
  wood: "🌲",
  food: "🍙",
  stone: "🪨",
  silver: "⚔️",
  gold: "👑",
};

type Tone = "victory-major" | "victory-normal" | "victory-minor" | "defeat";

const TONE_THEME: Record<Tone, {
  bg: string;
  ring: string;
  badge: string;
  badgeText: string;
  accent: string;
  glow: string;
  banner: string;
  cta: string;
}> = {
  "victory-major": {
    bg: "from-amber-500/30 via-slate-950 to-orange-700/30",
    ring: "border-amber-300/60",
    badge: "from-amber-300 via-orange-400 to-rose-500",
    badgeText: "text-slate-950",
    accent: "text-amber-200",
    glow: "shadow-amber-500/40",
    banner: "Kemenangan Telak",
    cta: "from-amber-400 via-orange-500 to-rose-500",
  },
  "victory-normal": {
    bg: "from-emerald-500/20 via-slate-950 to-cyan-700/20",
    ring: "border-emerald-300/50",
    badge: "from-emerald-300 via-cyan-400 to-sky-500",
    badgeText: "text-slate-950",
    accent: "text-emerald-200",
    glow: "shadow-emerald-500/30",
    banner: "Kemenangan",
    cta: "from-emerald-400 via-cyan-400 to-sky-400",
  },
  "victory-minor": {
    bg: "from-cyan-500/15 via-slate-950 to-violet-700/20",
    ring: "border-cyan-300/40",
    badge: "from-cyan-300 via-violet-400 to-indigo-500",
    badgeText: "text-slate-950",
    accent: "text-cyan-200",
    glow: "shadow-cyan-500/25",
    banner: "Kemenangan Tipis",
    cta: "from-cyan-400 via-violet-400 to-indigo-500",
  },
  defeat: {
    bg: "from-rose-700/30 via-slate-950 to-slate-950",
    ring: "border-rose-400/50",
    badge: "from-slate-300 via-slate-500 to-slate-700",
    badgeText: "text-slate-100",
    accent: "text-rose-200",
    glow: "shadow-rose-700/40",
    banner: "Pasukan Mundur",
    cta: "from-rose-500 via-slate-500 to-slate-700",
  },
};

const NARRATIVES: Record<string, { headline: string; story: string; tone: Tone }> = {
  ATTACKER_LOSS: {
    headline: "Pasukanmu dipukul mundur",
    story:
      "Garis pertahanan musuh terlalu kuat. Komandan menarik mundur sisa pasukan sebelum kerugian membesar — hanya secercah jarahan yang berhasil dibawa pulang.",
    tone: "defeat",
  },
  MINOR_WIN: {
    headline: "Kemenangan tipis di garis depan",
    story:
      "Pertempuran berlangsung sengit. Pasukanmu menguasai medan dengan susah payah, dan jarahan yang berhasil diambil masih sederhana.",
    tone: "victory-minor",
  },
  NORMAL_WIN: {
    headline: "Pertahanan musuh runtuh",
    story:
      "Pasukanmu menerobos tembok pertahanan. Gudang resource musuh dijarah dengan tertib, dan korban di pihakmu masih dapat dikendalikan.",
    tone: "victory-normal",
  },
  MAJOR_WIN: {
    headline: "Kemenangan telak — kastel goyah",
    story:
      "Komando defender kacau. Pasukanmu mendominasi medan dan menyabotase perbendaharaan; gerbong jarahan pulang penuh muatan.",
    tone: "victory-major",
  },
  FULL_DAMAGE: {
    headline: "Annihilasi total!",
    story:
      "Garrison musuh dilumpuhkan dalam satu gelombang. Setengah perbendaharaannya kini berkibar di benderamu, dan musuh kehilangan separuh prajuritnya.",
    tone: "victory-major",
  },
};

export function BattleReportModal({
  report,
  onClose,
}: {
  report: BattleReport;
  onClose: () => void;
}) {
  const narrative = NARRATIVES[report.result] ?? NARRATIVES.NORMAL_WIN;
  const theme = TONE_THEME[narrative.tone];
  const isVictory = narrative.tone !== "defeat";

  const stolen = useMemo(() => {
    return (Object.entries(report.stolen ?? {}) as Array<[keyof GameResources, number]>)
      .map(([key, amount]) => ({ key, amount: Number(amount ?? 0) }))
      .filter((entry) => entry.amount > 0);
  }, [report.stolen]);

  const totalStolen = stolen.reduce((sum, entry) => sum + entry.amount, 0);

  const attackerLost = useMemo(() => {
    return (report.attackerCasualties ?? []).filter((entry) => entry.lost > 0);
  }, [report.attackerCasualties]);

  const defenderLost = useMemo(() => {
    return (report.defenderCasualties ?? []).filter((entry) => entry.lost > 0);
  }, [report.defenderCasualties]);

  const attackerLostTotal = attackerLost.reduce((sum, entry) => sum + entry.lost, 0);
  const defenderLostTotal = defenderLost.reduce((sum, entry) => sum + entry.lost, 0);
  const ratio = report.snapshotJson?.ratio ?? report.attackerPower / Math.max(1, report.defenderPower);
  const stealPct = Math.round((report.snapshotJson?.stealPercent ?? 0) * 100);

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-md sm:items-center">
      <div
        className={`relative my-auto w-full max-w-xl overflow-hidden rounded-3xl border ${theme.ring} bg-gradient-to-b ${theme.bg} text-white shadow-2xl ${theme.glow}`}
      >
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
        {isVictory ? <SparkleField /> : null}

        <div className="relative p-6 sm:p-7">
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-[0.32em] ${theme.accent}`}>
                {theme.banner}
              </p>
              <h3 className="mt-2 text-xl font-black leading-tight sm:text-3xl">
                {narrative.headline}
              </h3>
              <p className="mt-2 max-w-md text-xs leading-5 text-slate-300/90 sm:text-sm">
                vs <span className="font-bold text-white">{report.snapshotJson?.defenderName ?? "Defender"}</span>
                {" · "}rasio kekuatan{" "}
                <span className="font-bold text-white">{ratio.toFixed(2)}×</span>
              </p>
            </div>
            <span
              className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${theme.badge} text-2xl font-black ${theme.badgeText} shadow-xl`}
            >
              {isVictory ? "★" : "✕"}
            </span>
          </div>

          <p className="mt-3 text-xs leading-6 text-slate-300/90 sm:text-sm">{narrative.story}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <PowerCard
              label="Pasukanmu"
              power={report.attackerPower}
              lost={attackerLostTotal}
              tone={isVictory ? "ally-win" : "ally-loss"}
            />
            <PowerCard
              label={report.snapshotJson?.defenderName ?? "Defender"}
              power={report.defenderPower}
              lost={defenderLostTotal}
              tone={isVictory ? "enemy-loss" : "enemy-win"}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-amber-300/30 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-300">
                Resource Dijarah
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-200/70">
                {stealPct > 0 ? `${stealPct}% perbendaharaan` : "—"}
              </p>
            </div>
            {stolen.length === 0 ? (
              <p className="mt-2 text-sm text-slate-300">
                Tidak ada resource yang berhasil dijarah dalam pertempuran ini.
              </p>
            ) : (
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs sm:grid-cols-5">
                {stolen.map((entry) => (
                  <div
                    key={entry.key}
                    className="rounded-xl border border-amber-400/30 bg-gradient-to-b from-amber-500/15 to-transparent px-2 py-2 text-center"
                  >
                    <p className="text-base">{RESOURCE_ICONS[entry.key]}</p>
                    <p className="mt-0.5 text-sm font-black text-amber-200">+{entry.amount.toLocaleString("en")}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider text-amber-100/70">
                      {publicResourceLabels[entry.key]}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {totalStolen > 0 ? (
              <p className="mt-2 text-[11px] font-semibold text-amber-200/70">
                Total dibawa pulang: <span className="text-amber-100">{totalStolen.toLocaleString("en")} unit resource</span>
              </p>
            ) : null}
          </div>

          {(attackerLost.length > 0 || defenderLost.length > 0) && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <CasualtyBlock
                title="Korban di pihakmu"
                accent="rose"
                entries={attackerLost}
                empty="Tidak ada korban — pasukanmu pulang utuh."
              />
              <CasualtyBlock
                title="Korban defender"
                accent="cyan"
                entries={defenderLost}
                empty="Defender berhasil mempertahankan barisan."
              />
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] font-semibold text-slate-400">
              Battle log tersimpan otomatis. Cooldown 6 jam terhadap target ini.
            </p>
            <button
              type="button"
              onClick={onClose}
              className={`w-full rounded-full bg-gradient-to-r ${theme.cta} px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-black/40 transition hover:brightness-110 sm:w-auto`}
            >
              Lanjut komando →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PowerCard({
  label,
  power,
  lost,
  tone,
}: {
  label: string;
  power: number;
  lost: number;
  tone: "ally-win" | "ally-loss" | "enemy-loss" | "enemy-win";
}) {
  const palette =
    tone === "ally-win"
      ? "border-emerald-400/40 bg-emerald-950/40 text-emerald-100"
      : tone === "ally-loss"
        ? "border-rose-400/40 bg-rose-950/40 text-rose-100"
        : tone === "enemy-loss"
          ? "border-slate-700 bg-slate-950/60 text-slate-200"
          : "border-amber-400/40 bg-amber-950/30 text-amber-100";
  return (
    <div className={`rounded-2xl border p-3 ${palette}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-black">{power.toLocaleString("en")}</p>
      <p className="mt-1 text-[11px] font-semibold opacity-80">
        Pasukan hilang: <span className="font-bold">{lost.toLocaleString("en")}</span>
      </p>
    </div>
  );
}

function CasualtyBlock({
  title,
  entries,
  empty,
  accent,
}: {
  title: string;
  entries: CasualtyEntry[];
  empty: string;
  accent: "rose" | "cyan";
}) {
  const ring = accent === "rose" ? "border-rose-400/30" : "border-cyan-400/30";
  const text = accent === "rose" ? "text-rose-300" : "text-cyan-300";
  const chip = accent === "rose" ? "bg-rose-500/10 text-rose-100" : "bg-cyan-500/10 text-cyan-100";
  return (
    <div className={`rounded-2xl border ${ring} bg-slate-950/60 p-3`}>
      <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${text}`}>{title}</p>
      {entries.length === 0 ? (
        <p className="mt-2 text-xs text-slate-400">{empty}</p>
      ) : (
        <div className="mt-2 space-y-1.5 text-xs">
          {entries.map((entry) => (
            <div
              key={entry.unitKey}
              className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 ${chip}`}
            >
              <span className="font-semibold">{entry.unitName}</span>
              <span className="font-mono">
                {entry.before} → {entry.after}{" "}
                <span className={accent === "rose" ? "text-rose-400" : "text-cyan-400"}>(-{entry.lost})</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SparkleField() {
  const sparks = [
    { left: "12%", top: "18%", delay: "0s", size: 6 },
    { left: "82%", top: "22%", delay: "0.6s", size: 5 },
    { left: "30%", top: "10%", delay: "1.1s", size: 4 },
    { left: "65%", top: "70%", delay: "1.6s", size: 5 },
    { left: "20%", top: "80%", delay: "2.0s", size: 4 },
    { left: "90%", top: "55%", delay: "2.4s", size: 6 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {sparks.map((spark, idx) => (
        <span
          key={idx}
          className="hero-spark absolute rounded-full bg-amber-200"
          style={{
            left: spark.left,
            top: spark.top,
            width: spark.size,
            height: spark.size,
            animationDelay: spark.delay,
            boxShadow: "0 0 12px rgba(253,224,71,0.85)",
          }}
        />
      ))}
    </div>
  );
}
