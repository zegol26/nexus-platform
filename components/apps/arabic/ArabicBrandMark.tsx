type ArabicBrandMarkProps = {
  size?: "sm" | "lg";
  className?: string;
};

export function ArabicBrandMark({ size = "sm", className = "" }: ArabicBrandMarkProps) {
  const dimension = size === "lg" ? "h-[120px] w-[120px]" : "h-14 w-14";
  const textSize = size === "lg" ? "text-5xl" : "text-2xl";

  return (
    <div
      aria-label="Nexus AI Arabic"
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-emerald-100 bg-[radial-gradient(circle_at_35%_25%,#fef3c7_0,#d1fae5_34%,#064e3b_100%)] shadow-sm ${dimension} ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 120 120"
        className="absolute inset-0 h-full w-full"
      >
        <circle cx="75" cy="33" r="19" fill="#f8fafc" opacity="0.95" />
        <circle cx="82" cy="30" r="19" fill="#047857" opacity="0.95" />
        <path
          d="M24 80C41 58 65 55 96 67"
          fill="none"
          stroke="#facc15"
          strokeLinecap="round"
          strokeWidth="5"
        />
        <path
          d="M32 74h42c10 0 17 6 17 14"
          fill="none"
          stroke="#ecfdf5"
          strokeLinecap="round"
          strokeWidth="4"
          opacity="0.85"
        />
        <path
          d="M38 82h46"
          stroke="#022c22"
          strokeLinecap="round"
          strokeWidth="4"
          opacity="0.45"
        />
      </svg>
      <span
        className={`relative -mt-1 font-black leading-none text-white drop-shadow-sm ${textSize}`}
      >
        ع
      </span>
      <span className="relative mt-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-900">
        Saudi
      </span>
    </div>
  );
}
