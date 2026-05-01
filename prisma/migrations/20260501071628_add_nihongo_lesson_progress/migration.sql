-- CreateTable
CREATE TABLE "NihongoLessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NihongoLessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NihongoLessonProgress_userId_lessonId_key" ON "NihongoLessonProgress"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "NihongoLessonProgress" ADD CONSTRAINT "NihongoLessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "NihongoLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
