import fs from "node:fs";
import path from "node:path";
import { countModuleQuestions, dceCurriculum } from "./index";
import { TARGET_PER_ACTIVITY } from "./question-expander";
import type {
  DceComprehensionQuestion,
  DceGapFill,
  DceGrammarDrill,
  DceListeningItem,
  DceModule,
} from "./types";

export type EnglishSanityIssue = {
  severity: "warning" | "error";
  itemId: string;
  section: string;
  level: string;
  audio?: string;
  transcriptPreview?: string;
  issue: string;
  suggestedFix: string;
};

export type EnglishSanityResult = {
  checked: number;
  warnings: EnglishSanityIssue[];
  errors: EnglishSanityIssue[];
};

const vagueQuestionPatterns = [
  /^choose the correct answer\.?$/i,
  /^select the best option\.?$/i,
  /^answer the question\.?$/i,
  /^listen and answer\.?$/i,
  /^which word appears\b/i,
];

export function getListeningTranscript(item: DceListeningItem) {
  return (item.transcript ?? item.script).trim();
}

function addIssue(
  issues: EnglishSanityIssue[],
  issue: Omit<EnglishSanityIssue, "transcriptPreview"> & { transcript?: string }
) {
  issues.push({
    ...issue,
    transcriptPreview: issue.transcript?.slice(0, 160),
  });
}

function correctAnswer(question: DceComprehensionQuestion | DceGapFill | DceGrammarDrill) {
  return question.options[question.answerIndex];
}

function validateQuestionCore(params: {
  issues: EnglishSanityIssue[];
  level: string;
  section: string;
  itemId: string;
  questionId: string;
  questionText: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
  transcript?: string;
  skillType: string;
}) {
  const contextId = `${params.itemId}/${params.questionId}`;
  const questionText = params.questionText.trim();
  const answer = params.options[params.answerIndex];

  if (!questionText) {
    addIssue(params.issues, {
      severity: "error",
      itemId: contextId,
      section: params.section,
      level: params.level,
      issue: "Question text is missing.",
      suggestedFix: "Write a clear, specific instruction for this question.",
      transcript: params.transcript,
    });
  }

  if (vagueQuestionPatterns.some((pattern) => pattern.test(questionText))) {
    addIssue(params.issues, {
      severity: "error",
      itemId: contextId,
      section: params.section,
      level: params.level,
      issue: "Question instruction is too vague.",
      suggestedFix: "Ask a specific who, what, where, when, why, how, or sentence-completion target.",
      transcript: params.transcript,
    });
  }

  if (!answer) {
    addIssue(params.issues, {
      severity: "error",
      itemId: contextId,
      section: params.section,
      level: params.level,
      issue: "Correct answer is missing or answerIndex is out of range.",
      suggestedFix: "Set answerIndex to a valid option.",
      transcript: params.transcript,
    });
  }

  const normalizedOptions = params.options.map((option) => option.trim().toLocaleLowerCase());
  if (new Set(normalizedOptions).size !== normalizedOptions.length) {
    addIssue(params.issues, {
      severity: "error",
      itemId: contextId,
      section: params.section,
      level: params.level,
      issue: "Question has duplicate options.",
      suggestedFix: "Replace repeated distractors with plausible but clearly wrong alternatives.",
      transcript: params.transcript,
    });
  }

  if (!params.explanation?.trim()) {
    addIssue(params.issues, {
      severity: "warning",
      itemId: contextId,
      section: params.section,
      level: params.level,
      issue: "Question has no explanation or rationale.",
      suggestedFix: "Add a short explanation that points to the grammar rule or source text.",
      transcript: params.transcript,
    });
  }

  if (params.skillType === "listening" && answer && params.transcript) {
    const normalizedTranscript = params.transcript.toLocaleLowerCase();
    const normalizedAnswer = answer.toLocaleLowerCase();
    const meaningfulWords = normalizedAnswer
      .split(/[^a-z0-9$]+/i)
      .filter((word) => word.length > 2);
    const supported =
      normalizedTranscript.includes(normalizedAnswer) ||
      meaningfulWords.some((word) => normalizedTranscript.includes(word));
    if (!supported) {
      addIssue(params.issues, {
        severity: "warning",
        itemId: contextId,
        section: params.section,
        level: params.level,
        issue: "Listening answer is not obviously supported by the transcript.",
        suggestedFix: "Check the transcript and rewrite either the answer or the question so the support is explicit.",
        transcript: params.transcript,
      });
    }
  }
}

