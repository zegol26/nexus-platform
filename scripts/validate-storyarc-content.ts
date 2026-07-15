import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  validateStoryArcContentPackage,
  type StoryArcContentPackage,
} from "../lib/storyarc/content/schema";

type FindingCategory =
  | "STRUCTURAL"
  | "REFERENCE"
  | "ENUM"
  | "COUNT"
  | "CURRICULUM_SOURCE"
  | "LEARNING_GRAPH"
  | "DIALOGUE"
  | "ASSESSMENT"
  | "CANON"
  | "IMPLEMENTATION_GAP";

type ReleaseFinding = {
  category: FindingCategory;
  severity: "ERROR" | "WARNING";
  code: string;
  contentId: string | null;
  finding: string;
  allowedNormalization: string;
  requiresContentCorrection: boolean;
};

type UnknownRecord = Record<string, unknown>;

const DATA_DIRECTORY = path.join(process.cwd(), "prisma", "data", "storyarc");
const EXPECTED_TRACK_COUNTS = { SCHOOL_CORE: 45, STORY_MODE: 27, EXAM_LAB: 18 } as const;
const EXPECTED_GRADE_COUNTS = { GRADE_10: 30, GRADE_11: 30, GRADE_12: 30 } as const;
const APPROVED_CHARACTERS = new Set([
  "char-halim",
  "char-hana",
  "char-john",
  "char-maya",
  "char-ratna",
  "char-ryo",
  "char-sari",
  "narrator",
]);
const APPROVED_LOCATIONS = new Set([
  "loc-cafeteria",
  "loc-classroom",
  "loc-clubroom",
  "loc-corridor",
  "loc-gate",
  "loc-hall",
  "loc-library",
  "loc-office",
  "loc-workplace",
  "loc-workshop",
]);
const PROHIBITED_IP_PATTERNS = [
  /\bnaruto\b/i,
  /\bgojo\b/i,
  /\bdemon slayer\b/i,
  /\bkimetsu no yaiba\b/i,
  /\bone piece\b(?!\s+of\b)/i,
];

const EXAM_TARGETS: Record<string, { questions: number; tasks: number }> = {
  "ex-g10-01": { questions: 20, tasks: 0 },
  "ex-g10-02": { questions: 16, tasks: 2 },
  "ex-g10-03": { questions: 20, tasks: 0 },
  "ex-g10-04": { questions: 20, tasks: 0 },
  "ex-g10-05": { questions: 5, tasks: 0 },
  "ex-g10-06": { questions: 40, tasks: 1 },
  "ex-g11-01": { questions: 16, tasks: 1 },
  "ex-g11-02": { questions: 24, tasks: 0 },
  "ex-g11-03": { questions: 24, tasks: 0 },
  "ex-g11-04": { questions: 5, tasks: 0 },
  "ex-g11-05": { questions: 2, tasks: 1 },
  "ex-g11-06": { questions: 44, tasks: 1 },
  "ex-g12-01": { questions: 16, tasks: 1 },
  "ex-g12-02": { questions: 30, tasks: 0 },
  "ex-g12-03": { questions: 30, tasks: 0 },
  "ex-g12-04": { questions: 6, tasks: 0 },
  "ex-g12-05": { questions: 3, tasks: 1 },
  "ex-g12-06": { questions: 50, tasks: 1 },
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (!isRecord(value)) return JSON.stringify(value);
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
}

function collectNamedArrays(value: unknown, property: string, found: unknown[][] = []): unknown[][] {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectNamedArrays(entry, property, found));
    return found;
  }
  if (!isRecord(value)) return found;
  for (const [key, entry] of Object.entries(value)) {
    if (key === property && Array.isArray(entry)) found.push(entry);
    collectNamedArrays(entry, property, found);
  }
  return found;
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated].sort();
}

function increment<T extends string>(record: Record<T, number>, key: T) {
  record[key] = (record[key] ?? 0) + 1;
}

