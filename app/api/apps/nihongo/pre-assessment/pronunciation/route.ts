import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { buildPronunciationMetadata, evaluatePronunciationUpload } from "@/lib/nihongo/assessment/pronunciationEvaluator";

export const runtime = "nodejs";

const supportedMimeTypes = new Set([
  "audio/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
]);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("audio");
  const expectedText = String(formData.get("expectedText") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
  }

  if (!supportedMimeTypes.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported audio format. Use webm, mp3, wav, or m4a." },
      { status: 400 }
    );
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Audio file is too large. Maximum size is 8MB." }, { status: 400 });
  }

  const extension = file.name.split(".").pop() || "webm";
  const safeName = `${user.id}-${Date.now()}.${extension.replace(/[^a-z0-9]/gi, "")}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "nihongo", "pronunciation");
  const uploadPath = path.join(uploadDir, safeName);
  const publicUrl = `/uploads/nihongo/pronunciation/${safeName}`;

  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(uploadPath, Buffer.from(await file.arrayBuffer()));
  } catch (error) {
    console.error(error);
    const evaluation = await evaluatePronunciationUpload({
      expectedText,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
    });

    return NextResponse.json({
      audioUrl: null,
      metadata: {
        expectedText,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        storageStatus: "unavailable",
      },
      evaluation: {
        ...evaluation,
        status: "pending",
        feedbackIndonesian:
          "Audio diterima, tetapi penyimpanan lokal belum tersedia. Assessment tetap bisa lanjut dan pronunciation ditandai pending/manual.",
      },
    });
  }

  const metadata = buildPronunciationMetadata({
    expectedText,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  });

  const evaluation = await evaluatePronunciationUpload({
    expectedText,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  });

  return NextResponse.json({
    audioUrl: publicUrl,
    metadata,
    evaluation,
  });
}
