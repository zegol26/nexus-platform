"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { CastleVisual } from "@/components/nihongo/game/CastleVisual";
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
  hero: { name: string; style: string; bestFor: string };
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

export function PlatformGameDashboard({ mode }: { mode: GameDashboardMode }) {
  const [kingdom, setKingdom] = useState<Kingdom | null>(null);
  const [leaderboard, setLeaderboard] = useState<Kingdom[]>([]);
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([]);
  const [targets, setTargets] = useState<Kingdom[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Preparing your kingdom...");
  const [busy, setBusy] = useState("");

  async function loadGame() {
    setLoading(true);
    setMessage("Preparing your kingdom...");
    const response = await fetch("/api/game/me", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) {
      setKingdom(payload.kingdom);
      setLeaderboard(payload.leaderboard ?? []);
      setBattleLogs(payload.battleLogs ?? []);
      await loadTargets();
    } else {
      setMessage(payload.error ?? "Gagal memuat kerajaan.");
    }
    setLoading(false);
  }

  async function loadTargets() {
    const response = await fetch("/api/game/targets", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) setTargets(payload.targets ?? []);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadGame();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const stage = useMemo(() => getStageName(kingdom?.castleLevel ?? 1), [kingdom?.castleLevel]);
  const visualLevel = Math.min(100, Math.max(1, (kingdom?.castleLevel ?? 1) * 10));

  if (loading && !kingdom) {
    return <div className="rounded-[2rem] border border-cyan-300/20 bg-slate-950 p-8 text-cyan-50">{message}</div>;
  }

  if (!kingdom) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-800">
        {message || "Kerajaan belum bisa dimuat."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-slate-950 text-white shadow-2xl shadow-slate-950/20">
        <div className="bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.24),transparent_34%),linear-gradient(135deg,#020617,#111827,#0f766e)] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Nexus Kingdoms: Nihongo Realms
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
                {mode === "platform" ? "Game Kerajaan Platform" : "Game Battle Nihongo"}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
                Belajar bahasa Jepang, kumpulkan resource, latih pasukan, upgrade kastel, dan naikkan reputasi kerajaan.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {mode === "platform" ? (
                <Link href="/apps/nihongo/game" className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white">
                  Masuk Mode Nihongo
                </Link>
              ) : (
                <Link href="/apps/nihongo/quiz" className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white">
                  Mulai Latihan Quiz
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {message ? <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm font-semibold text-cyan-900">{message}</div> : null}
      {busy ? <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600">{busy}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/[0.04]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">{kingdom.continent}</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">{kingdom.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Hero {kingdom.hero.name} mendukung gaya {kingdom.hero.style}. Senjata aktif: {kingdom.attackWeapon.name} dan {kingdom.defenseWeapon.name}.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
              Level {kingdom.level} / Kastel {kingdom.castleLevel}
            </div>
          </div>
          <div className="mt-5">
            <CastleVisual castleLevel={visualLevel} stage={stage} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Metric label="XP" value={kingdom.xp} />
            <Metric label="Army Power" value={kingdom.attackPower} />
            <Metric label="Defense Power" value={kingdom.defensePower} />
          </div>
        </div>

        <div className="space-y-6">
          <Panel title="Resource Kerajaan">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 xl:grid-cols-2">
              {(Object.keys(kingdom.resources) as Array<keyof GameResources>).map((key) => (
                <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">{publicResourceLabels[key]}</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">{kingdom.resources[key].toLocaleString("en")}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Konversi Resource">
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(publicConversions).map(([key, conversion]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => postAction("/api/game/convert-resource", { conversionKey: key }, "Syncing learning rewards...")}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  {conversion.label}
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      {mode === "nihongo" ? <LearningRewardPanel onClaim={postAction} /> : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Training Pasukan">
          <div className="grid gap-3">
            {publicUnitCatalog.map((unit) => (
              <div key={unit.key} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{unit.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      ATK {unit.attack} / DEF {unit.defense} / Unlock kastel {unit.unlockCastleLevel}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => postAction("/api/game/train-unit", { unitKey: unit.key, quantity: 1 }, "Training your troops...")}
                    className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-cyan-700"
                  >
                    Latih
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Upgrade dan Deck">
          <button
            type="button"
            onClick={() => postAction("/api/game/upgrade-castle", undefined, "Menjalankan animasi upgrade kastel...")}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:brightness-110"
          >
            Upgrade Kastel
          </button>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {publicDeckCards.map((card) => {
              const owned = kingdom.cards?.find((item) => item.cardKey === card.key);
              return (
                <div key={card.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-950">{card.name}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{card.description}</p>
                  <p className="mt-2 text-xs font-semibold text-cyan-700">Jumlah: {owned?.quantity ?? 0}</p>
                </div>
              );
            })}
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Panel title="Target Battle">
          {!targets.length ? (
            <p className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              Belum ada target di continent ini. Cross-continent attack terbuka mulai castle level 5.
            </p>
          ) : (
            <div className="grid gap-3">
              {targets.slice(0, 6).map((target) => (
                <div key={target.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                  <div>
                    <p className="font-semibold text-slate-950">{target.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      Kastel {target.castleLevel} / DEF sekitar {target.defensePower}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => postAction("/api/game/battle/attack", { targetKingdomId: target.id }, "Calculating battle outcome...")}
                    className="rounded-full border border-cyan-300 px-4 py-2 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-50"
                  >
                    Attack
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Leaderboard Preview">
          <div className="space-y-3">
            {leaderboard.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-950">#{index + 1} {item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.continent}</p>
                </div>
                <p className="text-sm font-semibold text-cyan-700">{item.xp.toLocaleString("en")} XP</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <Panel title="Recent Battle Logs">
        {!battleLogs.length ? (
          <p className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
            Belum ada battle log. Scout target pertama saat pasukan sudah siap.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {battleLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-950">{formatResult(log.result)}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {log.attacker?.name ?? "Attacker"} vs {log.defender?.name ?? "Defender"} - ATK {log.attackerPower} / DEF {log.defenderPower}
                </p>
              </div>
            ))}
          </div>
        )}
      </Panel>
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
    <Panel title="Integrasi Learning Reward N5/N4">
      <div className="grid gap-3 md:grid-cols-5">
        {rewards.map((reward) => (
          <button
            key={reward.rewardType}
            type="button"
            onClick={() =>
              onClaim(
                "/api/game/claim-learning-reward",
                { rewardType: reward.rewardType, sourceRef: `manual-demo-${reward.rewardType}` },
                "Syncing learning rewards..."
              )
            }
            className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-left text-sm font-semibold text-cyan-900 transition hover:bg-white"
          >
            {reward.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Tombol MVP ini memakai idempotency key demo. Flow lesson, reading, quiz, dan mock dapat mengirim sourceRef asli agar reward tidak dobel.
      </p>
    </Panel>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/[0.04]">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value.toLocaleString("en")}</p>
    </div>
  );
}

function getStageName(level: number) {
  if (level >= 10) return "Royal Castle";
  if (level >= 9) return "Great Fortress";
  if (level >= 8) return "Castle Town";
  if (level >= 7) return "Samurai Keep";
  if (level >= 6) return "Stone Residence";
  if (level >= 4) return "Small Village";
  if (level >= 3) return "Wooden House";
  if (level >= 2) return "Starter Hut";
  return "Empty Land";
}

function formatResult(result: string) {
  return result.replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (value) => value.toUpperCase());
}
