import Link from "next/link";
import { StoryArcLibraryDeleteButton } from "@/components/apps/storyarc/library/StoryArcLibraryDeleteButton";
import { StoryArcLibraryUploadForm } from "@/components/apps/storyarc/library/StoryArcLibraryUploadForm";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser, isStoryArcTeacherRole } from "@/lib/storyarc/access";
import { getStoryArcLearnerGradeScope } from "@/lib/storyarc/library/access";
import { formatStoryArcLibraryFileSize } from "@/lib/storyarc/library/policy";

const documentSelect = {
  id: true,
  subject: true,
  title: true,
  summary: true,
  fileName: true,
  mimeType: true,
  fileSize: true,
  storageProvider: true,
  processingStatus: true,
  createdAt: true,
  uploadedBy: { select: { name: true, email: true } },
} as const;

function fileTypeLabel(mimeType: string) {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.includes("openxmlformats")) return "DOCX";
  return "DOC";
}

export default async function StoryArcLibraryPage() {
  const user = await getStoryArcSessionUser();
  if (!user) return null;

  const staff = isStoryArcTeacherRole(user.role);
  const learnerGrade = !staff ? await getStoryArcLearnerGradeScope(user.id) : null;
  const teacherClasses = staff
    ? await prisma.storyArcClass.findMany({
        where: user.role === "TEACHER" ? { teacherId: user.id } : {},
        select: {
          id: true,
          name: true,
          grade: true,
          section: true,
          documents: {
            select: documentSelect,
            orderBy: [{ subject: "asc" }, { createdAt: "desc" }],
          },
        },
        orderBy: [{ grade: "asc" }, { section: "asc" }],
      })
    : [];
  const learnerMemberships = !staff && learnerGrade
    ? await prisma.storyArcClassMember.findMany({
        where: {
          learnerId: user.id,
          classroom: { grade: learnerGrade, status: "ACTIVE" },
        },
        select: {
          classroom: {
            select: {
              id: true,
              name: true,
              grade: true,
              section: true,
              documents: {
                select: documentSelect,
                orderBy: [{ subject: "asc" }, { createdAt: "desc" }],
              },
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      })
    : [];
  const visibleClasses = staff
    ? teacherClasses
    : learnerMemberships.map((membership) => membership.classroom);

  return (
    <section className="space-y-6">
      <div className="storyarc-page-hero">
        <div>
          <p className="storyarc-eyebrow">DIGITAL LIBRARY</p>
          <h1>{staff ? "Organize resources for every class." : "Your class learning resources."}</h1>
          <p>
            {staff
              ? "Upload private Word and PDF documents with a subject and teacher-written summary."
              : `Only Grade ${learnerGrade?.replace("GRADE_", "") ?? "-"} documents from your enrolled classes appear here.`}
          </p>
        </div>
        <span className="storyarc-hero-badge">
          {visibleClasses.reduce((total, classroom) => total + classroom.documents.length, 0)} FILES
        </span>
      </div>

      {staff ? (
        <StoryArcLibraryUploadForm
          classes={teacherClasses.map((classroom) => ({
            id: classroom.id,
            label: `${classroom.grade.replace("GRADE_", "Grade ")} · ${classroom.section} · ${classroom.name}`,
          }))}
        />
      ) : null}

      {visibleClasses.length === 0 ? (
        <div className="storyarc-control-card">
          <h2>{staff ? "Create a class first" : "No class library yet"}</h2>
          <p>
            {staff
              ? "Digital Library documents must belong to a StoryArc class."
              : "Join a class from My Assignments to access its private library."}
          </p>
          <Link href="/apps/storyarc/classroom" className="storyarc-primary-button mt-4">
            Open Classroom
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {visibleClasses.map((classroom) => {
            const subjects = [...new Set(classroom.documents.map((document) => document.subject))];
            return (
              <article key={classroom.id} className="storyarc-class-card">
                <header>
                  <div>
                    <span>{classroom.grade.replace("GRADE_", "Grade ")} · {classroom.section}</span>
                    <h2>{classroom.name}</h2>
                  </div>
                  <code>{classroom.documents.length} DOCUMENTS</code>
                </header>

                {classroom.documents.length === 0 ? (
                  <p className="p-6 text-sm text-slate-400">No documents have been added to this class.</p>
                ) : (
                  <div className="grid gap-5 p-4 sm:p-5">
                    {subjects.map((subject) => (
                      <section key={subject}>
                        <div className="mb-3 flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/10 text-lg">▤</span>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-300">Subject</p>
                            <h3 className="text-lg font-black text-white">{subject}</h3>
                          </div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {classroom.documents
                            .filter((document) => document.subject === subject)
                            .map((document) => (
                              <article key={document.id} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <span className="rounded-lg bg-fuchsia-300/10 px-2 py-1 text-[10px] font-black text-fuchsia-200">
                                    {fileTypeLabel(document.mimeType)}
                                  </span>
                                  <span className="text-[10px] text-slate-500">{formatStoryArcLibraryFileSize(document.fileSize)}</span>
                                </div>
                                <h4 className="mt-3 text-base font-black text-white">{document.title}</h4>
                                <p className="mt-2 text-sm leading-6 text-slate-300">{document.summary}</p>
                                <div className="mt-4 border-t border-white/[.07] pt-3 text-[10px] text-slate-500">
                                  <p>{document.fileName}</p>
                                  <p>Shared by {document.uploadedBy.name ?? document.uploadedBy.email} · {document.createdAt.toLocaleDateString("id-ID")}</p>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                  <Link
                                    href={document.mimeType === "application/pdf"
                                      ? `/apps/storyarc/library/${document.id}`
                                      : `/api/apps/storyarc/library/${document.id}?download=1`}
                                    className="storyarc-primary-button"
                                  >
                                    {document.mimeType === "application/pdf" ? "Read PDF" : "Download document"}
                                  </Link>
                                  {staff ? <StoryArcLibraryDeleteButton documentId={document.id} title={document.title} /> : null}
                                </div>
                              </article>
                            ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
