import { StoryArcEpisodePlayer } from "@/components/apps/storyarc/game/StoryArcEpisodePlayer";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser } from "@/lib/storyarc/access";
import { resolveStoryArcEpisodeIndex } from "@/lib/storyarc/game/story-sequence";

type EpisodeDecisionState = { episodes?: Record<string, { completed?: boolean }> };

export default async function StoryArcStoryPage({ searchParams }: { searchParams: Promise<{ episode?: string }> }) {
  const [{ episode }, user, revisions] = await Promise.all([
    searchParams,
    getStoryArcSessionUser(),
    prisma.storyArcContentRevision.findMany({
      where: { state: "PUBLISHED", item: { track: "STORY_MODE" } },
      include: { item: true },
      orderBy: { item: { stableId: "asc" } },
    }),
  ]);
  const state = user ? await prisma.storyArcPlayerState.findUnique({ where: { userId: user.id } }) : null;
  const decisions = (state?.decisionState ?? {}) as EpisodeDecisionState;
  const completedIds = new Set([
    ...(state?.completedNodeIds ?? []),
    ...Object.entries(decisions.episodes ?? {}).filter(([, progress]) => progress.completed).map(([id]) => id),
  ]);
  const episodeIds = revisions.map((revision) => revision.item.stableId);
  const { selectedIndex } = resolveStoryArcEpisodeIndex({ episodeIds, completedIds, requestedId: episode });
  const selected = revisions[selectedIndex];
  const previous = selectedIndex > 0 ? revisions[selectedIndex - 1] : undefined;
  const next = revisions[selectedIndex + 1];

  if (!selected) return <div className="rounded-3xl border border-dashed border-cyan-300/20 p-6 text-slate-300">No Story Mode episodes are published.</div>;

  return <StoryArcEpisodePlayer contentId={selected.item.stableId} previousEpisodeId={previous?.item.stableId} nextEpisodeId={next?.item.stableId} episodeNumber={selectedIndex + 1} totalEpisodes={revisions.length} />;
}
