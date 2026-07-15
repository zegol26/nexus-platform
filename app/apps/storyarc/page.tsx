import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser } from "@/lib/storyarc/access";

export default async function StoryArcHomePage() {
  const user = await getStoryArcSessionUser();
  const state = user ? await prisma.storyArcPlayerState.findUnique({ where: { userId: user.id } }) : null;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[0.12] via-[#0c2032] to-fuchsia-400/[0.08] p-6 shadow-2xl shadow-cyan-950/30 sm:p-9">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">The New Semester · Grade 10</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-6xl">Your English changes what happens next.</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Masuk ke Kampus Terpadu Cakrawala, temui Hana, dan gunakan bahasa Inggris yang terasa alami—bukan sekadar benar di atas kertas.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href={state?.currentEpisodeId ? `/apps/storyarc/story?episode=${state.currentEpisodeId}` : "/apps/storyarc/story"} className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-black text-[#06111c] transition hover:bg-cyan-200">{state ? "Resume Story" : "Begin Story"}</Link>
          <Link href="/apps/storyarc/learn" className="rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white hover:border-white/30">Explore School Core</Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["School Core", "UNDERSTAND + USE", "Curriculum-linked learning for Grades 10–12."],
          ["Story Mode", "EXPERIENCE + RECALL", "Choices, relationships, quests, and delayed language recall."],
          ["Exam Lab", "PROVE", "Rubric-backed evidence—kept separate from Story XP."],
        ].map(([title, label, copy]) => (
          <article key={title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
            <p className="text-[10px] font-black tracking-[0.2em] text-fuchsia-300">{label}</p>
            <h2 className="mt-3 text-xl font-black text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
