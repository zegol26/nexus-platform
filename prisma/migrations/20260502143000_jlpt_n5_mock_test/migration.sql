CREATE TABLE "NihongoMockTestQuestion" (
    "id" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "originalId" INTEGER,
    "level" TEXT NOT NULL,
    "testType" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "subCategory" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NihongoMockTestQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NihongoMockTestAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "totalQuestions" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "scorePercent" INTEGER NOT NULL,
    "readinessThreshold" INTEGER NOT NULL DEFAULT 70,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NihongoMockTestAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NihongoMockTestAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userAnswer" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NihongoMockTestAnswer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NihongoMockTestQuestion_sourceKey_key" ON "NihongoMockTestQuestion"("sourceKey");
CREATE INDEX "NihongoMockTestQuestion_level_idx" ON "NihongoMockTestQuestion"("level");
CREATE INDEX "NihongoMockTestQuestion_section_idx" ON "NihongoMockTestQuestion"("section");
CREATE INDEX "NihongoMockTestQuestion_subCategory_idx" ON "NihongoMockTestQuestion"("subCategory");
CREATE INDEX "NihongoMockTestQuestion_isActive_idx" ON "NihongoMockTestQuestion"("isActive");
CREATE INDEX "NihongoMockTestAttempt_userId_idx" ON "NihongoMockTestAttempt"("userId");
CREATE INDEX "NihongoMockTestAttempt_level_idx" ON "NihongoMockTestAttempt"("level");
CREATE INDEX "NihongoMockTestAttempt_scorePercent_idx" ON "NihongoMockTestAttempt"("scorePercent");
CREATE UNIQUE INDEX "NihongoMockTestAnswer_attemptId_questionId_key" ON "NihongoMockTestAnswer"("attemptId", "questionId");
CREATE INDEX "NihongoMockTestAnswer_attemptId_idx" ON "NihongoMockTestAnswer"("attemptId");
CREATE INDEX "NihongoMockTestAnswer_questionId_idx" ON "NihongoMockTestAnswer"("questionId");

ALTER TABLE "NihongoMockTestAttempt" ADD CONSTRAINT "NihongoMockTestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NihongoMockTestAnswer" ADD CONSTRAINT "NihongoMockTestAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "NihongoMockTestAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NihongoMockTestAnswer" ADD CONSTRAINT "NihongoMockTestAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "NihongoMockTestQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
