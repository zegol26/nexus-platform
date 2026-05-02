import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const lesson = await prisma.nihongoLesson.findUnique({
      where: { id },
      include: {
        templates: {
          orderBy: { variant: "asc" },
        },
        listeningAsset: true,
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      lesson,
      defaultTemplate: lesson.templates.find((template) => template.variant === 1) ?? null,
      listeningAsset: lesson.listeningAsset,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load lesson" },
      { status: 500 }
    );
  }
}
