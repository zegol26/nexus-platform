import { AdminSection } from "@/components/admin/AdminTable";
import { prisma } from "@/lib/db/prisma";

export default async function AdminLessonsPage() {
  const lessons = await prisma.nihongoLesson.findMany({
    include: { _count: { select: { templates: true, tutorMessages: true } } },
    orderBy: { order: "asc" },
  });

  return (
    <AdminSection title="Lessons" description="View lessons and cache coverage.">
      <div className="grid gap-3 md:grid-cols-2">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
            <p className="font-semibold">{lesson.order}. {lesson.title}</p>
            <p className="mt-1 text-slate-500">{lesson.level} - cache {lesson._count.templates}/3 - tutor messages {lesson._count.tutorMessages}</p>
          </div>
        ))}
      </div>
    </AdminSection>
  );
}
