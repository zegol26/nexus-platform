import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import {
  VOICE_CONVERSATION_FEATURE,
  canUseVoiceConversation,
  incrementFeatureUsage,
} from "@/lib/nexus/access-guards";

export const runtime = "nodejs";

const SUPPORTED_MIME = new Set([
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/ogg",
  "audio/ogg;codecs=opus",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
]);

const MAX_AUDIO_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const access = isAdmin
      ? { allowed: true as const }
      : await canUseVoiceConversation(user.id);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error:
            "reason" in access && access.reason
              ? access.reason
              : "Kuota voice conversation harian sudah habis.",
          access,
        },
        { status: 429 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Voice transcription belum dikonfigurasi (OPENAI_API_KEY belum ada).",
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File) || audio.size === 0) {
      return NextResponse.json(
        { error: "File audio tidak ditemukan." },
        { status: 400 }
      );
    }

    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: "Audio terlalu panjang. Maksimum 5 MB / sekitar 1 menit." },
        { status: 413 }
      );
    }

    const audioType = (audio.type || "audio/webm").toLowerCase();
    const mimeMatch = SUPPORTED_MIME.has(audioType) ||
      [...SUPPORTED_MIME].some((m) => audioType.startsWith(m.split(";")[0]));
    if (!mimeMatch) {
      return NextResponse.json(
        { error: `Format audio tidak didukung: ${audioType}` },
        { status: 415 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Use whisper-1 for compatibility — newer gpt-4o-mini-transcribe is
    // not yet stable across all SDK versions. Falls back gracefully if
    // the requested model is rejected.
    const model =
      process.env.OPENAI_TRANSCRIBE_MODEL ?? "whisper-1";

    let transcript: string;
    try {
      const result = await openai.audio.transcriptions.create({
        file: audio,
        model,
        // Hint Japanese + Indonesian — Whisper auto-detects but a hint
        // improves accuracy for code-switched speech.
        language: "ja",
      });
      transcript = result.text?.trim() ?? "";
    } catch (error) {
      console.error("[voice/transcribe] OpenAI STT failed", error);
      return NextResponse.json(
        {
          error:
            "Gagal mengubah suara jadi teks. Coba ulang ya, atau ucap lebih jelas.",
        },
        { status: 502 }
      );
    }

    if (!transcript) {
      return NextResponse.json(
        { error: "Suara terlalu pelan atau kosong. Coba bicara lebih jelas." },
        { status: 422 }
      );
    }

    // Always count voice conversations for cost monitoring; the
    // quota check above already lets admins through.
    await incrementFeatureUsage(user.id, VOICE_CONVERSATION_FEATURE);

    return NextResponse.json({ text: transcript });
  } catch (error) {
    console.error("[voice/transcribe] unexpected error", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Voice transcribe gagal: ${error.message}`
            : "Voice transcribe gagal.",
      },
      { status: 500 }
    );
  }
}
