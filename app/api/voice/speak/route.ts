import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { createHash } from "node:crypto";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { withRouteMetrics } from "@/lib/observability/route-metrics";

export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 1200;

type SpeakResult = {
  buffer: ArrayBuffer | Buffer;
  contentType: string;
  provider: "elevenlabs" | "openai";
};

type CachedSpeakResult = SpeakResult & {
  cacheKey: string;
  cacheStatus: "hit" | "miss";
};

type VoiceProfileId =
  | "aichan"
  | "john"
  | "englishFemale"
  | "storyNarrator"
  | "storyHana"
  | "storyRyo"
  | "storyJohn"
  | "storyRatna"
  | "storyMaya"
  | "storyHalim"
  | "storySari"
  | "storyLessonA"
  | "storyLessonB";

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
  storyArcPitchMultiplier?: number;
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
      stability: 0.42,
      similarity_boost: 0.86,
      style: 0.55,
    },
    openaiVoiceEnv: "OPENAI_ENGLISH_TTS_VOICE",
    openaiVoiceDefault: "verse",
    openaiInstructions:
      "You are John, a 40-something male English coach. Speak in clear, modern, mid-Atlantic English with warm mentor energy, like a seasoned conversation coach who is fully awake and engaged. Use a natural medium pitch, crisp articulation, and a slightly brisk pace. Add friendly lift at the start of key sentences and confident emphasis on corrections. Never sound sleepy, monotone, theatrical, robotic, or overly formal. Pronounce Indonesian names and learner-facing words with respect and care. Smile through your voice without becoming bubbly.",
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
  storyHana: {
    elevenlabsVoiceIdEnv: "ELEVENLABS_STORYARC_HANA_VOICE_ID",
    elevenlabsSettings: { stability: 0.36, similarity_boost: 0.86, style: 0.48 },
    openaiVoiceEnv: "OPENAI_STORYARC_HANA_TTS_VOICE",
    openaiVoiceDefault: "coral",
    storyArcPitchMultiplier: 1.11,
    openaiInstructions:
      "You are Hana, a warm, outgoing sixteen-year-old Indonesian high-school student speaking natural English with a new friend. Use a distinctly youthful, light, higher-pitched teenage resonance, friendly energy, clear learner-accessible pronunciation, and believable intonation. Keep the same identity throughout and use a slightly measured pace to accommodate subtle pitch processing. Never sound like an adult woman, teacher, child, cartoon, narrator, or robot.",
  },
  storyRyo: {
    elevenlabsVoiceIdEnv: "ELEVENLABS_STORYARC_RYO_VOICE_ID",
    elevenlabsSettings: { stability: 0.55, similarity_boost: 0.84, style: 0.22 },
    openaiVoiceEnv: "OPENAI_STORYARC_RYO_TTS_VOICE",
    openaiVoiceDefault: "ash",
    storyArcPitchMultiplier: 1.08,
    openaiInstructions:
      "You are Ryo, a reserved and practical sixteen-year-old Indonesian high-school student speaking accurate English. Use a youthful medium-light teenage resonance without chest-heavy bass, concise delivery, subtle warmth, and crisp pronunciation. Keep the same identity throughout and use a slightly measured pace to accommodate subtle pitch processing. Never sound like an adult man, teacher, child, narrator, or robot.",
  },
  storyNarrator: {
    elevenlabsVoiceIdEnv: "ELEVENLABS_STORYARC_NARRATOR_VOICE_ID",
    elevenlabsSettings: { stability: 0.62, similarity_boost: 0.82, style: 0.18 },
    openaiVoiceEnv: "OPENAI_STORYARC_NARRATOR_TTS_VOICE",
    openaiVoiceDefault: "sage",
    openaiInstructions: "Narrate a contemporary Indonesian school story in clear international English. Sound warm, observant, and cinematic, with restrained emotion and a steady pace. You are an adult narrator, not one of the students.",
  },
  storyJohn: {
    elevenlabsVoiceIdEnv: "ELEVENLABS_STORYARC_JOHN_VOICE_ID",
    elevenlabsSettings: { stability: 0.48, similarity_boost: 0.84, style: 0.3 },
    openaiVoiceEnv: "OPENAI_STORYARC_JOHN_TTS_VOICE",
    openaiVoiceDefault: "verse",
    openaiInstructions: "You are John, a friendly young adult mentor in an Indonesian school English club. Speak natural international English with calm energy, an early-thirties voice, and conversational timing. Never sound old, theatrical, or robotic.",
  },
  storyRatna: {
    elevenlabsVoiceIdEnv: "ELEVENLABS_STORYARC_RATNA_VOICE_ID",
    elevenlabsSettings: { stability: 0.6, similarity_boost: 0.86, style: 0.24 },
    openaiVoiceEnv: "OPENAI_STORYARC_RATNA_TTS_VOICE",
    openaiVoiceDefault: "marin",
    openaiInstructions: "You are Ibu Ratna, a composed Indonesian school principal in her late forties. Speak clear English with quiet authority, warmth, and measured natural rhythm. Pronounce Indonesian names correctly.",
  },
  storyMaya: {
    elevenlabsVoiceIdEnv: "ELEVENLABS_STORYARC_MAYA_VOICE_ID",
    elevenlabsSettings: { stability: 0.4, similarity_boost: 0.87, style: 0.42 },
    openaiVoiceEnv: "OPENAI_STORYARC_MAYA_TTS_VOICE",
    openaiVoiceDefault: "shimmer",
    storyArcPitchMultiplier: 1.11,
    openaiInstructions: "You are Maya, a confident sixteen-year-old exchange student speaking natural English. Use a distinctly youthful, light, higher-pitched teenage resonance, clear conversational rhythm, and curious friendly energy. Keep the same identity throughout and use a slightly measured pace to accommodate subtle pitch processing. Never sound like an adult woman, teacher, child, cartoon, or narrator.",
  },
  storyHalim: {
    elevenlabsVoiceIdEnv: "ELEVENLABS_STORYARC_HALIM_VOICE_ID",
    elevenlabsSettings: { stability: 0.58, similarity_boost: 0.85, style: 0.2 },
    openaiVoiceEnv: "OPENAI_STORYARC_HALIM_TTS_VOICE",
    openaiVoiceDefault: "cedar",
    openaiInstructions: "You are Pak Halim, an Indonesian vocational-school teacher in his forties. Speak clear international English with practical warmth, grounded confidence, and a natural medium pace.",
  },
  storySari: {
    elevenlabsVoiceIdEnv: "ELEVENLABS_STORYARC_SARI_VOICE_ID",
    elevenlabsSettings: { stability: 0.38, similarity_boost: 0.86, style: 0.46 },
    openaiVoiceEnv: "OPENAI_STORYARC_SARI_TTS_VOICE",
    openaiVoiceDefault: "nova",
    storyArcPitchMultiplier: 1.11,
    openaiInstructions: "You are Sari, an expressive fifteen-year-old Indonesian student. Use a distinctly youthful, light, higher-pitched teenage resonance with friendly energy, clear learner-accessible English, and believable timing. Keep the same identity throughout and use a slightly measured pace to accommodate subtle pitch processing. Be lively but never sound like an adult woman, young child, cartoon, or narrator.",
  },
  storyLessonA: {
    elevenlabsVoiceIdEnv: "ELEVENLABS_STORYARC_LESSON_A_VOICE_ID",
    elevenlabsSettings: { stability: 0.55, similarity_boost: 0.86, style: 0.25 },
    openaiVoiceEnv: "OPENAI_STORYARC_LESSON_A_TTS_VOICE",
    openaiVoiceDefault: "ash",
    storyArcPitchMultiplier: 1.08,
    openaiInstructions: "You are Speaker A in an English lesson dialogue, a sixteen-year-old male secondary-school student. Keep exactly the same youthful identity, medium-light teenage resonance without chest-heavy bass, measured volume, and clear pronunciation on every line. Use a slightly measured pace to accommodate subtle pitch processing. Never sound adult, elderly, childish, theatrical, or like a narrator.",
  },
  storyLessonB: {
    elevenlabsVoiceIdEnv: "ELEVENLABS_STORYARC_LESSON_B_VOICE_ID",
    elevenlabsSettings: { stability: 0.5, similarity_boost: 0.87, style: 0.3 },
    openaiVoiceEnv: "OPENAI_STORYARC_LESSON_B_TTS_VOICE",
    openaiVoiceDefault: "coral",
    storyArcPitchMultiplier: 1.11,
    openaiInstructions: "You are Speaker B in an English lesson dialogue, a sixteen-year-old female secondary-school student. Keep exactly the same youthful identity, light higher-pitched teenage resonance, measured volume, and clear pronunciation on every line. Use a slightly measured pace to accommodate subtle pitch processing. Never sound adult, elderly, childish, theatrical, or like a narrator.",
  },
};

