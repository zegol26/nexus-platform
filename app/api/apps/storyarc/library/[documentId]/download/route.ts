import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser } from "@/lib/storyarc/access";
import { canReadStoryArcLibraryClass } from "@/lib/storyarc/library/access";
import { createStoryArcPrivateBlobDownloadUrl } from "@/lib/storyarc/library/blob";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ documentId: string }> }) {
  const [user, { documentId }] = await Promise.all([getStoryArcSessionUser(), context.params]);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const document = await prisma.storyArcLibraryDocument.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      classId: true,
      fileName: true,
      storageProvider: true,
      processingStatus: true,
      blobPathname: true,
    },
  });
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  if (!(await canReadStoryArcLibraryClass(user.id, user.role, document.classId))) {
    return NextResponse.json({ error: "Document access denied." }, { status: 403 });
  }
  if (document.storageProvider !== "VERCEL_BLOB" || !document.blobPathname) {
    return NextResponse.json({ error: "Document is not stored in private Blob." }, { status: 409 });
  }
  if (document.processingStatus !== "READY") {
    return NextResponse.json({ error: "Document is not ready for reading." }, { status: 409 });
  }

  try {
    const signed = await createStoryArcPrivateBlobDownloadUrl(document.blobPathname);
    return NextResponse.json({
      url: signed.url,
      expiresAt: signed.expiresAt.toISOString(),
      fileName: document.fileName,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Secure document access is temporarily unavailable." }, { status: 503 });
  }
}
