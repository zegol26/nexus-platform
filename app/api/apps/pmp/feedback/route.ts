import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { trackEvent } from "@/lib/analytics/trackEvent";

export const dynamic = "force-dynamic";

function hashContent(content: string, sourceRef: string | null) {
  return createHash("sha256")
    .update(`${sourceRef ?? ""}::${content}`)
    .digest("hex")
    .slice(0, 40);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const rating = body?.rating === "like" || body?.rating === "dislike" ? body.rating : null;
  if (!rating) {
    return NextResponse.json({ error: "rating must be 'like' or 'dislike'" }, { status: 400 });
  }

  const content =
    typeof body?.content === "string" && body.content.trim() ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const sourceType =
    typeof body?.sourceType === "string" && body.sourceType.trim()
      ? body.sourceType.trim().slice(0, 64)
      : "andromeda_chat";
  const sourceRef =
    typeof body?.sourceRef === "string" && body.sourceRef.trim()
      ? body.sourceRef.trim().slice(0, 128)
      : null;
  const comment =
    typeof body?.comment === "string" && body.comment.trim()
      ? body.comment.trim().slice(0, 2000)
      : null;
  const userQuestion =
    typeof body?.userQuestion === "string" && body.userQuestion.trim()
      ? body.userQuestion.trim().slice(0, 2000)
      : null;

  const contentHash = hashContent(content, sourceRef);
  const excerpt = content.slice(0, 600);

  const feedback = await prisma.pmpAiFeedback.upsert({
    where: { userId_contentHash: { userId: user.id, contentHash } },
    create: {
      userId: user.id,
      sourceType,
      sourceRef,
      contentHash,
      contentExcerpt: excerpt,
      rating,
      comment,
      userQuestion,
    },
    update: {
      rating,
      comment,
      userQuestion,
      contentExcerpt: excerpt,
      sourceType,
      sourceRef,
    },
  });

  await trackEvent({
    userId: user.id,
    eventType: "AI_TUTOR_MESSAGE",
    appSlug: "pmp",
    pagePath: "/apps/pmp/dashboard",
    metadata: {
      scope: "pmp_ai_feedback",
      rating,
      sourceType,
      hasComment: Boolean(comment),
    },
  });

  return NextResponse.json({ feedback: { id: feedback.id, rating: feedback.rating } });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const contentHash = searchParams.get("contentHash");
  if (!contentHash) {
    return NextResponse.json({ error: "contentHash required" }, { status: 400 });
  }

  await prisma.pmpAiFeedback.deleteMany({
    where: { userId: user.id, contentHash },
  });

  return NextResponse.json({ ok: true });
}
