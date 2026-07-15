import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StoryArcExamPlayer } from "@/components/apps/storyarc/exam/StoryArcExamPlayer";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser } from "@/lib/storyarc/access";
import { resolveStoryArcAssignmentAccess } from "@/lib/storyarc/classroom/access";
import { normalizeStoryArcExam } from "@/lib/storyarc/exam/exam-runtime";

export default async function StoryArcExamPage({ params, searchParams }: { params: Promise<{ examId: string }>; searchParams: Promise<{ assignment?: string }> }) {
  const [{ examId }, query, user] = await Promise.all([params, searchParams, getStoryArcSessionUser()]);
  if (!user) return null;
  const revision = await prisma.storyArcContentRevision.findFirst({ where: { state: "PUBLISHED", item: { stableId: examId, track: "EXAM_LAB" } }, include: { item: true }, orderBy: { revision: "desc" } });
  if (!revision) notFound();
  const access = await resolveStoryArcAssignmentAccess({ userId: user.id, role: user.role, revisionId: revision.id, assignmentId: query.assignment });
  if (!access.allowed) redirect(`/apps/storyarc/exam-lab?error=${access.reason}`);
  const exam = normalizeStoryArcExam(revision.payload, { id: revision.item.stableId, title: revision.title, grade: revision.item.grade.replace("GRADE_", "Grade ") });
  return <section><Link href="/apps/storyarc/exam-lab" className="text-xs font-black tracking-[.16em] text-fuchsia-300 hover:text-white">← EXAM LAB</Link><StoryArcExamPlayer exam={exam} assignmentId={access.assignment?.id} /></section>;
}
