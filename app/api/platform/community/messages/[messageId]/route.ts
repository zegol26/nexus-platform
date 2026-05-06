import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Silakan login untuk mengelola pesan." }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Hanya admin yang dapat menghapus pesan." }, { status: 403 });
  }

  const { messageId } = await params;
  const message = await prisma.communityMessage.findUnique({
    where: { id: messageId },
    select: { id: true, roomId: true },
  });
  if (!message) return NextResponse.json({ error: "Pesan tidak ditemukan." }, { status: 404 });

  await prisma.communityMessage.delete({ where: { id: messageId } });
  await prisma.communityRoom.update({ where: { id: message.roomId }, data: { updatedAt: new Date() } });
  return NextResponse.json({ deleted: true });
}
