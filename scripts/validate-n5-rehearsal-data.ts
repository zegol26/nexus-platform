import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  n5RehearsalSections,
  rehearsalCategories,
  type RehearsalSection,
} from "../app/apps/nihongo/full-rehearsal-n5/n5RehearsalData";

const allowedCategories = new Set<RehearsalSection["category"]>(
  rehearsalCategories
    .map((category) => category.id)
    .filter((id): id is RehearsalSection["category"] => id !== "all")
);

const forbiddenWords = [
  "gue",
  "gw",
  "lo",
  "lu",
  "bro",
  "coy",
  "anjir",
  "anjay",
  "bangsat",
  "kampungan",
  "wkwk",
];

const uiFilesToAudit = [
  "app/apps/nihongo/full-rehearsal-n5/page.tsx",
  "app/apps/nihongo/full-rehearsal-n5/n5RehearsalData.ts",
  "components/nihongo/rehearsal/RehearsalSectionCard.tsx",
  "components/nihongo/rehearsal/RehearsalProgress.tsx",
  "components/nihongo/rehearsal/RehearsalFilters.tsx",
  "components/apps/nihongo/NihongoSidebar.tsx",
];

const errors: string[] = [];
const sectionIds = new Set<string>();

for (const section of n5RehearsalSections) {
  if (!section.id) errors.push(`Section order ${section.order} tidak punya id.`);
  if (sectionIds.has(section.id)) errors.push(`Duplicate section id: ${section.id}`);
  sectionIds.add(section.id);

  if (!section.title) errors.push(`${section.id} tidak punya title.`);
  if (!section.category) errors.push(`${section.id} tidak punya category.`);
  if (!allowedCategories.has(section.category)) {
    errors.push(`${section.id} memakai category tidak valid: ${section.category}`);
  }
  if (!section.explanation) errors.push(`${section.id} tidak punya explanation.`);
  if (section.level !== "N5") errors.push(`${section.id} harus level N5.`);
  if (!section.examples.length && !section.exercises.length) {
    errors.push(`${section.id} harus punya minimal satu example atau exercise.`);
  }

  section.exercises.forEach((exercise, index) => {
    if (exercise.type === "multiple_choice") {
      if (!exercise.choices?.length) {
        errors.push(`${section.id} exercise ${index + 1} multiple_choice tidak punya choices.`);
      }
      if (!exercise.answer) {
        errors.push(`${section.id} exercise ${index + 1} multiple_choice tidak punya answer.`);
      }
      if (exercise.answer && exercise.choices && !exercise.choices.includes(exercise.answer)) {
        errors.push(`${section.id} exercise ${index + 1} answer tidak ada di choices.`);
      }
    }
  });
}

const dataText = JSON.stringify(n5RehearsalSections);
auditForbiddenWords("n5RehearsalSections", dataText);

for (const file of uiFilesToAudit) {
  const content = readFileSync(resolve(process.cwd(), file), "utf8");
  auditForbiddenWords(file, content);
}

if (errors.length) {
  console.error("Validasi N5 rehearsal gagal:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validasi N5 rehearsal berhasil: ${n5RehearsalSections.length} section siap dipakai.`);

function auditForbiddenWords(label: string, content: string) {
  for (const word of forbiddenWords) {
    const pattern = new RegExp(`(^|[^a-zA-Z])${escapeRegExp(word)}([^a-zA-Z]|$)`, "i");
    if (pattern.test(content)) {
      errors.push(`${label} mengandung kata terlarang: ${word}`);
    }
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
