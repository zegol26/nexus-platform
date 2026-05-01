-- AlterTable
ALTER TABLE "NihongoLesson" ADD COLUMN     "lessonType" TEXT,
ADD COLUMN     "module" TEXT,
ADD COLUMN     "track" TEXT;

-- CreateTable
CREATE TABLE "NihongoFlashcard" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "deck" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "example" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NihongoFlashcard_pkey" PRIMARY KEY ("id")
);
