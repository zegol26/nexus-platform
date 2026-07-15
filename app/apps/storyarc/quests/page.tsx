import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser } from "@/lib/storyarc/access";

type EpisodeProgress = { currentNodeId?: string; completed?: boolean; inspectedHotspotIds?: string[] };
type EpisodeDecisionState = { episodes?: Record<string, EpisodeProgress> };

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function episodeBrief(payload: unknown) {
  const root = record(payload);
  const blocks = Array.isArray(root.lessonBlocks) ? root.lessonBlocks.map(record) : [];
  const brief = blocks.find((block) => block.blockType === "episode-brief") ?? {};
  return {
    arcTitle: typeof brief.arcTitleEn === "string" ? brief.arcTitleEn : "Cakrawala Story",
    sceneIntent: typeof brief.sceneIntentId === "string" ? brief.sceneIntentId : "Lanjutkan cerita dan gunakan bahasa Inggris sesuai konteks.",
    questIntent: typeof brief.questIntentId === "string" ? brief.questIntentId.replace(/^Quest:\s*/i, "") : "Selesaikan percakapan episode.",
    relationshipNotes: typeof brief.relationshipNotes === "string" ? brief.relationshipNotes : "Pilihan Anda memengaruhi respons karakter.",
  };
}

export default async function StoryArcQuestsPage() {
  const [user, episodes] = await Promise.all([
    getStoryArcSessionUser(),
    prisma.storyArcContentRevision.findMany({
      where: { state: "PUBLISHED", item: { track: "STORY_MODE" } },
      include: { item: true },
      orderBy: { item: { stableId: "asc" } },
    }),
  ]);
  const state = user ? await prisma.storyArcPlayerState.findUnique({ where: { userId: user.id } }) : null;
  const decisions = (state?.decisionState ?? {}) as EpisodeDecisionState;
  const progress = decisions.episodes ?? {};
  const completed = episodes.filter((episode) => progress[episode.item.stableId]?.completed || state?.completedNodeIds.includes(episode.item.stableId));
  const active = episodes.find((episode) => !progress[episode.item.stableId]?.completed && !state?.completedNodeIds.includes(episode.item.stableId));
  const activeProgress = active ? progress[active.item.stableId] : undefined;
  const brief = episodeBrief(active?.payload);

  return (
    <div className="space-y-6">
      <div><p className="text-xs font-black tracking-[0.25em] text-cyan-300">QUEST JOURNAL</p><h1 className="mt-3 text-3xl font-black text-white">Your current mission at Cakrawala.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Quest baru terbuka secara berurutan. Episode yang sudah selesai tetap tersedia sebagai review.</p></div>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"><p className="text-xs text-slate-500">STORY XP</p><p className="mt-2 text-4xl font-black text-cyan-200">{state?.storyXp ?? 0}</p><p className="mt-2 text-xs text-slate-500">Tidak digunakan sebagai nilai mastery.</p></article>
        <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"><p className="text-xs text-slate-500">STORY LEVEL</p><p className="mt-2 text-4xl font-black text-fuchsia-200">{state?.storyLevel ?? 1}</p></article>
        <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"><p className="text-xs text-slate-500">EPISODES COMPLETE</p><p className="mt-2 text-4xl font-black text-emerald-200">{completed.length}<span className="text-lg text-slate-500">/{episodes.length}</span></p></article>
      </section>
      {active ? <section className="rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/[.08] to-indigo-400/[.06] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black tracking-[.2em] text-cyan-300">CURRENT QUEST · {brief.arcTitle.toUpperCase()}</p><h2 className="mt-2 text-2xl font-black text-white">{active.title}</h2></div><span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100">{activeProgress ? "IN PROGRESS" : "READY"}</span></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs font-black text-slate-400">MISSION</p><p className="mt-2 leading-7 text-white">{brief.questIntent}</p></div><div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs font-black text-slate-400">SCENE</p><p className="mt-2 text-sm leading-6 text-slate-300">{brief.sceneIntent}</p></div></div>
        <p className="mt-4 text-sm leading-6 text-slate-400">{brief.relationshipNotes}</p>
        <div className="mt-5 flex flex-wrap gap-3"><Link href={`/apps/storyarc/story?episode=${active.item.stableId}`} className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950">{activeProgress ? "Resume quest →" : "Start quest →"}</Link>{activeProgress?.inspectedHotspotIds?.length ? <span className="rounded-xl border border-white/10 px-4 py-3 text-xs text-slate-300">{activeProgress.inspectedHotspotIds.length} scene clues found</span> : null}</div>
      </section> : <section className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[.06] p-6"><p className="text-xs font-black tracking-[.18em] text-emerald-300">ALL PUBLISHED QUESTS COMPLETE</p><h2 className="mt-2 text-2xl font-black text-white">You reached the end of the current StoryArc.</h2><p className="mt-3 text-sm text-slate-400">Review any completed mission below while the next arc is prepared.</p></section>}
      {completed.length > 0 ? <section><h2 className="text-lg font-black text-white">Completed missions</h2><div className="mt-3 grid gap-3 md:grid-cols-2">{completed.slice().reverse().map((episode) => <Link key={episode.id} href={`/apps/storyarc/story?episode=${episode.item.stableId}`} className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[.04] p-4 hover:border-emerald-300/40"><p className="text-xs font-black text-emerald-300">✓ COMPLETE · REVIEW</p><p className="mt-2 font-bold text-white">{episode.title}</p></Link>)}</div></section> : null}
    </div>
  );
}
