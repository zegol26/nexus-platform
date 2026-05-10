"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  size?: number;
  className?: string;
};

// Renders /john.png if the file is in /public, otherwise falls back to
// a CSS-rendered avatar so John never appears as a broken image. Drop a
// real john.png into /public to override the placeholder.
export function JohnAvatar({ size = 64, className }: Props) {
  const [errored, setErrored] = useState(false);
  const dimension = `${size}px`;

  if (errored) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-700 text-white shadow-inner ${className ?? ""}`}
        style={{ width: dimension, height: dimension }}
        aria-label="John"
      >
        <span
          className="font-semibold tracking-tight"
          style={{ fontSize: `${size * 0.42}px` }}
        >
          J
        </span>
        <span
          className="absolute bottom-1 right-1 rounded-full bg-amber-300 text-[8px] font-bold text-slate-900"
          style={{ padding: `${size * 0.05}px ${size * 0.08}px` }}
          aria-hidden
        >
          EN
        </span>
      </div>
    );
  }

  return (
    <Image
      src="/john.png"
      alt="John"
      width={size}
      height={size}
      className={`rounded-full object-cover ${className ?? ""}`}
      onError={() => setErrored(true)}
      priority={false}
    />
  );
}
