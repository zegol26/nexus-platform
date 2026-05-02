export type NihongoLessonContent = {
  lessonTitle: string;
  level: string;
  objective: string;
  explanationIndonesian: string;
  japaneseExamples: Array<{
    japanese: string;
    romaji: string;
    translationIndonesian: string;
  }>;
  grammarNotes: string[];
  commonMistakes: string[];
  miniPractice: string[];
  answerKey: string[];
  summary: string;
  recommendedNextStep: string;
};

export type NihongoLessonTemplateVariant = 1 | 2 | 3;

export type LessonInput = {
  id: string;
  title: string;
  description: string | null;
  level: string;
  module: string | null;
  lessonType: string | null;
};

export type NihongoListeningContent = {
  scriptJapanese: string;
  scriptRomaji: string;
  translationId: string;
};
