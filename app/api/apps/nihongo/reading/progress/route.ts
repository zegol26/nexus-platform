import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { awardGameReward } from "@/lib/gamification/kingdom";
import { claimLearningReward } from "@/lib/game/service";

export const runtime = "nodejs";

type ReadingProgressPayload = {
  slug?: unknown;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as ReadingProgressPayload;
  const slug = typeof payload.slug === "string" ? payload.slug.trim() : "";

  if (!slug) {
    return NextResponse.json({ error: "Article slug is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const passage = await prisma.readingPassage.findFirst({
    where: {
      contentType: "READING",
      OR: [{ id: slug }, { contentId: slug }],
    },
    select: {
      id: true,
      contentId: true,
      title: true,
      level: true,
    },
  });

  if (!passage) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  const existing = await prisma.analyticsEvent.findFirst({
    where: {
      userId: user.id,
      eventType: "READING_COMPLETED",
      lessonId: passage.id,
    },
    select: { id: true },
  });

  if (!existing) {
    await trackEvent({
      userId: user.id,
      eventType: "READING_COMPLETED",
      pagePath: `/apps/nihongo/reading/${passage.contentId}`,
      lessonId: passage.id,
      metadata: {
        contentId: passage.contentId,
        slug: passage.contentId,
        title: passage.title,
        level: passage.level,
      } satisfies Prisma.InputJsonObject,
    });

    await awardGameReward({
      userId: user.id,
      source: "READING_COMPLETE",
    });
    await claimLearningReward({
      userId: user.id,
      rewardType: "READING_COMPLETED",
      sourceRef: passage.id,
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true, completed: true });
}
