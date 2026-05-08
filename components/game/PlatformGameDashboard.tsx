"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { CastleVisual } from "@/components/nihongo/game/CastleVisual";
import { AttackNotificationModal } from "@/components/game/AttackNotificationModal";
import { BattleReportModal, type BattleReport } from "@/components/game/BattleReportModal";
import { BattleToastStack, type BattleToastData, type BattleToastKind } from "@/components/game/BattleToast";
import { HeroSelectionModal } from "@/components/game/HeroSelectionModal";
import { getCastleStage } from "@/lib/game/castle-stages";
import { getContinentMeta } from "@/lib/game/continents";
import type { GameResources } from "@/lib/game/config";
import { publicConversions, publicDeckCards, publicResourceLabels, publicUnitCatalog } from "@/lib/game/public-config";

type GameDashboardMode = "platform" | "nihongo";

type Kingdom = {
  id: string;
  name: string;
  continent: string;
  level: number;
  castleLevel: number;
  xp: number;
  resources: GameResources;
  attackPower: number;
  defensePower: number;
  hero: { name: string; style: string; bestFor: string; image?: string; aura?: string; title?: string };
  heroKey?: string;
  heroSelectedAt?: string | null;
  attackWeapon: { name: string; powerHint: string };
  defenseWeapon: { name: string; powerHint: string };
  armyUnits?: Array<{ unitKey: string; quantity: number; defenseQuantity: number }>;
  cards?: Array<{ cardKey: string; quantity: number; equipped: boolean }>;
};

type BattleLog = {
  id: string;
  result: string;
  attackerPower: number;
  defenderPower: number;
  createdAt: string;
  attacker?: { name: string };
  defender?: { name: string };
};

type IncomingAttack = {
  id: string;
  result: string;
  attackerPower: number;
  defenderPower: number;
  createdAt: string;
  continent: string;
  stolenResourcesJson: Partial<GameResources>;
  defenderCasualtiesJson: Array<{ unitKey: string; unitName: string; before: number; lost: number; after: number }> | null;
  attacker: { name: string; continent: string; castleLevel: number };
};

const RESOURCE_ICONS: Record<keyof GameResources, string> = {
  wood: "🌲",
  food: "🍙",
  stone: "🪨",
  silver: "⚔️",
  gold: "👑",
};

