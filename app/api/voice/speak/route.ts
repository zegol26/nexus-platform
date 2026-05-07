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

async function speakWithElevenLabs(text: string): Promise<SpeakResult | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!apiKey || !voiceId) return null;

  // Voice settings tuned for Ai-chan — a friendly young woman around 17
  // years old. Lower `stability` keeps natural pitch variation so the
  // delivery sounds youthful and expressive instead of monotone-mature;
  // higher `similarity_boost` keeps the chosen voice anchored;
  // moderate `style` adds gentle warmth without theatrical drift.
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
          // Wibu/anime-schoolgirl Ai-chan profile: low stability gives
          // strong pitch variation (youthful, expressive), high
          // similarity_boost anchors the chosen voice id, high style
          // pushes character/personality through.
          stability: 0.22,
          similarity_boost: 0.92,
          style: 0.6,
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

async function speakWithOpenAI(text: string): Promise<SpeakResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const openai = new OpenAI({ apiKey });
  const response = await openai.audio.speech.create({
    model: process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts",
    // Default to "coral" — the lightest, brightest young-female voice
    // OpenAI ships, which lands closest to a Japanese anime-school /
    // wibu sensei character. "shimmer" or "nova" are acceptable
    // alternates; "alloy"/"echo"/"onyx"/"sage" skew older or male.
    voice: process.env.OPENAI_NIHONGO_TTS_VOICE ?? "coral",
    input: text,
    instructions:
      "You are Ai-chan, a Japanese sensei character voiced as a cheerful young anime-style schoolgirl, around 17 years old. Speak with a bright, light, slightly higher pitch and youthful energy — like a friendly senpai in a Japanese school anime. Keep it warm, expressive, and a touch playful, never monotone, never deep, never adult-narrator. Use a moderate-but-lively pace; lift your tone slightly at the start of sentences and soften the end. Pronounce Japanese (kana, kanji readings, names) with clean, native, gentle anime-character intonation — no English accent. Pronounce Indonesian segments with native Indonesian fluency, still in the same youthful character voice. Smile through your voice. Never sound robotic or corporate.",
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

    let result = await speakWithElevenLabs(text);
    if (!result) {
      result = await speakWithOpenAI(text);
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
