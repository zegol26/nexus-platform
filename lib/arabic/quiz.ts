import { arabicCurriculum } from "./curriculum";
import type { ArabicLesson, ArabicQuizQuestion } from "./types";

export function getAllArabicQuizQuestions(): ArabicQuizQuestion[] {
  return arabicCurriculum.flatMap((lesson) => lesson.quiz);
}

export function getArabicQuizForLesson(lessonId: string): ArabicQuizQuestion[] {
  const lesson = arabicCurriculum.find((current) => current.id === lessonId);
  return lesson?.quiz ?? [];
}

export type ArabicQuizFilter = {
  level?: ArabicLesson["level"];
  targetSkill?: ArabicLesson["targetSkill"];
  questionType?: ArabicQuizQuestion["questionType"];
  difficulty?: ArabicQuizQuestion["difficulty"];
};

export function getArabicQuizQuestions(
  filter: ArabicQuizFilter = {}
): ArabicQuizQuestion[] {
  const filteredLessons = arabicCurriculum.filter((lesson) => {
    if (filter.level && lesson.level !== filter.level) return false;
    if (filter.targetSkill && lesson.targetSkill !== filter.targetSkill) {
      return false;
    }
    return true;
  });

  return filteredLessons.flatMap((lesson) =>
    lesson.quiz.filter((question) => {
      if (filter.questionType && question.questionType !== filter.questionType) {
        return false;
      }
      if (filter.difficulty && question.difficulty !== filter.difficulty) {
        return false;
      }
      return true;
    })
  );
}

export type ArabicQuizValidationIssue = {
  questionId: string;
  issue: string;
};

export function validateArabicQuizQuestion(
  question: ArabicQuizQuestion
): ArabicQuizValidationIssue[] {
  const issues: ArabicQuizValidationIssue[] = [];

  if (!question.promptId || question.promptId.trim().length < 8) {
    issues.push({
      questionId: question.id,
      issue: "Prompt is missing or too short to be meaningful.",
    });
  }

  if (!question.options || question.options.length < 4) {
    issues.push({
      questionId: question.id,
      issue: `Options must have at least 4 items (got ${question.options?.length ?? 0}).`,
    });
  }

  const uniqueOptions = new Set(question.options ?? []);
  if (question.options && uniqueOptions.size !== question.options.length) {
    issues.push({
      questionId: question.id,
      issue: "Duplicate options detected.",
    });
  }

  if (!question.correctAnswer) {
    issues.push({
      questionId: question.id,
      issue: "Correct answer is missing.",
    });
  } else if (!question.options?.includes(question.correctAnswer)) {
    issues.push({
      questionId: question.id,
      issue: "Correct answer is not present in options.",
    });
  }

  if (!question.explanationId || question.explanationId.trim().length < 8) {
    issues.push({
      questionId: question.id,
      issue: "Explanation is missing or too short.",
    });
  }

  const vaguePrompts = [
    "pilih jawaban yang tepat",
    "pilih yang benar",
    "choose the best answer",
  ];
  const lowerPrompt = question.promptId.toLowerCase();
  if (vaguePrompts.some((vague) => lowerPrompt === vague)) {
    issues.push({
      questionId: question.id,
      issue: "Prompt is too vague; needs an explicit question.",
    });
  }

  return issues;
}

export function validateAllArabicQuizQuestions(): ArabicQuizValidationIssue[] {
  return getAllArabicQuizQuestions().flatMap(validateArabicQuizQuestion);
}

export function shuffleArabicQuiz<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}
