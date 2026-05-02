import { englishInterviewQuestions } from "../lib/english/interview/questions";
import { generateEnglishInterviewTtsBase64 } from "../lib/english/interview/tts";
import { prisma } from "./seed-client";

export async function seedEnglishInterview() {
  let count = 0;

  for (const question of englishInterviewQuestions) {
    const existing = await prisma.englishInterviewQuestion.findUnique({
      where: { sourceKey: question.sourceKey },
    });

    const audio =
      existing?.audioBase64
        ? {
            audioBase64: existing.audioBase64,
            audioMimeType: existing.audioMimeType,
            audioProvider: existing.audioProvider,
          }
        : await generateEnglishInterviewTtsBase64(question.audioText);

    await prisma.englishInterviewQuestion.upsert({
      where: { sourceKey: question.sourceKey },
      update: {
        order: question.order,
        prompt: question.prompt,
        focusArea: question.focusArea,
        expectedDuration: question.expectedDuration,
        audioText: question.audioText,
        audioBase64: audio.audioBase64,
        audioMimeType: audio.audioMimeType,
        audioProvider: audio.audioProvider,
        isActive: true,
      },
      create: {
        sourceKey: question.sourceKey,
        order: question.order,
        prompt: question.prompt,
        focusArea: question.focusArea,
        expectedDuration: question.expectedDuration,
        audioText: question.audioText,
        audioBase64: audio.audioBase64,
        audioMimeType: audio.audioMimeType,
        audioProvider: audio.audioProvider,
        isActive: true,
      },
    });

    count += 1;
  }

  console.log(`English interview questions seeded: ${count}`);
}