const files = readdirSync(DATA_DIRECTORY).filter((name) => name.endsWith(".json")).sort();
const packages: Array<{ file: string; pkg: StoryArcContentPackage }> = [];
const findings: ReleaseFinding[] = [];

function addFinding(finding: ReleaseFinding) {
  findings.push(finding);
}

for (const file of files) {
  const input = JSON.parse(readFileSync(path.join(DATA_DIRECTORY, file), "utf8")) as unknown;
  const report = validateStoryArcContentPackage(input);
  for (const error of report.errors) {
    addFinding({
      category: error.code.includes("ENUM") || error.code === "INVALID_PHASE" ? "ENUM" : "STRUCTURAL",
      severity: "ERROR",
      code: error.code,
      contentId: null,
      finding: `${file}:${error.path}: ${error.message}`,
      allowedNormalization: "Only syntax or enum spelling may be normalized when meaning is unchanged.",
      requiresContentCorrection: false,
    });
  }
  for (const warning of report.warnings) {
    addFinding({
      category: "CURRICULUM_SOURCE",
      severity: "WARNING",
      code: warning.code,
      contentId: null,
      finding: `${file}:${warning.path}: ${warning.message}`,
      allowedNormalization: "None; an academic authority must provide the verified source mapping.",
      requiresContentCorrection: true,
    });
  }
  if (report.package) packages.push({ file, pkg: report.package });
}

const items = packages.flatMap(({ file, pkg }) => pkg.items.map((item) => ({ file, pkg, item })));
const itemIds = new Set(items.map(({ item }) => item.stableId));
const trackCounts = { SCHOOL_CORE: 0, STORY_MODE: 0, EXAM_LAB: 0 };
const gradeCounts = { GRADE_10: 0, GRADE_11: 0, GRADE_12: 0 };
const phaseCounts: Record<string, number> = {};
const skillCounts: Record<string, number> = {};

for (const { item } of items) {
  increment(trackCounts, item.track);
  increment(gradeCounts, item.grade);
  phaseCounts[item.phase] = (phaseCounts[item.phase] ?? 0) + 1;
  skillCounts[item.primarySkill] = (skillCounts[item.primarySkill] ?? 0) + 1;
  item.supportingSkills.forEach((skill) => { skillCounts[skill] = (skillCounts[skill] ?? 0) + 1; });
}

for (const duplicate of duplicates(items.map(({ item }) => `${item.stableId}@${item.revision}`))) {
  addFinding({
    category: "STRUCTURAL",
    severity: "ERROR",
    code: "DUPLICATE_RELEASE_CONTENT_ID",
    contentId: duplicate.split("@")[0],
    finding: `Content revision ${duplicate} occurs more than once in the release.`,
    allowedNormalization: "None without selecting the authoritative source revision.",
    requiresContentCorrection: true,
  });
}

for (const [track, expected] of Object.entries(EXPECTED_TRACK_COUNTS)) {
  const actual = trackCounts[track as keyof typeof trackCounts];
  if (actual !== expected) addFinding({
    category: "COUNT", severity: "ERROR", code: "TRACK_COUNT_MISMATCH", contentId: null,
    finding: `${track} has ${actual}; expected ${expected}.`,
    allowedNormalization: "None; filler or deletion is prohibited.", requiresContentCorrection: true,
  });
}
for (const [grade, expected] of Object.entries(EXPECTED_GRADE_COUNTS)) {
  const actual = gradeCounts[grade as keyof typeof gradeCounts];
  if (actual !== expected) addFinding({
    category: "COUNT", severity: "ERROR", code: "GRADE_COUNT_MISMATCH", contentId: null,
    finding: `${grade} has ${actual}; expected ${expected}.`,
    allowedNormalization: "None; filler or deletion is prohibited.", requiresContentCorrection: true,
  });
}
if (items.length !== 90) addFinding({
  category: "COUNT", severity: "ERROR", code: "TOTAL_COUNT_MISMATCH", contentId: null,
  finding: `Release has ${items.length} items; expected 90.`, allowedNormalization: "None.", requiresContentCorrection: true,
});

