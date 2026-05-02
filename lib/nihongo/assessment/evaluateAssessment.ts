import { assignNihongoBadge } from "@/lib/nihongo/badges/assignBadge";
import type { AssessmentQuestion } from "./questionBank";
import { getDailyPlanForLevel, mapScoreToNihongoLevel } from "./levelMapping";

export type SubmittedAssessmentAnswer = {
  questionId: string;
  answer: string;
};

export type PronunciationEvaluation = {
  pronunciationScore: number | null;
  fluencyScore: number | null;
  accuracyScore: number | null;
  missingWords: string[];
  misreadWords: string[];
  feedbackIndonesian: string;
  recommendedPractice: string[];
  status?: "evaluated" | "not_tested" | "provider_not_configured" | "pending" | "error";
};

export type ScoredAssessmentAnswer = {
  question: AssessmentQuestion;
  userAnswer: string;
  isCorrect: boolean;
  score: number;
  maxScore: number;
};

export type AssessmentEvaluation = {
  overallScore: number;
  estimatedLevel: ReturnType<typeof mapScoreToNihongoLevel>;
  weaknessTags: string[];
  strengthTags: string[];
  recommendedCurriculumFocus: string[];
  recommendedDailyPlan: string;
  aiFeedbackIndonesian: string;
  encouragementJapanese: string;
  badgeId: string;
  answers: ScoredAssessmentAnswer[];
  pronunciation?: PronunciationEvaluation;
};

const categoryWeights: Record<string, number> = {
  kana: 1,
  kanji: 1,
  particles: 1.1,
  tense_forms: 1.15,
  reading: 1.25,
  listening: 1.15,
};

const fallbackFeedback: Record<string, string> = {
  kana: "Perkuat hiragana dan katakana dulu supaya materi berikutnya terasa lebih ringan.",
  katakana: "Katakana masih perlu dibuat otomatis lewat latihan pendek tapi rutin.",
  kanji: "Mulai dari kanji N5/N4 yang paling sering muncul dan hubungkan dengan kosakata.",
  particles: "Partikel perlu dilatih lewat kalimat utuh, bukan hafalan terpisah.",
  verb_forms: "Bentuk kata kerja sopan lampau/negatif perlu dibuat lebih stabil.",
  adjective_forms: "Bentuk い-adjective dan な-adjective perlu latihan kontras.",
  reading: "Latihan membaca pendek akan membantu kamu menangkap ide utama dan detail.",
  listening: "Dengarkan kalimat pendek berulang, lalu cocokkan dengan transkrip.",
  pronunciation: "Latihan shadowing dan rekam ulang akan membantu akurasi bunyi.",
};

export function evaluateAssessment(params: {
  questions: AssessmentQuestion[];
  answers: SubmittedAssessmentAnswer[];
  pronunciation?: PronunciationEvaluation;
}): AssessmentEvaluation {
  const submitted = new Map(params.answers.map((answer) => [answer.questionId, answer.answer.trim()]));

  const scoredAnswers = params.questions.map((question) => {
    const userAnswer = submitted.get(question.id) ?? "";
    const isCorrect = userAnswer === question.correctAnswer;
    const maxScore = Math.round((categoryWeights[question.category] ?? 1) * 100);

    return {
      question,
      userAnswer,
      isCorrect,
      score: isCorrect ? maxScore : 0,
      maxScore,
    };
  });

  const earned = scoredAnswers.reduce((sum, answer) => sum + answer.score, 0);
  const possible = scoredAnswers.reduce((sum, answer) => sum + answer.maxScore, 0);
  const baseScore = possible === 0 ? 0 : Math.round((earned / possible) * 100);
  const pronunciationScore = params.pronunciation?.pronunciationScore;
  const overallScore =
    typeof pronunciationScore === "number"
      ? Math.round(baseScore * 0.9 + pronunciationScore * 0.1)
      : baseScore;

  const tagStats = new Map<string, { correct: number; total: number }>();
  for (const answer of scoredAnswers) {
    for (const tag of answer.question.tags) {
      const current = tagStats.get(tag) ?? { correct: 0, total: 0 };
      current.total += 1;
      if (answer.isCorrect) current.correct += 1;
      tagStats.set(tag, current);
    }
  }

  if (typeof params.pronunciation?.pronunciationScore === "number") {
    tagStats.set("pronunciation", {
      correct: params.pronunciation.pronunciationScore >= 70 ? 1 : 0,
      total: 1,
    });
  }

  const weaknessTags: string[] = [];
  const strengthTags: string[] = [];

  for (const [tag, stats] of tagStats.entries()) {
    const ratio = stats.correct / Math.max(stats.total, 1);
    if (ratio < 0.6) weaknessTags.push(tag);
    if (ratio >= 0.8) strengthTags.push(tag);
  }

  const estimatedLevel = mapScoreToNihongoLevel(overallScore);
  const recommendedCurriculumFocus =
    weaknessTags.length > 0
      ? weaknessTags
      : ["reading", "listening", "kanji"];
  const recommendedDailyPlan = getDailyPlanForLevel(estimatedLevel, weaknessTags);
  const badgeId = assignNihongoBadge({
    level: estimatedLevel,
    weaknessTags,
    score: overallScore,
  });

  return {
    overallScore,
    estimatedLevel,
    weaknessTags,
    strengthTags,
    recommendedCurriculumFocus,
    recommendedDailyPlan,
    aiFeedbackIndonesian: buildFeedbackIndonesian(overallScore, weaknessTags, strengthTags),
    encouragementJapanese: "少しずつ進めば、必ず上手になります。",
    badgeId,
    answers: scoredAnswers,
    pronunciation: params.pronunciation,
  };
}

function buildFeedbackIndonesian(score: number, weaknessTags: string[], strengthTags: string[]) {
  const strengths =
    strengthTags.length > 0
      ? `Kekuatanmu saat ini: ${strengthTags.join(", ")}.`
      : "Kamu sudah punya titik awal yang jelas untuk mulai belajar.";
  const weaknesses =
    weaknessTags.length > 0
      ? weaknessTags.slice(0, 3).map((tag) => fallbackFeedback[tag] ?? `Area ${tag} perlu latihan lanjutan.`).join(" ")
      : "Hasilmu cukup merata, jadi fokus berikutnya adalah menjaga konsistensi dan menaikkan tingkat bacaan.";

  return `Skor awalmu ${score}/100. ${strengths} ${weaknesses}`;
}
