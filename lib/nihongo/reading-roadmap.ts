import { Prisma } from "@prisma/client";

export type ReadingArticleMeta = {
  seedId?: string;
  legacyId?: number;
  order: number;
  levelLabel?: string;
  slug: string;
  estimatedMinutes: number;
  romaji: string;
  indonesia: string;
};

export type ReadingRoadmapArticle = {
  id: string;
  slug: string;
  title: string;
  level: string;
  topic: string;
  japanese: string;
  romaji: string;
  indonesia: string;
  order: number;
  levelLabel: string;
  estimatedMinutes: number;
};

const defaultMeta: ReadingArticleMeta = {
  order: 999,
  slug: "reading",
  estimatedMinutes: 3,
  romaji: "",
  indonesia: "",
};

export function parseReadingMeta(value: Prisma.JsonValue | null | undefined): ReadingArticleMeta {
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaultMeta;

  const record = value as Record<string, unknown>;

  return {
    seedId: typeof record.seedId === "string" ? record.seedId : undefined,
    legacyId: typeof record.legacyId === "number" ? record.legacyId : undefined,
    order: typeof record.order === "number" ? record.order : defaultMeta.order,
    levelLabel: typeof record.levelLabel === "string" ? record.levelLabel : undefined,
    slug: typeof record.slug === "string" ? record.slug : defaultMeta.slug,
    estimatedMinutes:
      typeof record.estimatedMinutes === "number"
        ? record.estimatedMinutes
        : defaultMeta.estimatedMinutes,
    romaji: typeof record.romaji === "string" ? record.romaji : defaultMeta.romaji,
    indonesia:
      typeof record.indonesia === "string" ? record.indonesia : defaultMeta.indonesia,
  };
}

export function toReadingRoadmapArticle(passage: {
  id: string;
  contentId: string;
  title: string;
  level: string;
  topic: string;
  contentJa: string;
  answerKeyJson: Prisma.JsonValue | null;
}): ReadingRoadmapArticle {
  const meta = parseReadingMeta(passage.answerKeyJson);

  return {
    id: passage.id,
    slug: meta.slug || passage.contentId,
    title: passage.title,
    level: passage.level,
    topic: passage.topic,
    japanese: passage.contentJa,
    romaji: meta.romaji,
    indonesia: meta.indonesia,
    order: meta.order,
    levelLabel: meta.levelLabel ?? passage.level,
    estimatedMinutes: meta.estimatedMinutes,
  };
}

export function sortReadingArticles(articles: ReadingRoadmapArticle[]) {
  return [...articles].sort((a, b) => {
    const levelRank = getReadingLevelRank(a.level) - getReadingLevelRank(b.level);
    if (levelRank !== 0) return levelRank;

    return a.order - b.order;
  });
}

export function getReadingLevelRank(level: string) {
  if (level === "N5") return 1;
  if (level === "N4") return 2;
  return 99;
}
