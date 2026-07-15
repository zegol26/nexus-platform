-- Release 1 expand-and-contract migration.
-- Existing DATABASE-backed rows retain fileData and receive DATABASE/READY defaults.

-- CreateEnum
CREATE TYPE "StoryArcLibraryStorageProvider" AS ENUM ('DATABASE', 'VERCEL_BLOB');

-- CreateEnum
CREATE TYPE "StoryArcLibraryProcessingStatus" AS ENUM ('UPLOADED', 'QUEUED', 'PARSING', 'INDEXING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "StoryArcLibraryUploadIntentStatus" AS ENUM ('PENDING', 'FINALIZING', 'FINALIZED', 'FAILED', 'EXPIRED');

-- AlterTable
ALTER TABLE "StoryArcLibraryDocument" ADD COLUMN     "blobEtag" TEXT,
ADD COLUMN     "blobPathname" TEXT,
ADD COLUMN     "finalizedAt" TIMESTAMP(3),
ADD COLUMN     "processingStatus" "StoryArcLibraryProcessingStatus" NOT NULL DEFAULT 'READY',
ADD COLUMN     "storageProvider" "StoryArcLibraryStorageProvider" NOT NULL DEFAULT 'DATABASE',
ALTER COLUMN "fileData" DROP NOT NULL;

-- CreateTable
CREATE TABLE "StoryArcLibraryUploadIntent" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "expectedPathname" TEXT NOT NULL,
    "expectedFileSize" INTEGER NOT NULL,
    "expectedMimeType" TEXT NOT NULL,
    "status" "StoryArcLibraryUploadIntentStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "finalizedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryArcLibraryUploadIntent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoryArcLibraryUploadIntent_documentId_key" ON "StoryArcLibraryUploadIntent"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryArcLibraryUploadIntent_expectedPathname_key" ON "StoryArcLibraryUploadIntent"("expectedPathname");

-- CreateIndex
CREATE INDEX "StoryArcLibraryUploadIntent_classId_status_expiresAt_idx" ON "StoryArcLibraryUploadIntent"("classId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "StoryArcLibraryUploadIntent_uploadedById_status_expiresAt_idx" ON "StoryArcLibraryUploadIntent"("uploadedById", "status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "StoryArcLibraryDocument_blobPathname_key" ON "StoryArcLibraryDocument"("blobPathname");

-- CreateIndex
CREATE INDEX "StoryArcLibraryDocument_storageProvider_processingStatus_cr_idx" ON "StoryArcLibraryDocument"("storageProvider", "processingStatus", "createdAt");

-- AddForeignKey
ALTER TABLE "StoryArcLibraryUploadIntent" ADD CONSTRAINT "StoryArcLibraryUploadIntent_classId_fkey" FOREIGN KEY ("classId") REFERENCES "StoryArcClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryArcLibraryUploadIntent" ADD CONSTRAINT "StoryArcLibraryUploadIntent_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
