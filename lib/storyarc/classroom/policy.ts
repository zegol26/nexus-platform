export type StoryArcAssignmentAvailability = "LOCKED" | "OPEN" | "OVERDUE";

export function calculateStoryArcAssignmentScore(score: number, maxScore: number) {
  if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0 || score < 0 || score > maxScore) return null;
  return { score, maxScore, scorePercent: Math.round((score / maxScore) * 10000) / 100 };
}

export function getStoryArcAssignmentAvailability(
  availableFrom: Date | string,
  dueAt: Date | string | null | undefined,
  now = new Date(),
): StoryArcAssignmentAvailability {
  const release = availableFrom instanceof Date ? availableFrom : new Date(availableFrom);
  if (release.getTime() > now.getTime()) return "LOCKED";
  if (dueAt) {
    const due = dueAt instanceof Date ? dueAt : new Date(dueAt);
    if (due.getTime() < now.getTime()) return "OVERDUE";
  }
  return "OPEN";
}

export function storyArcContentHref(track: string, stableId: string, assignmentId?: string) {
  const query = assignmentId ? `?assignment=${encodeURIComponent(assignmentId)}` : "";
  if (track === "EXAM_LAB") return `/apps/storyarc/exam-lab/${stableId}${query}`;
  if (track === "SCHOOL_CORE") return `/apps/storyarc/learn/${stableId}${query}`;
  return `/apps/storyarc/story?episode=${encodeURIComponent(stableId)}${assignmentId ? `&assignment=${encodeURIComponent(assignmentId)}` : ""}`;
}
