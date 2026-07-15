import { z } from "zod";
import {
  STORYARC_APP_SLUG,
  STORYARC_GRADES,
  STORYARC_PHASES,
  STORYARC_SCHEMA_VERSION,
  STORYARC_SKILLS,
  STORYARC_TRACKS,
  expectedPhaseForGrade,
} from "../constants";

const Identifier = z.string().min(3).max(120).regex(/^[a-z0-9][a-z0-9-]*$/);
const Grade = z.enum(STORYARC_GRADES);
const Track = z.enum(STORYARC_TRACKS);
const Phase = z.enum(STORYARC_PHASES);
const Skill = z.enum(STORYARC_SKILLS);

const assetSchema = z.object({
  assetId: Identifier,
  revision: z.number().int().positive(),
  type: z.string().min(2),
  purpose: z.string().min(4),
  sourceType: z.enum(["original-human", "commissioned", "generated", "licensed"]),
  sourceReference: z.string().min(2),
  authorOrGenerator: z.string().min(2),
  license: z.string().min(2),
  commercialUseAllowed: z.literal(true),
  derivativeUseAllowed: z.boolean(),
  attributionRequired: z.boolean(),
  attributionText: z.string().optional(),
  rightsOwner: z.string().min(2),
  approvalStatus: z.enum(["TEMPORARY_APPROVED", "APPROVED"]),
  storageLocation: z.string().min(2),
  contentHash: z.string().min(8),
  mimeType: z.string().min(2),
  byteSize: z.number().int().nonnegative(),
  temporary: z.boolean(),
});

const dialogueChoiceSchema = z.object({
  id: Identifier,
  text: z.string().min(1).max(220),
  dimension: z.enum([
    "natural",
    "understandable-unnatural",
    "too-direct",
    "overly-formal",
    "vague",
    "socially-weak",
    "context-inappropriate",
    "wrong-tense",
    "wrong-collocation",
    "narrative",
  ]),
  classification: z.enum([
    "NARRATIVE_CHOICE",
    "LEARNING_PRACTICE",
    "ASSESSED_INTERACTION",
    "RECALL_EVIDENCE",
  ]),
  nextNodeId: Identifier,
  actionType: Identifier,
  feedback: z.object({
    lenses: z.array(z.enum(["GRAMMAR", "NATURALNESS", "CONTEXT", "SOCIAL_COMMUNICATION"])).max(2),
    message: z.string().min(1).max(360),
    modelUtterance: z.string().min(1).max(220),
  }),
});

const dialogueNodeSchema = z.object({
  id: Identifier,
  speakerId: Identifier,
  text: z.string().min(1).max(600),
  expressionState: z.enum(["neutral", "warm", "surprised", "concerned"]),
  nextNodeId: Identifier.optional(),
  terminal: z.boolean().default(false),
  choices: z.array(dialogueChoiceSchema).max(4).default([]),
});

const sceneSchema = z.object({
  sceneId: Identifier,
  locationId: Identifier,
  arcId: Identifier,
  episodeId: Identifier,
  assetIds: z.array(Identifier).min(1),
  entryNodeId: Identifier,
  dialogueNodes: z.array(dialogueNodeSchema).min(1),
  hotspots: z.array(z.object({
    id: Identifier,
    label: z.string().min(1),
    actionType: Identifier,
  })).min(1),
});

const vocabularySchema = z.object({
  entryId: Identifier,
  term: z.string().min(1),
  meaningId: z.string().min(1),
  partOfSpeech: z.string().min(1),
  sourceIntentKey: Identifier,
  recallHookId: Identifier,
});

const expressionSchema = z.object({
  entryId: Identifier,
  expression: z.string().min(1),
  meaningId: z.string().min(1),
  register: z.enum(["informal", "neutral", "formal"]),
  sourceIntentKey: Identifier,
  recallHookId: Identifier,
});

const contentPayloadSchema = z.object({
  runtimeGeneration: z.literal(false),
  instructionLanguage: z.literal("id"),
  targetLanguage: z.literal("en"),
  arcId: Identifier.optional(),
  episodeId: Identifier.optional(),
  lessonBlocks: z.array(z.record(z.string(), z.unknown())).default([]),
  scene: sceneSchema.optional(),
  vocabulary: z.array(vocabularySchema).default([]),
  expressions: z.array(expressionSchema).default([]),
  recallHooks: z.array(z.object({
    hookId: Identifier,
    sourceEntryId: Identifier,
    objectiveKey: Identifier,
    intendedEvidenceClass: z.literal("RECALL_EVIDENCE"),
  })).default([]),
  recallReferences: z.array(z.object({
    hookId: Identifier,
    sourceEntryId: Identifier,
  })).default([]),
  assessment: z.object({
    rubricRevisionId: Identifier,
    evidenceIntent: z.enum(["PRACTICE", "ASSESSED_EVIDENCE", "RECALL_EVIDENCE"]),
  }).optional(),
});

