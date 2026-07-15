import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ contentId: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { contentId } = await params;
  const revision = await prisma.storyArcContentRevision.findFirst({
    where: { item: { stableId: contentId } },
    include: { item: true, objectives: { include: { objective: true } } },
    orderBy: { revision: "desc" },
  });
  if (!revision) return NextResponse.json({ error: "Content not found" }, { status: 404 });
  return NextResponse.json({ revision });
}
