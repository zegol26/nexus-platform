import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { STORYARC_FOUNDATION_FIXTURE } from "../lib/storyarc/content/foundation-fixture";
import { validateStoryArcContentPackage } from "../lib/storyarc/content/schema";
import { canTransitionStoryArcContent, isStudentVisibleStoryArcState } from "../lib/storyarc/content/lifecycle";
import { applyStoryArcCommandOnce, applyStoryArcPlayerAction, createInitialStoryArcPlayerState } from "../lib/storyarc/game/state";
import { applyStoryArcEpisodeCommand, parseStoryArcEpisodePayload } from "../lib/storyarc/game/episode-progress";
import { resolveStoryArcEpisodeIndex } from "../lib/storyarc/game/story-sequence";
import { composeStoryArcQuestionAudio, extractStoryArcListeningOptions, normalizeStoryArcExam } from "../lib/storyarc/exam/exam-runtime";
import { calculateStoryArcAssignmentScore, getStoryArcAssignmentAvailability, storyArcContentHref } from "../lib/storyarc/classroom/policy";
import { evaluateMasteryEligibility, storyXpCanChangeMastery } from "../lib/storyarc/learning/mastery-policy";
import { parseStoryArcDialogueTranscript } from "../lib/storyarc/learning/lesson-runtime";
import { resolveStoryArcLibraryByteRange, sanitizeStoryArcLibraryFileName, STORYARC_LIBRARY_MAX_FILE_BYTES, validateStoryArcLibraryFile } from "../lib/storyarc/library/policy";
import {
  buildStoryArcBlobPathname,
  canFinalizeStoryArcLibraryIntent,
  hasStoryArcPdfSignature,
  isPrivateVercelBlobUrl,
  isStoryArcUploadIntentExpired,
  validateStoryArcBlobUploadDeclaration,
} from "../lib/storyarc/library/blob-policy";
import { resolveStoryArcLanguageContext, STORYARC_JOHN_CONTEXT } from "../lib/storyarc/language/context";
import { isValidAppAccess } from "../lib/platform/access";
import { platformApps } from "../lib/platform/app-registry";
import { storyArcJohnDayWindow } from "../lib/storyarc/john/quota-policy";

const tests: Array<{ name: string; run: () => void }> = [];
const test = (name: string, run: () => void) => tests.push({ name, run });
const cloneFixture = () => JSON.parse(JSON.stringify(STORYARC_FOUNDATION_FIXTURE));

test("StoryArc is a distinct registered Nexus app", () => {
  const app = platformApps.find((candidate) => candidate.slug === "storyarc");
  assert.equal(app?.href, "/apps/storyarc");
  assert.notEqual(app?.slug, "english");
  assert.notEqual(app?.slug, "nihongo");
});

test("StoryArc entitlement uses active, unexpired platform app access", () => {
  const now = new Date("2026-07-14T00:00:00.000Z");
  assert.equal(isValidAppAccess(null, now), false);
  assert.equal(isValidAppAccess({ status: "INACTIVE", accessExpiresAt: null }, now), false);
  assert.equal(isValidAppAccess({ status: "ACTIVE", accessExpiresAt: "2026-07-13T23:59:59.000Z" }, now), false);
  assert.equal(isValidAppAccess({ status: "ACTIVE", accessExpiresAt: "2026-07-14T00:00:01.000Z" }, now), true);
});

test("learner story sequence blocks future jumps and permits previous review", () => {
  const episodeIds = ["ep-1", "ep-2", "ep-3", "ep-4"];
  const completedIds = new Set(["ep-1"]);
  assert.equal(resolveStoryArcEpisodeIndex({ episodeIds, completedIds }).selectedIndex, 1);
  assert.equal(resolveStoryArcEpisodeIndex({ episodeIds, completedIds, requestedId: "ep-4" }).selectedIndex, 1);
  assert.equal(resolveStoryArcEpisodeIndex({ episodeIds, completedIds, requestedId: "ep-1" }).selectedIndex, 0);
});

test("lesson dialogue transcripts preserve alternating A and B turns", () => {
  const turns = parseStoryArcDialogueTranscript("A: Are you ready? B: Yes, I am. A: Let's begin.");
  assert.deepEqual(turns, [
    { speaker: "A", text: "Are you ready?" },
    { speaker: "B", text: "Yes, I am." },
    { speaker: "A", text: "Let's begin." },
  ]);
});