const competencyDefinitions = new Map<string, Set<string>>();
const objectiveDefinitions = new Map<string, Set<string>>();
for (const { pkg } of packages) {
  for (const competency of pkg.competencies) {
    const definitions = competencyDefinitions.get(competency.competencyKey) ?? new Set<string>();
    definitions.add(stableJson(competency));
    competencyDefinitions.set(competency.competencyKey, definitions);
  }
  for (const objective of pkg.objectives) {
    const definitions = objectiveDefinitions.get(objective.objectiveKey) ?? new Set<string>();
    definitions.add(stableJson(objective));
    objectiveDefinitions.set(objective.objectiveKey, definitions);
  }
}
for (const [key, definitions] of [...competencyDefinitions, ...objectiveDefinitions]) {
  if (definitions.size > 1) addFinding({
    category: "REFERENCE", severity: "ERROR", code: "CONFLICTING_CATALOG_DEFINITION", contentId: key,
    finding: `${key} has ${definitions.size} conflicting definitions across packages.`,
    allowedNormalization: "Exact duplicate catalog rows may be deduplicated; conflicting definitions may not.",
    requiresContentCorrection: true,
  });
}

type LanguageOccurrence = { itemId: string; definition: string };
const vocabulary = new Map<string, LanguageOccurrence[]>();
const expressions = new Map<string, LanguageOccurrence[]>();
const hooks = new Map<string, LanguageOccurrence[]>();
let vocabularyDeclarations = 0;
let expressionDeclarations = 0;
let recallReferenceCount = 0;

for (const { item } of items) {
  for (const entry of item.content.vocabulary) {
    vocabularyDeclarations += 1;
    const entries = vocabulary.get(entry.entryId) ?? [];
    entries.push({ itemId: item.stableId, definition: stableJson(entry) });
    vocabulary.set(entry.entryId, entries);
  }
  for (const entry of item.content.expressions) {
    expressionDeclarations += 1;
    const entries = expressions.get(entry.entryId) ?? [];
    entries.push({ itemId: item.stableId, definition: stableJson(entry) });
    expressions.set(entry.entryId, entries);
  }
  for (const hook of item.content.recallHooks) {
    const entries = hooks.get(hook.hookId) ?? [];
    entries.push({ itemId: item.stableId, definition: stableJson(hook) });
    hooks.set(hook.hookId, entries);
  }
  for (const reference of item.content.recallReferences) {
    recallReferenceCount += 1;
    if (!hooks.has(reference.hookId)) {
      // Checked again after every package has been collected below.
    }
  }
}

for (const [kind, catalog] of [["vocabulary", vocabulary], ["expression", expressions], ["recall hook", hooks]] as const) {
  for (const [id, occurrences] of catalog) {
    const definitions = new Set(occurrences.map(({ definition }) => definition));
    if (definitions.size > 1) addFinding({
      category: kind === "recall hook" ? "LEARNING_GRAPH" : "REFERENCE",
      severity: "ERROR",
      code: "CONFLICTING_STABLE_DEFINITION",
      contentId: id,
      finding: `${kind} ${id} has ${definitions.size} conflicting definitions in ${occurrences.map(({ itemId }) => itemId).join(", ")}.`,
      allowedNormalization: "Exact duplicates may be deduplicated; stable IDs with different semantics may not be merged.",
      requiresContentCorrection: true,
    });
  }
}

const allLanguageIds = new Set([...vocabulary.keys(), ...expressions.keys()]);
for (const { item } of items) {
  for (const reference of item.content.recallReferences) {
    if (!hooks.has(reference.hookId)) addFinding({
      category: "LEARNING_GRAPH", severity: "ERROR", code: "ORPHAN_RECALL_HOOK", contentId: item.stableId,
      finding: `Recall reference ${reference.hookId} does not resolve in the release.`,
      allowedNormalization: "None; the source hook must be supplied or the semantic reference corrected.", requiresContentCorrection: true,
    });
    if (!allLanguageIds.has(reference.sourceEntryId)) addFinding({
      category: "LEARNING_GRAPH", severity: "ERROR", code: "ORPHAN_RECALL_ENTRY", contentId: item.stableId,
      finding: `Recall source ${reference.sourceEntryId} does not resolve in the release.`,
      allowedNormalization: "None; the source language entry must be supplied or corrected.", requiresContentCorrection: true,
    });
  }
}

