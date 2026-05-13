// Schema for the Dynamic Conversational English (DCE) curriculum.
// Mirrors the CEFR-mapped JSON briefing the curriculum designer wrote
// in AGENTS.md, with extra slots for concrete generative artefacts.

export type DceLevelId = "A1_A2" | "B1_B2" | "C1";

export type DceComprehensionQuestion = {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  rationale?: string;
};

export type DceReadingPassage = {
  id: string;
  title: string;
  text: string;
  estReadMinutes: number;
  questions: DceComprehensionQuestion[];
};

export type DceListeningItem = {
  id: string;
  title: string;
  level?: "A1" | "A2" | "B1" | "B2" | "C1";
  section?: string;
  audioUrl?: string;
  audioFile?: string;
  transcript?: string;
  requiresManualAudioReview?: boolean;
  // Script that the TTS endpoint can synthesize on the fly. Keep it
  // dialogue-heavy so learners can shadow real speech.
  script: string;
  speakers: string[];
  durationSec: number;
  questions: DceComprehensionQuestion[];
};

export type DceGapFill = {
  id: string;
  prompt: string;          // sentence with `____` placeholder
  options: string[];
  answerIndex: number;
  rationale?: string;
};

export type DceGrammarDrill = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  rationale?: string;
  targetStructure: string; // e.g. "Present Perfect"
};

export type DceRoleplay = {
  id: string;
  scenario: string;
  goal: string;
  personaSlug: string;     // links to DcePersona registry
  turns: number;
  openingLine: string;
};

export type DceDialogueLine = {
  speaker: string;
  text: string;
  translationId?: string;  // optional Indonesian gloss
};

export type DceDialogue = {
  id: string;
  title: string;
  lines: DceDialogueLine[];
  questions: DceComprehensionQuestion[];
};

export type DceModule = {
  slug: string;
  topic: string;
  summary: string;
  functionalLanguage: string[];
  vocabularyThemes: string[];
  grammarInContext: string[];
  reading: DceReadingPassage[];
  listening: DceListeningItem[];
  vocabulary: DceGapFill[];
  grammar: DceGrammarDrill[];
  dialogue: DceDialogue[];
  roleplay: DceRoleplay[];
};

export type DceLevel = {
  level: DceLevelId;
  name: string;
  focus: string;
  cefrRange: string;
  badgeColor: string;       // tailwind colour class fragment
  modules: DceModule[];
};

export type DcePersona = {
  slug: string;
  name: string;
  role: string;
  personality: string;
  voiceHint: string;        // hint for the TTS instructions block
  recommendedLevel: DceLevelId;
};
