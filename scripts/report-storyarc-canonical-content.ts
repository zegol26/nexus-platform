import "dotenv/config";
import { prisma } from "../lib/db/prisma";

type JsonObject = Record<string, unknown>;

function object(value: unknown): JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {};
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function increment(target: Record<string, number>, key: string) {
  target[key] = (target[key] ?? 0) + 1;
}

function entryKey(value: unknown) {
  const entry = object(value);
  return String(entry.entryKey ?? entry.vocabularyId ?? entry.expressionId ?? entry.id ?? entry.termEn ?? JSON.stringify(entry));
}

async function main() {
  try {
    const revisions = await prisma.storyArcContentRevision.findMany({
      include: {
        item: true,
        objectives: { include: { objective: { include: { competency: true } } } },
      },
      orderBy: [{ item: { stableId: "asc" } }, { revision: "asc" }],
    });
    const items = await prisma.storyArcContentItem.findMany({ select: { stableId: true } });
    const published = revisions.filter((revision) => revision.state === "PUBLISHED");
    const blockingWorkflowRevisions = revisions.filter((revision) => ["DRAFT", "VALIDATING", "IN_REVIEW", "APPROVED"].includes(revision.state));
    const byTrack: Record<string, number> = {};
    const byGrade: Record<string, number> = {};
    const byPhase: Record<string, number> = {};
    const byState: Record<string, number> = {};
    const skills = new Set<string>();
    const objectiveKeys = new Set<string>();
    const competencyKeys = new Set<string>();
    const vocabularyKeys = new Set<string>();
    const expressionKeys = new Set<string>();
    let recallHooks = 0;
    let recallReferences = 0;
    let dialogueEdges = 0;
    const invalidDialogueEdges: string[] = [];

    for (const revision of revisions) increment(byState, revision.state);
    for (const revision of published) {
      increment(byTrack, revision.item.track);
      increment(byGrade, revision.item.grade);
      increment(byPhase, revision.item.phase);
      skills.add(revision.primarySkill);
      revision.supportingSkills.forEach((skill) => skills.add(skill));
      revision.objectives.forEach(({ objective }) => {
        objectiveKeys.add(objective.objectiveKey);
        competencyKeys.add(objective.competency.competencyKey);
      });

      const payload = object(revision.payload);
      array(payload.vocabulary).forEach((entry) => vocabularyKeys.add(entryKey(entry)));
      array(payload.expressions).forEach((entry) => expressionKeys.add(entryKey(entry)));
      recallHooks += array(payload.recallHooks).length;
      recallReferences += array(payload.recallReferences).length;

      const scene = object(payload.scene);
      const nodes = array(scene.dialogueNodes).map(object);
      const nodeIds = new Set(nodes.map((node) => String(node.id ?? "")));
      for (const node of nodes) {
        const source = String(node.id ?? "unknown");
        const targets = [node.nextNodeId, ...array(node.choices).map((choice) => object(choice).nextNodeId)]
          .filter((target): target is string => typeof target === "string" && target.length > 0);
        for (const target of targets) {
          dialogueEdges += 1;
          if (!nodeIds.has(target)) invalidDialogueEdges.push(`${revision.item.stableId}:${source}->${target}`);
        }
      }
    }

    const stableIds = items.map((item) => item.stableId);
    const duplicateStableIds = stableIds.filter((id, index) => stableIds.indexOf(id) !== index);
    const expected = {
      total: published.length === 90,
      tracks: byTrack.SCHOOL_CORE === 45 && byTrack.STORY_MODE === 27 && byTrack.EXAM_LAB === 18,
      grades: byGrade.GRADE_10 === 30 && byGrade.GRADE_11 === 30 && byGrade.GRADE_12 === 30,
      phases: byPhase.PHASE_E === 30 && byPhase.PHASE_F === 60,
      allSixSkills: skills.size === 6,
      noBlockingWorkflowRevisions: blockingWorkflowRevisions.length === 0,
      noDuplicateStableIds: duplicateStableIds.length === 0,
      validDialogueEdges: invalidDialogueEdges.length === 0,
    };
    const report = {
      generatedAt: new Date().toISOString(),
      canonical: {
        items: items.length,
        revisions: revisions.length,
        publishedRevisions: published.length,
        historicalRevisions: revisions.length - published.length,
        blockingWorkflowRevisions: blockingWorkflowRevisions.length,
        byState,
        byTrack,
        byGrade,
        byPhase,
        skills: [...skills].sort(),
        competencies: competencyKeys.size,
        objectives: objectiveKeys.size,
        vocabularyEntries: vocabularyKeys.size,
        expressionEntries: expressionKeys.size,
        recallHooks,
        recallReferences,
        dialogueEdges,
        invalidDialogueEdges,
        duplicateStableIds,
      },
      expected,
      releaseReady: Object.values(expected).every(Boolean),
    };
    console.log(JSON.stringify(report, null, 2));
    if (!report.releaseReady) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
