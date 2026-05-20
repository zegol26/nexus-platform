import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { READINESS_CHECKLIST } from "@/lib/pmp/progress";

export const dynamic = "force-dynamic";

const VALID_KEYS = new Set(READINESS_CHECKLIST.map((item) => item.key));

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
}

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.pmpReadinessItem.findMany({ where: { userId: user.id } });
  return NextResponse.json({
    items,
    checklist: READINESS_CHECKLIST,
  });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const itemKey = typeof body?.itemKey === "string" ? body.itemKey : "";
  const isComplete = Boolean(body?.isComplete);
  if (!VALID_KEYS.has(itemKey)) {
    return NextResponse.json({ error: "Unknown itemKey" }, { status: 400 });
  }

  const now = new Date();
  await prisma.pmpReadinessItem.upsert({
    where: { userId_itemKey: { userId: user.id, itemKey } },
    create: {
      userId: user.id,
      itemKey,
      isComplete,
      completedAt: isComplete ? now : null,
    },
    update: {
      isComplete,
      completedAt: isComplete ? now : null,
    },
  });

  const items = await prisma.pmpReadinessItem.findMany({ where: { userId: user.id } });
  return NextResponse.json({ items });
}