const schoolCoreWithoutAssessment: string[] = [];
const storyEvidenceWithoutAssessment: Array<{ itemId: string; count: number }> = [];
const storyLinks = new Set<string>();
const storyPrerequisiteLinks = new Set<string>();
const characterIds = new Set<string>();
const locationIds = new Set<string>();
const examModes: Record<string, number> = {};
let selectedResponseQuestions = 0;
let constructedResponseTasks = 0;
let storyRecallEvidenceChoices = 0;
const examQuestionsWithoutOptionRationales: Array<{ itemId: string; count: number }> = [];
const pendingAudioItems = new Map<string, number>();

const releaseRubricDefinitions = new Set<string>();
for (const { item } of items) {
  for (const block of item.content.lessonBlocks as UnknownRecord[]) {
    if (block.blockType === "rubric-definition" && typeof block.rubricRevisionId === "string") {
      releaseRubricDefinitions.add(block.rubricRevisionId);
    }
  }
}

for (const { item } of items) {
  const blocks = item.content.lessonBlocks as UnknownRecord[];
  const referencedRubrics = new Set<string>();
  if (item.content.assessment) referencedRubrics.add(item.content.assessment.rubricRevisionId);
  for (const block of blocks) {
    if (typeof block.rubricRevisionId === "string" && block.blockType !== "rubric-definition") {
      referencedRubrics.add(block.rubricRevisionId);
    }
  }
  for (const rubricId of referencedRubrics) {
    if (!releaseRubricDefinitions.has(rubricId)) addFinding({
      category: "ASSESSMENT", severity: "ERROR", code: "UNRESOLVED_RUBRIC_REVISION", contentId: item.stableId,
      finding: `Assessment references ${rubricId}, but that rubric revision is not defined in the item package.`,
      allowedNormalization: "A byte-identical published global rubric may be linked if it exists; no such release definition is present here.",
      requiresContentCorrection: true,
    });
  }

  const masteryBlocks = blocks.filter((block) => block.blockType === "mastery-check" && block.evidenceIntent === "ASSESSED_EVIDENCE");
  if (item.track === "SCHOOL_CORE" && masteryBlocks.length > 0 && !item.content.assessment) {
    schoolCoreWithoutAssessment.push(item.stableId);
  }

  for (const block of blocks) {
    if (block.blockType === "story-link" && typeof block.storyItemId === "string") {
      storyLinks.add(`${item.stableId}->${block.storyItemId}`);
      if (!itemIds.has(block.storyItemId)) addFinding({
        category: "LEARNING_GRAPH", severity: "ERROR", code: "ORPHAN_STORY_LINK", contentId: item.stableId,
        finding: `Story application ${block.storyItemId} does not resolve.`, allowedNormalization: "None.", requiresContentCorrection: true,
      });
    }
    if (block.blockType === "episode-brief" && Array.isArray(block.prerequisites)) {
      for (const prerequisite of block.prerequisites) {
        if (typeof prerequisite !== "string") continue;
        storyPrerequisiteLinks.add(`${prerequisite}->${item.stableId}`);
        if (!itemIds.has(prerequisite)) addFinding({
          category: "LEARNING_GRAPH", severity: "ERROR", code: "ORPHAN_PREREQUISITE", contentId: item.stableId,
          finding: `Prerequisite ${prerequisite} does not resolve.`, allowedNormalization: "None.", requiresContentCorrection: true,
        });
      }
    }
    if (block.blockType === "exam-meta" && typeof block.modeId === "string") {
      examModes[block.modeId] = (examModes[block.modeId] ?? 0) + 1;
    }
  }

  const questionArrays = collectNamedArrays(blocks, "questions");
  const taskArrays = collectNamedArrays(blocks, "tasks");
  const questions = questionArrays.flat().filter(isRecord);
  const interviewPrompts = blocks
    .filter((block) => block.blockType === "john-interview" && Array.isArray(block.prompts))
    .flatMap((block) => block.prompts as unknown[])
    .filter(isRecord);
  const standaloneConstructedTasks = blocks.filter((block) => block.blockType === "presentation-task" && typeof block.taskEn === "string").length;
  selectedResponseQuestions += questions.filter((question) => Array.isArray(question.optionsEn)).length;
  constructedResponseTasks += taskArrays.flat().filter((task) => isRecord(task) && typeof task.taskId === "string").length + standaloneConstructedTasks;

  const pendingAudioBlocks = blocks.filter((block) => typeof block.audioState === "string" && block.audioState.includes("pending-audio"));
  if (pendingAudioBlocks.length > 0) pendingAudioItems.set(item.stableId, pendingAudioBlocks.length);

  const qids = questions.map((question) => question.qid).filter((qid): qid is string => typeof qid === "string");
  for (const qid of duplicates(qids)) addFinding({
    category: "ASSESSMENT", severity: "ERROR", code: "DUPLICATE_QUESTION_ID", contentId: item.stableId,
    finding: `Question ID ${qid} is duplicated within the learning item.`, allowedNormalization: "ID renaming is permitted only with deterministic reference updates.", requiresContentCorrection: false,
  });
  const normalizedPrompts = questions.map((question) => question.promptEn)
    .filter((prompt): prompt is string => typeof prompt === "string")
    .map((prompt) => prompt.trim().toLocaleLowerCase());
  for (const prompt of duplicates(normalizedPrompts)) addFinding({
    category: "ASSESSMENT", severity: "ERROR", code: "DUPLICATE_QUESTION_STEM", contentId: item.stableId,
    finding: `Duplicate question stem: ${prompt}`, allowedNormalization: "None; assessment intent must be reviewed.", requiresContentCorrection: true,
  });
  questions.forEach((question, questionIndex) => {
    if (!Array.isArray(question.optionsEn)) return;
    if (question.optionsEn.length < 2 || question.optionsEn.some((option) => typeof option !== "string" || option.trim() === "")) addFinding({
      category: "ASSESSMENT", severity: "ERROR", code: "MALFORMED_OPTIONS", contentId: item.stableId,
      finding: `Selected-response question ${question.qid ?? questionIndex + 1} has malformed options.`, allowedNormalization: "Formatting-only cleanup is allowed when the intended options are unambiguous.", requiresContentCorrection: true,
    });
    if (question.optionsEn.length >= 2 && question.optionsEn.every((option, index) => option === String.fromCharCode(65 + index))) addFinding({
      category: "ASSESSMENT", severity: "ERROR", code: "PLACEHOLDER_OPTIONS", contentId: item.stableId,
      finding: `Selected-response question ${question.qid ?? questionIndex + 1} exposes letter placeholders instead of answer text.`, allowedNormalization: "Expand the authored transcript choices into complete answer options.", requiresContentCorrection: true,
    });
    if (!Number.isInteger(question.answerIndex) || (question.answerIndex as number) < 0 || (question.answerIndex as number) >= question.optionsEn.length) addFinding({
      category: "ASSESSMENT", severity: "ERROR", code: "INVALID_ANSWER_KEY", contentId: item.stableId,
      finding: `Selected-response question ${question.qid ?? questionIndex + 1} has invalid answerIndex ${String(question.answerIndex)}.`, allowedNormalization: "None when the correct answer is ambiguous.", requiresContentCorrection: true,
    });
    if (typeof question.explanationId !== "string" || question.explanationId.trim() === "") addFinding({
      category: "ASSESSMENT", severity: "ERROR", code: "MISSING_EXPLANATION", contentId: item.stableId,
      finding: `Selected-response question ${question.qid ?? questionIndex + 1} has no explanation.`, allowedNormalization: "None; an explanation must be authored.", requiresContentCorrection: true,
    });
  });

  if (item.track === "EXAM_LAB") {
    const withoutRationales = questions.filter((question) =>
      Array.isArray(question.optionsEn)
      && (!Array.isArray(question.optionRationales) || question.optionRationales.length !== question.optionsEn.length),
    ).length;
    if (withoutRationales > 0) examQuestionsWithoutOptionRationales.push({ itemId: item.stableId, count: withoutRationales });
  }

  if (item.track === "EXAM_LAB") {
    const actualQuestions = questions.length + interviewPrompts.length;
    const actualTasks = taskArrays.flat().filter((task) => isRecord(task) && typeof task.taskId === "string").length + standaloneConstructedTasks;
    const target = EXAM_TARGETS[item.stableId];
    if (target && (actualQuestions !== target.questions || actualTasks !== target.tasks)) addFinding({
      category: "COUNT", severity: "ERROR", code: "EXAM_BLUEPRINT_COUNT_UNVERIFIED", contentId: item.stableId,
      finding: `Package has ${actualQuestions} questions and ${actualTasks} constructed tasks; blueprint target is ${target.questions} questions and ${target.tasks} tasks. The required generation report that may fix final generated counts is absent.`,
      allowedNormalization: "None; do not create filler. Supply the generation report or corrected approved assessment content.", requiresContentCorrection: true,
    });
  }

  if (item.content.scene) {
    locationIds.add(item.content.scene.locationId);
    if (!APPROVED_LOCATIONS.has(item.content.scene.locationId)) addFinding({
      category: "CANON", severity: "ERROR", code: "INVALID_LOCATION_REFERENCE", contentId: item.stableId,
      finding: `Location ${item.content.scene.locationId} is not documented in the StoryArc universe bible.`, allowedNormalization: "None; document or correct the location.", requiresContentCorrection: true,
    });
    let evidenceChoiceCount = 0;
    for (const node of item.content.scene.dialogueNodes) {
      characterIds.add(node.speakerId);
      if (!APPROVED_CHARACTERS.has(node.speakerId)) addFinding({
        category: "CANON", severity: "ERROR", code: "INVALID_CHARACTER_REFERENCE", contentId: item.stableId,
        finding: `Speaker ${node.speakerId} is not documented in the StoryArc character bible.`, allowedNormalization: "None; document or correct the character.", requiresContentCorrection: true,
      });
      evidenceChoiceCount += node.choices.filter((choice) => choice.classification === "RECALL_EVIDENCE" || choice.classification === "ASSESSED_INTERACTION").length;
      storyRecallEvidenceChoices += node.choices.filter((choice) => choice.classification === "RECALL_EVIDENCE").length;
    }
    if (evidenceChoiceCount > 0 && !item.content.assessment) storyEvidenceWithoutAssessment.push({ itemId: item.stableId, count: evidenceChoiceCount });
  }
}