test("published Exam Lab blocks normalize into runnable sections", () => {
  const exam = normalizeStoryArcExam({ lessonBlocks: [
    { blockType: "exam-meta", modeId: "SCHOOL_EXAM", instructionId: "Answer all questions.", timeSuggestionMinutes: 20 },
    { blockType: "exam-section", sectionId: "reading", skill: "READING", textEn: "A short text.", questions: [{ qid: "q1", promptEn: "What is it?", optionsEn: ["A", "B"], answerIndex: 1, explanationId: "The text supports B." }] },
    { blockType: "john-interview", johnContent: { learningContextId: "Interview practice." }, prompts: [{ promptId: "p1", promptEn: "Tell me about yourself." }] },
  ] }, { id: "exam-1", title: "Exam", grade: "Grade 10" });
  assert.equal(exam.mode, "SCHOOL_EXAM");
  assert.equal(exam.sections.length, 2);
  assert.equal(exam.sections[0].questions[0].answerIndex, 1);
  assert.equal(exam.sections[1].skill, "SPEAKING");
});

test("TOEIC listening options are extracted from the spoken transcript", () => {
  const transcript = '(A) She is checking a safety list. (B) She is opening a window. (C) She is serving lunch. (D) She is writing on a board.';
  assert.deepEqual(extractStoryArcListeningOptions(transcript), [
    "She is checking a safety list.",
    "She is opening a window.",
    "She is serving lunch.",
    "She is writing on a board.",
  ]);

  const exam = normalizeStoryArcExam({ lessonBlocks: [{
    blockType: "exam-section",
    sectionId: "listening",
    skill: "LISTENING",
    questions: [{ qid: "q1", optionsEn: ["A", "B", "C", "D"], transcriptEn: transcript, answerIndex: 0 }],
  }] }, { id: "toeic-1", title: "TOEIC Listening", grade: "Grade 12" });
  assert.equal(exam.sections[0].questions[0].options[0], "She is checking a safety list.");
  assert.equal(
    exam.sections[0].questions[0].audioText,
    `Listen and choose the best answer. ${transcript}`
  );
});

test("TOEIC question-response audio does not duplicate its spoken stem", () => {
  const transcript = 'Q: "When will the workshop begin?" (A) At nine o’clock. (B) In the library. (C) With my teacher.';
  assert.equal(
    composeStoryArcQuestionAudio("Choose the response that best answers the question.", transcript),
    transcript
  );
  const exam = normalizeStoryArcExam({ lessonBlocks: [{
    blockType: "exam-section",
    sectionId: "question-response",
    skill: "LISTENING",
    questions: [{ qid: "qr1", promptEn: "Choose the response that best answers the question.", transcriptEn: transcript, optionsEn: ["At nine o’clock.", "In the library.", "With my teacher."], answerIndex: 0 }],
  }] }, { id: "toeic-qr", title: "TOEIC Question-Response", grade: "Grade 12" });
  const question = exam.sections[0].questions[0];
  assert.equal(question.prompt, "Select the best response to the spoken question.");
  assert.equal(question.answerDisplay, "letters");
  assert.equal(question.audioLabel, "Play question and responses");
  assert.equal(question.audioText, transcript);
});

test("published Grade 12 TOEIC Part 1 uses a photograph and spoken descriptions only", () => {
  const packagePath = "prisma/data/storyarc/batch-9-grade12-exam-lab.json";
  const contentPackage = JSON.parse(readFileSync(packagePath, "utf8"));
  const item = contentPackage.items.find((candidate: { stableId?: string }) => candidate.stableId === "ex-g12-02");
  assert.ok(item);
  const exam = normalizeStoryArcExam(
    { lessonBlocks: item.content.lessonBlocks },
    { id: item.stableId, title: item.title, grade: "Grade 12" }
  );
  const firstQuestion = exam.sections[0]?.questions[0];
  const audioText = firstQuestion?.audioText;
  if (!firstQuestion || !audioText) assert.fail("Expected a composed listening script.");
  assert.equal(firstQuestion.prompt, "Select the sentence that best describes the photograph.");
  assert.equal(firstQuestion.answerDisplay, "letters");
  assert.equal(firstQuestion.audioLabel, "Play descriptions");
  assert.match(firstQuestion.photo?.src ?? "", /^\/storyarc\/exam\/toeic-part-1\/.+\.png$/);
  assert.ok(audioText.startsWith("(A)"));
  assert.doesNotMatch(audioText, /image brief/i);
  assert.match(audioText, /\(A\)[\s\S]*\(B\)[\s\S]*\(C\)[\s\S]*\(D\)/);
});

