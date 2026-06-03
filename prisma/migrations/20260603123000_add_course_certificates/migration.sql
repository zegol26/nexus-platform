CREATE TABLE "CourseCertificate" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "appSlug" TEXT NOT NULL,
  "courseName" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "certificateId" TEXT NOT NULL,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CourseCertificate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CourseCertificate_certificateId_key" ON "CourseCertificate"("certificateId");
CREATE UNIQUE INDEX "CourseCertificate_userId_appSlug_courseName_key" ON "CourseCertificate"("userId", "appSlug", "courseName");
CREATE INDEX "CourseCertificate_userId_idx" ON "CourseCertificate"("userId");
CREATE INDEX "CourseCertificate_appSlug_idx" ON "CourseCertificate"("appSlug");

ALTER TABLE "CourseCertificate"
  ADD CONSTRAINT "CourseCertificate_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
