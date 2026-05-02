export type NihongoAssessmentLevel =
  | "Absolute Beginner"
  | "N5 Starter"
  | "N5 Foundation"
  | "N5 Strong"
  | "N4 Starter"
  | "N4 Developing"
  | "N4 Candidate";

export function mapScoreToNihongoLevel(score: number): NihongoAssessmentLevel {
  if (score <= 20) return "Absolute Beginner";
  if (score <= 35) return "N5 Starter";
  if (score <= 50) return "N5 Foundation";
  if (score <= 65) return "N5 Strong";
  if (score <= 78) return "N4 Starter";
  if (score <= 89) return "N4 Developing";
  return "N4 Candidate";
}

export function getDailyPlanForLevel(level: NihongoAssessmentLevel, weaknessTags: string[]): string {
  const primaryWeakness = weaknessTags[0] ?? "grammar";

  if (level === "Absolute Beginner" || level === "N5 Starter") {
    return "20 menit kana, 10 menit kosakata dasar, lalu 5 menit baca kalimat pendek.";
  }

  if (primaryWeakness === "particles") {
    return "10 menit review partikel, 15 menit latihan kalimat, 10 menit membaca contoh N5/N4.";
  }

  if (primaryWeakness === "listening" || primaryWeakness === "pronunciation") {
    return "10 menit shadowing, 10 menit dengar audio pendek, lalu 10 menit rekam ulang bacaan.";
  }

  return "15 menit grammar, 10 menit kanji/kosakata, lalu 10 menit reading atau listening pendek.";
}
