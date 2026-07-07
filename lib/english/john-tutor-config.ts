import { containsForbiddenJohnScript } from "./john-language-policy";

export const JOHN_TUTOR_CONFIG = {
  tutorId: "john",
  subject: "english",
  courseId: "english-john",
  inputLanguage: "en",
  outputLanguage: "en",
  uiLanguage: "en",
  allowMixedLanguage: false,
} as const;

export type JohnTutorConfig = typeof JOHN_TUTOR_CONFIG;

export type JohnHistoryTurn = {
  role: "user" | "assistant";
  content: string;
};

export function isJohnTutorId(value: unknown): value is JohnTutorConfig["tutorId"] {
  return value === JOHN_TUTOR_CONFIG.tutorId;
}

export function scopeJohnHistoryToEnglish(turns: JohnHistoryTurn[]) {
  return turns.filter((turn) => !containsForbiddenJohnScript(turn.content));
}
