import type { StoryArcDisplayEvent, StoryArcPlayerSnapshot } from "./state";

export type StoryArcBootstrap = {
  content: { stableId: string; revisionId: string; revision: number; title: string; payload: unknown };
  player: { id: string; name: string };
  state: StoryArcPlayerSnapshot;
};

export type StoryArcCommandResponse = {
  duplicate: boolean;
  state: StoryArcPlayerSnapshot;
  displayEvents: StoryArcDisplayEvent[];
};
