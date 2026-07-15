import { prisma } from "@/lib/db/prisma";
import { isStoryArcTeacherRole } from "@/lib/storyarc/access";
import { getStoryArcAssignmentAvailability } from "@/lib/storyarc/classroom/policy";

export async function canManageStoryArcClass(userId: string, role: string, classId: string) {
  if (role === "ADMIN" || role === "SUPER_ADMIN") return true;
  if (role !== "TEACHER") return false;
  return Boolean(await prisma.storyArcClass.findFirst({ where: { id: classId, teacherId: userId }, select: { id: true } }));
}

export async function canJoinStoryArcGrade(
  learnerId: string,
  grade: "GRADE_10" | "GRADE_11" | "GRADE_12"
) {
  const conflictingMembership = await prisma.storyArcClassMember.findFirst({
    where: {
      learnerId,
      classroom: { status: "ACTIVE", grade: { not: grade } },
    },
    select: { id: true },
  });
  return !conflictingMembership;
}

export async function resolveStoryArcAssignmentAccess(params: {
  userId: string;
  role: string;
  revisionId: string;
  assignmentId?: string;
  now?: Date;
}) {
  if (isStoryArcTeacherRole(params.role)) return { allowed: true, assignment: null, reason: "STAFF" as const };
  const memberships = await prisma.storyArcClassMember.findMany({ where: { learnerId: params.userId }, select: { classId: true } });
  if (memberships.length === 0) return { allowed: true, assignment: null, reason: "OPEN_CATALOG" as const };
  const assignment = await prisma.storyArcAssignment.findFirst({
    where: {
      revisionId: params.revisionId,
      classId: { in: memberships.map((item) => item.classId) },
      ...(params.assignmentId ? { id: params.assignmentId } : {}),
    },
  });
  if (!assignment) return { allowed: false, assignment: null, reason: "NOT_ASSIGNED" as const };
  const availability = getStoryArcAssignmentAvailability(assignment.availableFrom, assignment.dueAt, params.now);
  return { allowed: availability !== "LOCKED", assignment, reason: availability };
}
