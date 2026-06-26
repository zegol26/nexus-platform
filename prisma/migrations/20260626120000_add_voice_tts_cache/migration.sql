-- CreateTable
CREATE TABLE "VoiceTtsCache" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "textHash" TEXT NOT NULL,
    "voiceProfile" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "audioBase64" TEXT NOT NULL,
    "audioMimeType" TEXT NOT NULL,
    "textLength" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceTtsCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoiceTtsCache_cacheKey_key" ON "VoiceTtsCache"("cacheKey");

-- CreateIndex
CREATE INDEX "VoiceTtsCache_voiceProfile_idx" ON "VoiceTtsCache"("voiceProfile");

-- CreateIndex
CREATE INDEX "VoiceTtsCache_textHash_idx" ON "VoiceTtsCache"("textHash");

-- CreateIndex
CREATE INDEX "VoiceTtsCache_lastUsedAt_idx" ON "VoiceTtsCache"("lastUsedAt");
