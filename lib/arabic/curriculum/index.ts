import type { ArabicLesson, ArabicLevelId } from "../types";
import { level1Lessons } from "./level1-foundation";
import { level2Lessons } from "./level2-daily";
import { level3Lessons } from "./level3-work";
import { level4Lessons } from "./level4-umrah";
import { level5Lessons } from "./level5-travel";
import { level6Lessons } from "./level6-dialect";

export const arabicCurriculum: ArabicLesson[] = [
  ...level1Lessons,
  ...level2Lessons,
  ...level3Lessons,
  ...level4Lessons,
  ...level5Lessons,
  ...level6Lessons,
];

export const arabicLevelOrder: ArabicLevelId[] = [
  "L1_FOUNDATION",
  "L2_DAILY",
  "L3_WORK",
  "L4_UMRAH",
  "L5_TRAVEL",
  "L6_DIALECT",
];

export const arabicLevelMeta: Record<
  ArabicLevelId,
  { title: string; subtitle: string }
> = {
  L1_FOUNDATION: {
    title: "Survival Arabic Foundation",
    subtitle: "Suara dasar, baca huruf, dan perkenalan diri",
  },
  L2_DAILY: {
    title: "Daily Life in Saudi",
    subtitle: "Rutinitas, makanan, belanja, transportasi",
  },
  L3_WORK: {
    title: "Work Arabic for Saudi",
    subtitle: "Perkenalan kerja, instruksi, masalah, keselamatan",
  },
  L4_UMRAH: {
    title: "Umrah Arabic",
    subtitle: "Bandara, hotel, masjid, darurat",
  },
  L5_TRAVEL: {
    title: "Travel & Social Conversation",
    subtitle: "Small talk dan problem solving traveler",
  },
  L6_DIALECT: {
    title: "Practical Saudi Dialect",
    subtitle: "Ungkapan Saudi paling sering dipakai",
  },
};

export function getArabicLesson(id: string): ArabicLesson | undefined {
  return arabicCurriculum.find((lesson) => lesson.id === id);
}

export function getArabicLessonsByLevel(level: ArabicLevelId): ArabicLesson[] {
  return arabicCurriculum.filter((lesson) => lesson.level === level);
}

export function getArabicLessonsByTargetSkill(
  skill: ArabicLesson["targetSkill"]
): ArabicLesson[] {
  return arabicCurriculum.filter((lesson) => lesson.targetSkill === skill);
}