test("every authored TOEIC photo description resolves to an original runtime asset", () => {
  for (const packagePath of [
    "prisma/data/storyarc/batch-3-grade10-exam-lab.json",
    "prisma/data/storyarc/batch-9-grade12-exam-lab.json",
  ]) {
    const contentPackage = JSON.parse(readFileSync(packagePath, "utf8"));
    const listeningItem = contentPackage.items.find((candidate: { stableId?: string }) => candidate.stableId === (packagePath.includes("grade10") ? "ex-g10-03" : "ex-g12-02"));
    const exam = normalizeStoryArcExam(
      { lessonBlocks: listeningItem.content.lessonBlocks },
      { id: listeningItem.stableId, title: listeningItem.title, grade: packagePath.includes("grade10") ? "Grade 10" : "Grade 12" }
    );
    const photoQuestions = exam.sections.flatMap((section) => section.questions).filter((question) => question.photo);
    assert.equal(photoQuestions.length, 6);
    assert.ok(photoQuestions.every((question) => question.photo?.src));
    assert.ok(photoQuestions.every((question) => !/image brief/i.test(question.prompt)));
  }
});

test("StoryArc John daily quota resets at midnight WIB", () => {
  const window = storyArcJohnDayWindow(new Date("2026-07-15T16:59:59.000Z"));
  assert.equal(window.periodStart.toISOString(), "2026-07-14T17:00:00.000Z");
  assert.equal(window.periodEnd.toISOString(), "2026-07-15T17:00:00.000Z");
});

test("classroom drip policy locks future work and opens released work", () => {
  const now = new Date("2026-07-15T12:00:00.000Z");
  assert.equal(getStoryArcAssignmentAvailability(new Date("2026-07-15T13:00:00.000Z"), null, now), "LOCKED");
  assert.equal(getStoryArcAssignmentAvailability(new Date("2026-07-15T11:00:00.000Z"), null, now), "OPEN");
  assert.equal(getStoryArcAssignmentAvailability(new Date("2026-07-15T10:00:00.000Z"), new Date("2026-07-15T11:00:00.000Z"), now), "OVERDUE");
});

test("classroom assignments deep-link into existing published runtimes", () => {
  assert.equal(storyArcContentHref("SCHOOL_CORE", "core-1", "task-1"), "/apps/storyarc/learn/core-1?assignment=task-1");
  assert.equal(storyArcContentHref("STORY_MODE", "story-1", "task-2"), "/apps/storyarc/story?episode=story-1&assignment=task-2");
  assert.equal(storyArcContentHref("EXAM_LAB", "exam-1", "task-3"), "/apps/storyarc/exam-lab/exam-1?assignment=task-3");
});

test("classroom score policy computes percentages and rejects manufactured scores", () => {
  assert.deepEqual(calculateStoryArcAssignmentScore(17, 20), { score: 17, maxScore: 20, scorePercent: 85 });
  assert.equal(calculateStoryArcAssignmentScore(-1, 20), null);
  assert.equal(calculateStoryArcAssignmentScore(21, 20), null);
  assert.equal(calculateStoryArcAssignmentScore(0, 0), null);
});

test("digital library accepts real document signatures and rejects disguised files", () => {
  assert.equal(validateStoryArcLibraryFile({ name: "module.pdf", size: 1200, mimeType: "application/pdf", head: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]) }).valid, true);
  assert.equal(validateStoryArcLibraryFile({ name: "worksheet.docx", size: 1200, mimeType: "application/octet-stream", head: new Uint8Array([0x50, 0x4b, 0x03, 0x04]) }).valid, true);
  assert.equal(validateStoryArcLibraryFile({ name: "fake.pdf", size: 1200, mimeType: "application/pdf", head: new Uint8Array([0x4d, 0x5a]) }).valid, false);
  assert.equal(validateStoryArcLibraryFile({ name: "large.pdf", size: 50 * 1024 * 1024, mimeType: "application/pdf", head: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]) }).valid, true);
  assert.equal(validateStoryArcLibraryFile({ name: "too-large.pdf", size: 50 * 1024 * 1024 + 1, mimeType: "application/pdf", head: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]) }).valid, false);
  assert.equal(STORYARC_LIBRARY_MAX_FILE_BYTES, 50 * 1024 * 1024);
  assert.equal(sanitizeStoryArcLibraryFileName("../../Class: Notes?.pdf"), "..-..-Class- Notes-.pdf");
});

