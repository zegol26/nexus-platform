-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "eventType" TEXT NOT NULL,
    "appSlug" TEXT DEFAULT 'nihongo',
    "pagePath" TEXT,
    "lessonId" TEXT,
    "quizId" TEXT,
    "flashcardDeck" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventType_idx" ON "AnalyticsEvent"("eventType");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_appSlug_idx" ON "AnalyticsEvent"("appSlug");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_pagePath_idx" ON "AnalyticsEvent"("pagePath");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_lessonId_idx" ON "AnalyticsEvent"("lessonId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_quizId_idx" ON "AnalyticsEvent"("quizId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_flashcardDeck_idx" ON "AnalyticsEvent"("flashcardDeck");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
