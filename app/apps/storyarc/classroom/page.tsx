import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser, isStoryArcTeacherRole } from "@/lib/storyarc/access";
import { getStoryArcAssignmentAvailability, storyArcContentHref } from "@/lib/storyarc/classroom/policy";
import { createStoryArcAssignment, createStoryArcClass, enrollStoryArcLearner, joinStoryArcClass, scoreStoryArcAssignment, updateStoryArcAssignmentProgress } from "./actions";

const field = "rounded-xl border border-white/10 bg-[#101b42] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300";
const trackLabel = (track: string) => track === "EXAM_LAB" ? "Exam Lab" : track === "SCHOOL_CORE" ? "Lesson" : "Story";
const scoreLabel = (scorePercent: number | null) => scorePercent === null ? "Not graded" : `${Math.round(scorePercent)}%`;

export default async function StoryArcClassroomPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const [user, notice] = await Promise.all([getStoryArcSessionUser(), searchParams]);
  if (!user) return null;
  const staff = isStoryArcTeacherRole(user.role);
  const classes = staff ? await prisma.storyArcClass.findMany({
    where: user.role === "TEACHER" ? { teacherId: user.id } : {},
    include: {
      members: { include: { learner: { select: { id: true, name: true, email: true } } }, orderBy: { learner: { name: "asc" } } },
      assignments: { include: { revision: { include: { item: true } }, progress: true }, orderBy: { availableFrom: "desc" } },
    },
    orderBy: [{ grade: "asc" }, { section: "asc" }],
  }) : [];
  const published = staff ? await prisma.storyArcContentRevision.findMany({
    where: { state: "PUBLISHED" },
    include: { item: true },
    orderBy: [{ item: { grade: "asc" } }, { item: { track: "asc" } }, { title: "asc" }],
  }) : [];
  const memberships = !staff ? await prisma.storyArcClassMember.findMany({
    where: { learnerId: user.id },
    include: { classroom: { include: { teacher: { select: { name: true, email: true } }, assignments: { include: { revision: { include: { item: true } }, progress: { where: { learnerId: user.id } } }, orderBy: { availableFrom: "asc" } } } } },
  }) : [];

  return <section className="storyarc-classroom">
    <div className="storyarc-page-hero"><div><p className="storyarc-eyebrow">{staff ? "TEACHER COMMAND CENTER" : "MY ASSIGNMENTS"}</p><h1>{staff ? "Plan, monitor, and score learning quests." : "Your class missions and scores."}</h1><p>{staff ? "Create classes, schedule published content, and see every learner’s completion and score." : "Assignments unlock on your teacher’s schedule. Completed work and scores stay visible here."}</p></div><span className="storyarc-hero-badge">{staff ? "TEACHER" : `${memberships.length} CLASS${memberships.length === 1 ? "" : "ES"}`}</span></div>
    {notice.error ? <p className="storyarc-notice storyarc-notice-error">{notice.error}</p> : null}{notice.success ? <p className="storyarc-notice">{notice.success}</p> : null}
    {staff ? <>
      <div className="storyarc-teacher-tools">
        <form action={createStoryArcClass} className="storyarc-control-card"><h2>Create class</h2><div className="grid gap-3 sm:grid-cols-2"><select name="grade" className={field} required><option value="GRADE_10">Grade 10</option><option value="GRADE_11">Grade 11</option><option value="GRADE_12">Grade 12</option></select><input name="section" className={field} placeholder="Section, e.g. A" required /></div><input name="name" className={field} placeholder="Optional class name" /><button className="storyarc-primary-button">Create class</button></form>
        <div className="storyarc-control-card"><h2>Assignment flow</h2><ol><li>Choose published content.</li><li>Set release and deadline.</li><li>Monitor learner completion.</li><li>Review auto-scores or enter a teacher score.</li></ol></div>
      </div>
      <div className="mt-6 grid gap-5">{classes.length === 0 ? <div className="storyarc-control-card"><h2>No classes yet</h2><p>Create a class to start assigning StoryArc content.</p></div> : classes.map((classroom) => <article key={classroom.id} className="storyarc-class-card">
        <header><div><span>{classroom.grade.replace("GRADE_", "Grade ")} · {classroom.section}</span><h2>{classroom.name}</h2></div><code>JOIN {classroom.joinCode}</code></header>
        <div className="storyarc-class-columns"><div><h3>Learners · {classroom.members.length}</h3><form action={enrollStoryArcLearner} className="flex gap-2"><input type="hidden" name="classId" value={classroom.id} /><input name="email" type="email" className={`${field} min-w-0 flex-1`} placeholder="Registered learner email" required /><button className="storyarc-secondary-button">Enroll</button></form><ul>{classroom.members.map((member) => <li key={member.id}><span>{member.learner.name ?? "Learner"}</span><small>{member.learner.email}</small></li>)}</ul></div><div><h3>Schedule assignment</h3><form action={createStoryArcAssignment} className="grid gap-2"><input type="hidden" name="classId" value={classroom.id} /><select name="revisionId" className={field} required><option value="">Choose published content</option>{published.filter((revision) => revision.item.grade === classroom.grade).map((revision) => <option key={revision.id} value={revision.id}>{trackLabel(revision.item.track)} · {revision.title}</option>)}</select><input name="title" className={field} placeholder="Optional assignment title" /><textarea name="instructions" className={field} placeholder="Teacher instructions" /><div className="grid gap-2 sm:grid-cols-2"><label>Release<input name="availableFrom" type="datetime-local" className={field} required /></label><label>Deadline<input name="dueAt" type="datetime-local" className={field} /></label></div><button className="storyarc-primary-button">Schedule task</button></form></div></div>
        <div className="mt-5 grid gap-4">{classroom.assignments.length === 0 ? <p className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-400">No assignments scheduled yet.</p> : classroom.assignments.map((assignment) => {
          const completed = assignment.progress.filter((item) => item.status === "COMPLETED").length;
          const scored = assignment.progress.filter((item) => item.scorePercent !== null);
          const average = scored.length ? Math.round(scored.reduce((sum, item) => sum + (item.scorePercent ?? 0), 0) / scored.length) : null;
          return <section key={assignment.id} className="rounded-2xl border border-white/10 bg-black/15 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.15em] text-cyan-300">{trackLabel(assignment.revision.item.track)} · {assignment.availableFrom.toLocaleString("id-ID")}</p><h3 className="mt-1 text-lg font-black text-white">{assignment.title}</h3></div><div className="flex gap-2 text-xs"><span className="rounded-full bg-emerald-300/10 px-3 py-2 text-emerald-200">{completed}/{classroom.members.length} complete</span><span className="rounded-full bg-fuchsia-300/10 px-3 py-2 text-fuchsia-200">Avg {average === null ? "—" : `${average}%`}</span></div></div>
            <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="text-[10px] uppercase tracking-[.14em] text-slate-500"><tr><th className="pb-2">Learner</th><th className="pb-2">Status</th><th className="pb-2">Score</th><th className="pb-2">Teacher score</th></tr></thead><tbody>{classroom.members.map((member) => { const progress = assignment.progress.find((item) => item.learnerId === member.learner.id); return <tr key={member.id} className="border-t border-white/[.06]"><td className="py-3"><strong className="block text-white">{member.learner.name ?? "Learner"}</strong><span className="text-xs text-slate-500">{member.learner.email}</span></td><td className="py-3 text-slate-300">{progress?.status === "COMPLETED" ? "Completed" : progress?.status === "IN_PROGRESS" ? "In progress" : "Assigned"}</td><td className="py-3"><strong className={progress?.scorePercent === null || progress?.scorePercent === undefined ? "text-slate-500" : "text-emerald-300"}>{scoreLabel(progress?.scorePercent ?? null)}</strong>{progress?.scoreSource === "EXAM_LAB_AUTO" ? <small className="block text-[10px] text-slate-500">Exam auto-score</small> : progress?.scoreSource === "TEACHER" ? <small className="block text-[10px] text-slate-500">Teacher graded</small> : null}</td><td className="py-3"><form action={scoreStoryArcAssignment} className="flex items-center gap-2"><input type="hidden" name="assignmentId" value={assignment.id} /><input type="hidden" name="learnerId" value={member.learner.id} /><input name="scorePercent" type="number" min="0" max="100" step="1" defaultValue={progress?.scorePercent === null || progress?.scorePercent === undefined ? "" : Math.round(progress.scorePercent)} aria-label={`Score for ${member.learner.name ?? member.learner.email}`} className={`${field} w-24 py-2`} placeholder="0–100" required /><button className="storyarc-secondary-button">Save</button></form></td></tr>; })}</tbody></table></div>
          </section>;
        })}</div>
      </article>)}</div>
    </> : <>
      {memberships.length === 0 ? <form action={joinStoryArcClass} className="storyarc-control-card mx-auto mt-7 max-w-xl"><h2>Join your class</h2><p>Enter the code given by your teacher.</p><div className="mt-4 flex gap-2"><input name="joinCode" className={`${field} min-w-0 flex-1 uppercase`} placeholder="CLASS CODE" required /><button className="storyarc-primary-button">Join</button></div></form> : null}
      <div className="mt-7 grid gap-6">{memberships.map(({ classroom }) => <article key={classroom.id} className="storyarc-class-card"><header><div><span>{classroom.grade.replace("GRADE_", "Grade ")} · {classroom.section}</span><h2>{classroom.name}</h2></div><code>{classroom.teacher.name ?? classroom.teacher.email}</code></header><div className="storyarc-learner-assignments">{classroom.assignments.length === 0 ? <p className="p-5 text-sm text-slate-400">Your teacher has not assigned any tasks yet.</p> : classroom.assignments.map((assignment) => {
        const availability = getStoryArcAssignmentAvailability(assignment.availableFrom, assignment.dueAt);
        const progress = assignment.progress[0];
        const status = progress?.status ?? "ASSIGNED";
        const href = storyArcContentHref(assignment.revision.item.track, assignment.revision.item.stableId, assignment.id);
        return <div key={assignment.id} className="storyarc-assignment-card" data-state={availability}><span>{availability === "LOCKED" ? "🔒 LOCKED" : status === "COMPLETED" ? "✓ COMPLETED" : "QUEST ACTIVE"}</span><h3>{assignment.title}</h3><p>{availability === "LOCKED" ? `Available ${assignment.availableFrom.toLocaleString("id-ID")}` : assignment.instructions ?? `${trackLabel(assignment.revision.item.track)} practice`}</p><div className="mt-3 flex flex-wrap gap-2 text-xs"><strong className="rounded-full bg-emerald-300/10 px-3 py-2 text-emerald-200">Score: {scoreLabel(progress?.scorePercent ?? null)}</strong><small className="rounded-full border border-white/10 px-3 py-2 text-slate-400">{assignment.dueAt ? `Due ${assignment.dueAt.toLocaleString("id-ID")}` : "No deadline"}</small></div>{availability !== "LOCKED" ? <div className="mt-4 flex flex-wrap gap-2"><Link href={href} className="storyarc-primary-button">Open task →</Link>{assignment.revision.item.track !== "EXAM_LAB" ? <form action={updateStoryArcAssignmentProgress}><input type="hidden" name="assignmentId" value={assignment.id} /><input type="hidden" name="status" value={status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED"} /><button className="storyarc-secondary-button">{status === "COMPLETED" ? "Review again" : "Mark complete"}</button></form> : null}</div> : null}</div>;
      })}</div></article>)}</div>
    </>}
  </section>;
}
