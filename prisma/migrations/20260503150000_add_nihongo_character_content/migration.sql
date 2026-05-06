-- AlterTable
ALTER TABLE "NihongoLesson" ADD COLUMN "slug" TEXT;

-- CreateTable
CREATE TABLE "NihongoCharacterContent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "lessonSlug" TEXT NOT NULL,
    "char" TEXT NOT NULL,
    "romaji" TEXT,
    "onyomi" TEXT,
    "kunyomi" TEXT,
    "meaning" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NihongoCharacterContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NihongoLesson_slug_key" ON "NihongoLesson"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "NihongoCharacterContent_type_level_char_key" ON "NihongoCharacterContent"("type", "level", "char");

-- CreateIndex
CREATE INDEX "NihongoCharacterContent_lessonSlug_idx" ON "NihongoCharacterContent"("lessonSlug");

-- CreateIndex
CREATE INDEX "NihongoCharacterContent_type_level_idx" ON "NihongoCharacterContent"("type", "level");