if (schoolCoreWithoutAssessment.length > 0) addFinding({
  category: "ASSESSMENT", severity: "ERROR", code: "SCHOOL_CORE_EVIDENCE_WITHOUT_RUBRIC", contentId: null,
  finding: `${schoolCoreWithoutAssessment.length} School Core items declare ASSESSED_EVIDENCE in mastery-check blocks but have no item assessment/rubric binding: ${schoolCoreWithoutAssessment.join(", ")}.`,
  allowedNormalization: "None; selecting or authoring a rubric changes assessment semantics and requires approved content correction.", requiresContentCorrection: true,
});
if (storyEvidenceWithoutAssessment.length > 0) addFinding({
  category: "ASSESSMENT", severity: "ERROR", code: "STORY_EVIDENCE_WITHOUT_RUBRIC", contentId: null,
  finding: `${storyEvidenceWithoutAssessment.reduce((sum, entry) => sum + entry.count, 0)} Story Mode evidence choices have no item assessment/rubric binding: ${storyEvidenceWithoutAssessment.map(({ itemId, count }) => `${itemId}(${count})`).join(", ")}.`,
  allowedNormalization: "None; either supply an approved rubric/evidence mapping or reclassify choices through content review.", requiresContentCorrection: true,
});
if (examQuestionsWithoutOptionRationales.length > 0) addFinding({
  category: "ASSESSMENT", severity: "ERROR", code: "MISSING_PER_OPTION_RATIONALES", contentId: null,
  finding: `${examQuestionsWithoutOptionRationales.reduce((sum, entry) => sum + entry.count, 0)} Exam Lab selected-response questions lack the blueprint-required per-option rationale array: ${examQuestionsWithoutOptionRationales.map(({ itemId, count }) => `${itemId}(${count})`).join(", ")}.`,
  allowedNormalization: "None; distractor rationales require content authorship and review.", requiresContentCorrection: true,
});
if (pendingAudioItems.size > 0) addFinding({
  category: "IMPLEMENTATION_GAP", severity: "ERROR", code: "PENDING_AUDIO_ASSETS", contentId: null,
  finding: `${pendingAudioItems.size} items contain transcript-only-pending-audio blocks without release-ready audio assets: ${[...pendingAudioItems].map(([itemId, count]) => `${itemId}(${count})`).join(", ")}.`,
  allowedNormalization: "None; generate/license, register, and validate the approved audio assets while preserving the supplied transcripts.", requiresContentCorrection: true,
});