function validateComprehensionQuestions(params: {
  issues: EnglishSanityIssue[];
  level: string;
  section: string;
  itemId: string;
  questions: DceComprehensionQuestion[];
  transcript?: string;
  skillType: "reading" | "listening" | "conversation";
}) {
  const seen = new Set<string>();
  for (const question of params.questions) {
    const key = question.question.trim().toLocaleLowerCase();
    if (seen.has(key)) {
      addIssue(params.issues, {
        severity: "error",
        itemId: `${params.itemId}/${question.id}`,
        section: params.section,
        level: params.level,
        issue: "Duplicate question text in the same section item.",
        suggestedFix: "Rewrite one duplicate so each question checks a different target.",
        transcript: params.transcript,
      });
    }
    seen.add(key);

    validateQuestionCore({
      issues: params.issues,
      level: params.level,
      section: params.section,
      itemId: params.itemId,
      questionId: question.id,
      questionText: question.question,
      options: question.options,
      answerIndex: question.answerIndex,
      explanation: question.rationale,
      transcript: params.transcript,
      skillType: params.skillType,
    });
  }
}

function validateDrills(params: {
  issues: EnglishSanityIssue[];
  level: string;
  section: string;
  itemId: string;
  items: Array<DceGapFill | DceGrammarDrill>;
  skillType: "vocabulary" | "grammar";
}) {
  for (const item of params.items) {
    validateQuestionCore({
      issues: params.issues,
      level: params.level,
      section: params.section,
      itemId: params.itemId,
      questionId: item.id,
      questionText: item.prompt,
      options: item.options,
      answerIndex: item.answerIndex,
      explanation: item.rationale,
      skillType: params.skillType,
    });
  }
}

function hasDialogueFormat(transcript: string, speakers: string[]) {
  const labels = speakers.map((speaker) => `${speaker}:`);
  const lines = transcript.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return labels.length >= 2 && lines.length >= 4 && lines.every((line) => labels.some((label) => line.startsWith(label)));
}

export function validateEnglishListeningData(rootDir = process.cwd()): EnglishSanityResult {
  const issues: EnglishSanityIssue[] = [];
  let checked = 0;
  const listeningIds = new Set<string>();

  for (const level of dceCurriculum) {
    for (const module of level.modules) {
      for (const item of module.listening) {
        checked += 1;
        listeningIds.add(item.id);
        const transcript = getListeningTranscript(item);
        const audio = item.audioUrl ?? item.audioFile ?? "generated TTS";

        if (!transcript) {
          addIssue(issues, {
            severity: "error",
            itemId: item.id,
            section: module.topic,
            level: level.level,
            audio,
            issue: "Listening item has no transcript/script.",
            suggestedFix: "Add a transcript or script that matches the listening task.",
            transcript,
          });
        }

        if ((level.level === "A1_A2" || item.level === "A1" || item.level === "A2") && !hasDialogueFormat(transcript, item.speakers)) {
          addIssue(issues, {
            severity: "error",
            itemId: item.id,
            section: module.topic,
            level: level.level,
            audio,
            issue: "Foundation A1-A2 listening transcript is not in clear dialogue format.",
            suggestedFix: "Use short lines with speaker labels such as A: and B:.",
            transcript,
          });
        }

        if ((item.audioUrl || item.audioFile) && item.audioFile) {
          const audioPath = path.join(rootDir, "public", item.audioFile.replace(/^\/+/, ""));
          if (!fs.existsSync(audioPath)) {
            addIssue(issues, {
              severity: "error",
              itemId: item.id,
              section: module.topic,
              level: level.level,
              audio,
              issue: "Listening item references a missing audio file.",
              suggestedFix: "Generate the audio file or update the audioFile reference.",
              transcript,
            });
          }
        }

        if (!item.audioUrl && !item.audioFile && !item.requiresManualAudioReview) {
          addIssue(issues, {
            severity: "warning",
            itemId: item.id,
            section: module.topic,
            level: level.level,
            audio,
            issue: "Listening item uses generated TTS and has no permanent audio metadata.",
            suggestedFix: "This is allowed, but set requiresManualAudioReview when the generated voice needs manual QA.",
            transcript,
          });
        }

        validateComprehensionQuestions({
          issues,
          level: level.level,
          section: module.topic,
          itemId: item.id,
          questions: item.questions,
          transcript,
          skillType: "listening",
        });
      }
    }
  }

  const audioDir = path.join(rootDir, "public", "audio", "english");
  if (fs.existsSync(audioDir)) {
    const files = fs.readdirSync(audioDir, { recursive: true }).filter((entry) => String(entry).match(/\.(mp3|wav|m4a|ogg)$/i));
    for (const file of files) {
      const stem = path.basename(String(file)).replace(/\.(mp3|wav|m4a|ogg)$/i, "");
      if (![...listeningIds].some((id) => stem.includes(id) || id.includes(stem))) {
        addIssue(issues, {
          severity: "warning",
          itemId: stem,
          section: "Audio library",
          level: "English",
          audio: String(file),
          issue: "Possible orphan audio file without a listening item.",
          suggestedFix: "Map this audio file to a listening item or remove it if unused.",
        });
      }
    }
  }

  return splitIssues(checked, issues);
}

