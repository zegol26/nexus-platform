import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { getArabicLesson } from "@/lib/arabic/curriculum";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId } = await params;
  const lesson = getArabicLesson(lessonId);

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  let completed = false;
  if (user) {
    const completion = await prisma.analyticsEvent.findFirst({
      where: {
        userId: user.id,
        appSlug: "arabic",
        eventType: "LESSON_COMPLETED",
        lessonId,
      },
      select: { id: true },
    });
    completed = Boolean(completion);
  }

  return NextResponse.json({ lesson, completed });
}
