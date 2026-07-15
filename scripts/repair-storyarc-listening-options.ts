import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

type JsonObject = Record<string, unknown>;

const object = (value: unknown): JsonObject | null => value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : null;
const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

function extractOptions(transcript: string) {
  const options: string[] = [];
  const pattern = /\(([A-D])\)\s*([\s\S]*?)(?=\s*\([A-D]\)\s*|$)/g;
  for (const match of transcript.matchAll(pattern)) {
    const option = match[2]?.trim();
    if (option) options.push(option);
  }
  return options;
}

function derivePrompt(transcript: string) {
  const question = transcript.match(/^Q:\s*["“]?([\s\S]*?)["”]?\s*\(A\)/)?.[1]?.trim().replace(/["”]\s*$/, "");
  return question ? `Choose the response that best answers: “${question}”` : null;
}

function questionObjects(block: JsonObject) {
  const questions = [...array(block.questions), ...array(block.tasks), ...array(block.prompts)];
  for (const parent of [...array(block.conversations), ...array(block.talks)]) {
    const value = object(parent);
    if (value) questions.push(...array(value.questions));
  }
  return questions.map(object).filter((value): value is JsonObject => value !== null);
}

const directory = path.join(process.cwd(), "prisma", "data", "storyarc");
const files = readdirSync(directory).filter((file) => file.endsWith(".json")).sort();
const repaired: { file: string; stableId: string; questionId: string }[] = [];

for (const file of files) {
  const filePath = path.join(directory, file);
  const pkg = JSON.parse(readFileSync(filePath, "utf8")) as JsonObject;
  let fileChanged = false;

  for (const itemRaw of array(pkg.items)) {
    const item = object(itemRaw);
    const content = object(item?.content);
    if (!item || !content) continue;
    let itemChanged = false;

    for (const blockRaw of array(content.lessonBlocks)) {
      const block = object(blockRaw);
      if (!block) continue;
      for (const question of questionObjects(block)) {
        const options = array(question.optionsEn).filter((value): value is string => typeof value === "string");
        const transcript = typeof question.transcriptEn === "string" ? question.transcriptEn : "";
        const placeholderOptions = options.length >= 2 && options.every((option, index) => option === String.fromCharCode(65 + index));
        if (!placeholderOptions || !transcript) continue;
        const expanded = extractOptions(transcript);
        if (expanded.length !== options.length) throw new Error(`Cannot repair ${String(item.stableId)}:${String(question.qid)}; transcript/options count mismatch.`);
        question.optionsEn = expanded;
        if (typeof question.promptEn !== "string" || !question.promptEn.trim()) {
          const prompt = derivePrompt(transcript);
          if (prompt) question.promptEn = prompt;
        }
        itemChanged = true;
        repaired.push({ file, stableId: String(item.stableId), questionId: String(question.qid ?? question.promptId ?? "unknown") });
      }
    }

    if (itemChanged) {
      item.revision = Number(item.revision) + 1;
      fileChanged = true;
    }
  }

  if (fileChanged) writeFileSync(filePath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify({ repairedCount: repaired.length, repaired }, null, 2));
