CREATE TABLE "EnglishInterviewQuestion" (
    "id" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "focusArea" TEXT NOT NULL,
    "expectedDuration" TEXT,
    "audioText" TEXT NOT NULL,
    "audioBase64" TEXT,
    "audioMimeType" TEXT,
    "audioProvider" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnglishInterviewQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EnglishInterviewAnswer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "audioBase64" TEXT NOT NULL,
    "audioMimeType" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "fileName" TEXT,
    "transcription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnglishInterviewAnswer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EnglishInterviewReview" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "englishLevel" TEXT NOT NULL,
    "pronunciationScore" INTEGER,
    "fluencyScore" INTEGER,
    "grammarScore" INTEGER,
    "vocabularyScore" INTEGER,
    "confidenceScore" INTEGER,
    "overallScore" INTEGER,
    "feedback" TEXT NOT NULL,
    "recommendation" TEXT,
    "visibleToUser" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnglishInterviewReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EnglishInterviewQuestion_sourceKey_key" ON "EnglishInterviewQuestion"("sourceKey");
CREATE INDEX "EnglishInterviewQuestion_order_idx" ON "EnglishInterviewQuestion"("order");
CREATE INDEX "EnglishInterviewQuestion_isActive_idx" ON "EnglishInterviewQuestion"("isActive");
CREATE INDEX "EnglishInterviewAnswer_userId_idx" ON "EnglishInterviewAnswer"("userId");
CREATE INDEX "EnglishInterviewAnswer_questionId_idx" ON "EnglishInterviewAnswer"("questionId");
CREATE INDEX "EnglishInterviewAnswer_submittedAt_idx" ON "EnglishInterviewAnswer"("submittedAt");
CREATE UNIQUE INDEX "EnglishInterviewReview_answerId_key" ON "EnglishInterviewReview"("answerId");
CREATE INDEX "EnglishInterviewReview_reviewerId_idx" ON "EnglishInterviewReview"("reviewerId");
CREATE INDEX "EnglishInterviewReview_englishLevel_idx" ON "EnglishInterviewReview"("englishLevel");

ALTER TABLE "EnglishInterviewAnswer" ADD CONSTRAINT "EnglishInterviewAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EnglishInterviewAnswer" ADD CONSTRAINT "EnglishInterviewAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "EnglishInterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EnglishInterviewReview" ADD CONSTRAINT "EnglishInterviewReview_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "EnglishInterviewAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EnglishInterviewReview" ADD CONSTRAINT "EnglishInterviewReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
