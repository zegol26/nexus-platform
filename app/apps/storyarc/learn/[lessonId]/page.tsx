import Link from "next/link";
import { notFound } from "next/navigation";
import { StoryArcLessonPlayer } from "@/components/apps/storyarc/learn/StoryArcLessonPlayer";
import { prisma } from "@/lib/db/prisma";
import { normalizeStoryArcLesson } from "@/lib/storyarc/learning/lesson-runtime";

export default async function StoryArcLessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const revision = await prisma.storyArcContentRevision.findFirst({
    where: {
      state: "PUBLISHED",
      item: { stableId: lessonId, track: "SCHOOL_CORE" },
    },
    include: { item: true },
    orderBy: { revision: "desc" },
  });

  if (!revision) notFound();
  const lesson = normalizeStoryArcLesson(revision.payload, {
    id: revision.item.stableId,
    title: revision.title,
    grade: revision.item.grade.replace("GRADE_", "Grade "),
  });

  return (
    <section>
      <Link href="/apps/storyarc/learn" className="text-xs font-black tracking-[0.16em] text-cyan-300 hover:text-white">← SCHOOL CORE</Link>
      <StoryArcLessonPlayer lesson={lesson} />
    </section>
  );
}
