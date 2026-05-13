export type ArabicType = "fusha" | "saudi" | "mixed";

export type ArabicTargetSkill =
  | "daily"
  | "work"
  | "umrah"
  | "travel"
  | "dialect";

export type ArabicLevelId =
  | "L1_FOUNDATION"
  | "L2_DAILY"
  | "L3_WORK"
  | "L4_UMRAH"
  | "L5_TRAVEL"
  | "L6_DIALECT";

export type ArabicVocabularyItem = {
  arabic: string;
  transliteration: string;
  meaningId: string;
  usageNote?: string;
  type: ArabicType;
};

export type ArabicDialogueLine = {
  speaker: string;
  arabic: string;
  transliteration: string;
  meaningId: string;
  type: ArabicType;
};

export type ArabicQuizQuestionType =
  | "vocabulary"
  | "meaning"
  | "situation"
  | "dialogue"
  | "work_instruction"
  | "umrah"
  | "saudi_expression";

export type ArabicQuizQuestion = {
  id: string;
  lessonId: string;
  questionType: ArabicQuizQuestionType;
  promptId: string;
  arabicText?: string;
  transliteration?: string;
  options: string[];
  correctAnswer: string;
  explanationId: string;
  difficulty: "easy" | "medium" | "hard";
};

export type ArabicLesson = {
  id: string;
  appSlug: "arabic";
  level: ArabicLevelId;
  levelTitle: string;
  moduleId: string;
  moduleTitle: string;
  lessonTitle: string;
  order: number;
  scenario: string;
  targetSkill: ArabicTargetSkill;
  arabicType: ArabicType;
  explanationId: string;
  saudiNote?: string;
  vocabulary: ArabicVocabularyItem[];
  dialogue: ArabicDialogueLine[];
  practicePrompts: string[];
  quiz: ArabicQuizQuestion[];
};

export type ArabicConversationScenario = {
  id: string;
  title: string;
  description: string;
  arabicContext: string;
  openingLine: ArabicDialogueLine;
  formality: "polite" | "casual";
};
