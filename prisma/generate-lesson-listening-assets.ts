import "dotenv/config";
import { prisma } from "./seed-client";
import { generateListeningAudio, generateListeningScript } from "../lib/nihongo/lessons/generateListeningAsset";

async function main() {
  const lessons = await prisma.nihongoLesson.findMany({
    orderBy: { order: "asc" },
    include: {
      listeningAsset: true,
    },
  });

  console.log(`Found ${lessons.length} Nihongo lessons.`);

  for (const lesson of lessons) {
    if (lesson.listeningAsset) {
      console.log(`Skipping ${lesson.title}: listening asset already exists.`);
      continue;
    }

    const script = await generateListeningScript(lesson);
    const audio = await generateListeningAudio({
      lessonId: lesson.id,
      scriptJapanese: script.scriptJapanese,
    });

    await prisma.nihongoLessonListeningAsset.create({
      data: {
        lessonId: lesson.id,
        scriptJapanese: script.scriptJapanese,
        scriptRomaji: script.scriptRomaji,
        translationId: script.translationId,
        audioUrl: audio.audioUrl,
        audioMimeType: audio.audioMimeType,
        audioProvider: audio.audioProvider,
        durationSec: audio.durationSec,
      },
    });

    console.log(
      `Created listening asset for ${lesson.title}${audio.audioUrl ? ` with audio ${audio.audioUrl}` : " without audio"}`
    );
  }
}

main()
  .then(async () => {
    console.log("Listening asset generation complete.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
