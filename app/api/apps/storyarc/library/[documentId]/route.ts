import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser, isStoryArcTeacherRole } from "@/lib/storyarc/access";
import { canManageStoryArcClass } from "@/lib/storyarc/classroom/access";
import { canReadStoryArcLibraryClass } from "@/lib/storyarc/library/access";
import {
  createStoryArcPrivateBlobDownloadUrl,
  deleteStoryArcPrivateBlob,
} from "@/lib/storyarc/library/blob";
import { resolveStoryArcLibraryByteRange } from "@/lib/storyarc/library/policy";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ documentId: string }> }) {
  const [user, { documentId }] = await Promise.all([getStoryArcSessionUser(), context.params]);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const document = await prisma.storyArcLibraryDocument.findUnique({ where: { id: documentId } });
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  if (!(await canReadStoryArcLibraryClass(user.id, user.role, document.classId))) {
    return NextResponse.json({ error: "Document access denied." }, { status: 403 });
  }

  if (document.storageProvider === "VERCEL_BLOB") {
    if (document.processingStatus !== "READY" || !document.blobPathname) {
      return NextResponse.json({ error: "Document is not ready for reading." }, { status: 409 });
    }
    try {
      const signed = await createStoryArcPrivateBlobDownloadUrl(document.blobPathname);
      return NextResponse.redirect(signed.url, 307);
    } catch {
      return NextResponse.json({ error: "Secure document access is temporarily unavailable." }, { status: 503 });
    }
  }

  if (!document.fileData) {
    return NextResponse.json({ error: "Database document body is unavailable." }, { status: 410 });
  }
  const downloadRequested = new URL(request.url).searchParams.get("download") === "1";
  const disposition = document.mimeType === "application/pdf" && !downloadRequested ? "inline" : "attachment";
  const encodedName = encodeURIComponent(document.fileName);
  const fileBuffer = Buffer.from(document.fileData);
  const range = resolveStoryArcLibraryByteRange(request.headers.get("range"), document.fileSize);
  if (range === false) {
    return new NextResponse(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${document.fileSize}` },
    });
  }
  const body = range ? fileBuffer.subarray(range.start, range.end + 1) : fileBuffer;
  return new NextResponse(body, {
    status: range ? 206 : 200,
    headers: {
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store",
      "Content-Disposition": `${disposition}; filename*=UTF-8''${encodedName}`,
      "Content-Length": String(body.byteLength),
      ...(range ? { "Content-Range": `bytes ${range.start}-${range.end}/${document.fileSize}` } : {}),
      "Content-Type": document.mimeType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function DELETE(_request: Request, context: { params: Promise<{ documentId: string }> }) {
  const [user, { documentId }] = await Promise.all([getStoryArcSessionUser(), context.params]);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!isStoryArcTeacherRole(user.role)) return NextResponse.json({ error: "Teacher access required." }, { status: 403 });
  const document = await prisma.storyArcLibraryDocument.findUnique({
    where: { id: documentId },
    select: { id: true, classId: true, storageProvider: true, blobPathname: true, blobEtag: true },
  });
  if (!document) return NextResponse.json({ deleted: true, idempotent: true });
  if (!(await canManageStoryArcClass(user.id, user.role, document.classId))) {
    return NextResponse.json({ error: "You cannot delete this document." }, { status: 403 });
  }

  if (document.storageProvider === "VERCEL_BLOB") {
    if (!document.blobPathname) {
      return NextResponse.json({ error: "Blob object identity is missing; metadata was preserved." }, { status: 409 });
    }
    try {
      await deleteStoryArcPrivateBlob(document.blobPathname, document.blobEtag);
    } catch {
      return NextResponse.json({ error: "Blob deletion failed; document metadata was preserved for retry." }, { status: 502 });
    }
  }

  await prisma.storyArcLibraryDocument.deleteMany({ where: { id: document.id } });
  return NextResponse.json({ deleted: true, idempotent: false });
}
