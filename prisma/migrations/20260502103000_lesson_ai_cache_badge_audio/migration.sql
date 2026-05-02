CREATE TABLE "NihongoLessonTemplate" (
  "id" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "variant" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "contentJson" JSONB NOT NULL,
  "contentMd" TEXT,
  "level" TEXT,
  "topic" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "NihongoLessonTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NihongoLessonGeneratedContent" (
  "id" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "userId" TEXT,
  "promptType" TEXT NOT NULL,
  "contentJson" JSONB NOT NULL,
  "contentMd" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "NihongoLessonGeneratedContent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NihongoLessonTutorMessage" (
  "id" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "NihongoLessonTutorMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NihongoLessonListeningAsset" (
  "id" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "scriptJapanese" TEXT NOT NULL,
  "scriptRomaji" TEXT,
  "translationId" TEXT,
  "audioUrl" TEXT,
  "audioMimeType" TEXT,
  "audioProvider" TEXT,
  "durationSec" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "NihongoLessonListeningAsset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NihongoLessonTemplate_lessonId_variant_key" ON "NihongoLessonTemplate"("lessonId", "variant");
CREATE INDEX "NihongoLessonTemplate_lessonId_idx" ON "NihongoLessonTemplate"("lessonId");
CREATE INDEX "NihongoLessonGeneratedContent_lessonId_idx" ON "NihongoLessonGeneratedContent"("lessonId");
CREATE INDEX "NihongoLessonGeneratedContent_userId_idx" ON "NihongoLessonGeneratedContent"("userId");
CREATE INDEX "NihongoLessonTutorMessage_lessonId_idx" ON "NihongoLessonTutorMessage"("lessonId");
CREATE INDEX "NihongoLessonTutorMessage_userId_idx" ON "NihongoLessonTutorMessage"("userId");
CREATE UNIQUE INDEX "NihongoLessonListeningAsset_lessonId_key" ON "NihongoLessonListeningAsset"("lessonId");

ALTER TABLE "NihongoLessonTemplate"
  ADD CONSTRAINT "NihongoLessonTemplate_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "NihongoLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NihongoLessonGeneratedContent"
  ADD CONSTRAINT "NihongoLessonGeneratedContent_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "NihongoLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NihongoLessonTutorMessage"
  ADD CONSTRAINT "NihongoLessonTutorMessage_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "NihongoLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NihongoLessonListeningAsset"
  ADD CONSTRAINT "NihongoLessonListeningAsset_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "NihongoLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