test("digital library byte ranges support private PDF readers", () => {
  assert.deepEqual(resolveStoryArcLibraryByteRange("bytes=0-999", 5000), { start: 0, end: 999 });
  assert.deepEqual(resolveStoryArcLibraryByteRange("bytes=4000-", 5000), { start: 4000, end: 4999 });
  assert.deepEqual(resolveStoryArcLibraryByteRange("bytes=-500", 5000), { start: 4500, end: 4999 });
  assert.equal(resolveStoryArcLibraryByteRange("bytes=5000-6000", 5000), false);
});

test("private Blob upload declarations enforce PDF-only and the 50 MB boundary", () => {
  const valid = {
    classId: "class_10a",
    subject: "English",
    title: "Week 3 reading",
    summary: "A guided reading document for the class.",
    fileName: "reading.pdf",
    fileSize: 50 * 1024 * 1024,
    mimeType: "application/pdf",
  };
  assert.equal(validateStoryArcBlobUploadDeclaration(valid).valid, true);
  assert.equal(validateStoryArcBlobUploadDeclaration({ ...valid, fileSize: 50 * 1024 * 1024 + 1 }).valid, false);
  assert.equal(validateStoryArcBlobUploadDeclaration({ ...valid, fileName: "reading.docx" }).valid, false);
  assert.equal(validateStoryArcBlobUploadDeclaration({ ...valid, mimeType: "application/octet-stream" }).valid, false);
});

test("private Blob pathname is constructed only from validated server identifiers", () => {
  assert.equal(
    buildStoryArcBlobPathname("class_10a", "document-123", "../../Class: Notes?.pdf"),
    "storyarc/classes/class_10a/documents/document-123/source/..-..-Class- Notes-.pdf"
  );
  assert.throws(() => buildStoryArcBlobPathname("../../other-class", "document-123", "notes.pdf"));
  assert.throws(() => buildStoryArcBlobPathname("class_10a", "../document", "notes.pdf"));
});

test("private Blob intent expiry and completion actor rules are deterministic", () => {
  const now = new Date("2026-07-16T00:00:00.000Z");
  assert.equal(isStoryArcUploadIntentExpired(new Date("2026-07-15T23:59:59.000Z"), now), true);
  assert.equal(isStoryArcUploadIntentExpired(new Date("2026-07-16T00:00:01.000Z"), now), false);
  assert.equal(canFinalizeStoryArcLibraryIntent({ actorId: "teacher-1", actorRole: "TEACHER", uploaderId: "teacher-1" }), true);
  assert.equal(canFinalizeStoryArcLibraryIntent({ actorId: "teacher-2", actorRole: "TEACHER", uploaderId: "teacher-1" }), false);
  assert.equal(canFinalizeStoryArcLibraryIntent({ actorId: "admin-1", actorRole: "ADMIN", uploaderId: "teacher-1" }), true);
  assert.equal(canFinalizeStoryArcLibraryIntent({ actorId: "super-1", actorRole: "SUPER_ADMIN", uploaderId: "teacher-1" }), true);
});

test("private Blob completion policy recognizes PDF signatures and private object URLs", () => {
  assert.equal(hasStoryArcPdfSignature(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])), true);
  assert.equal(hasStoryArcPdfSignature(new Uint8Array([0x4d, 0x5a, 0x90])), false);
  assert.equal(isPrivateVercelBlobUrl("https://store.private.blob.vercel-storage.com/storyarc/book.pdf"), true);
  assert.equal(isPrivateVercelBlobUrl("https://store.public.blob.vercel-storage.com/storyarc/book.pdf"), false);
});

test("the Phase A content package and cross references validate", () => {
  const report = validateStoryArcContentPackage(STORYARC_FOUNDATION_FIXTURE);
  assert.equal(report.valid, true);
  assert.equal(report.totals.items, 1);
  assert.equal(report.warnings[0]?.code, "CURRICULUM_SOURCE_GAP");
});

