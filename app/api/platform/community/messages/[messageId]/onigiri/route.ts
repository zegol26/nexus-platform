import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Silakan login untuk memberi onigiri." }, { status: 401 });
  }

  const { messageId } = await params;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });

  const message = await prisma.communityMessage.findUnique({
    where: { id: messageId },
    select: { id: true, authorId: true },
  });
  if (!message) return NextResponse.json({ error: "Pesan tidak ditemukan." }, { status: 404 });

  if (message.authorId === user.id) {
    return NextResponse.json({ error: "Kamu tidak bisa memberi onigiri ke pesan sendiri." }, { status: 400 });
  }

  const existing = await prisma.communityMessageReaction.findUnique({
    where: {
      messageId_userId_type: {
        messageId,
        userId: user.id,
        type: "ONIGIRI",
      },
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.communityMessageReaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }

  await prisma.communityMessageReaction.create({
    data: {
      messageId,
      userId: user.id,
      type: "ONIGIRI",
    },
  });

  return NextResponse.json({ liked: true });
}
