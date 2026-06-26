import { generatePreAssessmentQuestionBank } from "../lib/nihongo/assessment/questionBank";
import { conceptQuestions } from "../lib/nihongo/quiz/conceptQuestions";
import { randomizeQuestionOptions, shuffleWithCorrect } from "../lib/nihongo/randomize-options";

type Issue = {
  itemId: string;
  issue: string;
};

const issues: Issue[] = [];

function correctIndex(options: string[], correctAnswer: string) {
  return options.findIndex(
    (option) => option.trim().toLocaleLowerCase() === correctAnswer.trim().toLocaleLowerCase()
  );
}

function assertAnswerExists(itemId: string, options: string[], correctAnswer: string) {
  if (correctIndex(options, correctAnswer) < 0) {
    issues.push({ itemId, issue: "Correct answer is missing from options." });
  }
}

function collectDistribution(
  itemId: string,
  runs: number,
  getOptions: () => { options: string[]; correctAnswer: string }
) {
  const positions = new Set<number>();
  for (let index = 0; index < runs; index += 1) {
    const result = getOptions();
    const position = correctIndex(result.options, result.correctAnswer);
    if (position < 0) {
      issues.push({ itemId, issue: "Randomized options lost the correct answer." });
      return;
    }
    positions.add(position);
  }

  if (positions.size < 2) {
    issues.push({
      itemId,
      issue: "Correct answer did not move across option positions during randomization audit.",
    });
  }
}

const assessmentQuestions = generatePreAssessmentQuestionBank();
for (const question of assessmentQuestions) {
  assertAnswerExists(question.id, question.options, question.correctAnswer);
  collectDistribution(question.id, 20, () => {
    const randomized = randomizeQuestionOptions(question);
    return { options: randomized.options, correctAnswer: question.correctAnswer };
  });
}

for (const question of conceptQuestions) {
  assertAnswerExists(question.id, question.options, question.answer);
  collectDistribution(question.id, 20, () => ({
    options: shuffleWithCorrect(question.options, question.answer),
    correctAnswer: question.answer,
  }));
}

if (issues.length > 0) {
  console.error(`Failed: ${issues.length} Nihongo option issues found`);
  for (const issue of issues) {
    console.error(`- ${issue.itemId}: ${issue.issue}`);
  }
  process.exit(1);
}

console.log(
  `Passed: ${assessmentQuestions.length} pre-assessment questions and ${conceptQuestions.length} quiz questions checked`
);
