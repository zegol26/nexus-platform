import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth/auth-options";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { awardGameReward } from "@/lib/gamification/kingdom";
import { claimLearningReward } from "@/lib/game/service";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id : "";

  if (!id) {
    return NextResponse.json({ error: "Listening id is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const item = await prisma.readingPassage.findFirst({
    where: { id, contentType: "LISTENING" },
    select: { id: true, title: true, level: true, topic: true },
  });

  if (!item) {
    return NextResponse.json({ error: "Listening content not found." }, { status: 404 });
  }

  const existing = await prisma.analyticsEvent.findFirst({
    where: {
      userId: user.id,
      eventType: "LISTENING_COMPLETED",
      lessonId: item.id,
    },
    select: { id: true },
  });

  let reward = null;
  if (!existing) {
    await trackEvent({
      userId: user.id,
      eventType: "LISTENING_COMPLETED",
      pagePath: `/apps/nihongo/listening/${item.id}`,
      lessonId: item.id,
      metadata: {
        title: item.title,
        level: item.level,
        category: item.topic,
      } satisfies Prisma.InputJsonObject,
    });

    reward = await awardGameReward({
      userId: user.id,
      source: "LISTENING_COMPLETE",
    });
    await claimLearningReward({
      userId: user.id,
      rewardType: "READING_COMPLETED",
      sourceRef: `listening:${item.id}`,
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true, completed: true, reward });
}
