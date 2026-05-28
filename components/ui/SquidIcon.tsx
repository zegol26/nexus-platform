"use client";

type SquidShape = "circle" | "triangle" | "square";

export function SquidIcon({
  shape,
  active = false,
}: {
  shape: SquidShape;
  active?: boolean;
}) {
  const stroke = active ? "currentColor" : "currentColor";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke={stroke}
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {shape === "circle" ? <circle cx="12" cy="12" r="7" /> : null}
      {shape === "triangle" ? <path d="M12 4.5 20 18.5H4L12 4.5Z" /> : null}
      {shape === "square" ? <rect x="5.5" y="5.5" width="13" height="13" /> : null}
    </svg>
  );
}
