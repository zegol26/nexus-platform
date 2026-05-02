import type { BankAssessmentQuestion } from "./generateAssessmentForLevel";
import type { SubmittedAssessmentAnswer } from "./evaluateAssessment";

export type PlacementEvaluation = {
  totalScore: number;
  scoreByLevel: Record<string, number>;
  scoreBySkill: Record<string, number>;
  bridgeScore: number | null;
  readinessLabel: "N5 Foundation" | "N5 Strong" | "N4 Mid Ready" | "N4 Foundation" | "N4 Strong";
  recommendedLevel: string;
};

export function evaluatePlacement(params: {
  targetLevel: "N5" | "N4";
  questions: BankAssessmentQuestion[];
  answers: SubmittedAssessmentAnswer[];
}): PlacementEvaluation {
  const answerMap = new Map(params.answers.map((answer) => [answer.questionId, answer.answer]));
  const scored = params.questions.map((question) => ({
    question,
    correct: answerMap.get(question.id) === question.correctAnswer,
  }));

  const totalScore = percent(scored.filter((item) => item.correct).length, scored.length);
  const scoreByLevel = groupPercent(scored, (item) => item.question.level);
  const scoreBySkill = groupPercent(scored, (item) => item.question.skill);
  const bridgeScore = params.targetLevel === "N5" ? scoreByLevel.N4 ?? 0 : null;
  const baseN5 = scoreByLevel.N5 ?? totalScore;
  const baseN4 = scoreByLevel.N4 ?? totalScore;

  if (params.targetLevel === "N5") {
    if (baseN5 >= 80 && (bridgeScore ?? 0) >= 60) {
      return {
        totalScore,
        scoreByLevel,
        scoreBySkill,
        bridgeScore,
        readinessLabel: "N4 Mid Ready",
        recommendedLevel: "N4 Mid / N4 Ready",
      };
    }

    if (baseN5 >= 70) {
      return {
        totalScore,
        scoreByLevel,
        scoreBySkill,
        bridgeScore,
        readinessLabel: "N5 Strong",
        recommendedLevel: "N5 Strong, continue N4 intro",
      };
    }

    return {
      totalScore,
      scoreByLevel,
      scoreBySkill,
      bridgeScore,
      readinessLabel: "N5 Foundation",
      recommendedLevel: "N5 Foundation",
    };
  }

  if (baseN4 >= 80) {
    return {
      totalScore,
      scoreByLevel,
      scoreBySkill,
      bridgeScore,
      readinessLabel: "N4 Strong",
      recommendedLevel: "N4 Strong",
    };
  }

  return {
    totalScore,
    scoreByLevel,
    scoreBySkill,
    bridgeScore,
    readinessLabel: "N4 Foundation",
    recommendedLevel: "N4 Foundation",
  };
}

function groupPercent<T>(items: T[], getKey: (item: T) => string) {
  const groups = new Map<string, { correct: number; total: number }>();

  for (const item of items as Array<T & { correct: boolean }>) {
    const key = getKey(item);
    const current = groups.get(key) ?? { correct: 0, total: 0 };
    current.total += 1;
    if (item.correct) current.correct += 1;
    groups.set(key, current);
  }

  return Object.fromEntries(
    Array.from(groups.entries()).map(([key, value]) => [key, percent(value.correct, value.total)])
  );
}

function percent(correct: number, total: number) {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}
