import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { generateLessonTemplate } from "@/lib/nihongo/lessons/generateLessonTemplates";
import { isTemplateVariant, validateLessonTemplateContent } from "@/lib/nihongo/lessons/validateLessonContent";
import { normalizeRequestedVariant, selectLessonTemplateVariant } from "@/lib/nihongo/lesson-cache-policy";

export async function POST(
  request: Request,
  context: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { currentStep?: number; requestedVariant?: number };
  const requestedVariant = normalizeRequestedVariant(body.requestedVariant ?? body.currentStep ?? 1);

  const lesson = await prisma.nihongoLesson.findUnique({
    where: { id: lessonId },
    include: {
      templates: {
        orderBy: { variant: "asc" },
      },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const template = await getOrCreateCachedTemplate(lesson, requestedVariant);
  const cacheCount = await prisma.nihongoLessonTemplate.count({
    where: { lessonId: lesson.id },
  });

  return NextResponse.json({
    source: "cached_template",
    template,
    cacheCount,
    maxCacheCount: 3,
  });
}

async function getOrCreateCachedTemplate(
  lesson: {
    id: string;
    title: string;
    description: string | null;
    level: string;
    module: string | null;
    lessonType: string | null;
    templates?: Array<{ variant: number }>;
  },
  requestedVariant: 1 | 2 | 3
) {
  const variant = selectLessonTemplateVariant({
    cachedVariants: (lesson.templates ?? []).map((template) => template.variant),
    requestedVariant,
  });

  const existing = await prisma.nihongoLessonTemplate.findUnique({
    where: {
      lessonId_variant: {
        lessonId: lesson.id,
        variant,
      },
    },
  });

  if (existing) return existing;

  if (!isTemplateVariant(variant)) {
    throw new Error("Invalid template variant.");
  }

  const generated = await generateLessonTemplate(lesson, variant);
  const validation = validateLessonTemplateContent(generated.contentJson);

  if (!validation.valid) {
    throw new Error(`Generated template failed validation: ${validation.errors.join("; ")}`);
  }

  return prisma.nihongoLessonTemplate.create({
    data: {
      lessonId: lesson.id,
      variant,
      title: generated.title,
      contentJson: generated.contentJson as Prisma.InputJsonObject,
      contentMd: generated.contentMd,
      level: generated.level,
      topic: generated.topic,
    },
  });
}
