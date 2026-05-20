type AndromedaIconProps = {
  className?: string;
  size?: number;
};

/**
 * Mystic Andromeda spiral — gradient violet → cyan with starfield accents.
 * Pure inline SVG so it scales crisply at any density.
 */
export function AndromedaIcon({ className, size = 40 }: AndromedaIconProps) {
  const gradId = "andromeda-grad";
  const ringId = "andromeda-ring";
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      role="img"
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="1" />
          <stop offset="18%" stopColor="#f0abfc" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#a78bfa" stopOpacity="0.7" />
          <stop offset="75%" stopColor="#22d3ee" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="#020617" />
      <circle cx="32" cy="32" r="30" fill={`url(#${gradId})`} opacity="0.85" />
      {/* spiral arms */}
      <g
        transform="translate(32 32)"
        fill="none"
        stroke={`url(#${ringId})`}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.95"
      >
        <path d="M0 0 C 6 -2 12 -4 18 -10" />
        <path d="M0 0 C -6 2 -12 4 -18 10" />
        <path d="M0 0 C 10 4 18 2 22 -6" transform="rotate(35)" />
        <path d="M0 0 C 10 4 18 2 22 -6" transform="rotate(-35) scale(1 -1)" />
      </g>
      {/* core */}
      <circle cx="32" cy="32" r="3.5" fill="#fef9c3" />
      <circle cx="32" cy="32" r="6.5" fill="#fde68a" opacity="0.25" />
      {/* stars */}
      <g fill="#e0f2fe">
        <circle cx="12" cy="14" r="0.7" />
        <circle cx="50" cy="18" r="0.5" />
        <circle cx="54" cy="46" r="0.7" />
        <circle cx="10" cy="48" r="0.6" />
        <circle cx="46" cy="10" r="0.4" />
        <circle cx="20" cy="54" r="0.5" />
      </g>
      {/* outer mystic ring */}
      <circle
        cx="32"
        cy="32"
        r="29"
        fill="none"
        stroke={`url(#${ringId})`}
        strokeOpacity="0.5"
        strokeWidth="0.7"
      />
    </svg>
  );
}
