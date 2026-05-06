import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Silakan login untuk mengelola komunitas." }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Hanya admin yang dapat menghapus room." }, { status: 403 });
  }

  const { roomId } = await params;
  const room = await prisma.communityRoom.findUnique({ where: { id: roomId }, select: { id: true } });
  if (!room) return NextResponse.json({ error: "Room tidak ditemukan." }, { status: 404 });

  await prisma.communityRoom.delete({ where: { id: roomId } });
  return NextResponse.json({ deleted: true });
}
