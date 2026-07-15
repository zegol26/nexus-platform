export const STORYARC_CONTENT_TRANSITIONS = {
  DRAFT: ["VALIDATING"],
  VALIDATING: ["DRAFT", "IN_REVIEW"],
  IN_REVIEW: ["DRAFT", "APPROVED"],
  APPROVED: ["PUBLISHED"],
  PUBLISHED: ["SUPERSEDED", "ARCHIVED"],
  SUPERSEDED: ["ARCHIVED"],
  ARCHIVED: [],
} as const;

export type StoryArcContentStateKey = keyof typeof STORYARC_CONTENT_TRANSITIONS;

export function canTransitionStoryArcContent(from: StoryArcContentStateKey, to: StoryArcContentStateKey) {
  return (STORYARC_CONTENT_TRANSITIONS[from] as readonly string[]).includes(to);
}

export function isStudentVisibleStoryArcState(state: StoryArcContentStateKey) {
  return state === "PUBLISHED";
}
