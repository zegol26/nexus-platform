import "dotenv/config";
import { prisma } from "./seed-client";
import { generateLessonTemplate } from "../lib/nihongo/lessons/generateLessonTemplates";
import { validateLessonTemplateContent, validateTemplateRequest } from "../lib/nihongo/lessons/validateLessonContent";
import type { NihongoLessonTemplateVariant } from "../lib/nihongo/lessons/lessonContentTypes";

const variants: NihongoLessonTemplateVariant[] = [1, 2, 3];
const force = process.argv.includes("--force");

async function main() {
  const lessons = await prisma.nihongoLesson.findMany({
    orderBy: { order: "asc" },
    include: {
      templates: true,
    },
  });

  console.log(`Found ${lessons.length} Nihongo lessons.`);

  for (const lesson of lessons) {
    const existingVariants = force ? [] : lesson.templates.map((template) => template.variant);
    console.log(`Lesson ${lesson.order}: ${lesson.title} existing variants: ${existingVariants.join(", ") || "none"}`);

    for (const variant of variants) {
      const requestValidation = validateTemplateRequest({
        lesson,
        variant,
        existingVariants,
      });

      if (!requestValidation.valid) {
        console.log(`Skipping variant ${variant}: ${requestValidation.errors.join("; ")}`);
        continue;
      }

      const generated = await generateLessonTemplate(lesson, variant);
      const contentValidation = validateLessonTemplateContent(generated.contentJson);

      if (!contentValidation.valid) {
        console.log(`Skipped invalid template for ${lesson.title} v${variant}: ${contentValidation.errors.join("; ")}`);
        continue;
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

      console.log(`${force ? "Regenerated" : "Created"} template v${variant} for ${lesson.title}.`);
    }
  }
}

main()
  .then(async () => {
    console.log("Lesson template generation complete.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
