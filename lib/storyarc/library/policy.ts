export const STORYARC_LIBRARY_MAX_FILE_BYTES = 50 * 1024 * 1024;

const allowedTypes = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

export function sanitizeStoryArcLibraryFileName(fileName: string) {
  const safe = fileName.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").replace(/\s+/g, " ").trim();
  return (safe || "document").slice(0, 180);
}

export function validateStoryArcLibraryFile(input: { name: string; size: number; mimeType: string; head: Uint8Array }) {
  const extension = input.name.toLowerCase().split(".").pop() as keyof typeof allowedTypes | undefined;
  if (!extension || !(extension in allowedTypes)) return { valid: false as const, error: "Only PDF, DOC, and DOCX files are supported." };
  if (!Number.isInteger(input.size) || input.size <= 0) return { valid: false as const, error: "The selected document is empty." };
  if (input.size > STORYARC_LIBRARY_MAX_FILE_BYTES) return { valid: false as const, error: "The document must be 50 MB or smaller." };

  const validSignature = extension === "pdf"
    ? startsWith(input.head, [0x25, 0x50, 0x44, 0x46, 0x2d])
    : extension === "doc"
      ? startsWith(input.head, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
      : startsWith(input.head, [0x50, 0x4b, 0x03, 0x04]);
  if (!validSignature) return { valid: false as const, error: `The file contents do not match the .${extension} format.` };

  const expectedMimeType = allowedTypes[extension];
  const acceptedMime = !input.mimeType || input.mimeType === "application/octet-stream" || input.mimeType === expectedMimeType;
  if (!acceptedMime) return { valid: false as const, error: "The document MIME type does not match its file extension." };
  return { valid: true as const, mimeType: expectedMimeType, extension };
}

export function resolveStoryArcLibraryByteRange(rangeHeader: string | null, fileSize: number) {
  if (!rangeHeader) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match || !Number.isInteger(fileSize) || fileSize <= 0) return false as const;

  const rawStart = match[1];
  const rawEnd = match[2];
  if (!rawStart && !rawEnd) return false as const;

  let start: number;
  let end: number;
  if (!rawStart) {
    const suffixLength = Number(rawEnd);
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) return false as const;
    start = Math.max(0, fileSize - suffixLength);
    end = fileSize - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd ? Number(rawEnd) : fileSize - 1;
  }

  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start >= fileSize || end < start) {
    return false as const;
  }
  return { start, end: Math.min(end, fileSize - 1) };
}

export function formatStoryArcLibraryFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
