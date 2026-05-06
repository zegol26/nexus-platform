import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { canAccessLesson } from "@/lib/nexus/access-guards";

const alwaysAccessibleLessonSlugs = new Set([
  "hiragana-foundation",
  "katakana-foundation",
  "kanji-n5-foundation",
  "kanji-n4-foundation",
]);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const lesson = await prisma.nihongoLesson.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
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

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const isFoundationCharacterLesson =
      Boolean(lesson.slug) && alwaysAccessibleLessonSlugs.has(lesson.slug!);
    const access =
      isAdmin || isFoundationCharacterLesson
        ? { allowed: true, plan: isAdmin ? "ADMIN" : "FOUNDATION" }
        : await canAccessLesson(user.id, lesson.order);
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason ?? "Lesson locked for your plan.", access }, { status: 403 });
    }

    const characterContent = lesson.slug
      ? await prisma.nihongoCharacterContent.findMany({
          where: { lessonSlug: lesson.slug },
          orderBy: [{ type: "asc" }, { level: "asc" }, { order: "asc" }],
        })
      : [];

    return NextResponse.json({
      lesson,
      defaultTemplate: lesson.templates.find((template) => template.variant === 1) ?? null,
      lessonCache: {
        count: lesson.templates.length,
        max: 3,
        variants: lesson.templates.map((template) => template.variant),
      },
      access,
      listeningAsset: lesson.listeningAsset,
      characterContent,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load lesson" },
      { status: 500 }
    );
  }
}
