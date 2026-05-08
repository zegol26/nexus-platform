import Image from "next/image";
import { getCastleStage } from "@/lib/game/castle-stages";
import type { HeroAura } from "@/lib/game/config";

type CastleVisualProps = {
  castleLevel: number;
  stage?: string;
  compact?: boolean;
  hero?: {
    name: string;
    image?: string;
    aura?: HeroAura | string;
    title?: string;
  };
};

const auraColors: Record<string, { primary: string; secondary: string; ring: string }> = {
  cyan: { primary: "rgba(34,211,238,0.7)", secondary: "rgba(14,165,233,0.4)", ring: "rgba(125,211,252,0.7)" },
  rose: { primary: "rgba(244,63,94,0.7)", secondary: "rgba(239,68,68,0.4)", ring: "rgba(253,164,175,0.7)" },
  emerald: { primary: "rgba(16,185,129,0.7)", secondary: "rgba(5,150,105,0.4)", ring: "rgba(110,231,183,0.7)" },
  violet: { primary: "rgba(168,85,247,0.7)", secondary: "rgba(139,92,246,0.4)", ring: "rgba(216,180,254,0.7)" },
  amber: { primary: "rgba(251,191,36,0.75)", secondary: "rgba(245,158,11,0.45)", ring: "rgba(253,224,71,0.75)" },
};

export function CastleVisual({ castleLevel, stage, compact = false, hero }: CastleVisualProps) {
  const level = Math.min(Math.max(Math.round(castleLevel), 1), 10);
  const stageMeta = getCastleStage(level);
  const label = stage ?? stageMeta.name;
  const aura = auraColors[(hero?.aura as string) ?? "cyan"] ?? auraColors.cyan;
  const castleSrc = `/Castle/${stageMeta.name}.png`;

  return (
    <div
      className={`castle-animate relative overflow-hidden rounded-3xl border border-amber-300/30 shadow-inner ${
        compact ? "h-64" : "h-[22rem] sm:h-[26rem] lg:h-[30rem]"
      }`}
      aria-label={`Nexus Kingdom castle: ${label}, level ${level}`}
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, rgba(56,189,248,0.18) 0%, transparent 55%), linear-gradient(180deg, #0b1228 0%, #1e1b4b 60%, #0c2a3a 100%)",
      }}
    >
      <span className="castle-cloud absolute left-6 top-6 h-4 w-14 rounded-full bg-white/30 blur-sm" />
      <span className="castle-cloud castle-cloud-slow absolute right-10 top-12 h-3 w-20 rounded-full bg-white/20 blur-sm" />
      <span className="absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />
      <span className="absolute inset-x-6 bottom-10 h-12 rounded-[50%] bg-emerald-900/40 blur-xl" />

      <div
        className={`pointer-events-none absolute ${
          compact ? "inset-x-1 top-[7%] bottom-1" : "inset-x-2 top-[7%] bottom-2"
        }`}
      >
        <Image
          src={castleSrc}
          alt={`Castle ${stageMeta.name}`}
          fill
          sizes="(max-width: 640px) 100vw, 900px"
          quality={95}
          className="object-contain object-bottom drop-shadow-[0_24px_34px_rgba(15,23,42,0.75)]"
          priority
        />
      </div>

      {hero?.image ? (
        <div
          className={`pointer-events-none absolute hero-float-bounce ${
            compact ? "bottom-2 left-2 h-56 w-36" : "bottom-3 left-2 h-[18rem] w-52 sm:bottom-4 sm:left-3 sm:h-[22rem] sm:w-64 lg:h-[26rem] lg:w-72"
          }`}
          aria-hidden="true"
        >
          <span
            className="absolute inset-x-3 bottom-1 h-4 rounded-[50%] hero-shadow"
            style={{ background: `radial-gradient(ellipse at center, ${aura.secondary}, transparent 70%)` }}
          />
          <span
            className="absolute inset-0 hero-aura-soft"
            style={{
              background: `radial-gradient(58% 50% at 50% 55%, ${aura.primary} 0%, transparent 70%)`,
              filter: "blur(22px)",
            }}
          />
          <span
            className="absolute inset-x-4 bottom-4 top-6 rounded-full hero-aura-pulse"
            style={{ boxShadow: `0 0 80px 30px ${aura.primary}, inset 0 0 70px ${aura.secondary}` }}
          />
          <svg
            className="absolute inset-x-2 bottom-1 h-20 w-[calc(100%-1rem)] hero-runes"
            viewBox="0 0 200 80"
            fill="none"
            aria-hidden="true"
          >
            <ellipse cx="100" cy="60" rx="80" ry="14" stroke={aura.ring} strokeWidth="0.8" strokeDasharray="3 5" />
            <ellipse cx="100" cy="60" rx="60" ry="10" stroke={aura.ring} strokeWidth="0.6" strokeDasharray="1 3" opacity="0.7" />
          </svg>
          <span
            className="hero-spark absolute left-[18%] top-[28%] h-1.5 w-1.5 rounded-full"
            style={{ background: aura.ring, boxShadow: `0 0 12px ${aura.primary}` }}
          />
          <span
            className="hero-spark hero-spark-delay absolute right-[14%] top-[42%] h-1 w-1 rounded-full"
            style={{ background: aura.ring, boxShadow: `0 0 10px ${aura.primary}` }}
          />
          <span
            className="hero-spark hero-spark-delay-2 absolute left-[60%] top-[18%] h-1 w-1 rounded-full"
            style={{ background: aura.ring, boxShadow: `0 0 10px ${aura.primary}` }}
          />
          <Image
            src={hero.image}
            alt={hero.name}
            fill
            sizes="(max-width: 640px) 176px, 320px"
            quality={95}
            className="object-contain object-bottom"
            style={{
              filter: `drop-shadow(0 22px 28px rgba(0,0,0,0.65)) drop-shadow(0 0 22px ${aura.primary})`,
            }}
            priority
          />
        </div>
      ) : null}

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-amber-300/40 bg-slate-950/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200 shadow-lg shadow-slate-950/40 backdrop-blur sm:left-auto sm:right-3 sm:translate-x-0">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-300" />
        Lv {level} · {label}
      </div>
      <div className="absolute right-3 top-3 rounded-full border border-cyan-300/30 bg-slate-950/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
        {stageMeta.era}
      </div>
      {hero?.name ? (
        <div className="absolute left-3 top-3 max-w-[55%] rounded-full border border-amber-300/40 bg-slate-950/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-100 shadow-lg shadow-slate-950/40 backdrop-blur">
          <span className="block truncate">{hero.name}</span>
          {hero.title ? <span className="block truncate text-[9px] font-semibold tracking-[0.18em] text-amber-200/70">{hero.title}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