export function validateEnglishQuestionData(): EnglishSanityResult {
  const issues: EnglishSanityIssue[] = [];
  let checked = 0;

  for (const level of dceCurriculum) {
    for (const module of level.modules) {
      checked += countModuleQuestions(module).total;
      validateModuleQuestionCount(issues, level.level, module);

      for (const passage of module.reading) {
        validateComprehensionQuestions({
          issues,
          level: level.level,
          section: module.topic,
          itemId: passage.id,
          questions: passage.questions,
          transcript: passage.text,
          skillType: "reading",
        });
      }

      for (const item of module.listening) {
        validateComprehensionQuestions({
          issues,
          level: level.level,
          section: module.topic,
          itemId: item.id,
          questions: item.questions,
          transcript: getListeningTranscript(item),
          skillType: "listening",
        });
      }

      for (const dialogue of module.dialogue) {
        validateComprehensionQuestions({
          issues,
          level: level.level,
          section: module.topic,
          itemId: dialogue.id,
          questions: dialogue.questions,
          transcript: dialogue.lines.map((line) => `${line.speaker}: ${line.text}`).join("\n"),
          skillType: "conversation",
        });
      }

      validateDrills({
        issues,
        level: level.level,
        section: module.topic,
        itemId: `${module.slug}/vocabulary`,
        items: module.vocabulary,
        skillType: "vocabulary",
      });
      validateDrills({
        issues,
        level: level.level,
        section: module.topic,
        itemId: `${module.slug}/grammar`,
        items: module.grammar,
        skillType: "grammar",
      });
    }
  }

  return splitIssues(checked, issues);
}

function validateModuleQuestionCount(issues: EnglishSanityIssue[], level: string, module: DceModule) {
  const total = countModuleQuestions(module).total;
  const counts = countModuleQuestions(module);
  const categoryCounts = {
    reading: counts.reading,
    listening: counts.listening,
    vocabulary: counts.vocabulary,
    grammar: counts.grammar,
    dialogue: counts.dialogue,
  };

  for (const [category, count] of Object.entries(categoryCounts)) {
    if (count < TARGET_PER_ACTIVITY) {
      addIssue(issues, {
        severity: "error",
        itemId: `${module.slug}/${category}`,
        section: module.topic,
        level,
        issue: `${category} has ${count} questions; expected at least ${TARGET_PER_ACTIVITY}.`,
        suggestedFix: `Add more ${category} questions so this module reaches ${TARGET_PER_ACTIVITY} ${category} items.`,
      });
    }
  }

  if (total < TARGET_PER_ACTIVITY * 5) {
    addIssue(issues, {
      severity: "error",
      itemId: module.slug,
      section: module.topic,
      level,
      issue: `Section has ${total} questions; expected at least ${TARGET_PER_ACTIVITY * 5}.`,
      suggestedFix: "Add 25 questions in each area: reading, listening, vocabulary, grammar, and dialogue.",
    });
  }
}

function splitIssues(checked: number, issues: EnglishSanityIssue[]): EnglishSanityResult {
  return {
    checked,
    warnings: issues.filter((issue) => issue.severity === "warning"),
    errors: issues.filter((issue) => issue.severity === "error"),
  };
}
