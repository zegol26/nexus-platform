import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export const analyticsEventTypes = [
  "PAGE_VIEW",
  "LESSON_STARTED",
  "LESSON_COMPLETED",
  "QUIZ_STARTED",
  "QUIZ_COMPLETED",
  "FLASHCARD_REVIEWED",
  "AI_TUTOR_MESSAGE",
  "ASSESSMENT_STARTED",
  "ASSESSMENT_COMPLETED",
  "READING_STARTED",
  "READING_COMPLETED",
  "LISTENING_STARTED",
  "LISTENING_COMPLETED",
] as const;

export type AnalyticsEventType = (typeof analyticsEventTypes)[number];

export type TrackAnalyticsEventInput = {
  userId?: string | null;
  sessionId?: string | null;
  eventType: AnalyticsEventType;
  appSlug?: string | null;
  pagePath?: string | null;
  lessonId?: string | null;
  quizId?: string | null;
  flashcardDeck?: string | null;
  metadata?: Prisma.InputJsonValue | null;
};

export function isAnalyticsEventType(value: unknown): value is AnalyticsEventType {
  return (
    typeof value === "string" &&
    analyticsEventTypes.includes(value as AnalyticsEventType)
  );
}

export async function trackEvent(input: TrackAnalyticsEventInput) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        userId: input.userId ?? null,
        sessionId: input.sessionId ?? null,
        eventType: input.eventType,
        appSlug: input.appSlug ?? "nihongo",
        pagePath: input.pagePath ?? null,
        lessonId: input.lessonId ?? null,
        quizId: input.quizId ?? null,
        flashcardDeck: input.flashcardDeck ?? null,
        metadata: input.metadata ?? undefined,
      },
    });
  } catch (error) {
    console.error("Analytics tracking failed", error);
  }
}
