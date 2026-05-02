import type { NihongoAssessmentLevel } from "@/lib/nihongo/assessment/levelMapping";

export type BadgeAssignmentInput = {
  level: NihongoAssessmentLevel;
  weaknessTags: string[];
  score: number;
};

export function assignNihongoBadge(input: BadgeAssignmentInput): string {
  switch (input.level) {
    case "Absolute Beginner":
      return input.weaknessTags.includes("kana") ? "resilience-swordsman" : "hero-student";
    case "N5 Starter":
      return input.score <= 28 ? "resilience-swordsman" : "hero-student";
    case "N5 Foundation":
      return "determined-ninja";
    case "N5 Strong":
      return "rising-teammate";
    case "N4 Starter":
      return "adventure-captain";
    case "N4 Developing":
      return "limitless-sensei";
    case "N4 Candidate":
      return "mastery-fighter";
  }
}
