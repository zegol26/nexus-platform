import { AdminSection } from "@/components/admin/AdminTable";
import { prisma } from "@/lib/db/prisma";

export default async function AdminLessonCachePage() {
  const lessons = await prisma.nihongoLesson.findMany({
    include: { templates: { orderBy: { variant: "asc" } } },
    orderBy: { order: "asc" },
  });

  return (
    <AdminSection title="Lesson Cache" description="View cached AI lesson template variants per lesson.">
      <div className="grid gap-3">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">{lesson.order}. {lesson.title}</p>
              <span className={lesson.templates.length >= 3 ? "text-emerald-700" : "text-amber-700"}>{lesson.templates.length}/3 cached</span>
            </div>
            <p className="mt-1 text-slate-500">Variants: {lesson.templates.map((template) => template.variant).join(", ") || "none"}</p>
          </div>
        ))}
      </div>
    </AdminSection>
  );
}
