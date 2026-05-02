CREATE TABLE "AssessmentQuestion" (
  "id" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "skill" TEXT NOT NULL,
  "questionType" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "passage" TEXT,
  "options" JSONB NOT NULL,
  "correctAnswer" TEXT NOT NULL,
  "explanation" TEXT NOT NULL,
  "difficulty" INTEGER NOT NULL DEFAULT 1,
  "tags" TEXT[],
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sourceKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AssessmentQuestion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AssessmentQuestion_sourceKey_key" ON "AssessmentQuestion"("sourceKey");
CREATE INDEX "AssessmentQuestion_level_idx" ON "AssessmentQuestion"("level");
CREATE INDEX "AssessmentQuestion_skill_idx" ON "AssessmentQuestion"("skill");
CREATE INDEX "AssessmentQuestion_difficulty_idx" ON "AssessmentQuestion"("difficulty");
CREATE INDEX "AssessmentQuestion_isActive_idx" ON "AssessmentQuestion"("isActive");
