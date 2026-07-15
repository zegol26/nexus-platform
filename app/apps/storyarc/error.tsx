"use client";

export default function StoryArcError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-[2rem] border border-rose-300/20 bg-rose-300/[0.06] p-7">
      <h2 className="text-xl font-black text-white">StoryArc could not load this view.</h2>
      <p className="mt-2 text-sm text-rose-100">Your last acknowledged game checkpoint remains authoritative.</p>
      <button onClick={reset} className="mt-5 rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950">Try again</button>
    </div>
  );
}
