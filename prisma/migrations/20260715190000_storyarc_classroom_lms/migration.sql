CREATE TYPE "StoryArcClassStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "StoryArcAssignmentStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED');

CREATE TABLE "StoryArcClass" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "grade" "StoryArcGrade" NOT NULL,
  "section" TEXT NOT NULL,
  "joinCode" TEXT NOT NULL,
  "status" "StoryArcClassStatus" NOT NULL DEFAULT 'ACTIVE',
  "teacherId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoryArcClass_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoryArcClassMember" (
  "id" TEXT NOT NULL,
  "classId" TEXT NOT NULL,
  "learnerId" TEXT NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StoryArcClassMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoryArcAssignment" (
  "id" TEXT NOT NULL,
  "classId" TEXT NOT NULL,
  "revisionId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "instructions" TEXT,
  "availableFrom" TIMESTAMP(3) NOT NULL,
  "dueAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoryArcAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoryArcAssignmentProgress" (
  "id" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "learnerId" TEXT NOT NULL,
  "status" "StoryArcAssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StoryArcAssignmentProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StoryArcClass_joinCode_key" ON "StoryArcClass"("joinCode");
CREATE INDEX "StoryArcClass_teacherId_status_idx" ON "StoryArcClass"("teacherId", "status");
CREATE INDEX "StoryArcClass_grade_section_idx" ON "StoryArcClass"("grade", "section");
CREATE UNIQUE INDEX "StoryArcClass_teacherId_grade_section_key" ON "StoryArcClass"("teacherId", "grade", "section");
CREATE INDEX "StoryArcClassMember_learnerId_joinedAt_idx" ON "StoryArcClassMember"("learnerId", "joinedAt");
CREATE UNIQUE INDEX "StoryArcClassMember_classId_learnerId_key" ON "StoryArcClassMember"("classId", "learnerId");
CREATE INDEX "StoryArcAssignment_classId_availableFrom_idx" ON "StoryArcAssignment"("classId", "availableFrom");
CREATE INDEX "StoryArcAssignment_revisionId_availableFrom_idx" ON "StoryArcAssignment"("revisionId", "availableFrom");
CREATE UNIQUE INDEX "StoryArcAssignment_classId_revisionId_key" ON "StoryArcAssignment"("classId", "revisionId");
CREATE INDEX "StoryArcAssignmentProgress_learnerId_status_idx" ON "StoryArcAssignmentProgress"("learnerId", "status");
CREATE UNIQUE INDEX "StoryArcAssignmentProgress_assignmentId_learnerId_key" ON "StoryArcAssignmentProgress"("assignmentId", "learnerId");

ALTER TABLE "StoryArcClass" ADD CONSTRAINT "StoryArcClass_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StoryArcClassMember" ADD CONSTRAINT "StoryArcClassMember_classId_fkey" FOREIGN KEY ("classId") REFERENCES "StoryArcClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoryArcClassMember" ADD CONSTRAINT "StoryArcClassMember_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoryArcAssignment" ADD CONSTRAINT "StoryArcAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "StoryArcClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoryArcAssignment" ADD CONSTRAINT "StoryArcAssignment_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "StoryArcContentRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StoryArcAssignment" ADD CONSTRAINT "StoryArcAssignment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StoryArcAssignmentProgress" ADD CONSTRAINT "StoryArcAssignmentProgress_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "StoryArcAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoryArcAssignmentProgress" ADD CONSTRAINT "StoryArcAssignmentProgress_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
