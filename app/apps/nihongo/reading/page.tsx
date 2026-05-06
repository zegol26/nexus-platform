import Link from "next/link";
import { getServerSession } from "next-auth";
import { UserBadgeHeader } from "@/components/nihongo/UserBadgeHeader";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import {
  sortReadingArticles,
  toReadingRoadmapArticle,
  type ReadingRoadmapArticle,
} from "@/lib/nihongo/reading-roadmap";

export default async function ReadingPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      })
    : null;

  const articles = sortReadingArticles(
    (
      await prisma.readingPassage.findMany({
        where: {
          contentType: "READING",
          sourceType: "CACHED",
          OR: [{ contentId: { startsWith: "n5-" } }, { contentId: { startsWith: "n4-" } }],
        },
        orderBy: [{ level: "desc" }, { contentId: "asc" }],
      })
    ).map(toReadingRoadmapArticle)
  );

  const completedIds = user
    ? new Set(
        (
          await prisma.analyticsEvent.findMany({
            where: {
              userId: user.id,
              eventType: "READING_COMPLETED",
              lessonId: { in: articles.map((article) => article.id) },
            },
            select: { lessonId: true },
          })
        )
          .map((event) => event.lessonId)
          .filter(Boolean) as string[]
      )
    : new Set<string>();

  const completedCount = articles.filter((article) => completedIds.has(article.id)).length;
  const totalArticles = articles.length;
  const progressPercentage = totalArticles
    ? Math.round((completedCount / totalArticles) * 100)
    : 0;
  const currentIndex = getCurrentIndex(articles, completedIds);
  const currentArticle = totalArticles ? articles[currentIndex] : null;
  const totalMinutes = articles.reduce((sum, article) => sum + article.estimatedMinutes, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <UserBadgeHeader />

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[linear-gradient(135deg,#0f172a,#155e75,#0f766e)] p-6 text-white sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">
            Reading Skill Roadmap
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Reading Skill Roadmap
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50">
                Master Japanese reading from N5 to N4
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Overall progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4 sm:p-8">
          <StatCard label="Progress" value={`${progressPercentage}%`} />
          <StatCard label="Completed Articles" value={`${completedCount}/${totalArticles}`} />
          <StatCard label="Current Level" value={currentArticle?.level ?? "N5"} />
          <StatCard label="Reading Time" value={`${totalMinutes} min`} />
        </div>
      </section>

      {articles.length ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                N5 to N4 Journey
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Visual progression path
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Avatar follows your completion progress across the roadmap.
            </p>
          </div>

          <div className="relative mt-8">
            <div className="absolute left-6 top-0 h-full w-1 rounded-full bg-slate-100 md:left-1/2 md:-translate-x-1/2" />
            <div
              className="absolute left-6 top-0 w-1 rounded-full bg-cyan-500 md:left-1/2 md:-translate-x-1/2"
              style={{ height: `${progressPercentage}%` }}
            />
            <div
              className="absolute left-2 z-20 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-slate-950 text-sm text-white shadow-lg transition-all md:left-1/2 md:-translate-x-1/2"
              style={{ top: `calc(${getAvatarTop(progressPercentage)}% - 18px)` }}
              aria-label="Roadmap avatar progress marker"
            >
              AI
            </div>

            <div className="space-y-5">
              {articles.map((article, index) => {
                const isCompleted = completedIds.has(article.id);
                const isCurrent = index === currentIndex && !isCompleted;
                const isUnlocked = index === 0 || isCompleted || completedIds.has(articles[index - 1]?.id);

                return (
                  <RoadmapArticleCard
                    key={article.id}
                    article={article}
                    index={index}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    isUnlocked={isUnlocked}
                  />
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">
            Reading roadmap belum tersedia.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Jalankan seed reading articles untuk mengisi artikel N5 dan N4, lalu refresh halaman.
          </p>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function RoadmapArticleCard({
  article,
  index,
  isCompleted,
  isCurrent,
  isUnlocked,
}: {
  article: ReadingRoadmapArticle;
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isUnlocked: boolean;
}) {
  const side = index % 2 === 0 ? "md:pr-[calc(50%+2rem)]" : "md:pl-[calc(50%+2rem)]";

  return (
    <div className={`relative pl-16 ${side}`}>
      <div
        className={`absolute left-[10px] top-6 z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white text-sm font-semibold shadow md:left-1/2 md:-translate-x-1/2 ${
          isCompleted
            ? "bg-emerald-500 text-white"
            : isCurrent
              ? "animate-pulse bg-cyan-500 text-white"
              : isUnlocked
                ? "bg-slate-950 text-white"
                : "bg-slate-200 text-slate-500"
        }`}
      >
        {isCompleted ? "✓" : String(article.order).padStart(2, "0")}
      </div>

      <Link
        href={isUnlocked ? `/apps/nihongo/reading/${article.slug}` : "#"}
        aria-disabled={!isUnlocked}
        className={`block rounded-2xl border p-5 shadow-sm transition ${
          isUnlocked
            ? "border-slate-200 bg-white hover:border-cyan-200 hover:shadow-md"
            : "pointer-events-none border-slate-200 bg-slate-50 opacity-60"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">
            {article.level}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            Article {String(article.order).padStart(2, "0")}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            {article.estimatedMinutes} min
          </span>
          <span
            className={`rounded-full px-3 py-1 ${
              isCompleted
                ? "bg-emerald-50 text-emerald-700"
                : isCurrent
                  ? "bg-cyan-50 text-cyan-700"
                  : isUnlocked
                    ? "bg-slate-100 text-slate-600"
                    : "bg-slate-200 text-slate-500"
            }`}
          >
            {isCompleted ? "Completed" : isCurrent ? "Current" : isUnlocked ? "Unlocked" : "Locked"}
          </span>
        </div>
        <h3 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
          {article.title}
        </h3>
      </Link>
    </div>
  );
}

function getCurrentIndex(articles: ReadingRoadmapArticle[], completedIds: Set<string>) {
  const firstIncomplete = articles.findIndex((article) => !completedIds.has(article.id));
  return firstIncomplete === -1 ? Math.max(articles.length - 1, 0) : firstIncomplete;
}

function getAvatarTop(progressPercentage: number) {
  if (progressPercentage <= 0) return 0;
  if (progressPercentage >= 100) return 100;
  return progressPercentage;
}
