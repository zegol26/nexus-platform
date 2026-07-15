"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser, isStoryArcTeacherRole } from "@/lib/storyarc/access";
import { canJoinStoryArcGrade, canManageStoryArcClass } from "@/lib/storyarc/classroom/access";
import { getStoryArcAssignmentAvailability } from "@/lib/storyarc/classroom/policy";

const classroomPath = "/apps/storyarc/classroom";
const value = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const fail = (message: string): never => redirect(`${classroomPath}?error=${encodeURIComponent(message)}`);
const done = (message: string): never => {
  revalidatePath(classroomPath);
  redirect(`${classroomPath}?success=${encodeURIComponent(message)}`);
};

export async function createStoryArcClass(formData: FormData) {
  const user = await getStoryArcSessionUser();
  if (!user || !isStoryArcTeacherRole(user.role)) return fail("Teacher access required.");
  const grade = value(formData, "grade");
  const section = value(formData, "section").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 8);
  if (!["GRADE_10", "GRADE_11", "GRADE_12"].includes(grade) || !section) fail("Grade and section are required.");
  const label = `${grade.replace("GRADE_", "")} - ${section}`;
  await prisma.storyArcClass.create({
    data: { name: value(formData, "name") || `Class ${label}`, grade: grade as "GRADE_10" | "GRADE_11" | "GRADE_12", section, teacherId: user.id, joinCode: randomBytes(3).toString("hex").toUpperCase() },
  }).catch(() => fail("That class section already exists for this teacher."));
  done(`Class ${label} created.`);
}

export async function enrollStoryArcLearner(formData: FormData) {
  const user = await getStoryArcSessionUser();
  const classId = value(formData, "classId");
  if (!user || !(await canManageStoryArcClass(user.id, user.role, classId))) return fail("You cannot manage this class.");
  const classroom = await prisma.storyArcClass.findUnique({ where: { id: classId }, select: { grade: true } });
  if (!classroom) return fail("Class not found.");
  const learner = await prisma.user.findUnique({ where: { email: value(formData, "email").toLowerCase() }, select: { id: true, role: true } });
  if (!learner || learner.role !== "USER") return fail("Registered learner email was not found.");
  if (!(await canJoinStoryArcGrade(learner.id, classroom.grade))) return fail("Learner already belongs to an active class in another grade.");
  await prisma.storyArcClassMember.upsert({ where: { classId_learnerId: { classId, learnerId: learner.id } }, create: { classId, learnerId: learner.id }, update: {} });
  const assignments = await prisma.storyArcAssignment.findMany({ where: { classId }, select: { id: true } });
  if (assignments.length) await prisma.storyArcAssignmentProgress.createMany({ data: assignments.map((assignment) => ({ assignmentId: assignment.id, learnerId: learner.id })), skipDuplicates: true });
  done("Learner enrolled.");
}

export async function joinStoryArcClass(formData: FormData) {
  const user = await getStoryArcSessionUser();
  if (!user || isStoryArcTeacherRole(user.role)) return fail("Learner account required.");
  const classroom = await prisma.storyArcClass.findUnique({ where: { joinCode: value(formData, "joinCode").toUpperCase() }, select: { id: true, status: true, grade: true } });
  if (!classroom || classroom.status !== "ACTIVE") return fail("Active class code was not found.");
  if (!(await canJoinStoryArcGrade(user.id, classroom.grade))) return fail("Your account already belongs to an active class in another grade.");
  await prisma.storyArcClassMember.upsert({ where: { classId_learnerId: { classId: classroom.id, learnerId: user.id } }, create: { classId: classroom.id, learnerId: user.id }, update: {} });
  const assignments = await prisma.storyArcAssignment.findMany({ where: { classId: classroom.id }, select: { id: true } });
  if (assignments.length) await prisma.storyArcAssignmentProgress.createMany({ data: assignments.map((assignment) => ({ assignmentId: assignment.id, learnerId: user.id })), skipDuplicates: true });
  done("You joined the class.");
}

