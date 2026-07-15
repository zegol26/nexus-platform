import type { StoryArcPlayerSnapshot } from "./state";

export type StoryArcEpisodeChoice = {
  id: string;
  text: string;
  nextNodeId: string;
  actionType: string;
  classification: "NARRATIVE_CHOICE" | "LEARNING_PRACTICE" | "ASSESSED_INTERACTION" | "RECALL_EVIDENCE";
  feedback: { message: string; modelUtterance: string };
};

export type StoryArcEpisodeNode = {
  id: string;
  speakerId: string;
  text: string;
  expressionState: "neutral" | "warm" | "surprised" | "concerned";
  nextNodeId?: string;
  terminal: boolean;
  choices: StoryArcEpisodeChoice[];
};

export type StoryArcEpisodeScene = {
  sceneId: string;
  locationId: string;
  entryNodeId: string;
  dialogueNodes: StoryArcEpisodeNode[];
  hotspots: Array<{ id: string; label: string; actionType: string }>;
};

export type StoryArcEpisodePayload = {
  arcId?: string;
  episodeId?: string;
  scene: StoryArcEpisodeScene;
};

export type StoryArcEpisodeProgress = {
  currentNodeId: string;
  completedChoiceIds: string[];
  inspectedHotspotIds: string[];
  completed: boolean;
};

export type StoryArcEpisodeCommand =
  | { type: "choice"; nodeId: string; choiceId: string }
  | { type: "continue"; nodeId: string; nextNodeId: string }
  | { type: "hotspot"; hotspotId: string }
  | { type: "replay" };

