import {
  sanitizeStoryArcLibraryFileName,
  STORYARC_LIBRARY_MAX_FILE_BYTES,
} from "./policy";

export const STORYARC_LIBRARY_PDF_MIME_TYPE = "application/pdf";
export const STORYARC_LIBRARY_UPLOAD_INTENT_TTL_MS = 15 * 60 * 1000;
export const STORYARC_LIBRARY_DOWNLOAD_URL_TTL_MS = 5 * 60 * 1000;

export type StoryArcBlobUploadDeclaration = {
  classId: string;
  subject: string;
  title: string;
  summary: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

export function validateStoryArcBlobUploadDeclaration(input: unknown) {
  if (!input || typeof input !== "object") {
    return { valid: false as const, error: "Invalid upload request." };
  }
  const candidate = input as Partial<StoryArcBlobUploadDeclaration>;
  const classId = String(candidate.classId ?? "").trim();
  const subject = String(candidate.subject ?? "").trim();
  const title = String(candidate.title ?? "").trim();
  const summary = String(candidate.summary ?? "").trim();
  const fileName = sanitizeStoryArcLibraryFileName(String(candidate.fileName ?? ""));
  const fileSize = Number(candidate.fileSize);
  const mimeType = String(candidate.mimeType ?? "").trim().toLowerCase();

  if (!classId || classId.length > 128) return { valid: false as const, error: "Choose a valid StoryArc class." };
  if (subject.length < 2 || subject.length > 80) return { valid: false as const, error: "Subject must be between 2 and 80 characters." };
  if (title.length < 3 || title.length > 120) return { valid: false as const, error: "Title must be between 3 and 120 characters." };
  if (summary.length < 10 || summary.length > 2000) return { valid: false as const, error: "Summary must be between 10 and 2,000 characters." };
  if (!fileName.toLowerCase().endsWith(".pdf")) return { valid: false as const, error: "New Digital Library uploads must be PDF files." };
  if (!Number.isInteger(fileSize) || fileSize <= 0) return { valid: false as const, error: "The selected PDF is empty." };
  if (fileSize > STORYARC_LIBRARY_MAX_FILE_BYTES) return { valid: false as const, error: "The PDF must be 50 MB or smaller." };
  if (mimeType !== STORYARC_LIBRARY_PDF_MIME_TYPE) return { valid: false as const, error: "The declared file type must be application/pdf." };

  return {
    valid: true as const,
    value: { classId, subject, title, summary, fileName, fileSize, mimeType },
  };
}

function assertServerIdentifier(value: string, label: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error(`Invalid server-generated ${label}.`);
}

export function buildStoryArcBlobPathname(classId: string, documentId: string, fileName: string) {
  assertServerIdentifier(classId, "class ID");
  assertServerIdentifier(documentId, "document ID");
  return `storyarc/classes/${classId}/documents/${documentId}/source/${sanitizeStoryArcLibraryFileName(fileName)}`;
}

export function canFinalizeStoryArcLibraryIntent(input: { actorId: string; actorRole: string; uploaderId: string }) {
  return input.actorId === input.uploaderId || input.actorRole === "ADMIN" || input.actorRole === "SUPER_ADMIN";
}

export function isStoryArcUploadIntentExpired(expiresAt: Date, now = new Date()) {
  return expiresAt.getTime() <= now.getTime();
}

export function hasStoryArcPdfSignature(bytes: Uint8Array) {
  return bytes.length >= 5
    && bytes[0] === 0x25
    && bytes[1] === 0x50
    && bytes[2] === 0x44
    && bytes[3] === 0x46
    && bytes[4] === 0x2d;
}

export function isPrivateVercelBlobUrl(value: string) {
  try {
    return new URL(value).hostname.endsWith(".private.blob.vercel-storage.com");
  } catch {
    return false;
  }
}
