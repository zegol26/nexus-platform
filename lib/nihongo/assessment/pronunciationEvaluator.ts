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

    return {
      pronunciationScore: accuracyScore,
      fluencyScore: null,
      accuracyScore,
      missingWords: findMissingTokens(input.expectedText, input.transcript),
      misreadWords: [],
      feedbackIndonesian:
        "Skor dihitung dari kemiripan transcript dengan teks target. Ini mode MVP berbasis teks, bukan evaluasi fonetik penuh.",
      recommendedPractice: [
        "Ulangi bagian yang hilang dari transcript.",
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
      `Audio ${input.fileName} tersimpan, tetapi pronunciation scoring provider belum dikonfigurasi. Skor tidak dihitung agar hasil assessment tidak palsu.`,
    recommendedPractice: [
      "Lanjutkan assessment; bagian pronunciation ditandai belum dinilai.",
      "Latih shadowing dengan membaca teks yang sama 2-3 kali.",
      "Aktifkan speech-to-text provider untuk scoring otomatis di tahap berikutnya.",
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
    uploadedAt: new Date().toISOString(),
  };
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
