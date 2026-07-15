import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser, isStoryArcTeacherRole } from "@/lib/storyarc/access";
import { canManageStoryArcClass } from "@/lib/storyarc/classroom/access";
import {
  canFinalizeStoryArcLibraryIntent,
  isStoryArcUploadIntentExpired,
  STORYARC_LIBRARY_PDF_MIME_TYPE,
} from "@/lib/storyarc/library/blob-policy";
import { STORYARC_LIBRARY_MAX_FILE_BYTES } from "@/lib/storyarc/library/policy";
import {
  deleteStoryArcPrivateBlob,
  inspectStoryArcPrivatePdfBlob,
  StoryArcBlobValidationError,
} from "@/lib/storyarc/library/blob";

export const runtime = "nodejs";

async function rejectInvalidObject(intent: { id: string; expectedPathname: string }, reason: string, etag?: string) {
  let cleanupFailed = false;
  try {
    await deleteStoryArcPrivateBlob(intent.expectedPathname, etag);
  } catch {
    cleanupFailed = true;
  }
  await prisma.storyArcLibraryUploadIntent.updateMany({
    where: { id: intent.id, status: { in: ["PENDING", "FINALIZING"] } },
    data: {
      status: "FAILED",
      failureReason: cleanupFailed ? `${reason} Blob cleanup requires retry.` : reason,
    },
  });
}

export async function POST(request: Request) {
  const user = await getStoryArcSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!isStoryArcTeacherRole(user.role)) return NextResponse.json({ error: "Teacher access required." }, { status: 403 });

  const body = await request.json().catch(() => null) as { intentId?: unknown; pathname?: unknown } | null;
  const intentId = typeof body?.intentId === "string" ? body.intentId : "";
  const completedPathname = typeof body?.pathname === "string" ? body.pathname : "";
  if (!intentId || !completedPathname) return NextResponse.json({ error: "Invalid upload completion request." }, { status: 400 });

  const intent = await prisma.storyArcLibraryUploadIntent.findUnique({ where: { id: intentId } });
  if (!intent) return NextResponse.json({ error: "Upload intent not found." }, { status: 404 });
  if (!(await canManageStoryArcClass(user.id, user.role, intent.classId))) {
    return NextResponse.json({ error: "You cannot finalize this class upload." }, { status: 403 });
  }
  if (!canFinalizeStoryArcLibraryIntent({ actorId: user.id, actorRole: user.role, uploaderId: intent.uploadedById })) {
    return NextResponse.json({ error: "Only the uploader or an administrator can finalize this upload." }, { status: 403 });
  }
  if (completedPathname !== intent.expectedPathname) {
    return NextResponse.json({ error: "Completed Blob pathname does not match the authorized upload." }, { status: 400 });
  }

  const existingDocument = await prisma.storyArcLibraryDocument.findUnique({
    where: { id: intent.documentId },
    select: { id: true, title: true, storageProvider: true },
  });
  if (intent.status === "FINALIZED" && existingDocument) {
    return NextResponse.json({ document: existingDocument, idempotent: true });
  }
  if (intent.status === "FAILED" || intent.status === "EXPIRED") {
    return NextResponse.json({ error: `Upload intent is ${intent.status.toLowerCase()}.` }, { status: 410 });
  }
  if (isStoryArcUploadIntentExpired(intent.expiresAt)) {
    await prisma.storyArcLibraryUploadIntent.updateMany({
      where: { id: intent.id, status: "PENDING" },
      data: { status: "EXPIRED", failureReason: "Upload intent expired before finalization." },
    });
    return NextResponse.json({ error: "Upload authorization expired. Start the upload again." }, { status: 410 });
  }

  let metadata;
  try {
    metadata = await inspectStoryArcPrivatePdfBlob(intent.expectedPathname);
  } catch (error) {
    if (error instanceof StoryArcBlobValidationError) {
      await rejectInvalidObject(intent, error.message);
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    return NextResponse.json({ error: "Private Blob validation is temporarily unavailable." }, { status: 503 });
  }

  if (
    metadata.size !== intent.expectedFileSize
    || metadata.size > STORYARC_LIBRARY_MAX_FILE_BYTES
    || metadata.contentType !== STORYARC_LIBRARY_PDF_MIME_TYPE
  ) {
    await rejectInvalidObject(intent, "Uploaded Blob metadata does not match the authorized PDF.", metadata.etag);
    return NextResponse.json({ error: "Uploaded Blob metadata does not match the authorized PDF." }, { status: 422 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const claim = await tx.storyArcLibraryUploadIntent.updateMany({
      where: { id: intent.id, status: "PENDING", expiresAt: { gt: new Date() } },
      data: { status: "FINALIZING" },
    });
    if (claim.count === 0) {
      const document = await tx.storyArcLibraryDocument.findUnique({
        where: { id: intent.documentId },
        select: { id: true, title: true, storageProvider: true },
      });
      return { document, idempotent: true };
    }

    const document = await tx.storyArcLibraryDocument.create({
      data: {
        id: intent.documentId,
        classId: intent.classId,
        uploadedById: intent.uploadedById,
        subject: intent.subject,
        title: intent.title,
        summary: intent.summary,
        fileName: intent.fileName,
        mimeType: metadata.contentType,
        fileSize: metadata.size,
        fileData: null,
        storageProvider: "VERCEL_BLOB",
        blobPathname: metadata.pathname,
        blobEtag: metadata.etag,
        processingStatus: "READY",
        finalizedAt: new Date(),
      },
      select: { id: true, title: true, storageProvider: true },
    });
    await tx.storyArcLibraryUploadIntent.update({
      where: { id: intent.id },
      data: { status: "FINALIZED", finalizedAt: new Date(), failureReason: null },
    });
    return { document, idempotent: false };
  });

  if (!result.document) return NextResponse.json({ error: "Upload is already being finalized. Retry shortly." }, { status: 409 });
  return NextResponse.json({ document: result.document, idempotent: result.idempotent });
}
