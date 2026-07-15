import {
  BlobNotFoundError,
  del,
  head,
  issueSignedToken,
  presignUrl,
  type HeadBlobResult,
} from "@vercel/blob";
import {
  hasStoryArcPdfSignature,
  isPrivateVercelBlobUrl,
  STORYARC_LIBRARY_DOWNLOAD_URL_TTL_MS,
  STORYARC_LIBRARY_PDF_MIME_TYPE,
} from "./blob-policy";

export class StoryArcBlobValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoryArcBlobValidationError";
  }
}

export async function createStoryArcPrivateBlobUploadUrl(input: {
  pathname: string;
  maximumSizeInBytes: number;
  validUntil: number;
}) {
  const token = await issueSignedToken({
    pathname: input.pathname,
    operations: ["put"],
    validUntil: input.validUntil,
    allowedContentTypes: [STORYARC_LIBRARY_PDF_MIME_TYPE],
    maximumSizeInBytes: input.maximumSizeInBytes,
  });
  return presignUrl(token, {
    access: "private",
    operation: "put",
    pathname: input.pathname,
    validUntil: input.validUntil,
    allowedContentTypes: [STORYARC_LIBRARY_PDF_MIME_TYPE],
    maximumSizeInBytes: input.maximumSizeInBytes,
    addRandomSuffix: false,
    allowOverwrite: false,
    cacheControlMaxAge: 60,
  });
}

export async function createStoryArcPrivateBlobDownloadUrl(pathname: string, now = Date.now()) {
  const validUntil = now + STORYARC_LIBRARY_DOWNLOAD_URL_TTL_MS;
  const token = await issueSignedToken({ pathname, operations: ["get"], validUntil });
  const { presignedUrl } = await presignUrl(token, {
    access: "private",
    operation: "get",
    pathname,
    validUntil,
  });
  return { url: presignedUrl, expiresAt: new Date(validUntil) };
}

async function readStoryArcPdfSignature(pathname: string) {
  const { url } = await createStoryArcPrivateBlobDownloadUrl(pathname);
  const response = await fetch(url, {
    headers: { Range: "bytes=0-4" },
    cache: "no-store",
  });
  if (response.status !== 206) {
    await response.body?.cancel().catch(() => undefined);
    throw new Error("Private Blob did not honor the bounded PDF signature range request.");
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  return hasStoryArcPdfSignature(bytes);
}

export async function inspectStoryArcPrivatePdfBlob(pathname: string): Promise<HeadBlobResult> {
  const metadata = await head(pathname);
  if (metadata.pathname !== pathname) throw new StoryArcBlobValidationError("Blob pathname does not match the authorized upload intent.");
  if (!isPrivateVercelBlobUrl(metadata.url)) throw new StoryArcBlobValidationError("StoryArc documents require a private Vercel Blob store.");
  if (!(await readStoryArcPdfSignature(pathname))) throw new StoryArcBlobValidationError("Uploaded object does not contain a valid PDF signature.");
  return metadata;
}

export async function deleteStoryArcPrivateBlob(pathname: string, etag?: string | null) {
  try {
    await del(pathname, etag ? { ifMatch: etag } : undefined);
  } catch (error) {
    if (error instanceof BlobNotFoundError) return;
    throw error;
  }
}
