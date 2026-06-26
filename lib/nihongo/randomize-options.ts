export type OptionQuestion = {
  id: string;
  options: string[];
  correctAnswer: string;
};

export function randomizeQuestionOptions<T extends OptionQuestion>(question: T): T {
  return {
    ...question,
    options: shuffleWithCorrect(question.options, question.correctAnswer),
  };
}

export function shuffleWithCorrect(options: string[], correctAnswer: string) {
  const shuffled = fisherYates(normalizeOptions(options, correctAnswer));
  return shuffled.slice(0, Math.max(4, options.length));
}

export function placeCorrectAnswerAt(
  options: string[],
  correctAnswer: string,
  targetIndex: number
) {
  const normalized = normalizeOptions(options, correctAnswer);
  const wrongOptions = normalized.filter(
    (option) => option.trim().toLocaleLowerCase() !== correctAnswer.trim().toLocaleLowerCase()
  );
  const arranged = fisherYates(wrongOptions).slice(0, Math.max(3, normalized.length - 1));
  const boundedIndex = Math.max(0, Math.min(targetIndex, arranged.length));
  arranged.splice(boundedIndex, 0, correctAnswer);
  return arranged.slice(0, Math.max(4, options.length));
}

function normalizeOptions(options: string[], correctAnswer: string) {
  const correctKey = correctAnswer.trim().toLocaleLowerCase();
  const unique = Array.from(
    new Map(options.map((option) => [option.trim().toLocaleLowerCase(), option.trim()])).values()
  ).filter(Boolean);

  if (!unique.some((option) => option.toLocaleLowerCase() === correctKey)) {
    unique.unshift(correctAnswer);
  }

  return unique;
}

export function fisherYates<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}
