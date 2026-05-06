export const TRIAL_LESSON_LIMIT = 5;
export const TRIAL_FLASHCARD_LIMIT = 20;
export const TRIAL_AI_TUTOR_LIMIT = 2;

export type AccessDecision = {
  allowed: boolean;
  reason?: string;
  limit?: number;
  used?: number;
  plan?: string;
};

export function decideLessonAccess({
  isPaid,
  plan,
  lessonOrder,
}: {
  isPaid: boolean;
  plan: string;
  lessonOrder: number;
}): AccessDecision {
  if (isPaid) return { allowed: true, plan };

  const allowed = lessonOrder <= TRIAL_LESSON_LIMIT;
  return {
    allowed,
    plan,
    limit: TRIAL_LESSON_LIMIT,
    reason: allowed ? undefined : `Trial access is limited to lesson ${TRIAL_LESSON_LIMIT}.`,
  };
}

export function decideFlashcardAccess({
  isPaid,
  plan,
  requestedLimit = TRIAL_FLASHCARD_LIMIT,
}: {
  isPaid: boolean;
  plan: string;
  requestedLimit?: number;
}): AccessDecision {
  if (isPaid) return { allowed: true, plan };

  return {
    allowed: true,
    plan,
    limit: TRIAL_FLASHCARD_LIMIT,
    used: Math.min(requestedLimit, TRIAL_FLASHCARD_LIMIT),
  };
}

export function decideAiTutorAccess({
  isPaid,
  plan,
  used,
}: {
  isPaid: boolean;
  plan: string;
  used: number;
}): AccessDecision {
  if (isPaid) return { allowed: true, plan };

  const allowed = used < TRIAL_AI_TUTOR_LIMIT;
  return {
    allowed,
    plan,
    limit: TRIAL_AI_TUTOR_LIMIT,
    used,
    reason: allowed ? undefined : "Trial AI Tutor limit reached.",
  };
}

export function decideReadingAccess({ isTrial, plan }: { isTrial: boolean; plan: string }): AccessDecision {
  return {
    allowed: true,
    plan,
    reason: isTrial ? "Trial reading uses cached passages only." : undefined,
  };
}