const itemSchema = z.object({
  stableId: Identifier,
  revision: z.number().int().positive(),
  kind: z.enum(["LEARNING_ITEM", "ASSESSMENT", "VOCABULARY", "EXPRESSION"]),
  grade: Grade,
  track: Track,
  phase: Phase,
  title: z.string().min(3).max(180),
  primarySkill: Skill,
  supportingSkills: z.array(Skill).max(2),
  objectiveKeys: z.array(Identifier).min(1),
  content: contentPayloadSchema,
  sourceMetadata: z.object({
    sourceType: z.enum(["human-authored", "generated-draft", "imported"]),
    authorOrOperator: z.string().min(2),
    generatorProvider: z.string().optional(),
    generatorModel: z.string().optional(),
    promptTemplateVersion: z.string().optional(),
  }),
});

export const storyArcContentPackageSchema = z.object({
  schemaVersion: z.literal(STORYARC_SCHEMA_VERSION),
  packageId: Identifier,
  appSlug: z.literal(STORYARC_APP_SLUG),
  releaseTarget: z.string().min(3).max(120),
  curriculum: z.object({
    sourceKey: Identifier,
    sourceTitle: z.string().min(3),
    sourceAuthority: z.string().min(3),
    sourceReference: z.string().optional(),
    sourceVerificationNote: z.string().optional(),
    versionKey: Identifier,
    versionTitle: z.string().min(3),
  }),
  competencies: z.array(z.object({
    competencyKey: Identifier,
    title: z.string().min(3),
    description: z.string().min(3),
    authoritativeRef: z.string().optional(),
  })).min(1),
  objectives: z.array(z.object({
    objectiveKey: Identifier,
    competencyKey: Identifier,
    title: z.string().min(3),
    primarySkill: Skill,
  })).min(1),
  assets: z.array(assetSchema),
  items: z.array(itemSchema).min(1),
});

export type StoryArcContentPackage = z.infer<typeof storyArcContentPackageSchema>;

export type StoryArcValidationIssue = {
  severity: "ERROR" | "WARNING";
  code: string;
  path: string;
  message: string;
};

export type StoryArcValidationReport = {
  valid: boolean;
  schemaVersion: string;
  packageId: string | null;
  errors: StoryArcValidationIssue[];
  warnings: StoryArcValidationIssue[];
  totals: { items: number; competencies: number; objectives: number; assets: number };
  package: StoryArcContentPackage | null;
};

function duplicateValues(values: string[]) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

