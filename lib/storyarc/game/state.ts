export type StoryArcQuestState = {
  newSemester: {
    status: "STARTED" | "INTRODUCED" | "GATE_INSPECTED" | "COMPLETE";
    updatedAt: string;
  };
};

export type StoryArcRelationshipState = {
  hana: number;
};

export type StoryArcDecisionState = {
  introductionChoice?: "natural" | "formal" | "vague";
};

export type StoryArcPlayerSnapshot = {
  currentArcId: string;
  currentEpisodeId: string;
  currentSceneId: string;
  checkpointId: string;
  completedNodeIds: string[];
  questState: StoryArcQuestState;
  relationshipState: StoryArcRelationshipState;
  decisionState: StoryArcDecisionState;
  storyXp: number;
  storyLevel: number;
  stateVersion: number;
};

export const STORYARC_PLAYER_ACTIONS = [
  "choose-natural-introduction",
  "choose-formal-introduction",
  "choose-vague-introduction",
  "inspect-school-sign",
  "enter-school",
] as const;

export type StoryArcPlayerAction = (typeof STORYARC_PLAYER_ACTIONS)[number];

export type StoryArcDisplayEvent =
  | { type: "RELATIONSHIP"; characterId: "char-hana"; delta: number; label: string }
  | { type: "QUEST"; questId: "quest-new-semester"; label: string }
  | { type: "EXPRESSION_UNLOCK"; entryKey: string; label: string; futureRecallKey: string }
  | { type: "CHECKPOINT"; checkpointId: string; label: string };

export type StoryArcUnlockIntent = {
  kind: "EXPRESSION";
  entryKey: string;
  sourceIntentKey: string;
  futureRecallKey: string;
};

export type StoryArcTransitionResult = {
  state: StoryArcPlayerSnapshot;
  xpDelta: number;
  displayEvents: StoryArcDisplayEvent[];
  unlocks: StoryArcUnlockIntent[];
};

export class StoryArcTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoryArcTransitionError";
  }
}

export function createInitialStoryArcPlayerState(now = new Date()): StoryArcPlayerSnapshot {
  return {
    currentArcId: "arc-first-bell",
    currentEpisodeId: "sm-g10-01",
    currentSceneId: "scene-school-gate",
    checkpointId: "gate-arrival",
    completedNodeIds: [],
    questState: {
      newSemester: { status: "STARTED", updatedAt: now.toISOString() },
    },
    relationshipState: { hana: 0 },
    decisionState: {},
    storyXp: 0,
    storyLevel: 1,
    stateVersion: 1,
  };
}

function levelForXp(storyXp: number) {
  return Math.max(1, Math.floor(storyXp / 100) + 1);
}

