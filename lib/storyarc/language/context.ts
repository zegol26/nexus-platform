import { STORYARC_APP_SLUG } from "../constants";

export const STORYARC_JOHN_CONTEXT = {
  contextId: "storyarc-john",
  appSlug: STORYARC_APP_SLUG,
  entitlementSlug: STORYARC_APP_SLUG,
  courseId: "storyarc-english-10-12",
  tutorId: "john",
  subject: "english",
  instructionLanguage: "id",
  targetLanguage: "en",
  speechRecognitionLanguage: "en",
  expectedResponseLanguage: "en",
  tutorLanguage: "en",
  fallbackExplanationLanguage: "id",
  translationPolicy: "explanation-support-only",
  allowMixedLanguage: false,
  voiceProfile: "john",
  historyNamespace: "storyarc:john",
  usageFeatures: ["STORYARC_AI_TUTOR", "STORYARC_VOICE"],
} as const;

export type StoryArcLanguageContext = typeof STORYARC_JOHN_CONTEXT;

export function resolveStoryArcLanguageContext(contextId: string) {
  return contextId === STORYARC_JOHN_CONTEXT.contextId ? STORYARC_JOHN_CONTEXT : null;
}
