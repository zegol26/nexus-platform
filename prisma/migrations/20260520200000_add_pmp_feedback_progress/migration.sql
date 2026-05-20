CREATE TABLE "PmpAiFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'andromeda_chat',
    "sourceRef" TEXT,
    "contentHash" TEXT NOT NULL,
    "contentExcerpt" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "comment" TEXT,
    "userQuestion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PmpAiFeedback_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PmpAiFeedback_userId_contentHash_key" ON "PmpAiFeedback"("userId", "contentHash");
CREATE INDEX "PmpAiFeedback_userId_idx" ON "PmpAiFeedback"("userId");
CREATE INDEX "PmpAiFeedback_sourceType_idx" ON "PmpAiFeedback"("sourceType");
CREATE INDEX "PmpAiFeedback_rating_idx" ON "PmpAiFeedback"("rating");
CREATE INDEX "PmpAiFeedback_createdAt_idx" ON "PmpAiFeedback"("createdAt");

CREATE TABLE "PmpBrainDump" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PmpBrainDump_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PmpBrainDump_userId_idx" ON "PmpBrainDump"("userId");
CREATE INDEX "PmpBrainDump_createdAt_idx" ON "PmpBrainDump"("createdAt");

CREATE TABLE "PmpLessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "completedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PmpLessonProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PmpLessonProgress_userId_lessonId_key" ON "PmpLessonProgress"("userId", "lessonId");
CREATE INDEX "PmpLessonProgress_userId_idx" ON "PmpLessonProgress"("userId");
CREATE INDEX "PmpLessonProgress_status_idx" ON "PmpLessonProgress"("status");

CREATE TABLE "PmpReadinessItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PmpReadinessItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PmpReadinessItem_userId_itemKey_key" ON "PmpReadinessItem"("userId", "itemKey");
CREATE INDEX "PmpReadinessItem_userId_idx" ON "PmpReadinessItem"("userId");
CREATE INDEX "PmpReadinessItem_isComplete_idx" ON "PmpReadinessItem"("isComplete");
