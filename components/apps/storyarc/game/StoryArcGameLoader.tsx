"use client";

import dynamic from "next/dynamic";

const StoryArcPhaserHost = dynamic(
  () => import("./StoryArcPhaserHost").then((module) => module.StoryArcPhaserHost),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-video min-h-0 min-w-0 w-full items-center justify-center rounded-[2rem] border border-cyan-300/15 bg-[#071827] text-sm text-cyan-200">
        Loading the School Gate runtime…
      </div>
    ),
  },
);

export function StoryArcGameLoader() {
  return <StoryArcPhaserHost />;
}
