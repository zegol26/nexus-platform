import { resolveStoryArcToeicPhoto, type StoryArcToeicPhoto } from "./toeic-photo-assets";

export type StoryArcExamQuestion = {
  id: string;
  prompt: string;
  passage?: string;
  audioText?: string;
  audioLabel?: string;
  photo?: StoryArcToeicPhoto;
  answerDisplay?: "full" | "letters";
  options: string[];
  answerIndex?: number;
  explanation?: string;
  rationales?: string[];
};

export type StoryArcExamSection = {
  id: string;
  title: string;
  skill: string;
  stimulus?: string;
  questions: StoryArcExamQuestion[];
};

export type StoryArcExam = {
  id: string;
  title: string;
  grade: string;
  mode: string;
  instruction: string;
  durationMinutes?: number;
  sections: StoryArcExamSection[];
  rubric: { title: string; description: string }[];
};

type JsonObject = Record<string, unknown>;
const object = (value: unknown): JsonObject => value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {};
const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const string = (value: unknown): string => typeof value === "string" ? value : "";
const strings = (value: unknown): string[] => array(value).map(string).filter(Boolean);

export function extractStoryArcListeningOptions(transcript: string) {
  const options: string[] = [];
  const pattern = /\(([A-D])\)\s*([\s\S]*?)(?=\s*\([A-D]\)\s*|$)/g;
  for (const match of transcript.matchAll(pattern)) {
    const option = match[2]?.trim();
    if (option) options.push(option);
  }
  return options;
}

export function composeStoryArcQuestionAudio(prompt: string, transcript: string) {
  const script = transcript.trim();
  if (!script) return undefined;

  const firstOptionIndex = script.search(/\([A-D]\)\s*/);
  const transcriptAlreadyHasStem =
    firstOptionIndex > 0 && script.slice(0, firstOptionIndex).trim().length > 0;

  // Question-response scripts already contain the spoken Q before option A.
  // Photo/direct items begin at option A, so prepend the learner-visible stem.
  return transcriptAlreadyHasStem ? script : `${prompt} ${script}`.trim();
}

function listeningPrompt(transcript: string) {
  const question = transcript.match(/^Q:\s*["“]?([\s\S]*?)["”]?\s*\(A\)/)?.[1]?.trim();
  return question ? `Choose the response that best answers: “${question.replace(/["”]\s*$/, "")}”` : "Listen and choose the best answer.";
}

function question(raw: unknown, fallbackId: string): StoryArcExamQuestion | null {
  const value = object(raw);
  const transcript = string(value.transcriptEn);
  const photo = resolveStoryArcToeicPhoto(value.imageBriefId);
  const isPhotoDescription = Boolean(string(value.imageBriefId));
  const authoredOptions = strings(value.optionsEn);
  const transcriptOptions = extractStoryArcListeningOptions(transcript);
  const isQuestionResponse = /^Q:\s*/i.test(transcript.trim()) && transcriptOptions.length >= 2;
  const prompt = isPhotoDescription
    ? "Select the sentence that best describes the photograph."
    : isQuestionResponse
      ? "Select the best response to the spoken question."
      : string(value.promptEn) || string(value.taskEn) || listeningPrompt(transcript);
  if (!prompt) return null;
  const answerIndex = typeof value.answerIndex === "number" ? value.answerIndex : undefined;
  const placeholderOptions = authoredOptions.length >= 2 && authoredOptions.every((option, index) => option === String.fromCharCode(65 + index));
  return {
    id: string(value.qid) || string(value.promptId) || string(value.taskId) || fallbackId,
    prompt,
    passage: string(value.passageEn) || undefined,
    audioText: isPhotoDescription ? transcript.trim() || undefined : composeStoryArcQuestionAudio(prompt, transcript),
    audioLabel: isPhotoDescription ? "Play descriptions" : isQuestionResponse ? "Play question and responses" : "Play full question",
    photo,
    answerDisplay: isPhotoDescription || isQuestionResponse ? "letters" : "full",
    options: placeholderOptions && transcriptOptions.length === authoredOptions.length ? transcriptOptions : authoredOptions,
    answerIndex,
    explanation: string(value.explanationId) || string(value.followUpIntentId) || undefined,
    rationales: strings(value.optionRationales),
  };
}