export function validateStoryArcContentPackage(input: unknown): StoryArcValidationReport {
  const parsed = storyArcContentPackageSchema.safeParse(input);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => ({
      severity: "ERROR" as const,
      code: "SCHEMA_INVALID",
      path: issue.path.join("."),
      message: issue.message,
    }));
    return {
      valid: false,
      schemaVersion: STORYARC_SCHEMA_VERSION,
      packageId: null,
      errors,
      warnings: [],
      totals: { items: 0, competencies: 0, objectives: 0, assets: 0 },
      package: null,
    };
  }

  const pkg = parsed.data;
  const errors: StoryArcValidationIssue[] = [];
  const warnings: StoryArcValidationIssue[] = [];
  const addError = (code: string, path: string, message: string) =>
    errors.push({ severity: "ERROR", code, path, message });

  for (const duplicate of duplicateValues(pkg.items.map((item) => `${item.stableId}@${item.revision}`))) {
    addError("DUPLICATE_CONTENT_ID", "items", `Duplicate content revision ${duplicate}.`);
  }
  for (const duplicate of duplicateValues(pkg.competencies.map((item) => item.competencyKey))) {
    addError("DUPLICATE_COMPETENCY", "competencies", `Duplicate competency ${duplicate}.`);
  }
  for (const duplicate of duplicateValues(pkg.objectives.map((item) => item.objectiveKey))) {
    addError("DUPLICATE_OBJECTIVE", "objectives", `Duplicate objective ${duplicate}.`);
  }

  const competencyKeys = new Set(pkg.competencies.map((item) => item.competencyKey));
  const objectiveKeys = new Set(pkg.objectives.map((item) => item.objectiveKey));
  const assetKeys = new Set(pkg.assets.map((asset) => asset.assetId));

  pkg.objectives.forEach((objective, index) => {
    if (!competencyKeys.has(objective.competencyKey)) {
      addError("INVALID_COMPETENCY_REFERENCE", `objectives.${index}.competencyKey`, `Unknown competency ${objective.competencyKey}.`);
    }
  });

  pkg.items.forEach((item, itemIndex) => {
    if (item.phase !== expectedPhaseForGrade(item.grade)) {
      addError("INVALID_PHASE", `items.${itemIndex}.phase`, `${item.grade} must use ${expectedPhaseForGrade(item.grade)}.`);
    }
    item.objectiveKeys.forEach((objectiveKey) => {
      if (!objectiveKeys.has(objectiveKey)) {
        addError("INVALID_OBJECTIVE_REFERENCE", `items.${itemIndex}.objectiveKeys`, `Unknown objective ${objectiveKey}.`);
      }
    });
    if (item.track === "STORY_MODE" && !item.content.scene) {
      addError("MISSING_STORY_SCENE", `items.${itemIndex}.content.scene`, "Story Mode content requires a scene manifest.");
    }

    item.content.lessonBlocks.forEach((block, blockIndex) => {
      const direct = [block.questions, block.tasks, block.prompts].flatMap((value) => Array.isArray(value) ? value : []);
      const nested = [block.conversations, block.talks]
        .flatMap((value) => Array.isArray(value) ? value : [])
        .flatMap((value) => value && typeof value === "object" && !Array.isArray(value) && Array.isArray((value as Record<string, unknown>).questions) ? (value as Record<string, unknown>).questions as unknown[] : []);
      [...direct, ...nested].forEach((question, questionIndex) => {
        if (!question || typeof question !== "object" || Array.isArray(question)) return;
        const options = (question as Record<string, unknown>).optionsEn;
        if (!Array.isArray(options) || options.length < 2) return;
        const placeholderOptions = options.every((option, optionIndex) => option === String.fromCharCode(65 + optionIndex));
        if (placeholderOptions) {
          addError("PLACEHOLDER_OPTIONS", `items.${itemIndex}.content.lessonBlocks.${blockIndex}.questions.${questionIndex}.optionsEn`, "Answer choices must contain complete authored text, not A/B/C/D placeholders.");
        }
      });
    });

    const entryIds = new Set([
      ...item.content.vocabulary.map((entry) => entry.entryId),
      ...item.content.expressions.map((entry) => entry.entryId),
    ]);
    const hookIds = new Set(item.content.recallHooks.map((hook) => hook.hookId));
    item.content.recallHooks.forEach((hook) => {
      if (!entryIds.has(hook.sourceEntryId)) {
        addError("INVALID_RECALL_SOURCE", `items.${itemIndex}.content.recallHooks`, `Unknown recall source ${hook.sourceEntryId}.`);
      }
      if (!objectiveKeys.has(hook.objectiveKey)) {
        addError("INVALID_RECALL_OBJECTIVE", `items.${itemIndex}.content.recallHooks`, `Unknown recall objective ${hook.objectiveKey}.`);
      }
    });
    item.content.recallReferences.forEach((reference) => {
      if (!hookIds.has(reference.hookId)) {
        addError("INVALID_RECALL_REFERENCE", `items.${itemIndex}.content.recallReferences`, `Unknown recall hook ${reference.hookId}.`);
      }
    });

    const scene = item.content.scene;
    if (!scene) return;
    scene.assetIds.forEach((assetId) => {
      if (!assetKeys.has(assetId)) {
        addError("INVALID_ASSET_REFERENCE", `items.${itemIndex}.content.scene.assetIds`, `Unknown asset ${assetId}.`);
      }
    });
    const nodeIds = new Set(scene.dialogueNodes.map((node) => node.id));
    if (!nodeIds.has(scene.entryNodeId)) {
      addError("INVALID_DIALOGUE_ENTRY", `items.${itemIndex}.content.scene.entryNodeId`, `Unknown entry node ${scene.entryNodeId}.`);
    }
    scene.dialogueNodes.forEach((node, nodeIndex) => {
      const references = [node.nextNodeId, ...node.choices.map((choice) => choice.nextNodeId)].filter(Boolean) as string[];
      references.forEach((nextNodeId) => {
        if (!nodeIds.has(nextNodeId)) {
          addError("INVALID_DIALOGUE_REFERENCE", `items.${itemIndex}.content.scene.dialogueNodes.${nodeIndex}`, `Unknown dialogue node ${nextNodeId}.`);
        }
      });
      if (!node.terminal && !node.nextNodeId && node.choices.length === 0) {
        addError("DEAD_END_DIALOGUE", `items.${itemIndex}.content.scene.dialogueNodes.${nodeIndex}`, `Node ${node.id} is not terminal and has no next edge.`);
      }
    });
  });

  if (pkg.curriculum.sourceAuthority === "UNVERIFIED_PROJECT_MAPPING") {
    warnings.push({
      severity: "WARNING",
      code: "CURRICULUM_SOURCE_GAP",
      path: "curriculum.sourceAuthority",
      message: "Phase E/F mapping is descriptive until the academic lead supplies verified CP identifiers.",
    });
  }

  return {
    valid: errors.length === 0,
    schemaVersion: pkg.schemaVersion,
    packageId: pkg.packageId,
    errors,
    warnings,
    totals: {
      items: pkg.items.length,
      competencies: pkg.competencies.length,
      objectives: pkg.objectives.length,
      assets: pkg.assets.length,
    },
    package: errors.length === 0 ? pkg : null,
  };
}
