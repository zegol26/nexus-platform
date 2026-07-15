export function resolveStoryArcEpisodeIndex(params: {
  episodeIds: string[];
  completedIds: ReadonlySet<string>;
  requestedId?: string;
}) {
  const { episodeIds, completedIds, requestedId } = params;
  if (episodeIds.length === 0) return { selectedIndex: -1, currentIndex: -1, maxUnlockedIndex: -1 };

  const firstIncomplete = episodeIds.findIndex((id) => !completedIds.has(id));
  const currentIndex = firstIncomplete === -1 ? episodeIds.length - 1 : firstIncomplete;
  const requestedIndex = requestedId ? episodeIds.indexOf(requestedId) : -1;
  const selectedIndex = requestedIndex >= 0 && requestedIndex <= currentIndex ? requestedIndex : currentIndex;
  return { selectedIndex, currentIndex, maxUnlockedIndex: currentIndex };
}
