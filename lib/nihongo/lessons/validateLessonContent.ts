import type { LessonInput, NihongoLessonContent, NihongoLessonTemplateVariant } from "./lessonContentTypes";

const requiredSections: Array<keyof NihongoLessonContent> = [
  "lessonTitle",
  "level",
  "objective",
  "explanationIndonesian",
  "japaneseExamples",
  "grammarNotes",
  "commonMistakes",
  "miniPractice",
  "answerKey",
  "summary",
  "recommendedNextStep",
];

export function validateLessonTemplateContent(content: NihongoLessonContent) {
  const errors: string[] = [];

  for (const section of requiredSections) {
    if (!content[section]) errors.push(`Missing section: ${section}`);
  }

  if (!Array.isArray(content.japaneseExamples) || content.japaneseExamples.length < 3) {
    errors.push("Japanese examples must include at least 3 examples.");
  }

  if (!Array.isArray(content.grammarNotes) || content.grammarNotes.length < 2) {
    errors.push("Grammar notes must include at least 2 notes.");
  }

  if (!Array.isArray(content.commonMistakes) || content.commonMistakes.length < 2) {
    errors.push("Common mistakes must include at least 2 items.");
  }

  if (!Array.isArray(content.miniPractice) || content.miniPractice.length < 2) {
    errors.push("Mini practice must include at least 2 prompts.");
  }

  if (!Array.isArray(content.answerKey) || content.answerKey.length < 2) {
    errors.push("Answer key must include at least 2 answers.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateTemplateRequest(params: {
  lesson: LessonInput | null;
  variant: number;
  existingVariants: number[];
}) {
  const errors: string[] = [];

  if (!params.lesson?.id) errors.push("lessonId does not exist.");
  if (![1, 2, 3].includes(params.variant)) errors.push("variant must be 1, 2, or 3.");
  if (params.existingVariants.includes(params.variant)) {
    errors.push(`variant ${params.variant} already exists for this lesson.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function isTemplateVariant(value: number): value is NihongoLessonTemplateVariant {
  return value === 1 || value === 2 || value === 3;
}
