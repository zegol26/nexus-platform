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
  const correctKey = correctAnswer.trim().toLocaleLowerCase();
  const unique = Array.from(
    new Map(options.map((option) => [option.trim().toLocaleLowerCase(), option.trim()])).values()
  ).filter(Boolean);

  if (!unique.some((option) => option.toLocaleLowerCase() === correctKey)) {
    unique.unshift(correctAnswer);
  }

  const shuffled = fisherYates(unique);
  return shuffled.slice(0, Math.max(4, options.length));
}

export function fisherYates<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}