test("invalid grades, tracks, phases, duplicates, and references are rejected", () => {
  const invalidGrade = cloneFixture();
  invalidGrade.items[0].grade = "GRADE_9";
  assert.equal(validateStoryArcContentPackage(invalidGrade).valid, false);

  const invalidTrack = cloneFixture();
  invalidTrack.items[0].track = "GAME_ONLY";
  assert.equal(validateStoryArcContentPackage(invalidTrack).valid, false);

  const invalidPhase = cloneFixture();
  invalidPhase.items[0].phase = "PHASE_F";
  assert.equal(validateStoryArcContentPackage(invalidPhase).errors.some((issue) => issue.code === "INVALID_PHASE"), true);

  const duplicate = cloneFixture();
  duplicate.items.push(cloneFixture().items[0]);
  assert.equal(validateStoryArcContentPackage(duplicate).errors.some((issue) => issue.code === "DUPLICATE_CONTENT_ID"), true);

  const invalidReference = cloneFixture();
  invalidReference.items[0].content.scene.dialogueNodes[0].choices[0].nextNodeId = "missing-node";
  assert.equal(validateStoryArcContentPackage(invalidReference).errors.some((issue) => issue.code === "INVALID_DIALOGUE_REFERENCE"), true);
});

test("only published canonical content is student visible", () => {
  assert.equal(isStudentVisibleStoryArcState("DRAFT"), false);
  assert.equal(isStudentVisibleStoryArcState("APPROVED"), false);
  assert.equal(isStudentVisibleStoryArcState("PUBLISHED"), true);
  assert.equal(canTransitionStoryArcContent("DRAFT", "VALIDATING"), true);
  assert.equal(canTransitionStoryArcContent("DRAFT", "PUBLISHED"), false);
});

test("player actions persist quest, relationship, expression unlock, and resume state", () => {
  const initial = createInitialStoryArcPlayerState(new Date("2026-07-14T00:00:00.000Z"));
  const choice = applyStoryArcPlayerAction(initial, "choose-natural-introduction", new Date("2026-07-14T00:01:00.000Z"));
  assert.equal(choice.state.relationshipState.hana, 2);
  assert.equal(choice.state.questState.newSemester.status, "INTRODUCED");
  assert.equal(choice.unlocks[0]?.entryKey, "exp-getting-used-to-it");
  assert.equal(choice.unlocks[0]?.futureRecallKey, "recall-getting-used-to-it");

  const entered = applyStoryArcPlayerAction(choice.state, "enter-school", new Date("2026-07-14T00:02:00.000Z"));
  assert.equal(entered.state.currentSceneId, "scene-courtyard-preview");
  assert.equal(entered.state.questState.newSemester.status, "COMPLETE");
  assert.equal(entered.state.storyXp, 35);
});

test("duplicate save keys do not duplicate rewards", () => {
  const initial = createInitialStoryArcPlayerState();
  const once = applyStoryArcCommandOnce(initial, "choose-natural-introduction", "save-key-123", new Set());
  assert.equal(once.duplicate, false);
  const duplicate = applyStoryArcCommandOnce(once.state, "choose-natural-introduction", "save-key-123", new Set(["save-key-123"]));
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.state.storyXp, once.state.storyXp);
});

test("semantic action replay with a fresh key cannot grind Story XP", () => {
  const initial = createInitialStoryArcPlayerState();
  const choice = applyStoryArcPlayerAction(initial, "choose-natural-introduction");
  const entered = applyStoryArcPlayerAction(choice.state, "enter-school");
  assert.equal(entered.state.storyXp, 35);
  assert.throws(
    () => applyStoryArcCommandOnce(entered.state, "enter-school", "fresh-save-key", new Set()),
    /already been completed/,
  );
});

test("published episode choices advance generic story progress without reward replay", () => {
  const payload = parseStoryArcEpisodePayload(STORYARC_FOUNDATION_FIXTURE.items[0].content);
  const initial = createInitialStoryArcPlayerState();
  const choice = applyStoryArcEpisodeCommand({
    snapshot: initial,
    stableId: "sm-g10-01",
    payload,
    command: { type: "choice", nodeId: "hana-welcome", choiceId: "intro-natural" },
  });
  assert.equal(choice.duplicate, false);
  assert.equal(choice.progress.currentNodeId, "hana-reaction-natural");
  assert.equal(choice.progress.completed, true);
  assert.equal(choice.snapshot.currentEpisodeId, "sm-g10-01");
  assert.equal(choice.snapshot.storyXp, 8);
  const replayedChoice = applyStoryArcEpisodeCommand({
    snapshot: choice.snapshot,
    stableId: "sm-g10-01",
    payload,
    command: { type: "choice", nodeId: "hana-welcome", choiceId: "intro-natural" },
  });
  assert.equal(replayedChoice.progress.completed, true);
  assert.equal(replayedChoice.snapshot.storyXp, choice.snapshot.storyXp);

  const hotspot = applyStoryArcEpisodeCommand({
    snapshot: choice.snapshot,
    stableId: "sm-g10-01",
    payload,
    command: { type: "hotspot", hotspotId: "hotspot-school-gate" },
  });
  assert.equal(hotspot.progress.inspectedHotspotIds.includes("hotspot-school-gate"), true);
  assert.equal(hotspot.snapshot.storyXp, 10);
});

