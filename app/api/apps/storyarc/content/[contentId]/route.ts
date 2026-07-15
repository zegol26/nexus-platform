import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser } from "@/lib/storyarc/access";

export async function GET(_request: Request, { params }: { params: Promise<{ contentId: string }> }) {
  const user = await getStoryArcSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { contentId } = await params;
  const revision = await prisma.storyArcContentRevision.findFirst({
    where: { state: "PUBLISHED", item: { stableId: contentId } },
    include: { item: true, objectives: { include: { objective: true } } },
    orderBy: { revision: "desc" },
  });
  if (!revision) return NextResponse.json({ error: "Published content not found" }, { status: 404 });
  return NextResponse.json({ revision }, { headers: { "Cache-Control": "private, no-store" } });
}
