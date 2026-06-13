import { TRIAL_FLASHCARD_LIMIT, type AccessDecision } from "@/lib/nexus/access-policy";

export const NIHONGO_TRIAL_ROUTES = [
  "/apps/nihongo/assessment",
  "/apps/nihongo/pre-assessment",
  "/apps/nihongo/flashcards",
  "/apps/nihongo/quiz",
] as const;

const NIHONGO_TRIAL_API_ROUTES = [
  "/api/apps/nihongo/pre-assessment/generate",
  "/api/apps/nihongo/pre-assessment/profile",
  "/api/apps/nihongo/pre-assessment/submit",
  "/api/apps/nihongo/flashcards",
  "/api/apps/nihongo/quiz",
] as const;

export function isNihongoTrialRoute(pathname: string) {
  return NIHONGO_TRIAL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function isNihongoTrialApiRoute(pathname: string) {
  return NIHONGO_TRIAL_API_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function getAnonymousNihongoTrialAccess(requestedLimit = TRIAL_FLASHCARD_LIMIT): AccessDecision {
  return {
    allowed: true,
    plan: "ANONYMOUS_TRIAL",
    limit: TRIAL_FLASHCARD_LIMIT,
    used: Math.min(requestedLimit, TRIAL_FLASHCARD_LIMIT),
  };
}
