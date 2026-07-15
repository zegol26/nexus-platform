import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser, isStoryArcTeacherRole } from "@/lib/storyarc/access";
import { canManageStoryArcClass } from "@/lib/storyarc/classroom/access";
import {
  buildStoryArcBlobPathname,
  STORYARC_LIBRARY_UPLOAD_INTENT_TTL_MS,
  validateStoryArcBlobUploadDeclaration,
} from "@/lib/storyarc/library/blob-policy";
import { createStoryArcPrivateBlobUploadUrl } from "@/lib/storyarc/library/blob";

export const runtime = "nodejs";

const MAX_AUTHORIZATION_BODY_BYTES = 64 * 1024;

export async function POST(request: Request) {
  const user = await getStoryArcSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!isStoryArcTeacherRole(user.role)) return NextResponse.json({ error: "Teacher access required." }, { status: 403 });

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_AUTHORIZATION_BODY_BYTES) {
    return NextResponse.json({ error: "Upload authorization metadata is too large." }, { status: 413 });
  }
  const declaration = validateStoryArcBlobUploadDeclaration(await request.json().catch(() => null));
  if (!declaration.valid) return NextResponse.json({ error: declaration.error }, { status: 400 });

  const classroom = await prisma.storyArcClass.findUnique({
    where: { id: declaration.value.classId },
    select: { id: true, status: true },
  });
  if (!classroom || classroom.status !== "ACTIVE") {
    return NextResponse.json({ error: "The selected StoryArc class is not active." }, { status: 404 });
  }
  if (!(await canManageStoryArcClass(user.id, user.role, classroom.id))) {
    return NextResponse.json({ error: "You cannot upload to this class." }, { status: 403 });
  }

  const documentId = randomUUID();
  const pathname = buildStoryArcBlobPathname(classroom.id, documentId, declaration.value.fileName);
  const expiresAt = new Date(Date.now() + STORYARC_LIBRARY_UPLOAD_INTENT_TTL_MS);
  const intent = await prisma.storyArcLibraryUploadIntent.create({
    data: {
      documentId,
      classId: classroom.id,
      uploadedById: user.id,
      subject: declaration.value.subject,
      title: declaration.value.title,
      summary: declaration.value.summary,
      fileName: declaration.value.fileName,
      expectedPathname: pathname,
      expectedFileSize: declaration.value.fileSize,
      expectedMimeType: declaration.value.mimeType,
      expiresAt,
    },
    select: { id: true },
  });

  try {
    const { presignedUrl } = await createStoryArcPrivateBlobUploadUrl({
      pathname,
      maximumSizeInBytes: declaration.value.fileSize,
      validUntil: expiresAt.getTime(),
    });
    return NextResponse.json({
      intentId: intent.id,
      documentId,
      pathname,
      uploadUrl: presignedUrl,
      expiresAt: expiresAt.toISOString(),
    }, { status: 201 });
  } catch {
    await prisma.storyArcLibraryUploadIntent.update({
      where: { id: intent.id },
      data: { status: "FAILED", failureReason: "Private Blob upload authorization could not be issued." },
    });
    return NextResponse.json({ error: "Private document storage is temporarily unavailable." }, { status: 503 });
  }
}