test("episode replay synchronizes the checkpoint and does not grind rewards", () => {
  const payload = parseStoryArcEpisodePayload(STORYARC_FOUNDATION_FIXTURE.items[0].content);
  const initial = createInitialStoryArcPlayerState();
  const completed = applyStoryArcEpisodeCommand({
    snapshot: initial,
    stableId: "sm-g10-01",
    payload,
    command: { type: "choice", nodeId: "hana-welcome", choiceId: "intro-natural" },
  });
  const replayed = applyStoryArcEpisodeCommand({
    snapshot: completed.snapshot,
    stableId: "sm-g10-01",
    payload,
    command: { type: "replay" },
  });
  assert.equal(replayed.progress.currentNodeId, payload.scene.entryNodeId);
  assert.equal(replayed.progress.completed, false);
  assert.equal(replayed.snapshot.storyXp, completed.snapshot.storyXp);
  assert.equal(replayed.progress.completedChoiceIds.includes("intro-natural"), true);

  const replayChoice = applyStoryArcEpisodeCommand({
    snapshot: replayed.snapshot,
    stableId: "sm-g10-01",
    payload,
    command: { type: "choice", nodeId: "hana-welcome", choiceId: "intro-natural" },
  });
  assert.equal(replayChoice.progress.completed, true);
  assert.equal(replayChoice.snapshot.storyXp, completed.snapshot.storyXp);
  assert.deepEqual(replayChoice.snapshot.relationshipState, completed.snapshot.relationshipState);
});

test("hotspots cannot be invoked before their dialogue prerequisite", () => {
  const initial = createInitialStoryArcPlayerState();
  assert.throws(() => applyStoryArcPlayerAction(initial, "inspect-school-sign"), /Meet Hana/);
  assert.throws(() => applyStoryArcPlayerAction(initial, "enter-school"), /Meet Hana/);
});

test("terminal dialogue continuation persists completion before hotspots", () => {
  const snapshot = createInitialStoryArcPlayerState();
  const payload = {
    scene: {
      sceneId: "scene-continue",
      locationId: "loc-gate",
      entryNodeId: "lead-in",
      dialogueNodes: [
        { id: "lead-in", speakerId: "narrator", text: "Walk in.", expressionState: "neutral" as const, nextNodeId: "terminal", terminal: false, choices: [] },
        { id: "terminal", speakerId: "narrator", text: "Inside.", expressionState: "warm" as const, terminal: true, choices: [] },
      ],
      hotspots: [{ id: "door", label: "Inspect door", actionType: "inspect-door" }],
    },
  };
  const completed = applyStoryArcEpisodeCommand({
    snapshot,
    stableId: "episode-continue",
    payload,
    command: { type: "continue", nodeId: "lead-in", nextNodeId: "terminal" },
  });
  assert.equal(completed.progress.completed, true);
  assert.equal(completed.progress.currentNodeId, "terminal");
  const hotspot = applyStoryArcEpisodeCommand({
    snapshot: completed.snapshot,
    stableId: "episode-continue",
    payload,
    command: { type: "hotspot", hotspotId: "door" },
  });
  assert.equal(hotspot.progress.inspectedHotspotIds.includes("door"), true);
});

test("Story XP and formative evidence cannot modify English mastery", () => {
  assert.equal(storyXpCanChangeMastery(99999), false);
  assert.deepEqual(evaluateMasteryEligibility({ evidenceId: "ev-exposure", evidenceClass: "EXPOSURE", skill: "SPEAKING" }), { eligible: false, reason: "NON_MASTERY_EVIDENCE" });
  assert.deepEqual(evaluateMasteryEligibility({ evidenceId: "ev-practice", evidenceClass: "PRACTICE", skill: "SPEAKING" }), { eligible: false, reason: "NON_MASTERY_EVIDENCE" });
  assert.deepEqual(evaluateMasteryEligibility({ evidenceId: "ev-assessed", evidenceClass: "ASSESSED_EVIDENCE", skill: "SPEAKING", normalizedScore: 80 }), { eligible: false, reason: "MISSING_RUBRIC" });
  assert.deepEqual(evaluateMasteryEligibility({ evidenceId: "ev-assessed", evidenceClass: "ASSESSED_EVIDENCE", skill: "SPEAKING", rubricRevisionId: "rubric-v1", normalizedScore: 80 }), { eligible: true, evidenceId: "ev-assessed", skill: "SPEAKING", normalizedScore: 80 });
});

