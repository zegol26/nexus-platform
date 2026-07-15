CREATE TABLE "StoryArcLibraryDocument" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileData" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StoryArcLibraryDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StoryArcLibraryDocument_classId_subject_createdAt_idx" ON "StoryArcLibraryDocument"("classId", "subject", "createdAt");
CREATE INDEX "StoryArcLibraryDocument_uploadedById_createdAt_idx" ON "StoryArcLibraryDocument"("uploadedById", "createdAt");

ALTER TABLE "StoryArcLibraryDocument" ADD CONSTRAINT "StoryArcLibraryDocument_classId_fkey" FOREIGN KEY ("classId") REFERENCES "StoryArcClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoryArcLibraryDocument" ADD CONSTRAINT "StoryArcLibraryDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
