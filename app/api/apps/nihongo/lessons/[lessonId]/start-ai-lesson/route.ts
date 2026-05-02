import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { generateLessonTemplate } from "@/lib/nihongo/lessons/generateLessonTemplates";
import { renderLessonContentMarkdown } from "@/lib/nihongo/lessons/renderLessonContent";
import { isTemplateVariant, validateLessonTemplateContent } from "@/lib/nihongo/lessons/validateLessonContent";

export async function POST(
  request: Request,
  context: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await context.params;
  const session = await getServerSession(authOptions);
  const body = (await request.json()) as { currentStep?: number; requestedVariant?: number };
  const requestedVariant = Number(body.requestedVariant ?? body.currentStep ?? 2);

  const lesson = await prisma.nihongoLesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  if (requestedVariant === 2 || requestedVariant === 3) {
    const template = await getOrCreateCachedTemplate(lesson, requestedVariant);
    return NextResponse.json({
      source: "cached_template",
      template,
    });
  }

  const generated = await generateLessonTemplate(lesson, 3);
  const contentJson = {
    ...generated.contentJson,
    lessonTitle: `${lesson.title} - AI Fresh Session`,
    recommendedNextStep:
      "Simpan poin yang masih membingungkan, lalu tanyakan ke AI Tutor di panel lesson ini.",
  };

  const contentMd = renderLessonContentMarkdown(contentJson);
  const saved = await prisma.nihongoLessonGeneratedContent.create({
    data: {
      lessonId: lesson.id,
      userId: session?.user?.email
        ? (await prisma.user.findUnique({ where: { email: session.user.email } }))?.id
        : undefined,
      promptType: `fresh_ai_step_${requestedVariant}`,
      contentJson: contentJson as Prisma.InputJsonObject,
      contentMd,
    },
  });

  return NextResponse.json({
    source: "fresh_ai_generated",
    generatedContent: saved,
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
  },
  variant: 2 | 3
) {
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
