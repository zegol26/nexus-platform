import { readdir } from "fs/promises";
import path from "path";
import { prisma } from "./seed-client";
import { generateLessonTemplate } from "../lib/nihongo/lessons/generateLessonTemplates";
import { validateLessonTemplateContent } from "../lib/nihongo/lessons/validateLessonContent";
import type { NihongoLessonTemplateVariant } from "../lib/nihongo/lessons/lessonContentTypes";

const templateVariants: NihongoLessonTemplateVariant[] = [1, 2, 3];

export async function seedNihongoLessonContent() {
  const lessons = await prisma.nihongoLesson.findMany({
    orderBy: { order: "asc" },
    include: {
      templates: true,
      listeningAsset: true,
    },
  });

  const staticAudioUrls = await listStaticListeningAudioUrls();
  let templateCount = 0;
  let listeningCount = 0;

  for (const lesson of lessons) {
    for (const variant of templateVariants) {
      const generated = await generateLessonTemplate(lesson, variant);
      const validation = validateLessonTemplateContent(generated.contentJson);

      if (!validation.valid) {
        throw new Error(`Invalid lesson template ${lesson.title} v${variant}: ${validation.errors.join("; ")}`);
      }

      await prisma.nihongoLessonTemplate.upsert({
        where: {
          lessonId_variant: {
            lessonId: lesson.id,
            variant,
          },
        },
        update: {
          title: generated.title,
          contentJson: generated.contentJson,
          contentMd: generated.contentMd,
          level: generated.level,
          topic: generated.topic,
        },
        create: {
          lessonId: lesson.id,
          variant,
          title: generated.title,
          contentJson: generated.contentJson,
          contentMd: generated.contentMd,
          level: generated.level,
          topic: generated.topic,
        },
      });

      templateCount += 1;
    }

    const audioUrl = staticAudioUrls[lesson.order - 1] ?? null;
    const script = buildListeningScript(lesson.title);

    await prisma.nihongoLessonListeningAsset.upsert({
      where: { lessonId: lesson.id },
      update: {
        scriptJapanese: script.scriptJapanese,
        scriptRomaji: script.scriptRomaji,
        translationId: script.translationId,
        audioUrl,
        audioMimeType: audioUrl ? "audio/mpeg" : null,
        audioProvider: audioUrl ? "static-seed" : "not_configured",
      },
      create: {
        lessonId: lesson.id,
        scriptJapanese: script.scriptJapanese,
        scriptRomaji: script.scriptRomaji,
        translationId: script.translationId,
        audioUrl,
        audioMimeType: audioUrl ? "audio/mpeg" : null,
        audioProvider: audioUrl ? "static-seed" : "not_configured",
      },
    });

    listeningCount += 1;
  }

  console.log(`Nihongo lesson templates seeded: ${templateCount}`);
  console.log(`Nihongo listening assets seeded: ${listeningCount}`);
}

async function listStaticListeningAudioUrls() {
  const audioDir = path.join(process.cwd(), "public", "generated-audio", "nihongo", "lessons");

  try {
    const files = await readdir(audioDir);
    return files
      .filter((file) => file.toLowerCase().endsWith(".mp3"))
      .sort()
      .map((file) => `/generated-audio/nihongo/lessons/${file}`);
  } catch {
    return [];
  }
}

function buildListeningScript(lessonTitle: string) {
  return {
    scriptJapanese:
      `今日は「${lessonTitle}」を勉強します。先生の説明を聞いて、短い文を練習します。ゆっくり読んで、もう一度言います。毎日少しずつ上手になります。`,
    scriptRomaji:
      `Kyou wa "${lessonTitle}" o benkyou shimasu. Sensei no setsumei o kiite, mijikai bun o renshuu shimasu. Yukkuri yonde, mou ichido iimasu. Mainichi sukoshi zutsu jouzu ni narimasu.`,
    translationId:
      `Hari ini kita belajar "${lessonTitle}". Dengarkan penjelasan guru dan latih kalimat pendek. Baca pelan-pelan, lalu ucapkan sekali lagi. Setiap hari kamu akan makin mahir sedikit demi sedikit.`,
  };
}
