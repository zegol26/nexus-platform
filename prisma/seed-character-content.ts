import characterContentData from "./data/nihongo-character-content.json";
import { prisma } from "./seed-client";

type CharacterContentType = "hiragana" | "katakana" | "kanji" | "vocabulary";
type CharacterContentLevel = "N5" | "N4";

type CharacterContentItem = {
  char: string;
  romaji: string | null;
  onyomi: string | null;
  kunyomi: string | null;
  meaning: string | null;
  order: number;
};

type CharacterContentSet = {
  type: CharacterContentType;
  level: CharacterContentLevel;
  lessonSlug: string;
  items: CharacterContentItem[];
};

type CharacterContentSeed = {
  seedVersion: string;
  characterSets: CharacterContentSet[];
};

const lessonSlugMap = [
  {
    slug: "hiragana-foundation",
    title: "Hiragana Foundation",
    description: "Belajar semua huruf hiragana dasar dengan romaji.",
    level: "Beginner",
    order: 1,
    track: "JLPT",
    module: "Foundations",
    lessonType: "kana",
  },
  {
    slug: "katakana-foundation",
    title: "Katakana Foundation",
    description: "Belajar semua huruf katakana dasar dengan romaji.",
    level: "Beginner",
    order: 2,
    track: "JLPT",
    module: "Foundations",
    lessonType: "kana",
  },
  {
    slug: "kanji-n5-foundation",
    title: "Kanji N5 Foundation",
    description: "Belajar kanji inti N5 dengan onyomi, kunyomi, dan arti Indonesia.",
    level: "N5",
    order: 41,
    track: "JLPT",
    module: "N5 Vocabulary",
    lessonType: "kanji",
  },
  {
    slug: "kanji-n4-foundation",
    title: "Kanji N4 Foundation",
    description: "Belajar kanji inti N4 dengan onyomi, kunyomi, dan arti Indonesia.",
    level: "N4",
    order: 42,
    track: "JLPT",
    module: "N4 Vocabulary",
    lessonType: "kanji",
  },
];

export async function seedCharacterContent() {
  const data = characterContentData as CharacterContentSeed;
  const stats = new Map<string, { inserted: number; updated: number }>();

  for (const lesson of lessonSlugMap) {
    const existing = await prisma.nihongoLesson.findUnique({
      where: { slug: lesson.slug },
    });

    if (existing) {
      await prisma.nihongoLesson.update({
        where: { slug: lesson.slug },
        data: lesson,
      });
      continue;
    }

    const matchingTitle = await prisma.nihongoLesson.findFirst({
      where: { title: lesson.title },
    });

    if (matchingTitle) {
      await prisma.nihongoLesson.update({
        where: { id: matchingTitle.id },
        data: lesson,
      });
      continue;
    }

    await prisma.nihongoLesson.create({
      data: lesson,
    });
  }

  for (const characterSet of data.characterSets) {
    const statKey = `${characterSet.type}/${characterSet.level}`;

    if (!stats.has(statKey)) {
      stats.set(statKey, { inserted: 0, updated: 0 });
    }

    for (const item of characterSet.items) {
      const existing = await prisma.nihongoCharacterContent.findUnique({
        where: {
          type_level_char: {
            type: characterSet.type,
            level: characterSet.level,
            char: item.char,
          },
        },
      });

      await prisma.nihongoCharacterContent.upsert({
        where: {
          type_level_char: {
            type: characterSet.type,
            level: characterSet.level,
            char: item.char,
          },
        },
        update: {
          lessonSlug: characterSet.lessonSlug,
          romaji: item.romaji,
          onyomi: item.onyomi,
          kunyomi: item.kunyomi,
          meaning: item.meaning,
          order: item.order,
        },
        create: {
          type: characterSet.type,
          level: characterSet.level,
          lessonSlug: characterSet.lessonSlug,
          char: item.char,
          romaji: item.romaji,
          onyomi: item.onyomi,
          kunyomi: item.kunyomi,
          meaning: item.meaning,
          order: item.order,
        },
      });

      const statsForSet = stats.get(statKey);
      if (!statsForSet) continue;

      if (existing) {
        statsForSet.updated += 1;
      } else {
        statsForSet.inserted += 1;
      }
    }
  }

  console.log(`Character content seed version: ${data.seedVersion}`);
  for (const [key, value] of stats) {
    console.log(`${key}: inserted ${value.inserted}, updated ${value.updated}`);
  }
}

if (require.main === module) {
  seedCharacterContent()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
