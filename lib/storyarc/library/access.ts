import { prisma } from "@/lib/db/prisma";
import { isStoryArcTeacherRole } from "@/lib/storyarc/access";
import { canManageStoryArcClass } from "@/lib/storyarc/classroom/access";

export async function getStoryArcLearnerGradeScope(userId: string) {
  const membership = await prisma.storyArcClassMember.findFirst({
    where: { learnerId: userId, classroom: { status: "ACTIVE" } },
    orderBy: { joinedAt: "desc" },
    select: { classroom: { select: { grade: true } } },
  });
  return membership?.classroom.grade ?? null;
}

export async function canReadStoryArcLibraryClass(userId: string, role: string, classId: string) {
  if (isStoryArcTeacherRole(role)) return canManageStoryArcClass(userId, role, classId);
  const grade = await getStoryArcLearnerGradeScope(userId);
  if (!grade) return false;
  return Boolean(await prisma.storyArcClassMember.findFirst({
    where: {
      classId,
      learnerId: userId,
      classroom: { grade, status: "ACTIVE" },
    },
    select: { id: true },
  }));
}