const serializedRelease = packages.map(({ pkg }) => JSON.stringify(pkg)).join("\n");
for (const pattern of PROHIBITED_IP_PATTERNS) {
  if (pattern.test(serializedRelease)) addFinding({
    category: "CANON", severity: "ERROR", code: "PROHIBITED_IP_REFERENCE", contentId: null,
    finding: `Release contains prohibited IP pattern ${String(pattern)}.`, allowedNormalization: "None; content review is required.", requiresContentCorrection: true,
  });
}

if (!readFileSync(path.join(process.cwd(), "docs", "storyarc", "STORYARC_EXAM_BLUEPRINT.md"), "utf8").includes("final counts fixed at generation")) {
  throw new Error("Exam blueprint contract text changed; update the release validator.");
}
const generationReportFiles = readdirSync(path.join(process.cwd(), "docs", "storyarc"))
  .filter((file) => file.toLocaleUpperCase().includes("CONTENT_GENERATION_REPORT"));
if (generationReportFiles.length === 0) addFinding({
  category: "IMPLEMENTATION_GAP", severity: "ERROR", code: "MISSING_CONTENT_GENERATION_REPORT", contentId: null,
  finding: "STORYARC_CONTENT_GENERATION_REPORT is absent, so generated assessment counts and declared generation exceptions cannot be verified.",
  allowedNormalization: "None; provide the approved generation report.", requiresContentCorrection: true,
});