type EpisodeDecisionState = StoryArcPlayerSnapshot["decisionState"] & {
  episodes?: Record<string, StoryArcEpisodeProgress>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseStoryArcEpisodePayload(value: unknown): StoryArcEpisodePayload {
  if (!isRecord(value) || !isRecord(value.scene)) throw new Error("Published StoryArc episode has no scene payload.");
  const scene = value.scene as Record<string, unknown>;
  if (typeof scene.sceneId !== "string" || typeof scene.locationId !== "string" || typeof scene.entryNodeId !== "string" || !Array.isArray(scene.dialogueNodes) || !Array.isArray(scene.hotspots)) {
    throw new Error("Published StoryArc episode scene is malformed.");
  }
  return value as StoryArcEpisodePayload;
}

export function getStoryArcEpisodeProgress(snapshot: StoryArcPlayerSnapshot, stableId: string, entryNodeId: string) {
  const decisions = snapshot.decisionState as EpisodeDecisionState;
  return decisions.episodes?.[stableId] ?? {
    currentNodeId: entryNodeId,
    completedChoiceIds: [],
    inspectedHotspotIds: [],
    completed: false,
  };
}

export function isNodeReachableWithoutChoice(scene: StoryArcEpisodeScene, fromNodeId: string, targetNodeId: string) {
  const visited = new Set<string>();
  let currentId: string | undefined = fromNodeId;
  while (currentId && !visited.has(currentId)) {
    if (currentId === targetNodeId) return true;
    visited.add(currentId);
    const node = scene.dialogueNodes.find((candidate) => candidate.id === currentId);
    if (!node || node.choices.length > 0 || node.terminal) return false;
    currentId = node.nextNodeId;
  }
  return false;
}

export function applyStoryArcEpisodeCommand(params: {
  snapshot: StoryArcPlayerSnapshot;
  stableId: string;
  payload: StoryArcEpisodePayload;
  command: StoryArcEpisodeCommand;
}) {
  const { snapshot, stableId, payload, command } = params;
  const scene = payload.scene;
  const current = getStoryArcEpisodeProgress(snapshot, stableId, scene.entryNodeId);
  const nextProgress: StoryArcEpisodeProgress = structuredClone(current);
  // Older clients replayed locally without persisting the reset. Treat a
  // command from the opening path as an implicit replay when the saved episode
  // is terminal, while retaining completed choice IDs for reward protection.
  const reachabilityCheckpoint = current.completed ? scene.entryNodeId : current.currentNodeId;
  let actionType: string;
  let sourceNodeId: string;
  let xpDelta = 0;
  let feedback = "Progress saved.";
  let relationshipCharacter: string | null = null;
  let relationshipDelta = 0;

  if (command.type === "replay") {
    nextProgress.currentNodeId = scene.entryNodeId;
    nextProgress.completed = false;
    actionType = "episode-replay";
    sourceNodeId = current.currentNodeId;
    feedback = "Episode replayed from the opening scene. Previous rewards remain saved.";
  } else if (command.type === "choice") {
    if (!isNodeReachableWithoutChoice(scene, reachabilityCheckpoint, command.nodeId)) {
      throw new Error("That dialogue choice is not available at the current checkpoint.");
    }
    const node = scene.dialogueNodes.find((candidate) => candidate.id === command.nodeId);
    const choice = node?.choices.find((candidate) => candidate.id === command.choiceId);
    if (!node || !choice) throw new Error("The selected dialogue choice does not exist in this revision.");
    const alreadyRewarded = current.completedChoiceIds.includes(choice.id);
    const destination = scene.dialogueNodes.find((candidate) => candidate.id === choice.nextNodeId);
    if (!destination) throw new Error("The selected dialogue destination is missing.");
    nextProgress.currentNodeId = destination.id;
    nextProgress.completedChoiceIds = [...new Set([...nextProgress.completedChoiceIds, choice.id])];
    nextProgress.completed = destination.terminal;
    actionType = choice.actionType;
    sourceNodeId = node.id;
    xpDelta = alreadyRewarded ? 0 : choice.classification === "RECALL_EVIDENCE" ? 15 : choice.classification === "ASSESSED_INTERACTION" ? 12 : 8;
    feedback = alreadyRewarded ? `${choice.feedback.message} Replay rewards unchanged.` : choice.feedback.message;
    const relationshipMatch = choice.actionType.match(/^([a-z0-9]+)-trust-(up|down)$/);
    if (relationshipMatch && !alreadyRewarded) {
      relationshipCharacter = relationshipMatch[1];
      relationshipDelta = relationshipMatch[2] === "up" ? 1 : -1;
    }
  } else if (command.type === "continue") {
    if (!isNodeReachableWithoutChoice(scene, reachabilityCheckpoint, command.nodeId)) {
      throw new Error("That dialogue continuation is not available at the current checkpoint.");
    }
    const node = scene.dialogueNodes.find((candidate) => candidate.id === command.nodeId);
    if (!node || node.choices.length > 0 || node.nextNodeId !== command.nextNodeId) {
      throw new Error("The dialogue continuation does not exist in this revision.");
    }
    const destination = scene.dialogueNodes.find((candidate) => candidate.id === command.nextNodeId);
    if (!destination) throw new Error("The dialogue continuation destination is missing.");
    nextProgress.currentNodeId = destination.id;
    nextProgress.completed = destination.terminal;
    actionType = "dialogue-continue";
    sourceNodeId = node.id;
    feedback = destination.terminal ? "Episode completed." : "Dialogue continued.";
  } else {
    const hotspot = scene.hotspots.find((candidate) => candidate.id === command.hotspotId);
    if (!hotspot) throw new Error("The selected hotspot does not exist in this revision.");
    const currentNode = scene.dialogueNodes.find((candidate) => candidate.id === current.currentNodeId);
    if (!current.completed && !currentNode?.terminal) throw new Error("Finish the dialogue before inspecting this hotspot.");
    if (current.inspectedHotspotIds.includes(hotspot.id)) {
      return { duplicate: true as const, snapshot, progress: current, actionType: hotspot.actionType, sourceNodeId: hotspot.id, xpDelta: 0, feedback: `${hotspot.label} was already inspected.` };
    }
    nextProgress.inspectedHotspotIds = [...new Set([...nextProgress.inspectedHotspotIds, hotspot.id])];
    actionType = hotspot.actionType;
    sourceNodeId = hotspot.id;
    xpDelta = 2;
    feedback = `Hotspot discovered: ${hotspot.label}`;
  }

  const next: StoryArcPlayerSnapshot = structuredClone(snapshot);
  const decisions = next.decisionState as EpisodeDecisionState;
  decisions.episodes = { ...(decisions.episodes ?? {}), [stableId]: nextProgress };
  next.currentArcId = payload.arcId ?? next.currentArcId;
  next.currentEpisodeId = stableId;
  next.currentSceneId = scene.sceneId;
  next.checkpointId = nextProgress.completed ? `${stableId}-complete` : nextProgress.currentNodeId;
  if (nextProgress.completed) next.completedNodeIds = [...new Set([...next.completedNodeIds, stableId])];
  if (relationshipCharacter) {
    const relationships = next.relationshipState as Record<string, number>;
    relationships[relationshipCharacter] = (relationships[relationshipCharacter] ?? 0) + relationshipDelta;
  }
  next.storyXp += xpDelta;
  next.storyLevel = Math.max(1, Math.floor(next.storyXp / 100) + 1);
  next.stateVersion += 1;

  return { duplicate: false as const, snapshot: next, progress: nextProgress, actionType, sourceNodeId, xpDelta, feedback };
}
