import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser, isStoryArcTeacherRole } from "@/lib/storyarc/access";
import { getStoryArcAssignmentAvailability } from "@/lib/storyarc/classroom/policy";
import { normalizeStoryArcExam } from "@/lib/storyarc/exam/exam-runtime";

const modeLabels: Record<string, string> = { SCHOOL_EXAM: "School Exam", TOEIC_STYLE: "TOEIC-style", INTERVIEW: "Interview", MOCK_EXAM: "Mock Exam" };

export default async function StoryArcExamLabPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getStoryArcSessionUser();
  if (!user) return null;
  const query = await searchParams;
  const memberships = isStoryArcTeacherRole(user.role) ? [] : await prisma.storyArcClassMember.findMany({ where: { learnerId: user.id }, select: { classId: true } });
  const revisions = await prisma.storyArcContentRevision.findMany({ where: { state: "PUBLISHED", item: { track: "EXAM_LAB" } }, include: { item: true }, orderBy: { item: { stableId: "asc" } } });
  const assignments = memberships.length ? await prisma.storyArcAssignment.findMany({ where: { classId: { in: memberships.map((item) => item.classId) }, revision: { item: { track: "EXAM_LAB" } } } }) : [];
  const assignmentByRevision = new Map(assignments.map((assignment) => [assignment.revisionId, assignment]));
  const visible = memberships.length ? revisions.filter((revision) => assignmentByRevision.has(revision.id)) : revisions;
  const exams = visible.map((revision) => ({ revision, assignment: assignmentByRevision.get(revision.id), exam: normalizeStoryArcExam(revision.payload, { id: revision.item.stableId, title: revision.title, grade: revision.item.grade.replace("GRADE_", "Grade ") }) }));

  return <section>
    <p className="storyarc-eyebrow">EXAM LAB / PROVE</p>
    <h1 className="mt-3 text-3xl font-black text-white">Practice with evidence and rationale.</h1>
    {query.error ? <p className="storyarc-alert storyarc-alert-error">{query.error}</p> : null}
    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{memberships.length ? "Your teacher controls when assigned practice sets unlock. Locked cards show timing but never expose questions before release." : "Open one of the published practice sets. Selected-response items include answer rationale; speaking and writing tasks retain their published rubric prompts."}</p>
    <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{exams.map(({ exam, assignment }) => {
      const locked = assignment ? getStoryArcAssignmentAvailability(assignment.availableFrom, assignment.dueAt) === "LOCKED" : false;
      const content = <><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-fuchsia-300/10 px-3 py-1 text-[10px] font-black text-fuchsia-200">{locked ? "DRIP LOCKED" : modeLabels[exam.mode] ?? exam.mode.replaceAll("_", " ")}</span><span className="text-xs text-slate-500">{exam.grade}</span></div><h2 className="mt-4 text-lg font-black text-white">{exam.title}</h2><p className="mt-3 text-xs text-slate-400">{locked ? `Available ${assignment?.availableFrom.toLocaleString("id-ID")}` : `${exam.sections.length} sections${exam.durationMinutes ? ` / ${exam.durationMinutes} min` : ""}`}</p><p className="mt-5 text-sm font-black text-fuchsia-200">{locked ? "Questions hidden until release" : "Open exam ->"}</p></>;
      return locked ? <article key={exam.id} className="rounded-3xl border border-fuchsia-300/10 bg-fuchsia-300/[0.025] p-5 opacity-70">{content}</article> : <Link key={exam.id} href={`/apps/storyarc/exam-lab/${exam.id}${assignment ? `?assignment=${assignment.id}` : ""}`} className="group rounded-3xl border border-fuchsia-300/15 bg-fuchsia-300/[0.04] p-5 transition hover:-translate-y-1 hover:border-fuchsia-300/40">{content}</Link>;
    })}</div>
  </section>;
}
