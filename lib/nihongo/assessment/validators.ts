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
const genericReadingInstructions = [
  "baca teks, lalu pilih jawaban paling tepat",
  "baca teks pendek",
  "pilih jawaban paling tepat",
  "pilih jawaban yang benar",
  "jawaban paling tepat",
];
const nonParticleAnswers = new Set(["です", "ます", "でした", "ません", "ありません", "あります", "います", "ない"]);

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

  if (question.category === "particles" && nonParticleAnswers.has(question.correctAnswer)) {
    errors.push(`${question.id}: particle answer cannot be a copula, verb ending, noun, adjective, or verb.`);
  }

  if (question.category === "tense_forms" && !tenseForms.has(question.correctAnswer)) {
    errors.push(`${question.id}: tense question must have a conjugated form answer.`);
  }

  if (question.category === "listening" && question.type !== "audio_multiple_choice") {
    errors.push(`${question.id}: listening questions must use audio_multiple_choice.`);
  }

  if (question.category === "reading") {
    if (!question.passage) {
      errors.push(`${question.id}: reading questions must include passage metadata.`);
    }

    if (isGenericReadingInstruction(question.instructionIndonesian)) {
      errors.push(`${question.id}: reading instruction must ask a specific target.`);
    }

    if (!asksClearReadingTarget(question.instructionIndonesian)) {
      errors.push(`${question.id}: reading instruction must ask who/what/where/when/why/how or statement matching.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function isGenericReadingInstruction(value: string) {
  const normalized = value.trim().toLowerCase();
  return genericReadingInstructions.some((instruction) =>
    normalized.includes(instruction)
  );
}

export function asksClearReadingTarget(value: string) {
  return /本文の内容と合っているもの|本文によると|だれ|誰|何|どこ|いつ|なぜ|どうして|どうすれば|どれ|apa|siapa|di mana|dimana|kapan|mengapa|kenapa|bagaimana/i.test(
    value
  );
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
