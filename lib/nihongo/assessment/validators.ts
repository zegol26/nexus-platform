import type { AssessmentQuestion } from "./questionBank";

const particles = new Set(["は", "が", "を", "に", "で", "へ", "の", "と", "も", "から", "まで", "から / まで"]);
const tenseForms = new Set([
  "見ました",
  "見ます",
  "見ません",
  "見ませんでした",
  "行きません",
  "行きました",
  "行きませんでした",
  "行きます",
  "たかくない",
  "たかかった",
  "たかくなかった",
  "たかいでした",
  "しずかでした",
  "しずかです",
  "しずかではありません",
  "しずかくないです",
]);

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validateAssessmentQuestion(question: AssessmentQuestion): ValidationResult {
  const errors: string[] = [];

  if (!question.id) errors.push("Question id is required.");
  if (!question.prompt) errors.push(`${question.id}: prompt is required.`);
  if (!question.correctAnswer) errors.push(`${question.id}: correctAnswer is required.`);
  if (!question.options.includes(question.correctAnswer)) {
    errors.push(`${question.id}: correctAnswer must exist in options.`);
  }

  const uniqueOptions = new Set(question.options);
  if (uniqueOptions.size !== question.options.length) {
    errors.push(`${question.id}: options must be unique.`);
  }

  if (question.category === "particles" && !particles.has(question.correctAnswer)) {
    errors.push(`${question.id}: particle question must have a particle answer.`);
  }

  if (question.category === "tense_forms" && !tenseForms.has(question.correctAnswer)) {
    errors.push(`${question.id}: tense question must have a conjugated form answer.`);
  }

  if (question.category === "listening" && question.type !== "audio_multiple_choice") {
    errors.push(`${question.id}: listening questions must use audio_multiple_choice.`);
  }

  if (question.category === "reading" && !question.passage) {
    errors.push(`${question.id}: reading questions must include passage metadata.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateAssessmentQuestionBank(questions: AssessmentQuestion[]): ValidationResult {
  const errors = questions.flatMap((question) => validateAssessmentQuestion(question).errors);
  const duplicateIds = questions
    .map((question) => question.id)
    .filter((id, index, ids) => ids.indexOf(id) !== index);

  if (duplicateIds.length > 0) {
    errors.push(`Duplicate question ids: ${Array.from(new Set(duplicateIds)).join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
