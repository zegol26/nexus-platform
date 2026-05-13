export type EnglishSkillType =
  | "vocabulary"
  | "grammar"
  | "listening"
  | "reading"
  | "conversation"
  | "sentence_completion";

export type EnglishAnswerFeedbackInput = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  level?: string;
  skillType: EnglishSkillType;
};

export type EnglishAnswerFeedback = {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  learnerSummary: string;
  studyTip: string;
};

const skillTips: Record<EnglishSkillType, string> = {
  vocabulary: "Say the full sentence aloud once with the correct word, then make one new sentence with the same word.",
  grammar: "Review the pattern, then write two short examples with a different subject.",
  listening: "Listen again and point to the exact line in the transcript that gives the answer.",
  reading: "Underline the words in the passage that support the answer before moving on.",
  conversation: "Practice the answer as a short real-life reply, not only as a quiz choice.",
  sentence_completion: "Read the full sentence after choosing. The words before and after the blank are your clues.",
};

function fallbackExplanation(question: string, correctAnswer: string) {
  return `The best answer is "${correctAnswer}" because it matches the meaning of the question: ${question}`;
}

export function buildEnglishAnswerFeedback({
  question,
  userAnswer,
  correctAnswer,
  explanation,
  level,
  skillType,
}: EnglishAnswerFeedbackInput): EnglishAnswerFeedback {
  const normalizedUserAnswer = userAnswer.trim();
  const normalizedCorrectAnswer = correctAnswer.trim();
  const isCorrect =
    normalizedUserAnswer.toLocaleLowerCase() === normalizedCorrectAnswer.toLocaleLowerCase();
  const levelPrefix = level ? `At ${level} level, ` : "";

  return {
    isCorrect,
    correctAnswer: normalizedCorrectAnswer,
    explanation: explanation?.trim() || fallbackExplanation(question, normalizedCorrectAnswer),
    learnerSummary: isCorrect
      ? `${levelPrefix}nice work. You understood what the question was asking and chose the supported answer.`
      : `${levelPrefix}good try. You understood part of the task, and this is a good moment to review the clue for "${normalizedCorrectAnswer}".`,
    studyTip: skillTips[skillType],
  };
}
