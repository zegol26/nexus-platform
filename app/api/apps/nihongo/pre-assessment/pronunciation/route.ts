import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
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

  if (!isSupportedAudioMimeType(file.type)) {
    return NextResponse.json(
      { error: "Unsupported audio format. Use webm, mp3, wav, or m4a." },
      { status: 400 }
    );
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Audio file is too large. Maximum size is 8MB." }, { status: 400 });
  }

  const metadata = buildPronunciationMetadata({
    expectedText,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  });
  const transcript = await transcribeJapaneseAudio(file).catch((error) => {
    console.error("[pre-assessment/pronunciation] transcription failed", error);
    return null;
  });

  const evaluation = await evaluatePronunciationUpload({
    expectedText,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    transcript,
  });

  return NextResponse.json({
    audioUrl: null,
    metadata: {
      ...metadata,
      storageStatus: "temporary",
      transcript,
      analyzer: transcript ? "openai_transcription_similarity" : "unavailable",
    },
    evaluation,
  });
}

function isSupportedAudioMimeType(mimeType: string) {
  return supportedMimeTypes.has(mimeType) || mimeType.startsWith("audio/webm");
}

async function transcribeJapaneseAudio(file: File) {
  if (!process.env.OPENAI_API_KEY) return null;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const transcription = await openai.audio.transcriptions.create({
    file,
    model: process.env.OPENAI_TRANSCRIPTION_MODEL ?? "whisper-1",
    language: "ja",
  });

  return transcription.text?.trim() || null;
}
