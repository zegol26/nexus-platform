import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { PMP_NEXUS_COURSE } from "@/lib/pmp/course";
import { computeProgressSnapshot } from "@/lib/pmp/progress";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set(["not_started", "in_progress", "completed"]);
const LESSON_IDS = new Set(PMP_NEXUS_COURSE.map((lesson) => lesson.id));

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
}

async function getSnapshot(userId: string) {
  const [lessons, readiness] = await Promise.all([
    prisma.pmpLessonProgress.findMany({ where: { userId } }),
    prisma.pmpReadinessItem.findMany({ where: { userId, isComplete: true } }),
  ]);

  const snapshot = computeProgressSnapshot({
    completedLessonIds: lessons.filter((l) => l.status === "completed").map((l) => l.lessonId),
    inProgressLessonIds: lessons.filter((l) => l.status === "in_progress").map((l) => l.lessonId),
    readinessCompletedKeys: readiness.map((r) => r.itemKey),
  });

  return { lessons, snapshot };
}

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { lessons, snapshot } = await getSnapshot(user.id);
  return NextResponse.json({ lessons, snapshot });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId : "";
  const status = typeof body?.status === "string" ? body.status : "in_progress";
  if (!LESSON_IDS.has(lessonId)) {
    return NextResponse.json({ error: "Unknown lessonId" }, { status: 400 });
  }
  if (!VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const now = new Date();
  await prisma.pmpLessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: {
      userId: user.id,
      lessonId,
      status,
      lastAccessedAt: now,
      completedAt: status === "completed" ? now : null,
    },
    update: {
      status,
      lastAccessedAt: now,
      completedAt: status === "completed" ? now : null,
    },
  });

  const { lessons, snapshot } = await getSnapshot(user.id);
  return NextResponse.json({ lessons, snapshot });
}
