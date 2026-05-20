import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return user;
}

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dumps = await prisma.pmpBrainDump.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ dumps });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title =
    typeof body?.title === "string" && body.title.trim()
      ? body.title.trim().slice(0, 200)
      : "Brain dump";
  const content =
    typeof body?.content === "string" && body.content.trim()
      ? body.content.trim().slice(0, 20000)
      : "";
  if (!content) {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }
  const tags = Array.isArray(body?.tags)
    ? body.tags
        .filter((t: unknown): t is string => typeof t === "string" && t.trim().length > 0)
        .map((t: string) => t.trim().slice(0, 40))
        .slice(0, 10)
    : [];

  const dump = await prisma.pmpBrainDump.create({
    data: { userId: user.id, title, content, tags },
  });

  return NextResponse.json({ dump });
}

export async function PATCH(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = typeof body?.id === "string" ? body.id : null;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await prisma.pmpBrainDump.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: { title?: string; content?: string; tags?: string[] } = {};
  if (typeof body?.title === "string" && body.title.trim()) {
    data.title = body.title.trim().slice(0, 200);
  }
  if (typeof body?.content === "string" && body.content.trim()) {
    data.content = body.content.trim().slice(0, 20000);
  }
  if (Array.isArray(body?.tags)) {
    data.tags = body.tags
      .filter((t: unknown): t is string => typeof t === "string" && t.trim().length > 0)
      .map((t: string) => t.trim().slice(0, 40))
      .slice(0, 10);
  }

  const dump = await prisma.pmpBrainDump.update({ where: { id }, data });
  return NextResponse.json({ dump });
}

export async function DELETE(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await prisma.pmpBrainDump.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.pmpBrainDump.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
