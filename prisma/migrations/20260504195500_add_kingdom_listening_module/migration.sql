-- AlterTable
ALTER TABLE "ReadingPassage" ADD COLUMN     "audioMimeType" TEXT,
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "contentType" TEXT NOT NULL DEFAULT 'READING',
ADD COLUMN     "durationSec" INTEGER,
ADD COLUMN     "kanjiJson" JSONB,
ADD COLUMN     "romajiJson" JSONB,
ADD COLUMN     "translationJson" JSONB;

-- CreateTable
CREATE TABLE "UserGameProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "buildPoints" INTEGER NOT NULL DEFAULT 0,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "flashcardCorrectCount" INTEGER NOT NULL DEFAULT 0,
    "quizCorrectCount" INTEGER NOT NULL DEFAULT 0,
    "mockTestCorrectCount" INTEGER NOT NULL DEFAULT 0,
    "lessonCompletedCount" INTEGER NOT NULL DEFAULT 0,
    "readingCompletedCount" INTEGER NOT NULL DEFAULT 0,
    "lastDailyBonusDate" TIMESTAMP(3),
    "xpEarnedToday" INTEGER NOT NULL DEFAULT 0,
    "xpTodayDate" TIMESTAMP(3),
    "achievementsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGameProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGameProfile_userId_key" ON "UserGameProfile"("userId");

-- CreateIndex
CREATE INDEX "ReadingPassage_contentType_idx" ON "ReadingPassage"("contentType");

-- AddForeignKey
ALTER TABLE "UserGameProfile" ADD CONSTRAINT "UserGameProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
