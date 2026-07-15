export const STORYARC_APP_SLUG = "storyarc" as const;
export const STORYARC_SCHEMA_VERSION = "storyarc.content.v1" as const;
export const STORYARC_DEMO_STABLE_ID = "sm-g10-01" as const;
export const STORYARC_DEMO_SCENE_ID = "scene-school-gate" as const;

export const STORYARC_GRADES = ["GRADE_10", "GRADE_11", "GRADE_12"] as const;
export const STORYARC_TRACKS = ["SCHOOL_CORE", "STORY_MODE", "EXAM_LAB"] as const;
export const STORYARC_PHASES = ["PHASE_E", "PHASE_F"] as const;
export const STORYARC_SKILLS = [
  "LISTENING",
  "SPEAKING",
  "READING",
  "WRITING",
  "GRAMMAR",
  "VOCABULARY",
] as const;

export const STORYARC_EVIDENCE_CLASSES = [
  "EXPOSURE",
  "PRACTICE",
  "ASSESSED_EVIDENCE",
  "RECALL_EVIDENCE",
] as const;

export type StoryArcGradeKey = (typeof STORYARC_GRADES)[number];
export type StoryArcTrackKey = (typeof STORYARC_TRACKS)[number];
export type StoryArcSkillKey = (typeof STORYARC_SKILLS)[number];
export type StoryArcEvidenceClassKey = (typeof STORYARC_EVIDENCE_CLASSES)[number];

export function expectedPhaseForGrade(grade: StoryArcGradeKey) {
  return grade === "GRADE_10" ? "PHASE_E" : "PHASE_F";
}
