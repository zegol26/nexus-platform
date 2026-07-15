import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser } from "@/lib/storyarc/access";

const SKILLS = ["LISTENING", "SPEAKING", "READING", "WRITING", "GRAMMAR", "VOCABULARY"] as const;

function learnerExpressionLabel(entryKey: string) {
  return entryKey
    .replace(/^(exp|expression|vocab|vocabulary)-/i, "")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function StoryArcProfilePage() {
  const user = await getStoryArcSessionUser();
  const [mastery, unlocks] = user ? await Promise.all([
    prisma.storyArcMasteryProjection.findMany({ where: { userId: user.id } }),
    prisma.storyArcLearnerUnlock.findMany({ where: { userId: user.id }, orderBy: { unlockedAt: "desc" } }),
  ]) : [[], []];
  const masteryBySkill = new Map(mastery.map((row) => [row.skill, row]));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black tracking-[0.25em] text-fuchsia-300">PROFILE · ENGLISH MASTERY</p>
        <h1 className="mt-3 text-3xl font-black text-white">Your learning progress</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Your mastery grows from assessed practice and recall activities. Simply encountering a phrase does not count as mastery.</p>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SKILLS.map((skill) => {
          const row = masteryBySkill.get(skill);
          return <article key={skill} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"><p className="text-xs font-black tracking-[0.15em] text-slate-400">{skill}</p><p className="mt-3 text-3xl font-black text-white">{row ? `${Math.round(row.score)}%` : "—"}</p><p className="mt-1 text-xs text-slate-500">{row?.band ?? "MORE PRACTICE NEEDED"}</p></article>;
        })}
      </section>
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-xl font-bold text-white">Unlocked expressions</h2>
        <p className="mt-2 text-xs text-slate-500">Expressions you have encountered in Story mode.</p>
        <div className="mt-4 flex flex-wrap gap-2">{unlocks.length === 0 ? <span className="text-sm text-slate-400">No expressions unlocked yet.</span> : unlocks.map((unlock) => <span key={unlock.id} className="rounded-full bg-fuchsia-300/10 px-3 py-2 text-xs text-fuchsia-100">{learnerExpressionLabel(unlock.entryKey)}</span>)}</div>
      </section>
    </div>
  );
}