const errors = findings.filter((finding) => finding.severity === "ERROR");
const warnings = findings.filter((finding) => finding.severity === "WARNING");
const summary = {
  valid: errors.length === 0,
  packageFiles: files,
  counts: {
    total: items.length,
    byTrack: trackCounts,
    byGrade: gradeCounts,
    byPhase: phaseCounts,
    competencies: competencyDefinitions.size,
    objectives: objectiveDefinitions.size,
    skillCoverage: skillCounts,
    vocabulary: { declarations: vocabularyDeclarations, unique: vocabulary.size },
    expressions: { declarations: expressionDeclarations, unique: expressions.size },
    recallHooks: { declarations: [...hooks.values()].reduce((sum, occurrences) => sum + occurrences.length, 0), unique: hooks.size },
    recallReferences: recallReferenceCount,
    storyApplicationLinks: storyLinks.size,
    storyPrerequisiteLinks: storyPrerequisiteLinks.size,
    selectedResponseQuestions,
    constructedResponseTasks,
    storyRecallEvidenceChoices,
    approvedCharactersUsed: [...characterIds].sort(),
    approvedLocationsUsed: [...locationIds].sort(),
    examModes,
  },
  findings: { errors, warnings },
};

console.log(JSON.stringify(summary, null, 2));
if (errors.length > 0) process.exitCode = 1;
