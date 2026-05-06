import { AchievementGrid, type Achievement } from "@/components/nihongo/game/AchievementGrid";
import { CastleVisual } from "@/components/nihongo/game/CastleVisual";

type KingdomCardProps = {
  profile: {
    totalXP: number;
    buildPoints: number;
    coins: number;
    xpEarnedToday: number;
    castleLevel: number;
    castleStage: { name: string };
    progressToNextLevel: {
      nextLevel: number;
      progressPercent: number;
      pointsIntoLevel: number;
      pointsNeeded: number;
    };
    achievements: Achievement[];
  };
  compact?: boolean;
};

export function KingdomCard({ profile, compact = false }: KingdomCardProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-xl shadow-slate-950/[0.05] backdrop-blur-2xl">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Nexus Kingdom
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Level {profile.castleLevel} {profile.castleStage.name}
              </h2>
            </div>
            <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              {profile.xpEarnedToday}/1000 XP today
            </div>
          </div>

          <div className="mt-5">
            <CastleVisual
              castleLevel={profile.castleLevel}
              stage={profile.castleStage.name}
              compact={compact}
            />
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
              <span>Build progress to level {profile.progressToNextLevel.nextLevel}</span>
              <span>{profile.progressToNextLevel.progressPercent}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="castle-build-shimmer h-full rounded-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-300"
                style={{ width: `${profile.progressToNextLevel.progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-medium text-slate-500">
              {profile.progressToNextLevel.pointsIntoLevel}/{profile.progressToNextLevel.pointsNeeded} build points
            </p>
          </div>
        </div>

        <aside className="border-t border-slate-100 bg-slate-50/80 p-5 sm:p-6 lg:border-l lg:border-t-0">
          <div className="grid grid-cols-3 gap-3">
            <Metric label="XP" value={profile.totalXP} />
            <Metric label="Build" value={profile.buildPoints} />
            <Metric label="Coins" value={profile.coins} />
          </div>

          <div className="mt-5">
            <p className="mb-3 text-sm font-semibold text-slate-700">Achievements</p>
            <AchievementGrid achievements={profile.achievements} />
          </div>
        </aside>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value.toLocaleString("en")}</p>
    </div>
  );
}
