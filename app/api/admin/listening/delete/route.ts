import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id : "";

  if (!id) {
    return NextResponse.json({ error: "Listening id is required." }, { status: 400 });
  }

  const entry = await prisma.readingPassage.findFirst({
    where: { id, contentType: "LISTENING" },
    select: { id: true },
  });

  if (!entry) {
    return NextResponse.json({ error: "Listening entry not found." }, { status: 404 });
  }

  await prisma.readingPassage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
