type CastleVisualProps = {
  castleLevel: number;
  stage: string;
  compact?: boolean;
};

const stageComplexity = [
  { min: 1, houses: 0, towers: 0, keep: false, crown: false },
  { min: 5, houses: 1, towers: 0, keep: false, crown: false },
  { min: 10, houses: 1, towers: 0, keep: false, crown: false },
  { min: 20, houses: 3, towers: 0, keep: false, crown: false },
  { min: 35, houses: 2, towers: 1, keep: false, crown: false },
  { min: 50, houses: 2, towers: 2, keep: true, crown: false },
  { min: 65, houses: 4, towers: 2, keep: true, crown: false },
  { min: 80, houses: 4, towers: 3, keep: true, crown: false },
  { min: 95, houses: 5, towers: 4, keep: true, crown: true },
];

export function CastleVisual({ castleLevel, stage, compact = false }: CastleVisualProps) {
  const visual = stageComplexity.reduce(
    (current, item) => (castleLevel >= item.min ? item : current),
    stageComplexity[0]
  );

  return (
    <div
      className={`castle-animate relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-b from-sky-100 via-cyan-50 to-emerald-50 shadow-inner ${
        compact ? "h-52" : "h-72 sm:h-80"
      }`}
      aria-label={`Nexus Kingdom castle visual: ${stage}, level ${castleLevel}`}
    >
      <div className="castle-cloud absolute left-6 top-8 h-5 w-16 rounded-full bg-white/80 shadow-sm" />
      <div className="castle-cloud castle-cloud-slow absolute right-12 top-14 h-4 w-20 rounded-full bg-white/70 shadow-sm" />
      <div className="absolute inset-x-0 bottom-0 h-24 rounded-t-[50%] bg-gradient-to-b from-emerald-200 to-emerald-400" />
      <div className="absolute bottom-10 left-1/2 h-16 w-[88%] -translate-x-1/2 rounded-t-full bg-emerald-300/70" />

      {visual.crown ? (
        <div className="castle-sparkle absolute left-1/2 top-8 h-16 w-16 -translate-x-1/2 rounded-full bg-amber-200/30 blur-xl" />
      ) : null}

      <svg
        viewBox="0 0 420 260"
        className="absolute inset-x-0 bottom-8 mx-auto h-[78%] max-w-[420px] drop-shadow-xl"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="castleWall" x1="0" x2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="castleRoof" x1="0" x2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#155e75" />
          </linearGradient>
        </defs>

        {visual.houses === 0 ? (
          <>
            <rect x="160" y="190" width="100" height="12" rx="4" fill="#94a3b8" />
            <rect x="176" y="172" width="68" height="18" rx="3" fill="#d97706" />
            <path d="M170 172h80l-12-18h-56z" fill="#92400e" />
            <text x="210" y="185" textAnchor="middle" fontSize="10" fill="#fff7ed">
              START
            </text>
          </>
        ) : null}

        {Array.from({ length: visual.houses }).map((_, index) => {
          const x = 74 + index * 58;
          const y = index % 2 === 0 ? 186 : 198;
          return (
            <g key={`house-${index}`}>
              <rect x={x} y={y} width="44" height="30" rx="4" fill="#f8fafc" />
              <path d={`M${x - 5} ${y}h54l-27-24z`} fill={index % 2 ? "#0f766e" : "#334155"} />
              <rect className="castle-window" x={x + 16} y={y + 11} width="10" height="10" rx="2" fill="#fde68a" />
            </g>
          );
        })}

        {visual.towers > 0 ? (
          <rect x="102" y="142" width="216" height="76" rx="8" fill="url(#castleWall)" stroke="#94a3b8" />
        ) : null}

        {Array.from({ length: visual.towers }).map((_, index) => {
          const positions = [112, 270, 72, 320];
          const x = positions[index] ?? 112 + index * 54;
          const height = index > 1 ? 88 : 72;
          const y = 218 - height;
          return (
            <g key={`tower-${index}`}>
              <rect x={x} y={y} width="38" height={height} rx="5" fill="url(#castleWall)" stroke="#94a3b8" />
              <path d={`M${x - 10} ${y}h58l-29-30z`} fill="url(#castleRoof)" />
              <rect className="castle-window" x={x + 13} y={y + 28} width="12" height="16" rx="2" fill="#fde68a" />
              <path className="castle-flag" d={`M${x + 19} ${y - 30}v-22l27 8-27 8`} fill="#ef4444" />
            </g>
          );
        })}

        {visual.keep ? (
          <g>
            <rect x="170" y="102" width="80" height="116" rx="7" fill="#f8fafc" stroke="#94a3b8" />
            <rect x="182" y="72" width="56" height="38" rx="5" fill="#e2e8f0" stroke="#94a3b8" />
            <path d="M154 104h112l-56-36z" fill="url(#castleRoof)" />
            <path d="M172 72h76l-38-28z" fill="url(#castleRoof)" />
            <rect className="castle-window" x="192" y="128" width="12" height="18" rx="2" fill="#fde68a" />
            <rect className="castle-window" x="218" y="128" width="12" height="18" rx="2" fill="#fde68a" />
            <rect x="198" y="178" width="24" height="40" rx="10" fill="#475569" />
            <path d="M146 224h128" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
            <path d="M210 44v-26" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
            <path className="castle-flag" d="M212 18l36 10-36 12z" fill="#f59e0b" />
          </g>
        ) : null}

        {visual.crown ? (
          <g className="castle-sparkle">
            <path d="M188 34l14 14 8-22 10 22 14-14-4 34h-38z" fill="#facc15" stroke="#b45309" />
            <circle cx="210" cy="24" r="5" fill="#fef3c7" />
          </g>
        ) : null}

        <path d="M56 220h308" stroke="#047857" strokeWidth="10" strokeLinecap="round" />
        <path d="M330 209h32v-36h28v36" fill="none" stroke="#dc2626" strokeWidth="6" strokeLinecap="round" />
        <path d="M338 174h44" stroke="#dc2626" strokeWidth="6" strokeLinecap="round" />
      </svg>

      <div className="absolute bottom-4 left-4 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
        {stage}
      </div>
    </div>
  );
}
