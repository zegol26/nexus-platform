import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { canCreateCommunityRoom } from "@/lib/community/eligibility";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Silakan login untuk membuka komunitas." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });

  const [rooms, eligible] = await Promise.all([
    prisma.communityRoom.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        createdBy: { select: { name: true, email: true, role: true } },
        _count: { select: { messages: true } },
      },
    }),
    canCreateCommunityRoom(user.id),
  ]);

  return NextResponse.json({
    isAdmin: user.role === "ADMIN" || user.role === "SUPER_ADMIN",
    canCreateRoom: eligible,
    createRoomHint: eligible ? null : "Kamu bisa membuat room setelah mencapai level Flashcard Spark.",
    rooms: rooms.map((room) => ({
      id: room.id,
      name: room.name,
      description: room.description,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
      messageCount: room._count.messages,
      createdBy: {
        name: room.createdBy.name ?? room.createdBy.email,
        role: room.createdBy.role,
      },
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Silakan login untuk membuat room." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });

  if (!(await canCreateCommunityRoom(user.id))) {
    return NextResponse.json(
      { error: "Kamu bisa membuat room setelah mencapai level Flashcard Spark." },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    description?: unknown;
  } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";

  if (name.length < 3 || name.length > 80) {
    return NextResponse.json({ error: "Nama room harus 3 sampai 80 karakter." }, { status: 400 });
  }

  const room = await prisma.communityRoom.create({
    data: {
      name,
      description: description || null,
      createdById: user.id,
    },
  });

  return NextResponse.json({ room }, { status: 201 });
}