export async function createStoryArcAssignment(formData: FormData) {
  const user = await getStoryArcSessionUser();
  const classId = value(formData, "classId");
  if (!user || !(await canManageStoryArcClass(user.id, user.role, classId))) return fail("You cannot assign to this class.");
  const classroom = await prisma.storyArcClass.findUnique({ where: { id: classId }, select: { grade: true } });
  const revision = await prisma.storyArcContentRevision.findFirst({ where: { id: value(formData, "revisionId"), state: "PUBLISHED", item: { grade: classroom?.grade } }, select: { id: true, title: true } });
  if (!revision) return fail("Choose published content matching the class grade.");
  const availableFrom = new Date(value(formData, "availableFrom"));
  const rawDue = value(formData, "dueAt");
  const dueAt = rawDue ? new Date(rawDue) : null;
  if (Number.isNaN(availableFrom.getTime()) || (dueAt && dueAt <= availableFrom)) fail("Release time must be valid and before the deadline.");
  const assignment = await prisma.storyArcAssignment.create({
    data: { classId, revisionId: revision.id, createdById: user.id, title: value(formData, "title") || revision.title, instructions: value(formData, "instructions") || null, availableFrom, dueAt },
  }).catch(() => fail("This content is already assigned to the class."));
  const members = await prisma.storyArcClassMember.findMany({ where: { classId }, select: { learnerId: true } });
  if (members.length) await prisma.storyArcAssignmentProgress.createMany({ data: members.map((member) => ({ assignmentId: assignment.id, learnerId: member.learnerId })), skipDuplicates: true });
  done("Assignment scheduled.");
}

export async function updateStoryArcAssignmentProgress(formData: FormData) {
  const user = await getStoryArcSessionUser();
  if (!user || isStoryArcTeacherRole(user.role)) return fail("Learner account required.");
  const assignment = await prisma.storyArcAssignment.findFirst({ where: { id: value(formData, "assignmentId"), classroom: { members: { some: { learnerId: user.id } } } } });
  if (!assignment || getStoryArcAssignmentAvailability(assignment.availableFrom, assignment.dueAt) === "LOCKED") return fail("This assignment is not available yet.");
  const complete = value(formData, "status") === "COMPLETED";
  await prisma.storyArcAssignmentProgress.upsert({
    where: { assignmentId_learnerId: { assignmentId: assignment.id, learnerId: user.id } },
    create: { assignmentId: assignment.id, learnerId: user.id, status: complete ? "COMPLETED" : "IN_PROGRESS", startedAt: new Date(), completedAt: complete ? new Date() : null },
    update: { status: complete ? "COMPLETED" : "IN_PROGRESS", startedAt: new Date(), completedAt: complete ? new Date() : null },
  });
  done(complete ? "Assignment completed." : "Assignment started.");
}

export async function scoreStoryArcAssignment(formData: FormData) {
  const user = await getStoryArcSessionUser();
  const assignmentId = value(formData, "assignmentId");
  const learnerId = value(formData, "learnerId");
  const scorePercent = Number(value(formData, "scorePercent"));
  const assignment = user ? await prisma.storyArcAssignment.findUnique({
    where: { id: assignmentId },
    select: {
      classId: true,
      classroom: { select: { members: { where: { learnerId }, select: { learnerId: true } } } },
    },
  }) : null;
  if (!user || !assignment || !(await canManageStoryArcClass(user.id, user.role, assignment.classId))) {
    return fail("You cannot grade this assignment.");
  }
  if (assignment.classroom.members.length === 0) return fail("Learner is not enrolled in this class.");
  if (!Number.isFinite(scorePercent) || scorePercent < 0 || scorePercent > 100) {
    return fail("Score must be between 0 and 100.");
  }
  const now = new Date();
  await prisma.storyArcAssignmentProgress.upsert({
    where: { assignmentId_learnerId: { assignmentId, learnerId } },
    create: {
      assignmentId,
      learnerId,
      status: "COMPLETED",
      startedAt: now,
      completedAt: now,
      score: scorePercent,
      maxScore: 100,
      scorePercent,
      scoreSource: "TEACHER",
      scoredAt: now,
    },
    update: {
      status: "COMPLETED",
      completedAt: now,
      score: scorePercent,
      maxScore: 100,
      scorePercent,
      scoreSource: "TEACHER",
      scoredAt: now,
    },
  });
  done("Score saved.");
}