test("StoryArc language context is explicit and never falls back", () => {
  assert.equal(STORYARC_JOHN_CONTEXT.instructionLanguage, "id");
  assert.equal(STORYARC_JOHN_CONTEXT.targetLanguage, "en");
  assert.equal(STORYARC_JOHN_CONTEXT.speechRecognitionLanguage, "en");
  assert.equal(STORYARC_JOHN_CONTEXT.expectedResponseLanguage, "en");
  assert.equal(STORYARC_JOHN_CONTEXT.fallbackExplanationLanguage, "id");
  assert.equal(resolveStoryArcLanguageContext("storyarc-john"), STORYARC_JOHN_CONTEXT);
  assert.equal(resolveStoryArcLanguageContext("nihongo-aichan"), null);
  assert.equal(resolveStoryArcLanguageContext("unknown"), null);
});

test("Phaser remains behind a client-only dynamic import boundary", () => {
  const loader = readFileSync("components/apps/storyarc/game/StoryArcGameLoader.tsx", "utf8");
  const host = readFileSync("components/apps/storyarc/game/StoryArcPhaserHost.tsx", "utf8");
  const runtime = readFileSync("lib/storyarc/game/create-school-gate-game.ts", "utf8");
  assert.match(loader, /ssr:\s*false/);
  assert.match(host, /await import\("@\/lib\/storyarc\/game\/create-school-gate-game"\)/);
  assert.match(runtime, /"Digit1", "Digit2", "Digit3"/);
  assert.match(runtime, /event\.code === "KeyS"/);
  assert.match(runtime, /event\.code === "Enter"/);
});

test("Story Mode keeps the Campus Arcade reference console structure", () => {
  const player = readFileSync("components/apps/storyarc/game/StoryArcEpisodePlayer.tsx", "utf8");
  const shell = readFileSync("components/apps/storyarc/StoryArcShell.tsx", "utf8");
  const styles = readFileSync("app/apps/storyarc/storyarc.css", "utf8");
  assert.match(player, /storyarc-reference-console/);
  assert.match(player, /storyarc-episode-track/);
  assert.match(player, /storyarc-reference-choices/);
  assert.match(player, /storyarc-vocabulary-panel/);
  assert.match(player, /storyarc-expression-panel/);
  assert.match(player, /hana-arcade-warm-v3\.png/);
  assert.match(player, /ryo-arcade-warm-v3\.png/);
  assert.match(player, /data-character=/);
  assert.match(shell, /aria-current/);
  assert.match(shell, /Digital Library/);
  assert.match(styles, /grid-template-columns:\s*minmax\(0,1fr\)\s+minmax\(330px,380px\)/);
  assert.match(styles, /data-character="char-ryo"/);
  assert.match(styles, /data-character="char-ryo"\][^}]*width:\s*62%/);
  assert.match(styles, /data-character="char-ryo"\] img[^}]*object-fit:\s*contain/);
});

test("StoryArc portrait provenance declares fictional synthetic identities", () => {
  const manifest = JSON.parse(readFileSync("public/storyarc/asset-manifest.json", "utf8"));
  const assetPolicy = readFileSync("docs/storyarc/STORYARC_ASSET_POLICY.md", "utf8");
  assert.equal(manifest.generator, "OpenAI built-in image generation");
  assert.equal(manifest.fictionalCharacters, true);
  assert.equal(manifest.realPersonIdentityReferenceUsed, false);
  assert.match(assetPolicy, /synthetic fictional characters/i);
  assert.match(assetPolicy, /No real-person identity or face reference/i);
});

