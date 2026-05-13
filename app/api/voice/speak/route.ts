import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 1200;

type SpeakResult = {
  buffer: ArrayBuffer;
  contentType: string;
  provider: "elevenlabs" | "openai";
};

type VoiceProfileId = "aichan" | "john" | "englishFemale";

type VoiceProfile = {
  elevenlabsVoiceIdEnv: string;
  elevenlabsSettings: {
    stability: number;
    similarity_boost: number;
    style: number;
  };
  openaiVoiceEnv: string;
  openaiVoiceDefault: string;
  openaiInstructions: string;
};

const VOICE_PROFILES: Record<VoiceProfileId, VoiceProfile> = {
  // Ai-chan: bright, young anime-sensei delivery for the Nihongo tutor.
  aichan: {
    elevenlabsVoiceIdEnv: "ELEVENLABS_VOICE_ID",
    elevenlabsSettings: {
      stability: 0.22,
      similarity_boost: 0.92,
      style: 0.6,
    },
    openaiVoiceEnv: "OPENAI_NIHONGO_TTS_VOICE",
    openaiVoiceDefault: "coral",
    openaiInstructions:
      "You are Ai-chan, a Japanese sensei character voiced as a cheerful young anime-style schoolgirl, around 17 years old. Speak with a bright, light, slightly higher pitch and youthful energy — like a friendly senpai in a Japanese school anime. Keep it warm, expressive, and a touch playful, never monotone, never deep, never adult-narrator. Use a moderate-but-lively pace; lift your tone slightly at the start of sentences and soften the end. Pronounce Japanese (kana, kanji readings, names) with clean, native, gentle anime-character intonation — no English accent. Pronounce Indonesian segments with native Indonesian fluency, still in the same youthful character voice. Smile through your voice. Never sound robotic or corporate.",
  },
  // John: calm, mid-40s male English coach for the Nexus AI English app.
  john: {
    elevenlabsVoiceIdEnv: "ELEVENLABS_JOHN_VOICE_ID",
    elevenlabsSettings: {
      stability: 0.55,
      similarity_boost: 0.85,
      style: 0.35,
    },
    openaiVoiceEnv: "OPENAI_ENGLISH_TTS_VOICE",
    openaiVoiceDefault: "onyx",
    openaiInstructions:
      "You are John, a 40-something male English coach. Speak in clear, modern, mid-Atlantic English with a calm, warm, mentor-like tone — think senior teacher or seasoned podcast host. Lower-mid pitch, unhurried pace, gentle pauses for emphasis. Never theatrical, never robotic, never overly formal. Pronounce Indonesian names and learner-facing words with respect and care. Smile through your voice without becoming bubbly.",
  },
  englishFemale: {
    elevenlabsVoiceIdEnv: "ELEVENLABS_ENGLISH_FEMALE_VOICE_ID",
    elevenlabsSettings: {
      stability: 0.5,
      similarity_boost: 0.85,
      style: 0.35,
    },
    openaiVoiceEnv: "OPENAI_ENGLISH_FEMALE_TTS_VOICE",
    openaiVoiceDefault: "nova",
    openaiInstructions:
      "You are a warm, clear female English conversation partner. Speak naturally with friendly everyday intonation, moderate pace, and crisp pronunciation for English learners. Keep the tone supportive and realistic, never robotic or theatrical.",
  },
};

function resolveProfile(value: unknown): VoiceProfileId {
  if (value === "englishFemale") return "englishFemale";
  return value === "john" ? "john" : "aichan";
}

async function speakWithElevenLabs(
  text: string,
  profile: VoiceProfile
): Promise<SpeakResult | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId =
    process.env[profile.elevenlabsVoiceIdEnv] ??
    // Fall back to the shared voice id if a profile-specific one isn't
    // configured — saves the user from having to set two env vars to
    // get John working.
    (profile.elevenlabsVoiceIdEnv === "ELEVENLABS_ENGLISH_FEMALE_VOICE_ID"
      ? undefined
      : process.env.ELEVENLABS_VOICE_ID);
  if (!apiKey || !voiceId) return null;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        accept: "audio/mpeg",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2",
        voice_settings: {
          ...profile.elevenlabsSettings,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    console.error("[voice/speak] ElevenLabs failed", response.status, errBody);
    return null;
  }

  return {
    buffer: await response.arrayBuffer(),
    contentType: response.headers.get("content-type") ?? "audio/mpeg",
    provider: "elevenlabs",
  };
}

async function speakWithOpenAI(
  text: string,
  profile: VoiceProfile
): Promise<SpeakResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const openai = new OpenAI({ apiKey });
  const response = await openai.audio.speech.create({
    model: process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts",
    voice: process.env[profile.openaiVoiceEnv] ?? profile.openaiVoiceDefault,
    input: text,
    instructions: profile.openaiInstructions,
  });

  return {
    buffer: await response.arrayBuffer(),
    contentType: "audio/mpeg",
    provider: "openai",
  };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = (await request.json().catch(() => null)) as {
      text?: unknown;
      voiceProfile?: unknown;
    } | null;

    const text =
      body && typeof body.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json(
        { error: "Text is required." },
        { status: 400 }
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        {
          error: `Text terlalu panjang (max ${MAX_TEXT_LENGTH} karakter).`,
        },
        { status: 413 }
      );
    }

    const profileId = resolveProfile(body?.voiceProfile);
    const profile = VOICE_PROFILES[profileId];

    let result = await speakWithElevenLabs(text, profile);
    if (!result) {
      result = await speakWithOpenAI(text, profile);
    }

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Voice belum dikonfigurasi. Set ELEVENLABS_API_KEY+ELEVENLABS_VOICE_ID atau OPENAI_API_KEY.",
        },
        { status: 503 }
      );
    }

    return new NextResponse(Buffer.from(result.buffer), {
      headers: {
        "Content-Type": result.contentType,
        "Cache-Control": "no-store",
        "X-Voice-Provider": result.provider,
      },
    });
  } catch (error) {
    console.error("[voice/speak] unexpected error", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Voice speak gagal: ${error.message}`
            : "Voice speak gagal.",
      },
      { status: 500 }
    );
  }
}
