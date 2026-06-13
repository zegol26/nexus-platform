import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth/auth-options";
import {
  isAnalyticsEventType,
  trackEvent,
  type AnalyticsEventType,
} from "@/lib/analytics/trackEvent";
import { prisma } from "@/lib/db/prisma";
import { isNihongoTrialRoute } from "@/lib/nexus/nihongo-trial";

export const runtime = "nodejs";

type AnalyticsTrackPayload = {
  eventType?: unknown;
  appSlug?: unknown;
  pagePath?: unknown;
  lessonId?: unknown;
  quizId?: unknown;
  flashcardDeck?: unknown;
  metadata?: unknown;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AnalyticsTrackPayload;

    if (!isAnalyticsEventType(payload.eventType)) {
      return NextResponse.json({ ok: false }, { status: 202 });
    }

    const session = await getServerSession(authOptions);
    const pagePath = getOptionalString(payload.pagePath);

    if (!session?.user?.email && pagePath && isNihongoTrialRoute(pagePath)) {
      return NextResponse.json({ ok: true, skipped: "anonymous_trial" });
    }

    const user = session?.user?.email
      ? await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        })
      : null;

    await trackEvent({
      userId: user?.id ?? null,
      eventType: payload.eventType as AnalyticsEventType,
      appSlug: getOptionalString(payload.appSlug) ?? "nihongo",
      pagePath,
      lessonId: getOptionalString(payload.lessonId),
      quizId: getOptionalString(payload.quizId),
      flashcardDeck: getOptionalString(payload.flashcardDeck),
      metadata: normalizeMetadata(payload.metadata),
    });
  } catch (error) {
    console.error("Analytics API failed", error);
  }

  return NextResponse.json({ ok: true });
}

function getOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeMetadata(value: unknown): Prisma.InputJsonValue | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  return value as Prisma.InputJsonValue;
}
