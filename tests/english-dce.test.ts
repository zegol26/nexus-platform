import assert from "node:assert/strict";
import {
  countModuleQuestions,
  dceCurriculum,
  getNextEnglishCourseItem,
} from "../lib/english/dce";
import { buildEnglishAnswerFeedback } from "../lib/english/dce/feedback";
import {
  getListeningTranscript,
  validateEnglishListeningData,
  validateEnglishQuestionData,
} from "../lib/english/dce/validation";

const questionResult = validateEnglishQuestionData();
const listeningResult = validateEnglishListeningData(process.cwd());

assert.equal(questionResult.errors.length, 0, questionResult.errors.map((issue) => issue.issue).join("\n"));
assert.equal(listeningResult.errors.length, 0, listeningResult.errors.map((issue) => issue.issue).join("\n"));

for (const level of dceCurriculum) {
  assert.equal(level.modules.length, 5, `${level.level} should have exactly 5 DCE modules`);
  for (const module of level.modules) {
    const totalQuestions =
      module.reading.reduce((sum, item) => sum + item.questions.length, 0) +
      module.listening.reduce((sum, item) => sum + item.questions.length, 0) +
      module.dialogue.reduce((sum, item) => sum + item.questions.length, 0) +
      module.vocabulary.length +
      module.grammar.length;
    const counts = countModuleQuestions(module);
    assert.equal(counts.reading, 25, `${module.slug} should have 25 reading questions`);
    assert.equal(counts.listening, 25, `${module.slug} should have 25 listening questions`);
    assert.equal(counts.vocabulary, 25, `${module.slug} should have 25 vocabulary questions`);
    assert.equal(counts.grammar, 25, `${module.slug} should have 25 grammar questions`);
    assert.equal(counts.dialogue, 25, `${module.slug} should have 25 dialogue questions`);
    assert.equal(totalQuestions, 125, `${module.slug} should have 125 total study questions`);

    for (const item of module.listening) {
      assert.ok(getListeningTranscript(item), `${item.id} should have a transcript`);
      assert.equal(item.speakers[0], "John", `${item.id} should use John as speaker A`);
      assert.ok(item.speakers[1], `${item.id} should include another person as speaker B`);
    }
  }
}

const feedback = buildEnglishAnswerFeedback({
  question: "He ____ to school.",
  userAnswer: "go",
  correctAnswer: "goes",
  explanation: "Because the subject is he, the verb needs -s.",
  level: "A1",
  skillType: "grammar",
});

assert.equal(feedback.isCorrect, false);
assert.equal(feedback.correctAnswer, "goes");
assert.ok(feedback.explanation);
assert.ok(feedback.learnerSummary);
assert.ok(feedback.studyTip);

const nextSection = getNextEnglishCourseItem("A1_A2", "introductions-daily-routines");
assert.equal(nextSection?.label, "Next Section");
assert.equal(nextSection?.module.slug, "navigating-the-city");

const nextCourse = getNextEnglishCourseItem("A1_A2", "time-and-schedules");
assert.equal(nextCourse?.label, "Next Course");
assert.equal(nextCourse?.level.level, "B1_B2");

console.log("English DCE regression checks passed");
