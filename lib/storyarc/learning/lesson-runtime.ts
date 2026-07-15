export type LessonChoice = {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type LessonBlock = {
  type: string;
  title?: string;
  instruction?: string;
  canDo?: string;
  prompts?: string[];
  explanation?: string;
  patterns?: { text: string; note: string }[];
  transcript?: string;
  listeningTasks?: { prompt: string; answer: string; explanation: string }[];
  choices?: LessonChoice[];
  transforms?: { prompt: string; answer: string; explanation: string }[];
  productionPrompt?: string;
  support?: string[];
  storyItemId?: string;
  note?: string;
};

export type StoryArcLesson = {
  id: string;
  title: string;
  grade: string;
  blocks: LessonBlock[];
  vocabulary: { term: string; meaning: string; partOfSpeech: string }[];
};

export type StoryArcDialogueTurn = { speaker: string; text: string };

export function parseStoryArcDialogueTranscript(transcript: string): StoryArcDialogueTurn[] {
  const marker = /(?:^|\s)([A-Za-z][A-Za-z0-9 _-]{0,18}):\s*/g;
  const matches = [...transcript.matchAll(marker)];
  if (matches.length < 2) return transcript.trim() ? [{ speaker: "Narrator", text: transcript.trim() }] : [];
  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? transcript.length;
    return { speaker: match[1].trim(), text: transcript.slice(start, end).trim() };
  }).filter((turn) => turn.text);
}

type JsonObject = Record<string, unknown>;

const object = (value: unknown): JsonObject => value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {};
const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const string = (value: unknown): string => typeof value === "string" ? value : "";
const strings = (value: unknown): string[] => array(value).map(string).filter(Boolean);
const number = (value: unknown): number => typeof value === "number" && Number.isInteger(value) ? value : -1;

export function normalizeStoryArcLesson(payload: unknown, meta: Pick<StoryArcLesson, "id" | "title" | "grade">): StoryArcLesson {
  const root = object(payload);
  const blocks = array(root.lessonBlocks).map((raw): LessonBlock | null => {
    const block = object(raw);
    const type = string(block.blockType);
    if (!type || type === "rubric-definition") return null;
    const tasks = array(block.tasks).map(object);
    const questions = array(block.questions).map(object);
    return {
      type,
      title: string(block.titleEn),
      instruction: string(block.instructionId),
      canDo: string(block.canDoEn),
      prompts: strings(block.promptsEn),
      explanation: string(block.explanationId),
      patterns: array(block.patterns).map(object).map((item) => ({ text: string(item.en), note: string(item.noteId) })).filter((item) => item.text),
      transcript: string(block.transcriptEn),
      listeningTasks: tasks.filter((task) => string(task.answerEn)).map((task) => ({ prompt: string(task.promptEn), answer: string(task.answerEn), explanation: string(task.explanationId) })),
      choices: [...tasks, ...questions].filter((task) => array(task.optionsEn).length > 0).map((task) => ({
        prompt: string(task.promptEn), options: strings(task.optionsEn), answerIndex: number(task.answerIndex), explanation: string(task.explanationId),
      })),
      transforms: tasks.filter((task) => string(task.type) === "transform").map((task) => ({ prompt: string(task.promptEn), answer: string(task.answerEn), explanation: string(task.explanationId) })),
      productionPrompt: string(block.promptEn),
      support: strings(block.supportEn),
      storyItemId: string(block.storyItemId),
      note: string(block.noteId),
    };
  }).filter((block): block is LessonBlock => block !== null);

  const vocabulary = array(root.vocabulary).map(object).map((entry) => ({
    term: string(entry.term),
    meaning: string(entry.meaningId).replaceAll("-", " "),
    partOfSpeech: string(entry.partOfSpeech),
  })).filter((entry) => entry.term);

  return { ...meta, blocks, vocabulary };
}
