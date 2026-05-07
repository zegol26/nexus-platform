import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import {
  AnalyticsEmptyState,
  AnalyticsKpiGrid,
  AnalyticsPanel,
} from "@/components/platform/analytics/AnalyticsPrimitives";
import {
  extractKeywords,
  type KeywordCount,
} from "@/lib/analytics/keywordExtraction";

export const dynamic = "force-dynamic";

type CurriculumRow = {
  lessonId: string;
  title: string;
  starts: number;
  completions: number;
  completionRate: number;
  quizAverageScore: number | null;
};

type WeaknessRow = {
  label: string;
  lessonId: string | null;
  questionType: string;
  attempts: number;
  wrongCount: number;
  accuracy: number;
  severity: "Critical" | "High" | "Medium" | "Good";
};

type QuizMetadata = {
  score?: number;
  total?: number;
  wrongAnswers?: Array<{
    topic?: string;
    category?: string;
    lessonId?: string;
    questionType?: string;
  }>;
};

type TutorMetadata = {
  userMessage?: string;
  assistantReply?: string;
  mode?: "text" | "voice";
  scope?: "free_chat" | "lesson";
};

type TutorKeywordPanel = {
  fromUser: KeywordCount[];
  fromAssistant: KeywordCount[];
  totalTurns: number;
  voiceTurns: number;
  textTurns: number;
};

export default async function PlatformAdminAnalyticsPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user ? (session.user as { role?: string }).role : undefined;

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    notFound();
  }

  const analytics = await getCoreAnalytics();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-xl shadow-slate-950/[0.04] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
          Admin Analytics
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">
              Nexus learning intelligence
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Phase 1 analytics from first-party events, curriculum progress,
              quiz interactions, tutor usage, and assessment completion.
            </p>
          </div>
          <Link
            href="/platform/admin"
            className="w-fit rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to Admin
          </Link>
        </div>
      </section>

      <AnalyticsKpiGrid cards={analytics.kpis} />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <AnalyticsPanel
          title="Funnel Analytics"
          description="Learner progression from signup to quiz completion."
        >
          <div className="space-y-3">
            {analytics.funnel.map((step, index) => (
              <div key={step.label} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Step {index + 1}
                    </p>
                    <p className="mt-1 font-semibold text-slate-950">{step.label}</p>
                  </div>
                  <p className="text-2xl font-semibold text-slate-950">{step.value}</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${step.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AnalyticsPanel>

        <AnalyticsPanel
          title="Curriculum Heatmap"
          description="Starts, completions, completion rate, and quiz score by lesson."
        >
          {analytics.curriculum.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Lesson</th>
                    <th className="px-3 py-2">Starts</th>
                    <th className="px-3 py-2">Completions</th>
                    <th className="px-3 py-2">Rate</th>
                    <th className="px-3 py-2">Avg time</th>
                    <th className="px-3 py-2">Quiz avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.curriculum.map((row) => (
                    <tr key={row.lessonId}>
                      <td className="px-3 py-3 font-semibold text-slate-950">{row.title}</td>
                      <td className="px-3 py-3 text-slate-600">{row.starts}</td>
                      <td className="px-3 py-3 text-slate-600">{row.completions}</td>
                      <td className="px-3 py-3 text-slate-600">{row.completionRate}%</td>
                      <td className="px-3 py-3 text-slate-500">n/a</td>
                      <td className="px-3 py-3 text-slate-600">
                        {row.quizAverageScore === null ? "n/a" : `${row.quizAverageScore}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AnalyticsEmptyState label="No curriculum analytics yet." />
          )}
        </AnalyticsPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsPanel
          title="AI Tutor Keywords — Pertanyaan Pelajar"
          description={`Top keyword dari ${analytics.tutorKeywords.totalTurns} percakapan tutor (${analytics.tutorKeywords.textTurns} chat · ${analytics.tutorKeywords.voiceTurns} voice).`}
        >
          {analytics.tutorKeywords.fromUser.length ? (
            <KeywordCloud rows={analytics.tutorKeywords.fromUser} />
          ) : (
            <AnalyticsEmptyState label="Belum ada pertanyaan tutor untuk dianalisis." />
          )}
        </AnalyticsPanel>

        <AnalyticsPanel
          title="AI Tutor Keywords — Topik Jawaban Ai-chan"
          description="Top keyword dari jawaban Ai-chan — gambaran materi yang paling sering diajarkan."
        >
          {analytics.tutorKeywords.fromAssistant.length ? (
            <KeywordCloud rows={analytics.tutorKeywords.fromAssistant} />
          ) : (
            <AnalyticsEmptyState label="Belum ada jawaban tutor untuk dianalisis." />
          )}
        </AnalyticsPanel>
      </div>

      <AnalyticsPanel
        title="Quiz Weakness Report"
        description="Wrong answer hotspots grouped by topic/category, lesson, and question type."
      >
        {analytics.weaknesses.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-slate-400">
                <tr>
                  <th className="px-3 py-2">Topic</th>
                  <th className="px-3 py-2">Lesson</th>
                  <th className="px-3 py-2">Question type</th>
                  <th className="px-3 py-2">Attempts</th>
                  <th className="px-3 py-2">Wrong</th>
                  <th className="px-3 py-2">Accuracy</th>
                  <th className="px-3 py-2">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.weaknesses.map((row) => (
                  <tr key={`${row.label}-${row.lessonId}-${row.questionType}`}>
                    <td className="px-3 py-3 font-semibold text-slate-950">{row.label}</td>
                    <td className="px-3 py-3 text-slate-600">{row.lessonId ?? "n/a"}</td>
                    <td className="px-3 py-3 text-slate-600">{row.questionType}</td>
                    <td className="px-3 py-3 text-slate-600">{row.attempts}</td>
                    <td className="px-3 py-3 text-slate-600">{row.wrongCount}</td>
                    <td className="px-3 py-3 text-slate-600">{row.accuracy}%</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {row.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <AnalyticsEmptyState label="No quiz weakness data yet. Submit quizzes to populate this report." />
        )}
      </AnalyticsPanel>
    </div>
  );
}

async function getCoreAnalytics() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newSignups7d,
    activeUsers7d,
    lessonsCompleted,
    quizzesCompleted,
    tutorMessages,
    assessmentCompleted,
    lessons,
    lessonStarts,
    lessonCompletions,
    quizEvents,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.analyticsEvent
      .findMany({
        where: { createdAt: { gte: sevenDaysAgo }, userId: { not: null } },
        distinct: ["userId"],
        select: { userId: true },
      })
      .then((rows) => rows.length),
    prisma.analyticsEvent.count({ where: { eventType: "LESSON_COMPLETED" } }),
    prisma.analyticsEvent.count({ where: { eventType: "QUIZ_COMPLETED" } }),
    prisma.analyticsEvent.count({ where: { eventType: "AI_TUTOR_MESSAGE" } }),
    prisma.analyticsEvent.count({ where: { eventType: "ASSESSMENT_COMPLETED" } }),
    prisma.nihongoLesson.findMany({
      select: { id: true, order: true, title: true },
      orderBy: { order: "asc" },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["lessonId"],
      where: { eventType: "LESSON_STARTED", lessonId: { not: null } },
      _count: { _all: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["lessonId"],
      where: { eventType: "LESSON_COMPLETED", lessonId: { not: null } },
      _count: { _all: true },
    }),
    prisma.analyticsEvent.findMany({
      where: { eventType: "QUIZ_COMPLETED" },
      select: { lessonId: true, metadata: true },
      orderBy: { createdAt: "desc" },
      take: 1000,
    }),
  ]);

  const quizScores = quizEvents
    .map((event) => getQuizScore(event.metadata))
    .filter((score): score is number => typeof score === "number");
  const averageQuizScore = average(quizScores);
  const signupCount = totalUsers;
  const assessmentCount = await prisma.analyticsEvent.count({
    where: { eventType: "ASSESSMENT_COMPLETED" },
  });
  const firstLessonStarts = await prisma.analyticsEvent.findMany({
    where: { eventType: "LESSON_STARTED", lessonId: { not: null } },
    distinct: ["userId"],
    select: { userId: true },
  });
  const lessonFive = lessons.find((lesson) => lesson.order === 5);
  const lessonFiveCompleted = lessonFive
    ? await prisma.analyticsEvent.count({
        where: { eventType: "LESSON_COMPLETED", lessonId: lessonFive.id },
      })
    : 0;

  const startsByLesson = new Map(
    lessonStarts.map((row) => [row.lessonId, row._count._all])
  );
  const completionsByLesson = new Map(
    lessonCompletions.map((row) => [row.lessonId, row._count._all])
  );

  const curriculum: CurriculumRow[] = lessons.map((lesson) => {
    const starts = startsByLesson.get(lesson.id) ?? 0;
    const completions = completionsByLesson.get(lesson.id) ?? 0;
    const relatedScores = quizEvents
      .filter((event) => event.lessonId === lesson.id)
      .map((event) => getQuizScore(event.metadata))
      .filter((score): score is number => typeof score === "number");

    return {
      lessonId: lesson.id,
      title: `${lesson.order}. ${lesson.title}`,
      starts,
      completions,
      completionRate: starts === 0 ? 0 : Math.round((completions / starts) * 100),
      quizAverageScore: average(relatedScores),
    };
  });

  const tutorKeywords = await getTutorKeywordPanel();

  return {
    kpis: [
      { label: "Total users", value: totalUsers },
      { label: "Active users 7d", value: activeUsers7d },
      { label: "New signups 7d", value: newSignups7d },
      { label: "Lessons completed", value: lessonsCompleted },
      { label: "Quizzes completed", value: quizzesCompleted },
      { label: "Avg quiz score", value: averageQuizScore === null ? "n/a" : `${averageQuizScore}%` },
      { label: "AI tutor messages", value: tutorMessages },
      { label: "Assessments completed", value: assessmentCompleted },
    ],
    funnel: buildFunnel([
      { label: "Signup", value: signupCount },
      { label: "Assessment completed", value: assessmentCount },
      { label: "First lesson started", value: firstLessonStarts.length },
      { label: "Lesson 5 completed", value: lessonFiveCompleted },
      { label: "Quiz completed", value: quizzesCompleted },
    ]),
    curriculum,
    weaknesses: buildWeaknessRows(quizEvents.map((event) => event.metadata)),
    tutorKeywords,
  };
}

function KeywordCloud({ rows }: { rows: KeywordCount[] }) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <div className="flex flex-wrap gap-2">
      {rows.map((row) => {
        const intensity = 0.4 + (row.count / max) * 0.6; // 40% – 100%
        return (
          <span
            key={row.keyword}
            className="rounded-full px-3 py-1.5 text-sm font-semibold"
            style={{
              backgroundColor: `rgba(59, 130, 246, ${intensity * 0.18})`,
              color: row.isJapanese ? "#0e7490" : "#1e3a8a",
              fontFamily: row.isJapanese
                ? "'Noto Sans JP', 'Inter', sans-serif"
                : undefined,
              fontSize: `${0.85 + (row.count / max) * 0.5}rem`,
            }}
            title={`${row.keyword} — disebut ${row.count}x`}
          >
            {row.keyword}
            <span className="ml-1.5 text-[10px] font-normal opacity-70">
              {row.count}
            </span>
          </span>
        );
      })}
    </div>
  );
}

async function getTutorKeywordPanel(): Promise<TutorKeywordPanel> {
  // Pull recent tutor turns. 1500 events ≈ 4-6 weeks of activity for
  // a small cohort; cap to stay under the typical Vercel function
  // memory budget when extracting tokens in-process.
  const events = await prisma.analyticsEvent.findMany({
    where: { eventType: "AI_TUTOR_MESSAGE" },
    select: { metadata: true },
    orderBy: { createdAt: "desc" },
    take: 1500,
  });

  const userTexts: string[] = [];
  const assistantTexts: string[] = [];
  let voiceTurns = 0;
  let textTurns = 0;

  for (const event of events) {
    const meta = event.metadata as TutorMetadata | null;
    if (!meta) continue;
    if (typeof meta.userMessage === "string" && meta.userMessage.trim()) {
      userTexts.push(meta.userMessage);
    }
    if (typeof meta.assistantReply === "string" && meta.assistantReply.trim()) {
      assistantTexts.push(meta.assistantReply);
    }
    if (meta.mode === "voice") voiceTurns += 1;
    else textTurns += 1;
  }

  return {
    fromUser: extractKeywords(userTexts, { topN: 30, minLength: 2 }),
    fromAssistant: extractKeywords(assistantTexts, { topN: 30, minLength: 2 }),
    totalTurns: events.length,
    voiceTurns,
    textTurns,
  };
}

function buildFunnel(rows: Array<{ label: string; value: number }>) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return rows.map((row) => ({
    ...row,
    percent: Math.round((row.value / max) * 100),
  }));
}

function getQuizScore(metadata: unknown) {
  const quizMetadata = metadata as QuizMetadata | null;
  const score = quizMetadata?.score;
  const total = quizMetadata?.total;

  if (typeof score !== "number" || typeof total !== "number" || total <= 0) {
    return null;
  }

  return Math.round((score / total) * 100);
}

function buildWeaknessRows(metadataRows: unknown[]): WeaknessRow[] {
  const groups = new Map<string, WeaknessRow>();

  for (const metadata of metadataRows) {
    const quizMetadata = metadata as QuizMetadata | null;
    const wrongAnswers = quizMetadata?.wrongAnswers ?? [];

    for (const wrongAnswer of wrongAnswers) {
      const label = wrongAnswer.topic ?? wrongAnswer.category ?? "Unknown";
      const lessonId = wrongAnswer.lessonId ?? null;
      const questionType = wrongAnswer.questionType ?? "multiple_choice";
      const key = `${label}:${lessonId ?? "none"}:${questionType}`;
      const current =
        groups.get(key) ??
        ({
          label,
          lessonId,
          questionType,
          attempts: 0,
          wrongCount: 0,
          accuracy: 100,
          severity: "Good",
        } satisfies WeaknessRow);

      current.attempts += 1;
      current.wrongCount += 1;
      groups.set(key, current);
    }
  }

  return Array.from(groups.values())
    .map((row) => {
      const accuracy = Math.max(0, Math.round(((row.attempts - row.wrongCount) / row.attempts) * 100));
      return {
        ...row,
        accuracy,
        severity: getSeverity(accuracy),
      };
    })
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, 25);
}

function getSeverity(accuracy: number): WeaknessRow["severity"] {
  if (accuracy < 40) return "Critical";
  if (accuracy < 60) return "High";
  if (accuracy < 80) return "Medium";
  return "Good";
}

function average(values: number[]) {
  if (!values.length) return null;

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}
