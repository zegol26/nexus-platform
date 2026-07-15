import type { StoryArcEvidenceClassKey, StoryArcSkillKey } from "../constants";

export type MasteryEvidenceInput = {
  evidenceId: string;
  evidenceClass: StoryArcEvidenceClassKey;
  skill: StoryArcSkillKey;
  rubricRevisionId?: string | null;
  normalizedScore?: number | null;
};

export type MasteryEligibility =
  | { eligible: false; reason: "NON_MASTERY_EVIDENCE" | "MISSING_RUBRIC" | "MISSING_SCORE" }
  | { eligible: true; evidenceId: string; skill: StoryArcSkillKey; normalizedScore: number };

export function evaluateMasteryEligibility(input: MasteryEvidenceInput): MasteryEligibility {
  if (input.evidenceClass !== "ASSESSED_EVIDENCE" && input.evidenceClass !== "RECALL_EVIDENCE") {
    return { eligible: false, reason: "NON_MASTERY_EVIDENCE" };
  }
  if (!input.rubricRevisionId) return { eligible: false, reason: "MISSING_RUBRIC" };
  if (input.normalizedScore === null || input.normalizedScore === undefined) {
    return { eligible: false, reason: "MISSING_SCORE" };
  }
  return {
    eligible: true,
    evidenceId: input.evidenceId,
    skill: input.skill,
    normalizedScore: input.normalizedScore,
  };
}

export function storyXpCanChangeMastery(storyXpDelta: number) {
  void storyXpDelta;
  return false as const;
}
