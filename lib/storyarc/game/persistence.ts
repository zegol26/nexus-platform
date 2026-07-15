import type { StoryArcPlayerState } from "@prisma/client";
import type { StoryArcDecisionState, StoryArcPlayerSnapshot, StoryArcQuestState, StoryArcRelationshipState } from "./state";

export function playerRowToSnapshot(row: StoryArcPlayerState): StoryArcPlayerSnapshot {
  return {
    currentArcId: row.currentArcId,
    currentEpisodeId: row.currentEpisodeId,
    currentSceneId: row.currentSceneId,
    checkpointId: row.checkpointId,
    completedNodeIds: row.completedNodeIds,
    questState: row.questState as StoryArcQuestState,
    relationshipState: row.relationshipState as StoryArcRelationshipState,
    decisionState: row.decisionState as StoryArcDecisionState,
    storyXp: row.storyXp,
    storyLevel: row.storyLevel,
    stateVersion: row.stateVersion,
  };
}

export function snapshotCreateData(userId: string, snapshot: StoryArcPlayerSnapshot) {
  return {
    userId,
    currentArcId: snapshot.currentArcId,
    currentEpisodeId: snapshot.currentEpisodeId,
    currentSceneId: snapshot.currentSceneId,
    checkpointId: snapshot.checkpointId,
    completedNodeIds: snapshot.completedNodeIds,
    questState: snapshot.questState,
    relationshipState: snapshot.relationshipState,
    decisionState: snapshot.decisionState,
    storyXp: snapshot.storyXp,
    storyLevel: snapshot.storyLevel,
    stateVersion: snapshot.stateVersion,
  };
}

export function snapshotUpdateData(snapshot: StoryArcPlayerSnapshot) {
  return {
    currentArcId: snapshot.currentArcId,
    currentEpisodeId: snapshot.currentEpisodeId,
    currentSceneId: snapshot.currentSceneId,
    checkpointId: snapshot.checkpointId,
    completedNodeIds: snapshot.completedNodeIds,
    questState: snapshot.questState,
    relationshipState: snapshot.relationshipState,
    decisionState: snapshot.decisionState,
    storyXp: snapshot.storyXp,
    storyLevel: snapshot.storyLevel,
    stateVersion: snapshot.stateVersion,
    lastSavedAt: new Date(),
  };
}
