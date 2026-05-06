import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { getLearningBadgeLabel, getOnigiriBadge } from "@/lib/community/display";
import { extractInternalLinkedRoomId, moderateCommunityMessage } from "@/lib/community/moderation";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

const blockedMessage =
  "Pesan tidak dapat dikirim karena melanggar aturan komunitas. Mohon gunakan bahasa yang sopan dan hindari link tidak pantas.";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Silakan login untuk melihat percakapan." }, { status: 401 });
  }

  const { roomId } = await params;
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!currentUser) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });

  const room = await prisma.communityRoom.findUnique({
    where: { id: roomId },
    select: { id: true, name: true, description: true },
  });
  if (!room) return NextResponse.json({ error: "Room tidak ditemukan." }, { status: 404 });

  const messages = await prisma.communityMessage.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          image: true,
          role: true,
          gameProfile: { select: { flashcardCorrectCount: true } },
        },
      },
      replyTo: {
        select: {
          id: true,
          body: true,
          author: { select: { name: true, email: true } },
        },
      },
      linkedRoom: { select: { id: true, name: true } },
      reactions: { select: { userId: true, type: true } },
    },
    take: 200,
  });

  const authorIds = Array.from(new Set(messages.map((message) => message.authorId)));
  const receivedReactions = authorIds.length
    ? await prisma.communityMessageReaction.findMany({
        where: {
          type: "ONIGIRI",
          message: { authorId: { in: authorIds } },
        },
        select: { message: { select: { authorId: true } } },
      })
    : [];
  const totals = new Map<string, number>();
  for (const reaction of receivedReactions) {
    const authorId = reaction.message.authorId;
    totals.set(authorId, (totals.get(authorId) ?? 0) + 1);
  }

  return NextResponse.json({
    room,
    messages: messages.map((message) => {
      const onigiriCount = message.reactions.filter((reaction) => reaction.type === "ONIGIRI").length;
      const authorOnigiriTotal = totals.get(message.authorId) ?? 0;
      return {
        id: message.id,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
        replyTo: message.replyTo
          ? {
              id: message.replyTo.id,
              body: message.replyTo.body,
              authorName: message.replyTo.author.name ?? message.replyTo.author.email,
            }
          : null,
        linkedRoom: message.linkedRoom,
        onigiriCount,
        likedByMe: message.reactions.some((reaction) => reaction.userId === currentUser.id && reaction.type === "ONIGIRI"),
        author: {
          name: message.author.name ?? message.author.email,
          avatarUrl: message.author.avatarUrl ?? message.author.image,
          role: message.author.role,
          learningBadge: getLearningBadgeLabel(message.author.gameProfile),
          onigiriBadge: getOnigiriBadge(authorOnigiriTotal, message.author.role),
        },
      };
    }),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Silakan login untuk mengirim pesan." }, { status: 401 });
  }

  const { roomId } = await params;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });

  const body = (await request.json().catch(() => null)) as {
    body?: unknown;
    replyToId?: unknown;
  } | null;
  const messageBody = typeof body?.body === "string" ? body.body.trim() : "";
  const replyToId = typeof body?.replyToId === "string" ? body.replyToId : null;

  if (messageBody.length < 1 || messageBody.length > 1500) {
    return NextResponse.json({ error: "Pesan harus 1 sampai 1500 karakter." }, { status: 400 });
  }

  const moderation = moderateCommunityMessage(messageBody);
  if (!moderation.allowed) {
    return NextResponse.json({ error: blockedMessage, moderation }, { status: 400 });
  }

  const room = await prisma.communityRoom.findUnique({ where: { id: roomId }, select: { id: true } });
  if (!room) return NextResponse.json({ error: "Room tidak ditemukan." }, { status: 404 });

  const linkedRoomId = extractInternalLinkedRoomId(messageBody);
  const linkedRoom = linkedRoomId
    ? await prisma.communityRoom.findUnique({ where: { id: linkedRoomId }, select: { id: true } })
    : null;

  const message = await prisma.communityMessage.create({
    data: {
      roomId,
      authorId: user.id,
      body: messageBody,
      replyToId,
      linkedRoomId: linkedRoom?.id ?? null,
    },
  });

  await prisma.communityRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } });

  return NextResponse.json({ message }, { status: 201 });
}
