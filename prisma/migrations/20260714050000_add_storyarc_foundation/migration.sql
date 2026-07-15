CREATE TYPE "StoryArcGrade" AS ENUM ('GRADE_10', 'GRADE_11', 'GRADE_12');
CREATE TYPE "StoryArcTrack" AS ENUM ('SCHOOL_CORE', 'STORY_MODE', 'EXAM_LAB');
CREATE TYPE "StoryArcContentState" AS ENUM ('DRAFT', 'VALIDATING', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED', 'ARCHIVED');
CREATE TYPE "StoryArcContentKind" AS ENUM ('LEARNING_ITEM', 'ASSESSMENT', 'VOCABULARY', 'EXPRESSION');
CREATE TYPE "StoryArcSkill" AS ENUM ('LISTENING', 'SPEAKING', 'READING', 'WRITING', 'GRAMMAR', 'VOCABULARY');
CREATE TYPE "StoryArcEvidenceClass" AS ENUM ('EXPOSURE', 'PRACTICE', 'ASSESSED_EVIDENCE', 'RECALL_EVIDENCE');
CREATE TYPE "StoryArcAttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'SCORED', 'ABANDONED');
CREATE TYPE "StoryArcUnlockKind" AS ENUM ('VOCABULARY', 'EXPRESSION');

CREATE TABLE "StoryArcCurriculumSource" (
  "id" TEXT NOT NULL, "sourceKey" TEXT NOT NULL, "title" TEXT NOT NULL, "authority" TEXT NOT NULL,
  "reference" TEXT, "verificationNote" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "StoryArcCurriculumSource_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StoryArcCurriculumVersion" (
  "id" TEXT NOT NULL, "sourceId" TEXT NOT NULL, "versionKey" TEXT NOT NULL, "title" TEXT NOT NULL,
  "effectiveFrom" TIMESTAMP(3), "retiredAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "StoryArcCurriculumVersion_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StoryArcCompetency" (
  "id" TEXT NOT NULL, "curriculumVersionId" TEXT NOT NULL, "competencyKey" TEXT NOT NULL, "title" TEXT NOT NULL,
  "description" TEXT NOT NULL, "authoritativeRef" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "StoryArcCompetency_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StoryArcLearningObjective" (
  "id" TEXT NOT NULL, "curriculumVersionId" TEXT NOT NULL, "competencyId" TEXT NOT NULL, "objectiveKey" TEXT NOT NULL,
  "title" TEXT NOT NULL, "primarySkill" "StoryArcSkill" NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "StoryArcLearningObjective_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StoryArcContentItem" (
  "id" TEXT NOT NULL, "stableId" TEXT NOT NULL, "curriculumVersionId" TEXT NOT NULL,
  "kind" "StoryArcContentKind" NOT NULL, "grade" "StoryArcGrade" NOT NULL, "track" "StoryArcTrack" NOT NULL,
  "phase" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoryArcContentItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StoryArcContentRevision" (
  "id" TEXT NOT NULL, "itemId" TEXT NOT NULL, "revision" INTEGER NOT NULL, "schemaVersion" TEXT NOT NULL,
  "contentHash" TEXT NOT NULL, "title" TEXT NOT NULL, "state" "StoryArcContentState" NOT NULL DEFAULT 'DRAFT',
  "primarySkill" "StoryArcSkill" NOT NULL, "supportingSkills" "StoryArcSkill"[], "payload" JSONB NOT NULL,
  "validationReport" JSONB, "sourceMetadata" JSONB, "createdById" TEXT NOT NULL, "reviewedById" TEXT,
  "approvedById" TEXT, "reviewedAt" TIMESTAMP(3), "approvedAt" TIMESTAMP(3), "publishedAt" TIMESTAMP(3),
  "retiredAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StoryArcContentRevision_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StoryArcRevisionObjective" (
  "id" TEXT NOT NULL, "revisionId" TEXT NOT NULL, "objectiveId" TEXT NOT NULL, "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "StoryArcRevisionObjective_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StoryArcLearningAttempt" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "itemId" TEXT NOT NULL, "revisionId" TEXT NOT NULL, "mode" TEXT NOT NULL,
  "status" "StoryArcAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS', "idempotencyKey" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "submittedAt" TIMESTAMP(3),
  CONSTRAINT "StoryArcLearningAttempt_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StoryArcLearningEvidence" (
  "id" TEXT NOT NULL, "attemptId" TEXT NOT NULL, "userId" TEXT NOT NULL, "revisionId" TEXT NOT NULL,
  "evidenceClass" "StoryArcEvidenceClass" NOT NULL, "competencyKey" TEXT NOT NULL, "objectiveKey" TEXT NOT NULL,
  "skill" "StoryArcSkill" NOT NULL, "rubricRevisionId" TEXT, "rawScore" DOUBLE PRECISION, "maxScore" DOUBLE PRECISION,
  "normalizedScore" DOUBLE PRECISION, "confidence" DOUBLE PRECISION, "evaluatorType" TEXT NOT NULL,
  "evaluatorRef" TEXT, "metadata" JSONB, "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StoryArcLearningEvidence_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StoryArcMasteryProjection" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "skill" "StoryArcSkill" NOT NULL, "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "band" TEXT NOT NULL DEFAULT 'NOT_ENOUGH_EVIDENCE', "evidenceThrough" TIMESTAMP(3), "algorithmVersion" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StoryArcMasteryProjection_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StoryArcMasteryProjectionChange" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "skill" "StoryArcSkill" NOT NULL, "evidenceId" TEXT NOT NULL,
  "beforeScore" DOUBLE PRECISION NOT NULL, "afterScore" DOUBLE PRECISION NOT NULL, "algorithmVersion" TEXT NOT NULL,
  "reasonCode" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StoryArcMasteryProjectionChange_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StoryArcPlayerState" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "currentArcId" TEXT NOT NULL, "currentEpisodeId" TEXT NOT NULL,
  "currentSceneId" TEXT NOT NULL, "checkpointId" TEXT NOT NULL, "completedNodeIds" TEXT[], "questState" JSONB NOT NULL,
  "relationshipState" JSONB NOT NULL, "decisionState" JSONB NOT NULL, "storyXp" INTEGER NOT NULL DEFAULT 0,
  "storyLevel" INTEGER NOT NULL DEFAULT 1, "stateVersion" INTEGER NOT NULL DEFAULT 1,
  "lastSavedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "StoryArcPlayerState_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StoryArcPlayerTransition" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "playerStateId" TEXT NOT NULL, "idempotencyKey" TEXT NOT NULL,
  "actionType" TEXT NOT NULL, "sourceRevisionId" TEXT NOT NULL, "sourceNodeId" TEXT NOT NULL, "payload" JSONB NOT NULL,
  "xpDelta" INTEGER NOT NULL DEFAULT 0, "stateVersionAfter" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "StoryArcPlayerTransition_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StoryArcLearnerUnlock" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "kind" "StoryArcUnlockKind" NOT NULL, "entryKey" TEXT NOT NULL,
  "sourceRevisionId" TEXT NOT NULL, "sourceIntentKey" TEXT NOT NULL, "futureRecallKey" TEXT NOT NULL,
  "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "StoryArcLearnerUnlock_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StoryArcCurriculumSource_sourceKey_key" ON "StoryArcCurriculumSource"("sourceKey");
CREATE INDEX "StoryArcCurriculumVersion_versionKey_idx" ON "StoryArcCurriculumVersion"("versionKey");
CREATE UNIQUE INDEX "StoryArcCurriculumVersion_sourceId_versionKey_key" ON "StoryArcCurriculumVersion"("sourceId", "versionKey");
CREATE INDEX "StoryArcCompetency_competencyKey_idx" ON "StoryArcCompetency"("competencyKey");
CREATE UNIQUE INDEX "StoryArcCompetency_curriculumVersionId_competencyKey_key" ON "StoryArcCompetency"("curriculumVersionId", "competencyKey");
CREATE INDEX "StoryArcLearningObjective_objectiveKey_idx" ON "StoryArcLearningObjective"("objectiveKey");
CREATE INDEX "StoryArcLearningObjective_competencyId_idx" ON "StoryArcLearningObjective"("competencyId");
CREATE UNIQUE INDEX "StoryArcLearningObjective_curriculumVersionId_objectiveKey_key" ON "StoryArcLearningObjective"("curriculumVersionId", "objectiveKey");
CREATE UNIQUE INDEX "StoryArcContentItem_stableId_key" ON "StoryArcContentItem"("stableId");
CREATE INDEX "StoryArcContentItem_grade_track_idx" ON "StoryArcContentItem"("grade", "track");
CREATE INDEX "StoryArcContentItem_phase_idx" ON "StoryArcContentItem"("phase");
CREATE INDEX "StoryArcContentItem_kind_idx" ON "StoryArcContentItem"("kind");
CREATE INDEX "StoryArcContentRevision_state_publishedAt_idx" ON "StoryArcContentRevision"("state", "publishedAt");
CREATE INDEX "StoryArcContentRevision_contentHash_idx" ON "StoryArcContentRevision"("contentHash");
CREATE UNIQUE INDEX "StoryArcContentRevision_itemId_revision_key" ON "StoryArcContentRevision"("itemId", "revision");
CREATE UNIQUE INDEX "StoryArcContentRevision_itemId_contentHash_key" ON "StoryArcContentRevision"("itemId", "contentHash");
CREATE INDEX "StoryArcRevisionObjective_objectiveId_idx" ON "StoryArcRevisionObjective"("objectiveId");
CREATE UNIQUE INDEX "StoryArcRevisionObjective_revisionId_objectiveId_key" ON "StoryArcRevisionObjective"("revisionId", "objectiveId");
CREATE INDEX "StoryArcLearningAttempt_userId_itemId_idx" ON "StoryArcLearningAttempt"("userId", "itemId");
CREATE INDEX "StoryArcLearningAttempt_revisionId_idx" ON "StoryArcLearningAttempt"("revisionId");
CREATE UNIQUE INDEX "StoryArcLearningAttempt_userId_idempotencyKey_key" ON "StoryArcLearningAttempt"("userId", "idempotencyKey");
CREATE INDEX "StoryArcLearningEvidence_userId_skill_occurredAt_idx" ON "StoryArcLearningEvidence"("userId", "skill", "occurredAt");
CREATE INDEX "StoryArcLearningEvidence_evidenceClass_idx" ON "StoryArcLearningEvidence"("evidenceClass");
CREATE INDEX "StoryArcLearningEvidence_objectiveKey_idx" ON "StoryArcLearningEvidence"("objectiveKey");
CREATE INDEX "StoryArcMasteryProjection_skill_score_idx" ON "StoryArcMasteryProjection"("skill", "score");
CREATE UNIQUE INDEX "StoryArcMasteryProjection_userId_skill_key" ON "StoryArcMasteryProjection"("userId", "skill");
CREATE UNIQUE INDEX "StoryArcMasteryProjectionChange_evidenceId_key" ON "StoryArcMasteryProjectionChange"("evidenceId");
CREATE INDEX "StoryArcMasteryProjectionChange_userId_skill_createdAt_idx" ON "StoryArcMasteryProjectionChange"("userId", "skill", "createdAt");
CREATE UNIQUE INDEX "StoryArcPlayerState_userId_key" ON "StoryArcPlayerState"("userId");
CREATE INDEX "StoryArcPlayerTransition_playerStateId_createdAt_idx" ON "StoryArcPlayerTransition"("playerStateId", "createdAt");
CREATE INDEX "StoryArcPlayerTransition_sourceRevisionId_idx" ON "StoryArcPlayerTransition"("sourceRevisionId");
CREATE UNIQUE INDEX "StoryArcPlayerTransition_userId_idempotencyKey_key" ON "StoryArcPlayerTransition"("userId", "idempotencyKey");
CREATE INDEX "StoryArcLearnerUnlock_userId_unlockedAt_idx" ON "StoryArcLearnerUnlock"("userId", "unlockedAt");
CREATE INDEX "StoryArcLearnerUnlock_futureRecallKey_idx" ON "StoryArcLearnerUnlock"("futureRecallKey");
CREATE UNIQUE INDEX "StoryArcLearnerUnlock_userId_kind_entryKey_key" ON "StoryArcLearnerUnlock"("userId", "kind", "entryKey");

ALTER TABLE "StoryArcCurriculumVersion" ADD CONSTRAINT "StoryArcCurriculumVersion_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "StoryArcCurriculumSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StoryArcCompetency" ADD CONSTRAINT "StoryArcCompetency_curriculumVersionId_fkey" FOREIGN KEY ("curriculumVersionId") REFERENCES "StoryArcCurriculumVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StoryArcLearningObjective" ADD CONSTRAINT "StoryArcLearningObjective_curriculumVersionId_fkey" FOREIGN KEY ("curriculumVersionId") REFERENCES "StoryArcCurriculumVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StoryArcLearningObjective" ADD CONSTRAINT "StoryArcLearningObjective_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "StoryArcCompetency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StoryArcContentItem" ADD CONSTRAINT "StoryArcContentItem_curriculumVersionId_fkey" FOREIGN KEY ("curriculumVersionId") REFERENCES "StoryArcCurriculumVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StoryArcContentRevision" ADD CONSTRAINT "StoryArcContentRevision_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "StoryArcContentItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StoryArcRevisionObjective" ADD CONSTRAINT "StoryArcRevisionObjective_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "StoryArcContentRevision"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoryArcRevisionObjective" ADD CONSTRAINT "StoryArcRevisionObjective_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "StoryArcLearningObjective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StoryArcLearningAttempt" ADD CONSTRAINT "StoryArcLearningAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoryArcLearningAttempt" ADD CONSTRAINT "StoryArcLearningAttempt_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "StoryArcContentItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StoryArcLearningAttempt" ADD CONSTRAINT "StoryArcLearningAttempt_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "StoryArcContentRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StoryArcLearningEvidence" ADD CONSTRAINT "StoryArcLearningEvidence_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "StoryArcLearningAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StoryArcLearningEvidence" ADD CONSTRAINT "StoryArcLearningEvidence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoryArcLearningEvidence" ADD CONSTRAINT "StoryArcLearningEvidence_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "StoryArcContentRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StoryArcMasteryProjection" ADD CONSTRAINT "StoryArcMasteryProjection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoryArcMasteryProjectionChange" ADD CONSTRAINT "StoryArcMasteryProjectionChange_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoryArcMasteryProjectionChange" ADD CONSTRAINT "StoryArcMasteryProjectionChange_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "StoryArcLearningEvidence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StoryArcPlayerState" ADD CONSTRAINT "StoryArcPlayerState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoryArcPlayerTransition" ADD CONSTRAINT "StoryArcPlayerTransition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoryArcPlayerTransition" ADD CONSTRAINT "StoryArcPlayerTransition_playerStateId_fkey" FOREIGN KEY ("playerStateId") REFERENCES "StoryArcPlayerState"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoryArcLearnerUnlock" ADD CONSTRAINT "StoryArcLearnerUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoryArcLearnerUnlock" ADD CONSTRAINT "StoryArcLearnerUnlock_sourceRevisionId_fkey" FOREIGN KEY ("sourceRevisionId") REFERENCES "StoryArcContentRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