export function PlatformGameDashboard({ mode }: { mode: GameDashboardMode }) {
  const [kingdom, setKingdom] = useState<Kingdom | null>(null);
  const [leaderboard, setLeaderboard] = useState<Kingdom[]>([]);
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([]);
  const [targets, setTargets] = useState<Kingdom[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Preparing your kingdom...");
  const [busy, setBusy] = useState("");
  const [incoming, setIncoming] = useState<IncomingAttack[]>([]);
  const [showIncoming, setShowIncoming] = useState(false);
  const [battleReport, setBattleReport] = useState<BattleReport | null>(null);
  const [toasts, setToasts] = useState<BattleToastData[]>([]);
  const toastIdRef = useRef(0);

  function pushToast(toast: Omit<BattleToastData, "id">) {
    toastIdRef.current += 1;
    const id = `battle-toast-${toastIdRef.current}`;
    setToasts((current) => [...current, { ...toast, id }]);
  }

  function dismissToast(id: string) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  const loadTargets = useCallback(async () => {
    const response = await fetch("/api/game/targets", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) setTargets(payload.targets ?? []);
  }, []);

  const loadIncoming = useCallback(async () => {
    const response = await fetch("/api/game/battle/incoming", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) {
      const list: IncomingAttack[] = payload.incoming ?? [];
      setIncoming(list);
      if (list.length > 0) setShowIncoming(true);
    }
  }, []);

  const loadGame = useCallback(async () => {
    setLoading(true);
    setMessage("Preparing your kingdom...");
    const response = await fetch("/api/game/me", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) {
      setKingdom(payload.kingdom);
      setLeaderboard(payload.leaderboard ?? []);
      setBattleLogs(payload.battleLogs ?? []);
      await Promise.all([loadTargets(), loadIncoming()]);
    } else {
      setMessage(payload.error ?? "Gagal memuat kerajaan.");
    }
    setLoading(false);
  }, [loadTargets, loadIncoming]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadGame();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadGame]);

  async function postAction(endpoint: string, body?: Record<string, unknown>, nextMessage = "Sedang memproses data...") {
    setBusy(nextMessage);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(payload.error ?? "Aksi belum berhasil.");
    else setMessage(payload.reason ?? "Aksi berhasil disimpan.");
    await loadGame();
    setBusy("");
  }

  async function confirmHero(heroKey: string) {
    const response = await fetch("/api/game/hero/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroKey }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error ?? "Gagal mengunci hero.");
    }
    await loadGame();
  }

  async function attackTarget(targetKingdomId: string, targetName: string) {
    setBusy(`Melancarkan serangan ke ${targetName}...`);
    const response = await fetch("/api/game/battle/attack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetKingdomId }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const titleMap: Record<BattleToastKind, string> = {
        SHIELD_ACTIVE: "Target Terlindungi Shield",
        COOLDOWN_ACTIVE: "Cooldown Masih Berjalan",
        CONTINENT_LOCKED: "Cross-Continent Terkunci",
        INVALID_TARGET: "Target Tidak Valid",
        ERROR: "Serangan Gagal",
      };
      const rawCode = typeof payload.code === "string" ? payload.code : "ERROR";
      const code: BattleToastKind = (rawCode in titleMap ? rawCode : "ERROR") as BattleToastKind;
      pushToast({
        kind: code,
        title: titleMap[code],
        message: payload.error ?? "Serangan tidak dapat diluncurkan.",
        meta: payload.meta ?? undefined,
        durationMs: code === "SHIELD_ACTIVE" || code === "COOLDOWN_ACTIVE" ? 9000 : 6500,
      });
      setBusy("");
      return;
    }
    const battle = payload.battle;
    if (battle) {
      setBattleReport({
        id: battle.id,
        result: battle.result,
        attackerPower: battle.attackerPower,
        defenderPower: battle.defenderPower,
        stolen: battle.stolen ?? battle.stolenResourcesJson ?? {},
        attackerCasualties: battle.attackerCasualties ?? [],
        defenderCasualties: battle.defenderCasualties ?? [],
        snapshotJson: battle.snapshotJson,
      });
    }
    await loadGame();
    setBusy("");
    setMessage("");
  }

  async function acknowledgeIncoming() {
    setShowIncoming(false);
    await fetch("/api/game/battle/ack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setIncoming([]);
  }

  const stageMeta = useMemo(() => getCastleStage(kingdom?.castleLevel ?? 1), [kingdom?.castleLevel]);
  const continentMeta = useMemo(() => getContinentMeta(kingdom?.continent), [kingdom?.continent]);

  if (loading && !kingdom) {
    return (
      <div className="rounded-[2rem] border border-amber-300/20 bg-slate-950 p-8 text-center text-amber-100 shadow-2xl">
        <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-2 border-amber-300/30 border-t-amber-300" />
        {message}
      </div>
    );
  }

  if (!kingdom) {
    return (
      <div className="rounded-[2rem] border border-rose-400/40 bg-rose-950/40 p-8 text-rose-100">
        {message || "Kerajaan belum bisa dimuat."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {showIncoming && incoming.length > 0 ? (
        <AttackNotificationModal incoming={incoming} onAcknowledge={acknowledgeIncoming} />
      ) : null}

      {battleReport ? (
        <BattleReportModal report={battleReport} onClose={() => setBattleReport(null)} />
      ) : null}

      <BattleToastStack toasts={toasts} onDismiss={dismissToast} />

      {kingdom && !kingdom.heroSelectedAt ? (
        <HeroSelectionModal defaultHeroKey={kingdom.heroKey} onConfirm={confirmHero} />
      ) : null}

      <ContinentBanner kingdom={kingdom} mode={mode} continentImage={continentMeta.image} continentTagline={continentMeta.tagline} accent={continentMeta.accent} />

      {message ? (
        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-950/30 p-3 text-sm font-semibold text-cyan-200">
          {message}
        </div>
      ) : null}
      {busy ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-950/30 p-3 text-sm font-semibold text-amber-200">
          {busy}
        </div>
      ) : null}

      {/* Hero / kingdom card */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <div className="relative overflow-hidden rounded-[2rem] border border-amber-400/20 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-5 shadow-2xl shadow-slate-950/50">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-amber-300">
                {kingdom.continent}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                {kingdom.name}
              </h2>
              <p className="mt-2 text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
                Hero <span className="font-bold text-amber-200">{kingdom.hero.name}</span>
                {kingdom.hero.title ? <span className="text-slate-400"> · {kingdom.hero.title}</span> : null} · {kingdom.hero.style}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                ATK {kingdom.attackWeapon.name} · DEF {kingdom.defenseWeapon.name}
              </p>
            </div>
            <RankBadge level={kingdom.level} castleLevel={kingdom.castleLevel} stageName={stageMeta.name} />
          </div>

          <div className="relative mt-5">
            <CastleVisual
              castleLevel={kingdom.castleLevel}
              stage={stageMeta.name}
              hero={kingdom.hero}
            />
          </div>

          <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
            <PowerMetric label="XP" value={kingdom.xp} accent="from-emerald-400 to-cyan-400" icon="⭐" />
            <PowerMetric label="Army Power" value={kingdom.attackPower} accent="from-rose-400 to-amber-400" icon="🗡️" />
            <PowerMetric label="Defense Power" value={kingdom.defensePower} accent="from-cyan-400 to-indigo-400" icon="🛡️" />
          </div>
        </div>

        <div className="space-y-5">
          <Panel title="Resource Treasury" subtitle="Hasil belajar dijarah saat kalah">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-2">
              {(Object.keys(kingdom.resources) as Array<keyof GameResources>).map((key) => (
                <ResourceTile key={key} resourceKey={key} amount={kingdom.resources[key]} />
              ))}
            </div>
          </Panel>

          <Panel title="Konversi Resource" subtitle="Tukar di pasar antar-benteng">
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(publicConversions).map(([key, conversion]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => postAction("/api/game/convert-resource", { conversionKey: key }, "Konversi resource...")}
                  className="rounded-2xl border border-amber-400/20 bg-slate-900/50 px-4 py-3 text-left text-xs font-semibold text-amber-100 transition hover:border-amber-300/60 hover:bg-amber-500/10"
                >
                  {conversion.label}
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      {mode === "nihongo" ? <LearningRewardPanel onClaim={postAction} /> : null}

      {/* Training + Upgrade */}
      <section className="grid gap-5 lg:grid-cols-2">
        <Panel title="Training Pasukan" subtitle="Latih unit, isi defense saat scout terdeteksi">
          <div className="grid gap-2">
            {publicUnitCatalog.map((unit) => {
              const owned = kingdom.armyUnits?.find((item) => item.unitKey === unit.key);
              const locked = kingdom.castleLevel < unit.unlockCastleLevel;
              return (
                <div
                  key={unit.key}
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-3 transition ${
                    locked
                      ? "border-slate-700/60 bg-slate-900/40 opacity-70"
                      : "border-amber-400/30 bg-gradient-to-r from-slate-900/60 to-slate-900/30 hover:border-amber-300/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UnitAvatar locked={locked} />
                    <div>
                      <p className="text-sm font-bold text-white">{unit.name}</p>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        ATK {unit.attack} · DEF {unit.defense} · Lv{unit.unlockCastleLevel}
                      </p>
                      {owned && owned.quantity > 0 ? (
                        <p className="mt-0.5 text-[11px] font-semibold text-emerald-300">
                          Dimiliki: {owned.quantity}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => postAction("/api/game/train-unit", { unitKey: unit.key, quantity: 1 }, "Latih pasukan...")}
                    className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition ${
                      locked
                        ? "cursor-not-allowed bg-slate-800 text-slate-500"
                        : "bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-slate-950 shadow-lg shadow-amber-500/30 hover:brightness-110"
                    }`}
                  >
                    {locked ? "Locked" : "Latih"}
                  </button>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Upgrade & Deck" subtitle="Naikkan kastel dan kelola kartu skill">
          <button
            type="button"
            onClick={() => postAction("/api/game/upgrade-castle", undefined, "Animasi upgrade kastel...")}
            className="group relative w-full overflow-hidden rounded-2xl border border-amber-300/50 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-5 py-4 text-left shadow-xl shadow-amber-700/30 transition hover:brightness-110"
          >
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_50%)] opacity-60" />
            <span className="relative flex items-center justify-between">
              <span>
                <span className="block text-xs font-bold uppercase tracking-[0.28em] text-slate-950/80">
                  Upgrade Kastel
                </span>
                <span className="mt-1 block text-lg font-black text-slate-950">
                  → Lv {Math.min(kingdom.castleLevel + 1, 10)} {getCastleStage(Math.min(kingdom.castleLevel + 1, 10)).name}
                </span>
              </span>
              <span className="text-3xl">⚡</span>
            </span>
          </button>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {publicDeckCards.map((card) => {
              const owned = kingdom.cards?.find((item) => item.cardKey === card.key);
              const has = (owned?.quantity ?? 0) > 0;
              return (
                <div
                  key={card.key}
                  className={`relative overflow-hidden rounded-2xl border p-3 ${
                    has
                      ? "border-cyan-400/40 bg-gradient-to-br from-cyan-950/60 to-slate-900/60"
                      : "border-slate-700/60 bg-slate-900/40 opacity-70"
                  }`}
                >
                  {has ? (
                    <span className="absolute right-2 top-2 rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                      x{owned?.quantity}
                    </span>
                  ) : null}
                  <p className="text-sm font-bold text-white">{card.name}</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-300">{card.description}</p>
                </div>
              );
            })}
          </div>
        </Panel>
      </section>

      {/* Battle */}
      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title="Target Battle"
          subtitle="Semua benua terbuka — pilih lawanmu"
          accent="rose"
        >
          {!targets.length ? (
            <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-5 text-sm text-slate-400">
              Belum ada target online di seluruh benua. Coba refresh sebentar.
            </p>
          ) : (
            <div className="grid gap-2">
              {targets.slice(0, 6).map((target) => {
                const targetMeta = getContinentMeta(target.continent);
                return (
                  <div
                    key={target.id}
                    className="relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-rose-400/30 bg-slate-900/60 p-3 transition hover:border-rose-300/70"
                  >
                    <span
                      className="pointer-events-none absolute inset-y-0 left-0 w-24 opacity-40"
                      style={{
                        backgroundImage: `url(${encodeURI(targetMeta.image)})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        maskImage: "linear-gradient(to right, black 30%, transparent)",
                        WebkitMaskImage: "linear-gradient(to right, black 30%, transparent)",
                      }}
                    />
                    <div className="relative">
                      <p className="text-sm font-bold text-white">{target.name}</p>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {target.continent} · Kastel {target.castleLevel} · DEF ~{target.defensePower}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => attackTarget(target.id, target.name)}
                      className="relative rounded-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-rose-700/40 transition hover:brightness-110"
                    >
                      Attack
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel title="Leaderboard" subtitle="Top 5 kingdom global" accent="cyan">
          <div className="space-y-2">
            {leaderboard.map((item, index) => {
              const rankColor =
                index === 0
                  ? "from-amber-400 to-orange-500 text-slate-950"
                  : index === 1
                    ? "from-slate-200 to-slate-400 text-slate-900"
                    : index === 2
                      ? "from-orange-300 to-amber-700 text-slate-50"
                      : "from-slate-700 to-slate-800 text-slate-200";
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-cyan-400/20 bg-slate-900/60 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${rankColor} text-sm font-black shadow-lg`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{item.name}</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{item.continent}</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-cyan-200">{item.xp.toLocaleString("en")} XP</p>
                </div>
              );
            })}
          </div>
        </Panel>
      </section>

      <Panel title="Recent Battle Logs" subtitle="Riwayat penyerangan & pertahanan">
        {!battleLogs.length ? (
          <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-5 text-sm text-slate-400">
            Belum ada battle log. Scout target pertama saat pasukan sudah siap.
          </p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {battleLogs.slice(0, 8).map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-slate-700/60 bg-slate-900/50 p-3"
              >
                <p className="text-sm font-bold text-white">{formatResult(log.result)}</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-400">
                  {log.attacker?.name ?? "Attacker"} vs {log.defender?.name ?? "Defender"} · ATK {log.attackerPower} / DEF {log.defenderPower}
                </p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function ContinentBanner({
  kingdom,
  mode,
  continentImage,
  continentTagline,
  accent,
}: {
  kingdom: Kingdom;
  mode: GameDashboardMode;
  continentImage: string;
  continentTagline: string;
  accent: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-amber-300/30 shadow-2xl shadow-slate-950/50">
      <div className="absolute inset-0">
        <Image
          src={continentImage}
          alt={kingdom.continent}
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1200px"
          className="object-cover opacity-60"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/30" />
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} mix-blend-overlay`} />

      <div className="relative grid gap-4 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(220px,1fr)] lg:items-end lg:p-9">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-slate-950/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.32em] text-amber-200 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-300" />
            Nexus Kingdoms · {kingdom.continent}
          </div>
          <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] sm:text-4xl lg:text-5xl">
            {mode === "platform" ? "Game Kerajaan Platform" : "Game Battle Nihongo"}
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-200/90 sm:mt-3 sm:text-sm sm:leading-6 lg:text-base">
            {continentTagline} Kumpulkan resource dari belajar, latih pasukan, jarah musuh, lindungi kerajaanmu.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          {mode === "platform" ? (
            <Link
              href="/apps/nihongo/game"
              className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-600/40 transition hover:brightness-110"
            >
              Mode Nihongo →
            </Link>
          ) : (
            <Link
              href="/apps/nihongo/quiz"
              className="rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-cyan-600/40 transition hover:brightness-110"
            >
              Latihan Quiz →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function RankBadge({ level, castleLevel, stageName }: { level: number; castleLevel: number; stageName: string }) {
  return (
    <div className="relative flex items-center gap-3 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/20 via-slate-950 to-cyan-500/10 px-4 py-3 text-right shadow-lg shadow-amber-700/20">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-lg font-black text-slate-950 shadow-inner">
        {castleLevel}
      </div>
      <div className="text-left">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-200">Castle Tier</p>
        <p className="mt-0.5 text-sm font-bold text-white">{stageName}</p>
        <p className="mt-0.5 text-[11px] font-semibold text-slate-300">Hero Lv {level}</p>
      </div>
    </div>
  );
}

function PowerMetric({ label, value, accent, icon }: { label: string; value: number; accent: string; icon: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 p-3 shadow-inner">
      <span className={`pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br ${accent} opacity-20`} />
      <div className="relative flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900/70 text-lg">{icon}</span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">{label}</p>
          <p className="mt-0.5 text-xl font-black text-white">{value.toLocaleString("en")}</p>
        </div>
      </div>
    </div>
  );
}

function ResourceTile({ resourceKey, amount }: { resourceKey: keyof GameResources; amount: number }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-slate-900/60 px-3 py-2">
      <span className="text-lg">{RESOURCE_ICONS[resourceKey]}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{publicResourceLabels[resourceKey]}</p>
        <p className="text-sm font-black text-amber-100">{amount.toLocaleString("en")}</p>
      </div>
    </div>
  );
}

function UnitAvatar({ locked }: { locked: boolean }) {
  return (
    <div
      className={`grid h-10 w-10 place-items-center rounded-xl border ${
        locked
          ? "border-slate-700 bg-slate-800 text-slate-600"
          : "border-amber-400/40 bg-gradient-to-br from-amber-500/20 to-rose-500/20 text-amber-200"
      }`}
    >
      <span className="text-lg">{locked ? "🔒" : "⚔"}</span>
    </div>
  );
}

function LearningRewardPanel({ onClaim }: { onClaim: (endpoint: string, body?: Record<string, unknown>, message?: string) => Promise<void> }) {
  const rewards = [
    { label: "Flashcard Battle Training", rewardType: "FLASHCARD_CORRECT" },
    { label: "Quiz Battle Training", rewardType: "QUIZ_COMPLETED" },
    { label: "Mock Test Raid N5", rewardType: "MOCK_N5_COMPLETED" },
    { label: "Lesson Clear Reward", rewardType: "LESSON_COMPLETED" },
    { label: "Reading Expedition Reward", rewardType: "READING_COMPLETED" },
  ];

  return (
    <Panel title="Integrasi Learning Reward N5/N4" subtitle="Hasil belajar = resource & XP">
      <div className="grid gap-2 md:grid-cols-5">
        {rewards.map((reward) => (
          <button
            key={reward.rewardType}
            type="button"
            onClick={() =>
              onClaim(
                "/api/game/claim-learning-reward",
                { rewardType: reward.rewardType, sourceRef: `manual-demo-${reward.rewardType}` },
                "Sync learning reward..."
              )
            }
            className="rounded-2xl border border-cyan-400/30 bg-cyan-950/30 p-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-900/40"
          >
            {reward.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-5 text-slate-400">
        Tombol MVP ini memakai idempotency key demo. Flow lesson, reading, quiz, dan mock dapat mengirim sourceRef asli agar reward tidak dobel.
      </p>
    </Panel>
  );
}

function Panel({
  title,
  subtitle,
  children,
  accent = "amber",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  accent?: "amber" | "cyan" | "rose";
}) {
  const accentRing =
    accent === "rose"
      ? "from-rose-400/40 via-orange-400/20 to-transparent"
      : accent === "cyan"
        ? "from-cyan-400/40 via-emerald-400/20 to-transparent"
        : "from-amber-400/40 via-orange-400/20 to-transparent";

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 p-5 shadow-2xl shadow-slate-950/40">
      <span className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accentRing}`} />
      <span className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
      <header className="relative flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight text-white">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              {subtitle}
            </p>
          ) : null}
        </div>
      </header>
      <div className="relative mt-4">{children}</div>
    </section>
  );
}

function formatResult(result: string) {
  return result.replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (value) => value.toUpperCase());
}
