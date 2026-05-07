/**
 * Cost estimation for AI features in Nexus AI Nihongo.
 *
 * The model + provider rates below are rough USD prices as of late
 * 2025. They are intentionally read from constants so we can hot-fix
 * them without redeploying every page that imports this file. The
 * USD→JPY rate is overridable via the JPY_PER_USD env var so finance
 * can pin a settlement rate per month.
 *
 * Cost is an *estimate* — token counts are approximated from string
 * length (≈ 4 chars per token for mixed Indonesian/Japanese text) and
 * audio durations are estimated when not present in metadata. Use
 * provider invoices for ground truth; this is a learner-cost
 * dashboard, not finance.
 */

export const PRICING_USD = {
  // gpt-4.1-mini, used by AI Tutor for text + voice mode replies.
  tutorTextInputPerMillionTokens: 0.15,
  tutorTextOutputPerMillionTokens: 0.6,
  // gpt-4o-mini-tts, used by /api/voice/speak when ElevenLabs is not
  // configured. Priced per input character.
  ttsPerMillionCharsOpenAI: 15.0,
  // ElevenLabs eleven_multilingual_v2, average per-character price on
  // the Creator tier. ElevenLabs bills per character of input text.
  ttsPerMillionCharsElevenLabs: 30.0,
  // whisper-1, priced per minute of audio.
  whisperPerMinute: 0.006,
} as const;

const DEFAULT_JPY_PER_USD = 150;

export function jpyPerUsd(): number {
  const raw = process.env.JPY_PER_USD;
  const parsed = raw ? Number.parseFloat(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_JPY_PER_USD;
}

function tokensFromChars(chars: number): number {
  // Mixed Indonesian + Japanese text averages ≈ 4 chars per token on
  // OpenAI tokenizers. Japanese-heavy strings skew lower (~2.5 chars
  // per token), but the input/output mix here keeps ~4 a sane rough.
  return chars / 4;
}

function usd(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

export function estimateTutorTextCostUsd(params: {
  messageLength: number;
  replyLength: number;
}): number {
  const inputTokens = tokensFromChars(params.messageLength);
  const outputTokens = tokensFromChars(params.replyLength);
  const cost =
    (inputTokens * PRICING_USD.tutorTextInputPerMillionTokens) / 1_000_000 +
    (outputTokens * PRICING_USD.tutorTextOutputPerMillionTokens) / 1_000_000;
  return usd(cost);
}

export function estimateTtsCostUsd(params: {
  replyLength: number;
  provider: "openai" | "elevenlabs";
}): number {
  const rate =
    params.provider === "elevenlabs"
      ? PRICING_USD.ttsPerMillionCharsElevenLabs
      : PRICING_USD.ttsPerMillionCharsOpenAI;
  const cost = (params.replyLength * rate) / 1_000_000;
  return usd(cost);
}

export function estimateWhisperCostUsd(params: {
  /** Estimated audio duration in seconds. Pass a default if missing. */
  audioSeconds: number;
}): number {
  const cost = (params.audioSeconds / 60) * PRICING_USD.whisperPerMinute;
  return usd(cost);
}

/**
 * Estimate the full cost of one AI Tutor turn given the metadata
 * shape we now persist into `AnalyticsEvent.metadata`:
 *
 *   {
 *     messageLength: number,
 *     replyLength: number,
 *     mode: "text" | "voice",
 *     // optional, may be missing on legacy rows
 *     ttsProvider?: "openai" | "elevenlabs",
 *     audioSeconds?: number,
 *   }
 *
 * Voice turns add Whisper (transcribe) + TTS (speak) on top of the
 * tutor reply. We use conservative defaults when fields are missing.
 */
export function estimateTutorTurnCostUsd(params: {
  messageLength: number;
  replyLength: number;
  mode: "text" | "voice";
  ttsProvider?: "openai" | "elevenlabs";
  audioSeconds?: number;
}): number {
  let total = estimateTutorTextCostUsd({
    messageLength: params.messageLength,
    replyLength: params.replyLength,
  });
  if (params.mode === "voice") {
    total += estimateWhisperCostUsd({
      audioSeconds: params.audioSeconds ?? 8,
    });
    total += estimateTtsCostUsd({
      replyLength: params.replyLength,
      provider: params.ttsProvider ?? "openai",
    });
  }
  return usd(total);
}

export function usdToJpy(usdValue: number): number {
  return Math.round(usdValue * jpyPerUsd());
}

export function formatJpy(value: number): string {
  return `¥${value.toLocaleString("ja-JP")}`;
}
