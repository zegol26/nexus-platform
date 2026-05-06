import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { UserBadgeHeader } from "@/components/nihongo/UserBadgeHeader";
import { ReadingArticleClient } from "@/components/nihongo/ReadingArticleClient";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import {
  sortReadingArticles,
  toReadingRoadmapArticle,
} from "@/lib/nihongo/reading-roadmap";

export default async function ReadingArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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
      })
    ).map(toReadingRoadmapArticle)
  );

  const articleIndex = articles.findIndex((article) => article.slug === slug || article.id === slug);
  if (articleIndex === -1) {
    notFound();
  }

  const article = articles[articleIndex];
  const completedArticleIds = user
    ? new Set(
        (
          await prisma.analyticsEvent.findMany({
            where: {
              userId: user.id,
              eventType: "READING_COMPLETED",
              lessonId: { in: articles.map((item) => item.id) },
            },
            select: { lessonId: true },
          })
        )
          .map((event) => event.lessonId)
          .filter(Boolean) as string[]
      )
    : new Set<string>();

  const isUnlocked =
    articleIndex === 0 ||
    completedArticleIds.has(article.id) ||
    completedArticleIds.has(articles[articleIndex - 1]?.id);

  if (!isUnlocked) {
    redirect("/apps/nihongo/reading");
  }

  const completed = user
    ? Boolean(
        await prisma.analyticsEvent.findFirst({
          where: {
            userId: user.id,
            eventType: "READING_COMPLETED",
            lessonId: article.id,
          },
          select: { id: true },
        })
      )
    : false;

  return (
    <div className="space-y-6">
      <UserBadgeHeader />
      <ReadingArticleClient
        article={article}
        previousArticle={articles[articleIndex - 1] ?? null}
        nextArticle={articles[articleIndex + 1] ?? null}
        initiallyCompleted={completed}
      />
    </div>
  );
}
