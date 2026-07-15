import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser, isStoryArcTeacherRole } from "@/lib/storyarc/access";
import { calculateStoryArcAssignmentScore, getStoryArcAssignmentAvailability } from "@/lib/storyarc/classroom/policy";

export async function POST(request: Request, context: { params: Promise<{ assignmentId: string }> }) {
  const [user, { assignmentId }] = await Promise.all([getStoryArcSessionUser(), context.params]);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (isStoryArcTeacherRole(user.role)) return NextResponse.json({ error: "Learner account required." }, { status: 403 });

  const assignment = await prisma.storyArcAssignment.findFirst({
    where: {
      id: assignmentId,
      classroom: { members: { some: { learnerId: user.id } } },
      revision: { item: { track: "EXAM_LAB" } },
    },
    select: { id: true, availableFrom: true, dueAt: true },
  });
  if (!assignment) return NextResponse.json({ error: "Exam assignment was not found." }, { status: 404 });
  if (getStoryArcAssignmentAvailability(assignment.availableFrom, assignment.dueAt) === "LOCKED") {
    return NextResponse.json({ error: "This assignment is not available yet." }, { status: 403 });
  }

  const payload = await request.json().catch(() => null) as { score?: unknown; maxScore?: unknown } | null;
  const score = Number(payload?.score);
  const maxScore = Number(payload?.maxScore);
  const result = calculateStoryArcAssignmentScore(score, maxScore);
  if (!result) {
    return NextResponse.json({ error: "A valid objective score is required." }, { status: 400 });
  }

  const now = new Date();
  const progress = await prisma.storyArcAssignmentProgress.upsert({
    where: { assignmentId_learnerId: { assignmentId: assignment.id, learnerId: user.id } },
    create: {
      assignmentId: assignment.id,
      learnerId: user.id,
      status: "COMPLETED",
      startedAt: now,
      completedAt: now,
      ...result,
      scoreSource: "EXAM_LAB_AUTO",
      scoredAt: now,
    },
    update: {
      status: "COMPLETED",
      completedAt: now,
      ...result,
      scoreSource: "EXAM_LAB_AUTO",
      scoredAt: now,
    },
    select: { score: true, maxScore: true, scorePercent: true, status: true },
  });
  return NextResponse.json({ progress });
}
