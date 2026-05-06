import type { AnalyticsEventType } from "@/lib/analytics/trackEvent";

type ClientTrackInput = {
  eventType: AnalyticsEventType;
  appSlug?: string | null;
  pagePath?: string | null;
  lessonId?: string | null;
  quizId?: string | null;
  flashcardDeck?: string | null;
  metadata?: Record<string, unknown> | null;
};

export function clientTrack(input: ClientTrackInput) {
  const payload = JSON.stringify(input);

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/track", blob);
    return;
  }

  void fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // Analytics must never interrupt the learner flow.
  });
}