function questions(raw: unknown, prefix: string) {
  return array(raw).map((item, index) => question(item, `${prefix}-${index + 1}`)).filter((item): item is StoryArcExamQuestion => item !== null);
}

export function normalizeStoryArcExam(payload: unknown, meta: Pick<StoryArcExam, "id" | "title" | "grade">): StoryArcExam {
  const root = object(payload);
  const blocks = array(root.lessonBlocks).map(object);
  const examMeta = blocks.find((block) => block.blockType === "exam-meta") ?? {};
  const sections: StoryArcExamSection[] = [];

  for (const [blockIndex, block] of blocks.entries()) {
    const type = string(block.blockType);
    if (type === "exam-section") {
      const sectionId = string(block.sectionId) || `section-${blockIndex + 1}`;
      const skill = string(block.skill) || "ENGLISH";
      const directQuestions = questions(block.questions, sectionId);
      const taskQuestions = questions(block.tasks, `${sectionId}-task`);
      if (directQuestions.length || taskQuestions.length || string(block.textEn) || string(block.transcriptEn) || string(block.taskIntro) || string(block.providedAdEn)) {
        sections.push({
          id: sectionId,
          title: `${skill.replaceAll("_", " ")} · Section ${sections.length + 1}`,
          skill,
          stimulus: string(block.textEn) || string(block.transcriptEn) || string(block.taskIntro) || string(block.providedAdEn) || undefined,
          questions: [...directQuestions, ...taskQuestions],
        });
      }
      for (const [index, itemRaw] of [...array(block.conversations), ...array(block.talks)].entries()) {
        const item = object(itemRaw);
        const itemId = string(item.convId) || string(item.talkId) || `${sectionId}-audio-${index + 1}`;
        sections.push({
          id: itemId,
          title: `${skill.replaceAll("_", " ")} · Set ${index + 1}`,
          skill,
          stimulus: string(item.transcriptEn) || undefined,
          questions: questions(item.questions, itemId),
        });
      }
    } else if (type === "john-interview") {
      const john = object(block.johnContent);
      sections.push({
        id: `john-interview-${blockIndex}`,
        title: "John Interview",
        skill: "SPEAKING",
        stimulus: string(john.learningContextId) || string(john.tutorGoal) || undefined,
        questions: questions(block.prompts, "john"),
      });
    } else if (type === "presentation-task") {
      const followUps = questions(block.questions, "presentation-followup");
      const main = question({ qid: "presentation-main", promptEn: block.taskEn, followUpIntentId: block.providedDataEn }, "presentation-main");
      sections.push({
        id: `presentation-${blockIndex}`,
        title: "Presentation Task",
        skill: "SPEAKING",
        stimulus: string(block.providedDataEn) || undefined,
        questions: [...(main ? [main] : []), ...followUps],
      });
    }
  }

  const rubric = blocks.filter((block) => block.blockType === "rubric-definition").flatMap((block) => array(block.criteria).map(object).map((criterion) => ({
    title: string(criterion.titleEn),
    description: string(criterion.descriptorId),
  })).filter((criterion) => criterion.title));

  return {
    ...meta,
    mode: string(examMeta.modeId) || "PRACTICE",
    instruction: string(examMeta.instructionId) || string(examMeta.disclaimerId) || "Complete every section and review your rationale.",
    durationMinutes: typeof examMeta.timeSuggestionMinutes === "number" ? examMeta.timeSuggestionMinutes : undefined,
    sections,
    rubric,
  };
}
