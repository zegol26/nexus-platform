type LessonLike = {
  id: string;
  level: string;
  title: string;
  module: string | null;
  lessonType: string | null;
  order: number;
};

const tagToLessonHints: Record<string, string[]> = {
  kana: ["kana"],
  katakana: ["kana"],
  kanji: ["vocabulary", "kanji"],
  particles: ["grammar", "particle"],
  verb_forms: ["grammar", "verb", "masu", "past"],
  adjective_forms: ["grammar", "adjective"],
  reading: ["reading", "vocabulary"],
  listening: ["conversation"],
  pronunciation: ["pronunciation", "conversation"],
};

export async function recommendNihongoLessons(params: {
  prisma: {
    nihongoLesson: {
      findMany: (args: { orderBy: { order: "asc" } }) => Promise<LessonLike[]>;
    };
  };
  weaknessTags: string[];
  limit?: number;
}) {
  const lessons = await params.prisma.nihongoLesson.findMany({
    orderBy: { order: "asc" },
  });

  const hints = params.weaknessTags.flatMap((tag) => tagToLessonHints[tag] ?? []);
  const limit = params.limit ?? 5;

  const scored = lessons
    .map((lesson) => {
      const searchable = `${lesson.title} ${lesson.module ?? ""} ${lesson.lessonType ?? ""}`.toLowerCase();
      const score = hints.reduce((sum, hint) => sum + (searchable.includes(hint) ? 1 : 0), 0);
      return { lesson, score };
    })
    .sort((a, b) => b.score - a.score || a.lesson.order - b.lesson.order);

  const recommended = scored.filter((item) => item.score > 0).map((item) => item.lesson);
  const fallback = lessons.filter((lesson) => !recommended.some((item) => item.id === lesson.id));

  return [...recommended, ...fallback].slice(0, limit);
}
