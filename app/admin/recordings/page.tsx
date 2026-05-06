import Link from "next/link";
import { AdminSection, EmptyState } from "@/components/admin/AdminTable";
import { groupRecordings } from "@/lib/admin/recordings";
import { prisma } from "@/lib/db/prisma";

type RecordingRow = {
  id: string;
  userId: string;
  questionId: string;
  audioMimeType: string;
  durationSec: number;
  fileName: string | null;
  status: string;
  submittedAt: Date;
  user: {
    name: string | null;
    email: string;
  };
  question: {
    order: number;
    prompt: string;
    focusArea: string;
  };
  review: {
    overallScore: number | null;
    englishLevel: string;
    visibleToUser: boolean;
  } | null;
};

export default async function AdminRecordingsPage() {
  const recordings = (await prisma.englishInterviewAnswer.findMany({
    include: { user: true, question: true, review: true },
    orderBy: [{ userId: "asc" }, { questionId: "asc" }, { submittedAt: "desc" }],
    take: 300,
  })) as RecordingRow[];

  const grouped = groupRecordings(recordings);

  return (
    <AdminSection
      title="Recordings"
      description="English Interview submissions grouped by user and question. Older duplicates stay visible for reference."
    >
      {!grouped.length ? (
        <EmptyState label="No recordings submitted yet." />
      ) : (
        <div className="space-y-4">
          {grouped.map((user) => (
            <details
              key={user.userId}
              className="group rounded-2xl border border-slate-200 bg-white shadow-sm"
              open={grouped.length === 1}
            >
              <summary className="cursor-pointer list-none rounded-2xl px-5 py-4 transition hover:bg-slate-50">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{user.label}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {user.total} recording{user.total === 1 ? "" : "s"}
                  </span>
                </div>
              </summary>

              <div className="space-y-3 border-t border-slate-100 p-4">
                {user.questions.map((question) => (
                  <details key={question.questionId} className="rounded-2xl border border-slate-200 bg-slate-50" open>
                    <summary className="cursor-pointer list-none px-4 py-3">
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            Question {question.order} / {question.focusArea}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{question.prompt}</p>
                        </div>
                        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          {question.recordings.length} submission{question.recordings.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </summary>

                    <div className="space-y-3 border-t border-slate-200 p-3">
                      {question.recordings.map((recording, index) => (
                        <RecordingCard key={recording.id} recording={recording} latest={index === 0} />
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </AdminSection>
  );
}

function RecordingCard({ recording, latest }: { recording: RecordingRow; latest: boolean }) {
  const reviewLabel = recording.review
    ? `${recording.review.englishLevel}${typeof recording.review.overallScore === "number" ? ` / ${recording.review.overallScore}` : ""}`
    : "Not reviewed";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {latest ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Latest
              </span>
            ) : null}
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {recording.status}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {reviewLabel}
            </span>
          </div>

          <p className="mt-3 font-semibold text-slate-950">{formatTimestamp(recording.submittedAt)}</p>
          <p className="mt-1 text-slate-500">
            Duration {recording.durationSec}s · {recording.audioMimeType}
            {recording.fileName ? ` · ${recording.fileName}` : ""}
          </p>
        </div>

        <Link
          href={`/api/apps/english/interview/answers/${recording.id}/audio`}
          className="w-fit rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
          target="_blank"
        >
          Open Audio
        </Link>
      </div>

      <audio controls src={`/api/apps/english/interview/answers/${recording.id}/audio`} className="mt-4 w-full">
        <track kind="captions" />
      </audio>
    </article>
  );
}

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