export function applyStoryArcPlayerAction(
  current: StoryArcPlayerSnapshot,
  action: StoryArcPlayerAction,
  now = new Date(),
): StoryArcTransitionResult {
  const next: StoryArcPlayerSnapshot = structuredClone(current);
  const displayEvents: StoryArcDisplayEvent[] = [];
  const unlocks: StoryArcUnlockIntent[] = [];
  let xpDelta = 0;

  if (current.currentSceneId !== "scene-school-gate") {
    throw new StoryArcTransitionError("The School Gate scene has already been completed.");
  }

  if (action.startsWith("choose-") && current.decisionState.introductionChoice) {
    throw new StoryArcTransitionError("The introduction choice has already been recorded.");
  }

  if (action === "choose-natural-introduction") {
    next.decisionState.introductionChoice = "natural";
    next.relationshipState.hana += 2;
    next.questState.newSemester = { status: "INTRODUCED", updatedAt: now.toISOString() };
    next.checkpointId = "hana-introduction-complete";
    next.completedNodeIds = [...new Set([...next.completedNodeIds, "dialogue-introduction"] )];
    xpDelta = 15;
    displayEvents.push(
      { type: "RELATIONSHIP", characterId: "char-hana", delta: 2, label: "Hana appreciates the natural response." },
      { type: "QUEST", questId: "quest-new-semester", label: "Quest updated: Make your first connection." },
      {
        type: "EXPRESSION_UNLOCK",
        entryKey: "exp-getting-used-to-it",
        label: "Expression unlocked: getting used to it",
        futureRecallKey: "recall-getting-used-to-it",
      },
    );
    unlocks.push({
      kind: "EXPRESSION",
      entryKey: "exp-getting-used-to-it",
      sourceIntentKey: "intent-natural-new-school-response",
      futureRecallKey: "recall-getting-used-to-it",
    });
  } else if (action === "choose-formal-introduction") {
    next.decisionState.introductionChoice = "formal";
    next.relationshipState.hana += 1;
    next.questState.newSemester = { status: "INTRODUCED", updatedAt: now.toISOString() };
    next.checkpointId = "hana-introduction-complete";
    next.completedNodeIds = [...new Set([...next.completedNodeIds, "dialogue-introduction"] )];
    xpDelta = 10;
    displayEvents.push(
      { type: "RELATIONSHIP", characterId: "char-hana", delta: 1, label: "Hana smiles at the very formal introduction." },
      { type: "QUEST", questId: "quest-new-semester", label: "Quest updated: Make your first connection." },
    );
  } else if (action === "choose-vague-introduction") {
    next.decisionState.introductionChoice = "vague";
    next.questState.newSemester = { status: "INTRODUCED", updatedAt: now.toISOString() };
    next.checkpointId = "hana-introduction-complete";
    next.completedNodeIds = [...new Set([...next.completedNodeIds, "dialogue-introduction"] )];
    xpDelta = 8;
    displayEvents.push(
      { type: "RELATIONSHIP", characterId: "char-hana", delta: 0, label: "Hana stays friendly, but needs more to continue." },
      { type: "QUEST", questId: "quest-new-semester", label: "Quest updated: Make your first connection." },
    );
  } else if (action === "inspect-school-sign") {
    if (!current.decisionState.introductionChoice) {
      throw new StoryArcTransitionError("Meet Hana before inspecting the campus hotspots.");
    }
    next.questState.newSemester = { status: "GATE_INSPECTED", updatedAt: now.toISOString() };
    next.checkpointId = "gate-sign-inspected";
    displayEvents.push({ type: "QUEST", questId: "quest-new-semester", label: "Hotspot discovered: The Bridge Club notice." });
  } else if (action === "enter-school") {
    if (!current.decisionState.introductionChoice) {
      throw new StoryArcTransitionError("Meet Hana before entering the campus.");
    }
    if (current.questState.newSemester.status === "COMPLETE" || current.completedNodeIds.includes("school-gate")) {
      throw new StoryArcTransitionError("The School Gate scene has already been completed.");
    }
    next.currentSceneId = "scene-courtyard-preview";
    next.checkpointId = "courtyard-arrival";
    next.questState.newSemester = { status: "COMPLETE", updatedAt: now.toISOString() };
    next.completedNodeIds = [...new Set([...next.completedNodeIds, "school-gate"] )];
    xpDelta = 20;
    displayEvents.push(
      { type: "QUEST", questId: "quest-new-semester", label: "Quest complete: Through the School Gate." },
      { type: "CHECKPOINT", checkpointId: "courtyard-arrival", label: "Checkpoint saved: Courtyard." },
    );
  }

  next.storyXp += xpDelta;
  next.storyLevel = levelForXp(next.storyXp);
  next.stateVersion += 1;
  return { state: next, xpDelta, displayEvents, unlocks };
}

export function applyStoryArcCommandOnce(
  current: StoryArcPlayerSnapshot,
  action: StoryArcPlayerAction,
  idempotencyKey: string,
  appliedKeys: ReadonlySet<string>,
) {
  if (appliedKeys.has(idempotencyKey)) {
    return { duplicate: true as const, state: current, xpDelta: 0 };
  }
  const result = applyStoryArcPlayerAction(current, action);
  return { duplicate: false as const, ...result };
}

export function isStoryArcPlayerAction(value: unknown): value is StoryArcPlayerAction {
  return typeof value === "string" && (STORYARC_PLAYER_ACTIONS as readonly string[]).includes(value);
}
