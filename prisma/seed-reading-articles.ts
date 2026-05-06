import { Prisma } from "@prisma/client";
import readingData from "./data/nihongo-reading-articles.fixed.json";
import { prisma } from "./seed-client";

type ReadingSeedArticle = {
  id: string;
  legacyId: number;
  order: number;
  level: "N5" | "N4";
  levelLabel: string;
  slug: string;
  title: string;
  estimatedMinutes: number;
  content: {
    japanese: string;
    romaji: string;
    indonesia: string;
  };
};

type ReadingSeedData = {
  seedVersion: string;
  articles: ReadingSeedArticle[];
};

const seed = readingData as ReadingSeedData;

export async function seedReadingArticles() {
  const counts = new Map<string, { inserted: number; updated: number }>();

  for (const article of seed.articles) {
    const existing = await prisma.readingPassage.findUnique({
      where: { contentId: article.slug },
      select: { id: true },
    });

    await prisma.readingPassage.upsert({
      where: { contentId: article.slug },
      update: {
        title: article.title,
        level: article.level,
        topic: `${article.level} reading roadmap`,
        contentJa: article.content.japanese,
        vocabularyJson: [],
        questionsJson: [],
        answerKeyJson: buildArticleMeta(article),
        note: `Seeded from ${seed.seedVersion}.`,
        sourceType: "CACHED",
      },
      create: {
        title: article.title,
        level: article.level,
        topic: `${article.level} reading roadmap`,
        contentId: article.slug,
        contentJa: article.content.japanese,
        vocabularyJson: [],
        questionsJson: [],
        answerKeyJson: buildArticleMeta(article),
        note: `Seeded from ${seed.seedVersion}.`,
        sourceType: "CACHED",
      },
    });

    const current = counts.get(article.level) ?? { inserted: 0, updated: 0 };
    if (existing) current.updated += 1;
    else current.inserted += 1;
    counts.set(article.level, current);
  }

  console.log(`Reading article seed version: ${seed.seedVersion}`);
  for (const [level, count] of counts.entries()) {
    console.log(`${level}: inserted ${count.inserted}, updated ${count.updated}`);
  }
}

function buildArticleMeta(article: ReadingSeedArticle): Prisma.InputJsonObject {
  return {
    seedId: article.id,
    legacyId: article.legacyId,
    order: article.order,
    levelLabel: article.levelLabel,
    slug: article.slug,
    estimatedMinutes: article.estimatedMinutes,
    romaji: article.content.romaji,
    indonesia: article.content.indonesia,
  };
}

if (require.main === module) {
  seedReadingArticles()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
