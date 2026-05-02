import type { NihongoLessonContent } from "./lessonContentTypes";

export function renderLessonContentMarkdown(content: NihongoLessonContent) {
  const examples = content.japaneseExamples
    .map(
      (example, index) =>
        `${index + 1}. ${example.japanese}\n   Romaji: ${example.romaji}\n   Arti: ${example.translationIndonesian}`
    )
    .join("\n\n");

  return `# ${content.lessonTitle}

Level: ${content.level}

## Objective
${content.objective}

## Penjelasan
${content.explanationIndonesian}

## Contoh Jepang
${examples}

## Grammar Notes
${content.grammarNotes.map((note) => `- ${note}`).join("\n")}

## Common Mistakes
${content.commonMistakes.map((mistake) => `- ${mistake}`).join("\n")}

## Mini Practice
${content.miniPractice.map((practice, index) => `${index + 1}. ${practice}`).join("\n")}

## Answer Key
${content.answerKey.map((answer, index) => `${index + 1}. ${answer}`).join("\n")}

## Summary
${content.summary}

## Recommended Next Step
${content.recommendedNextStep}`;
}
