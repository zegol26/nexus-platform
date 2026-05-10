import type { PronunciationEvaluation } from "./evaluateAssessment";

type PronunciationInput = {
  expectedText: string;
  fileName: string;
  mimeType: string;
  size: number;
  transcript?: string | null;
};

export async function evaluatePronunciationUpload(input: PronunciationInput): Promise<PronunciationEvaluation> {
  if (input.transcript?.trim()) {
    const accuracyScore = calculateTextSimilarity(input.expectedText, input.transcript);
    const fluencyScore = estimateFluencyScore(input);
    const pronunciationScore = Math.round(accuracyScore * 0.85 + fluencyScore * 0.15);
    const missingWords = findMissingTokens(input.expectedText, input.transcript);

    return {
      pronunciationScore,
      fluencyScore,
      accuracyScore,
      missingWords,
      misreadWords: findLikelyMisreadTokens(input.expectedText, input.transcript),
      feedbackIndonesian:
        buildEvaluatedFeedback(pronunciationScore, accuracyScore, fluencyScore),
      recommendedPractice: [
        missingWords.length
          ? `Ulangi bagian yang belum terbaca jelas: ${missingWords.slice(0, 3).join("、")}.`
          : "Pertahankan artikulasi karena transcript sudah dekat dengan teks target.",
        "Baca perlahan sambil menjaga panjang bunyi vokal.",
        "Gunakan audio native sebagai pembanding saat tersedia.",
      ],
      status: "evaluated",
    };
  }

  // TODO: connect a real speech-to-text/pronunciation provider here.
  // Until that exists, never return a fake exact score.
  return {
    pronunciationScore: null,
    fluencyScore: null,
    accuracyScore: null,
    missingWords: [],
    misreadWords: [],
    feedbackIndonesian:
      `Audio ${input.fileName} diterima hanya untuk sesi ini, tetapi analyzer speech-to-text belum tersedia. Skor tidak dihitung agar hasil assessment tidak palsu.`,
    recommendedPractice: [
      "Lanjutkan assessment; bagian pronunciation ditandai belum dinilai.",
      "Latih shadowing dengan membaca teks yang sama 2-3 kali.",
      "Aktifkan OPENAI_API_KEY untuk scoring otomatis berbasis transcript.",
    ],
    status: "provider_not_configured",
  };
}

export function buildPronunciationMetadata(input: PronunciationInput) {
  return {
    expectedText: input.expectedText,
    fileName: input.fileName,
    mimeType: input.mimeType,
    size: input.size,
    analyzedAt: new Date().toISOString(),
    retention: "temporary_audio_not_stored",
  };
}

function buildEvaluatedFeedback(pronunciationScore: number, accuracyScore: number, fluencyScore: number) {
  if (pronunciationScore >= 85) {
    return `Bagus. Transcript sangat dekat dengan teks target. Accuracy ${accuracyScore}/100 dan estimasi kelancaran ${fluencyScore}/100.`;
  }

  if (pronunciationScore >= 70) {
    return `Cukup jelas, tetapi masih ada bagian yang perlu dirapikan. Accuracy ${accuracyScore}/100 dan estimasi kelancaran ${fluencyScore}/100.`;
  }

  return `Beberapa bagian belum terbaca jelas oleh analyzer. Accuracy ${accuracyScore}/100 dan estimasi kelancaran ${fluencyScore}/100. Coba baca lebih pelan dan stabil.`;
}

function estimateFluencyScore(input: PronunciationInput) {
  const expectedLength = normalizeJapaneseText(input.expectedText).length;
  const bytesPerCharacter = input.size / Math.max(expectedLength, 1);

  if (bytesPerCharacter < 3500) return 65;
  if (bytesPerCharacter > 120000) return 72;
  return 85;
}

function calculateTextSimilarity(expected: string, actual: string) {
  const normalizedExpected = normalizeJapaneseText(expected);
  const normalizedActual = normalizeJapaneseText(actual);

  if (!normalizedExpected || !normalizedActual) return 0;
  if (normalizedExpected === normalizedActual) return 100;

  const distance = levenshteinDistance(normalizedExpected, normalizedActual);
  const longest = Math.max(normalizedExpected.length, normalizedActual.length);

  return Math.max(0, Math.round((1 - distance / longest) * 100));
}

function normalizeJapaneseText(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[、。・「」『』\s.,!?！？]/g, "")
    .toLowerCase();
}

function findMissingTokens(expected: string, actual: string) {
  const actualNormalized = normalizeJapaneseText(actual);
  return expected
    .split(/[、。\s]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !actualNormalized.includes(normalizeJapaneseText(token)));
}

function findLikelyMisreadTokens(expected: string, actual: string) {
  const actualNormalized = normalizeJapaneseText(actual);
  return expected
    .split(/[、。\s]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => {
      const normalized = normalizeJapaneseText(token);
      return normalized.length >= 4 && !actualNormalized.includes(normalized);
    })
    .slice(0, 5);
}

function levenshteinDistance(a: string, b: string) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);

  for (let j = 1; j <= b.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}