function resolveProfile(value: unknown): VoiceProfileId {
  if (value === "storyNarrator") return "storyNarrator";
  if (value === "storyHana") return "storyHana";
  if (value === "storyRyo") return "storyRyo";
  if (value === "storyJohn") return "storyJohn";
  if (value === "storyRatna") return "storyRatna";
  if (value === "storyMaya") return "storyMaya";
  if (value === "storyHalim") return "storyHalim";
  if (value === "storySari") return "storySari";
  if (value === "storyLessonA") return "storyLessonA";
  if (value === "storyLessonB") return "storyLessonB";
  if (value === "englishFemale") return "englishFemale";
  return value === "john" ? "john" : "aichan";
}

function devLog(message: string, metadata?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[voice/speak] ${message}`, metadata ?? "");
  }
}

function isStoryArcProfile(profileId: VoiceProfileId) {
  return profileId.startsWith("story");
}

function buildCacheKey(text: string, profileId: VoiceProfileId, profile: VoiceProfile) {
  const textHash = createHash("sha256").update(text).digest("hex");
  const voiceFingerprint = isStoryArcProfile(profileId)
    ? JSON.stringify({
        version: profile.storyArcPitchMultiplier ? "storyarc-voice-v5-teen-pitch" : "storyarc-voice-v4-normalized",
        model: process.env.OPENAI_STORYARC_TTS_MODEL ?? "gpt-4o-mini-tts-2025-12-15",
        voice: process.env[profile.openaiVoiceEnv] ?? profile.openaiVoiceDefault,
        instructions: profile.openaiInstructions,
        pitchMultiplier: profile.storyArcPitchMultiplier,
      })
    : "shared-voice-v1";
  const cacheKey = createHash("sha256")
    .update(`${profileId}:${textHash}:${voiceFingerprint}`)
    .digest("hex")
    .slice(0, 40);

  return { cacheKey, textHash };
}

function toBuffer(buffer: ArrayBuffer | Buffer) {
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
}

function normalizePcmWave(input: ArrayBuffer | Buffer, pitchMultiplier = 1) {
  const wave = Buffer.from(toBuffer(input));
  if (wave.toString("ascii", 0, 4) !== "RIFF" || wave.toString("ascii", 8, 12) !== "WAVE") return wave;
  let offset = 12;
  let audioFormat = 0;
  let channels = 0;
  let bitsPerSample = 0;
  let sampleRateOffset = 0;
  let byteRateOffset = 0;
  let dataOffset = 0;
  let dataSize = 0;
  while (offset + 8 <= wave.length) {
    const chunkId = wave.toString("ascii", offset, offset + 4);
    const chunkSize = wave.readUInt32LE(offset + 4);
    if (chunkId === "fmt " && offset + 24 <= wave.length) {
      audioFormat = wave.readUInt16LE(offset + 8);
      channels = wave.readUInt16LE(offset + 10);
      sampleRateOffset = offset + 12;
      byteRateOffset = offset + 16;
      bitsPerSample = wave.readUInt16LE(offset + 22);
    } else if (chunkId === "data") {
      dataOffset = offset + 8;
      dataSize = Math.min(chunkSize, wave.length - dataOffset);
      break;
    }
    offset += 8 + chunkSize + (chunkSize % 2);
  }
  if (audioFormat !== 1 || bitsPerSample !== 16 || dataOffset === 0 || dataSize < 2) return wave;

  if (pitchMultiplier > 1 && sampleRateOffset > 0 && byteRateOffset > 0 && channels > 0) {
    const originalSampleRate = wave.readUInt32LE(sampleRateOffset);
    const tunedSampleRate = Math.round(originalSampleRate * pitchMultiplier);
    wave.writeUInt32LE(tunedSampleRate, sampleRateOffset);
    wave.writeUInt32LE(tunedSampleRate * channels * (bitsPerSample / 8), byteRateOffset);
  }

  const sampleCount = Math.floor(dataSize / 2);
  let sumSquares = 0;
  let peak = 0;
  for (let index = 0; index < sampleCount; index += 1) {
    const sample = wave.readInt16LE(dataOffset + index * 2);
    sumSquares += sample * sample;
    peak = Math.max(peak, Math.abs(sample));
  }
  const rms = Math.sqrt(sumSquares / sampleCount);
  if (rms < 1 || peak < 1) return wave;
  const targetRms = 0.12 * 32767;
  const peakLimit = 0.89 * 32767;
  const gain = Math.min(targetRms / rms, peakLimit / peak, 4);
  for (let index = 0; index < sampleCount; index += 1) {
    const sample = wave.readInt16LE(dataOffset + index * 2);
    const normalized = Math.max(-32768, Math.min(32767, Math.round(sample * gain)));
    wave.writeInt16LE(normalized, dataOffset + index * 2);
  }
  return wave;
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
    undefined;
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
  profile: VoiceProfile,
  profileId: VoiceProfileId,
): Promise<SpeakResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const openai = new OpenAI({ apiKey });
  const storyArc = isStoryArcProfile(profileId);
  const response = await openai.audio.speech.create({
    model: storyArc ? process.env.OPENAI_STORYARC_TTS_MODEL ?? "gpt-4o-mini-tts-2025-12-15" : process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts",
    voice: process.env[profile.openaiVoiceEnv] ?? profile.openaiVoiceDefault,
    input: text,
    instructions: profile.openaiInstructions,
    ...(storyArc ? { response_format: "wav" as const } : {}),
  });

  const buffer = await response.arrayBuffer();

  return {
    buffer: storyArc ? normalizePcmWave(buffer, profile.storyArcPitchMultiplier) : buffer,
    contentType: storyArc ? "audio/wav" : "audio/mpeg",
    provider: "openai",
  };
}

async function getOrCreateCachedSpeech(
  text: string,
  profileId: VoiceProfileId,
  profile: VoiceProfile
): Promise<CachedSpeakResult | null> {
  const { cacheKey, textHash } = buildCacheKey(text, profileId, profile);
  const cached = await prisma.voiceTtsCache.findUnique({
    where: { cacheKey },
  });

  if (cached) {
    devLog("tts cache hit", {
      cacheKey,
      voiceProfile: profileId,
      textLength: text.length,
    });
    await prisma.voiceTtsCache.update({
      where: { cacheKey },
      data: { lastUsedAt: new Date() },
    });
    return {
      buffer: Buffer.from(cached.audioBase64, "base64"),
      contentType: cached.audioMimeType,
      provider: cached.provider === "elevenlabs" ? "elevenlabs" : "openai",
      cacheKey,
      cacheStatus: "hit",
    };
  }

  devLog("tts cache miss", {
    cacheKey,
    voiceProfile: profileId,
    textLength: text.length,
  });

  let result: SpeakResult | null;
  if (isStoryArcProfile(profileId) && process.env.OPENAI_API_KEY) {
    result = await speakWithOpenAI(text, profile, profileId);
  } else {
    result = await speakWithElevenLabs(text, profile);
    if (!result) result = await speakWithOpenAI(text, profile, profileId);
  }

  if (!result) return null;

  const buffer = toBuffer(result.buffer);
  try {
    await prisma.voiceTtsCache.create({
      data: {
        cacheKey,
        textHash,
        voiceProfile: profileId,
        provider: result.provider,
        audioBase64: buffer.toString("base64"),
        audioMimeType: result.contentType,
        textLength: text.length,
      },
    });
    devLog("generated URL recreated", { cacheKey, voiceProfile: profileId });
  } catch {
    const racedCache = await prisma.voiceTtsCache.findUnique({
      where: { cacheKey },
    });
    if (racedCache) {
      devLog("generated URL reused after concurrent create", {
        cacheKey,
        voiceProfile: profileId,
      });
      return {
        buffer: Buffer.from(racedCache.audioBase64, "base64"),
        contentType: racedCache.audioMimeType,
        provider: racedCache.provider === "elevenlabs" ? "elevenlabs" : "openai",
        cacheKey,
        cacheStatus: "hit",
      };
    }
    throw new Error("Voice cache write failed.");
  }

  return {
    buffer,
    contentType: result.contentType,
    provider: result.provider,
    cacheKey,
    cacheStatus: "miss",
  };
}

export async function POST(request: Request) {
  return withRouteMetrics(
    {
      route: "/api/voice/speak",
      method: "POST",
      routeType: "voice",
      riskLevel: "high",
      slowMs: 1200,
      sampleRate: 1,
    },
    () => speakVoice(request)
  );
}

async function speakVoice(request: Request) {
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
      returnUrl?: unknown;
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

    const result = await getOrCreateCachedSpeech(text, profileId, profile);

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Voice belum dikonfigurasi. Set ELEVENLABS_API_KEY+ELEVENLABS_VOICE_ID atau OPENAI_API_KEY.",
        },
        { status: 503 }
      );
    }

    if (body?.returnUrl === true) {
      const audioUrl = `/api/voice/speak/cache/${result.cacheKey}`;
      devLog(
        result.cacheStatus === "hit"
          ? "generated URL reused"
          : "generated URL recreated",
        { audioUrl, voiceProfile: profileId }
      );
      return NextResponse.json(
        {
          audioUrl,
          cacheKey: result.cacheKey,
          cacheStatus: result.cacheStatus,
          provider: result.provider,
          contentType: result.contentType,
        },
        {
          headers: {
            "Cache-Control": "private, max-age=3600",
            "X-TTS-Cache": result.cacheStatus,
            "X-Voice-Provider": result.provider,
          },
        }
      );
    }

    return new NextResponse(new Uint8Array(toBuffer(result.buffer)), {
      headers: {
        "Content-Type": result.contentType,
        "Cache-Control": "private, max-age=3600",
        "X-Voice-Provider": result.provider,
        "X-TTS-Cache": result.cacheStatus,
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

