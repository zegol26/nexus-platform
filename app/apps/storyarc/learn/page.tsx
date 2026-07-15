import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export default async function StoryArcLearnPage() {
  const items = await prisma.storyArcContentRevision.findMany({
    where: { state: "PUBLISHED", item: { track: "SCHOOL_CORE" } },
    include: { item: true },
    orderBy: [{ item: { grade: "asc" } }, { item: { stableId: "asc" } }],
  });

  return (
    <section>
      <p className="text-xs font-black tracking-[0.25em] text-cyan-300">LEARN · SCHOOL CORE</p>
      <h1 className="mt-3 text-3xl font-black text-white">English you can use when the story gets real.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
        Open a published lesson for listening, guided practice, production, and a mastery check. Each lesson connects directly to its Story episode.
      </p>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-cyan-300/20 bg-cyan-300/[0.04] p-6 text-sm text-slate-300">
            No School Core items are published yet.
          </div>
        ) : items.map((revision, index) => (
          <Link
            key={revision.id}
            href={`/apps/storyarc/learn/${revision.item.stableId}`}
            className="group rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-300/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-cyan-300">{revision.item.grade.replace("GRADE_", "Grade ")} · Lesson {String(index + 1).padStart(2, "0")}</p>
                <h2 className="mt-2 text-lg font-bold text-white">{revision.title}</h2>
              </div>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-black tracking-wider text-cyan-200">OPEN</span>
            </div>
            <p className="mt-5 text-sm font-bold text-cyan-200 transition group-hover:translate-x-1">Start lesson →</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
