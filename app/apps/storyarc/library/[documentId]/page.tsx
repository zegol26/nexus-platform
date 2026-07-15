import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StoryArcPdfReader } from "@/components/apps/storyarc/library/StoryArcPdfReader";
import { prisma } from "@/lib/db/prisma";
import { getStoryArcSessionUser } from "@/lib/storyarc/access";
import { canReadStoryArcLibraryClass } from "@/lib/storyarc/library/access";
import { formatStoryArcLibraryFileSize } from "@/lib/storyarc/library/policy";

export const dynamic = "force-dynamic";

export default async function StoryArcLibraryReaderPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const [user, { documentId }] = await Promise.all([getStoryArcSessionUser(), params]);
  if (!user) redirect("/platform/dashboard");

  const document = await prisma.storyArcLibraryDocument.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      classId: true,
      title: true,
      summary: true,
      subject: true,
      fileName: true,
      fileSize: true,
      mimeType: true,
      storageProvider: true,
      classroom: { select: { name: true, grade: true, section: true } },
    },
  });
  if (!document || document.mimeType !== "application/pdf") notFound();
  if (!(await canReadStoryArcLibraryClass(user.id, user.role, document.classId))) notFound();

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/apps/storyarc/library" className="text-xs font-black uppercase tracking-[.14em] text-cyan-300 hover:text-cyan-100">
            ← Digital Library
          </Link>
          <p className="mt-3 text-xs font-black uppercase tracking-[.16em] text-fuchsia-300">
            {document.classroom.grade.replace("GRADE_", "Grade ")} · {document.classroom.section} · {document.subject}
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">{document.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{document.summary}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 text-right text-xs text-slate-400">
          <p className="font-black text-white">{document.classroom.name}</p>
          <p>{formatStoryArcLibraryFileSize(document.fileSize)}</p>
        </div>
      </div>
      <StoryArcPdfReader
        documentId={document.id}
        title={document.title}
        fileName={document.fileName}
        storageProvider={document.storageProvider}
      />
    </section>
  );
}
