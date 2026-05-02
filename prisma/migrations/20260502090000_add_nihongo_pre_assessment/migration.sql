-- Add Nihongo pre-assessment, adaptive profile, and original badge support.

CREATE TABLE "NihongoBadge" (
  "id" TEXT NOT NULL,
  "nameIndonesian" TEXT NOT NULL,
  "nameJapanese" TEXT NOT NULL,
  "archetype" TEXT NOT NULL,
  "levelRequirement" TEXT NOT NULL,
  "motivationalMessage" TEXT NOT NULL,
  "imageUrl" TEXT,
  "iconUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "NihongoBadge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NihongoAssessmentSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "overallScore" INTEGER,
  "estimatedLevel" TEXT,
  "weaknessTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "strengthTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "recommendedCurriculumFocus" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "recommendedLessonIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "recommendedDailyPlan" TEXT,
  "aiFeedbackIndonesian" TEXT,
  "encouragementJapanese" TEXT,
  "badgeId" TEXT,
  "finalEvaluation" JSONB,
  "pronunciationScore" INTEGER,
  "pronunciationFeedback" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "NihongoAssessmentSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NihongoAssessmentAnswer" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "userAnswer" TEXT,
  "correctAnswer" TEXT,
  "isCorrect" BOOLEAN,
  "score" INTEGER NOT NULL DEFAULT 0,
  "maxScore" INTEGER NOT NULL DEFAULT 1,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "NihongoAssessmentAnswer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserNihongoProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "currentLevel" TEXT NOT NULL DEFAULT 'Absolute Beginner',
  "targetLevel" TEXT NOT NULL DEFAULT 'N4',
  "weaknessTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "strengthTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "recommendedLessonIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "recommendedCurriculumFocus" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "recommendedDailyPlan" TEXT,
  "nextLessonId" TEXT,
  "badgeId" TEXT,
  "assessmentCompletedAt" TIMESTAMP(3),
  "latestAssessmentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UserNihongoProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserNihongoBadge" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "badgeId" TEXT NOT NULL,
  "assessmentSessionId" TEXT,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserNihongoBadge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserNihongoProfile_userId_key" ON "UserNihongoProfile"("userId");
CREATE UNIQUE INDEX "UserNihongoBadge_userId_badgeId_key" ON "UserNihongoBadge"("userId", "badgeId");
CREATE INDEX "NihongoAssessmentSession_userId_status_idx" ON "NihongoAssessmentSession"("userId", "status");
CREATE INDEX "NihongoAssessmentAnswer_sessionId_idx" ON "NihongoAssessmentAnswer"("sessionId");
CREATE INDEX "NihongoAssessmentAnswer_category_idx" ON "NihongoAssessmentAnswer"("category");

ALTER TABLE "NihongoAssessmentSession"
  ADD CONSTRAINT "NihongoAssessmentSession_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NihongoAssessmentSession"
  ADD CONSTRAINT "NihongoAssessmentSession_badgeId_fkey"
  FOREIGN KEY ("badgeId") REFERENCES "NihongoBadge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "NihongoAssessmentAnswer"
  ADD CONSTRAINT "NihongoAssessmentAnswer_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "NihongoAssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserNihongoProfile"
  ADD CONSTRAINT "UserNihongoProfile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserNihongoProfile"
  ADD CONSTRAINT "UserNihongoProfile_nextLessonId_fkey"
  FOREIGN KEY ("nextLessonId") REFERENCES "NihongoLesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UserNihongoProfile"
  ADD CONSTRAINT "UserNihongoProfile_badgeId_fkey"
  FOREIGN KEY ("badgeId") REFERENCES "NihongoBadge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UserNihongoBadge"
  ADD CONSTRAINT "UserNihongoBadge_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserNihongoBadge"
  ADD CONSTRAINT "UserNihongoBadge_badgeId_fkey"
  FOREIGN KEY ("badgeId") REFERENCES "NihongoBadge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