test("StoryArc Digital Library repeats role and class guards at every server boundary", () => {
  const uploadRoute = readFileSync("app/api/apps/storyarc/library/route.ts", "utf8");
  const completionRoute = readFileSync("app/api/apps/storyarc/library/upload-complete/route.ts", "utf8");
  const documentRoute = readFileSync("app/api/apps/storyarc/library/[documentId]/route.ts", "utf8");
  const downloadRoute = readFileSync("app/api/apps/storyarc/library/[documentId]/download/route.ts", "utf8");
  const libraryPage = readFileSync("app/apps/storyarc/library/page.tsx", "utf8");
  const readerPage = readFileSync("app/apps/storyarc/library/[documentId]/page.tsx", "utf8");
  const readerClient = readFileSync("components/apps/storyarc/library/StoryArcPdfReader.tsx", "utf8");
  const libraryAccess = readFileSync("lib/storyarc/library/access.ts", "utf8");
  assert.match(uploadRoute, /getStoryArcSessionUser/);
  assert.match(uploadRoute, /status:\s*401/);
  assert.match(uploadRoute, /isStoryArcTeacherRole/);
  assert.match(uploadRoute, /canManageStoryArcClass/);
  assert.match(uploadRoute, /buildStoryArcBlobPathname/);
  assert.doesNotMatch(uploadRoute, /request\.formData|file\.arrayBuffer/);
  assert.match(completionRoute, /getStoryArcSessionUser/);
  assert.match(completionRoute, /canManageStoryArcClass/);
  assert.match(completionRoute, /completedPathname\s*!==\s*intent\.expectedPathname/);
  assert.match(completionRoute, /intent\.status\s*===\s*"FINALIZED"/);
  assert.match(completionRoute, /fileData:\s*null/);
  assert.match(completionRoute, /storageProvider:\s*"VERCEL_BLOB"/);
  assert.match(documentRoute, /canReadStoryArcLibraryClass/);
  assert.match(documentRoute, /canManageStoryArcClass/);
  assert.match(documentRoute, /Content-Range/);
  assert.match(documentRoute, /document\.storageProvider\s*===\s*"VERCEL_BLOB"/);
  assert.match(documentRoute, /deleteStoryArcPrivateBlob/);
  assert.match(downloadRoute, /getStoryArcSessionUser/);
  assert.match(downloadRoute, /canReadStoryArcLibraryClass/);
  assert.match(downloadRoute, /createStoryArcPrivateBlobDownloadUrl/);
  assert.match(readerPage, /canReadStoryArcLibraryClass/);
  assert.match(readerClient, /#page=\$\{page\}/);
  assert.match(readerClient, /Refresh secure link/);
  assert.match(libraryAccess, /getStoryArcLearnerGradeScope/);
  assert.match(libraryPage, /learnerId:\s*user\.id/);
  assert.match(libraryPage, /classroom:\s*\{\s*grade:\s*learnerGrade/);
  assert.doesNotMatch(libraryPage, /fileData:\s*true/);
});

test("StoryArc routes retain server-side access and published-content guards", () => {
  const protectedLayout = readFileSync("app/apps/storyarc/layout.tsx", "utf8");
  const bootstrapRoute = readFileSync("app/api/apps/storyarc/bootstrap/route.ts", "utf8");
  const contentRoute = readFileSync("app/api/apps/storyarc/content/[contentId]/route.ts", "utf8");
  const stateRoute = readFileSync("app/api/apps/storyarc/state/route.ts", "utf8");
  const episodeRoute = readFileSync("app/api/apps/storyarc/episodes/[contentId]/route.ts", "utf8");

  assert.match(protectedLayout, /getStoryArcSessionUser/);
  assert.match(bootstrapRoute, /getStoryArcSessionUser/);
  assert.match(contentRoute, /getStoryArcSessionUser/);
  assert.match(stateRoute, /getStoryArcSessionUser/);
  assert.match(episodeRoute, /getStoryArcSessionUser/);
  assert.match(bootstrapRoute, /state:\s*"PUBLISHED"/);
  assert.match(contentRoute, /state:\s*"PUBLISHED"/);
  assert.match(stateRoute, /state:\s*"PUBLISHED"/);
  assert.match(episodeRoute, /state:\s*"PUBLISHED"/);
  assert.match(stateRoute, /STORYARC_DEMO_STABLE_ID/);
});

let failed = 0;
for (const item of tests) {
  try {
    item.run();
    console.log(`ok - ${item.name}`);
  } catch (error) {
    failed += 1;
    console.error(`not ok - ${item.name}`);
    console.error(error);
  }
}
if (failed > 0) process.exitCode = 1;
else console.log(`${tests.length} StoryArc foundation tests passed`);
