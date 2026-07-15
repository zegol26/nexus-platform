import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { withRouteMetrics } from "@/lib/observability/route-metrics";
import {
  VOICE_CONVERSATION_FEATURE,
  canUseVoiceConversation,
  incrementFeatureUsage,
} from "@/lib/nexus/access-guards";
import { JOHN_TUTOR_CONFIG, isJohnTutorId } from "@/lib/english/john-tutor-config";
import { getStoryArcSessionUser } from "@/lib/storyarc/access";
import { STORYARC_JOHN_CONTEXT } from "@/lib/storyarc/language/context";
import { getStoryArcJohnUsage } from "@/lib/storyarc/john/usage";

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
const DEFAULT_TRANSCRIBE_LANGUAGE = "ja";

export async function POST(request: Request) {
  return withRouteMetrics(
    {
      route: "/api/voice/transcribe",
      method: "POST",
      routeType: "voice",
      riskLevel: "high",
      slowMs: 1200,
      sampleRate: 1,
    },
    () => transcribeVoice(request)
  );
}

async function transcribeVoice(request: Request) {
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

    const formData = await request.formData();
    const contextId = formData.get("contextId");
    const storyArcJohn = contextId === STORYARC_JOHN_CONTEXT.contextId;
    const storyArcUser = storyArcJohn ? await getStoryArcSessionUser() : null;
    if (storyArcJohn && storyArcUser?.id !== user.id) {
      return NextResponse.json({ error: "StoryArc access is required." }, { status: 403 });
    }

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const access = storyArcJohn
      ? await getStoryArcJohnUsage(user.id)
      : isAdmin
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

    const audio = formData.get("audio");
    const tutorId = formData.get("tutorId");
    const courseId = formData.get("courseId");
    const clientLocale = formData.get("clientLocale");
    const tutorConfig = isJohnTutorId(tutorId) ? JOHN_TUTOR_CONFIG : null;
    const sttLanguage = tutorConfig?.inputLanguage ?? DEFAULT_TRANSCRIBE_LANGUAGE;

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
      if (process.env.NODE_ENV === "development") {
        console.log("[voice/transcribe] stt request", {
          tutorId: tutorConfig?.tutorId ?? (typeof tutorId === "string" ? tutorId : null),
          courseId: typeof courseId === "string" ? courseId : null,
          selectedSttLanguage: sttLanguage,
          clientLocale: typeof clientLocale === "string" ? clientLocale : null,
          finalPromptLanguage: tutorConfig?.outputLanguage ?? null,
          historyScopedByTutorLanguage: Boolean(tutorConfig),
          audioType,
          audioSize: audio.size,
        });
      }

      const result = await openai.audio.transcriptions.create({
        file: audio,
        model,
        // Explicit source language improves accuracy and avoids cross-tutor leakage.
        language: sttLanguage,
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

    const transcriptLanguage = detectTranscriptLanguage(transcript);
    if (process.env.NODE_ENV === "development") {
      console.log("[voice/transcribe] stt result", {
        tutorId: tutorConfig?.tutorId ?? null,
        courseId: typeof courseId === "string" ? courseId : null,
        selectedSttLanguage: sttLanguage,
        clientLocale: typeof clientLocale === "string" ? clientLocale : null,
        detectedTranscriptLanguage: transcriptLanguage,
        rawTranscript: transcript,
        finalPromptLanguage: tutorConfig?.outputLanguage ?? null,
        historyScopedByTutorLanguage: Boolean(tutorConfig),
      });
    }

    if (tutorConfig && transcriptLanguage === "ja") {
      return NextResponse.json(
        {
          error:
            "I heard Japanese. For John English practice, please speak in English or try recording again.",
          detectedLanguage: transcriptLanguage,
        },
        { status: 422 }
      );
    }

    // Always count voice conversations for cost monitoring; the
    // quota check above already lets admins through.
    if (!storyArcJohn) {
      await incrementFeatureUsage(user.id, VOICE_CONVERSATION_FEATURE);
    }

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

function detectTranscriptLanguage(text: string): "ja" | "unknown" {
  const japaneseMatches =
    text.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g) ?? [];
  if (japaneseMatches.length < 2) return "unknown";

  const lettersAndJapanese =
    text.match(/[A-Za-z\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g) ?? [];
  if (lettersAndJapanese.length === 0) return "unknown";

  return japaneseMatches.length / lettersAndJapanese.length >= 0.35
    ? "ja"
    : "unknown";
}
