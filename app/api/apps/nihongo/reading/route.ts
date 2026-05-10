import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { canAccessReading, getNihongoAccess } from "@/lib/nexus/access-guards";

const fallbackPassages = {
  N5: {
    title: "N5 Daily Morning",
    passage: "私は毎朝七時に起きます。朝ご飯を食べて、学校へ行きます。学校で日本語を勉強します。昼休みに友だちと話します。午後五時に家へ帰ります。",
    vocabulary: ["毎朝 = maiasa = setiap pagi", "勉強します = benkyou shimasu = belajar", "友だち = tomodachi = teman"],
    questions: ["主人公は何時に起きますか。", "どこで日本語を勉強しますか。", "午後、どこへ帰りますか。"],
    answerKey: ["七時に起きます。", "学校で勉強します。", "家へ帰ります。"],
  },
  N4: {
    title: "N4 Restaurant Near The Station",
    passage: "昨日、友だちと駅の近くのレストランへ行きました。その店は安いのに、とてもおいしかったです。食べた後で、図書館へ行って日本語の本を借りました。",
    vocabulary: ["駅 = eki = stasiun", "安いのに = yasui noni = walaupun murah", "借りました = karimashita = meminjam"],
    questions: ["どこへ行きましたか。", "その店はどうでしたか。", "食べた後で何をしましたか。"],
    answerKey: ["駅の近くのレストランへ行きました。", "安いのにおいしかったです。", "図書館で日本語の本を借りました。"],
  },
  N3: {
    title: "N3 Continuing Study",
    passage: "最近、日本語を勉強する人が増えています。仕事のために学ぶ人もいれば、日本の文化に興味がある人もいます。毎日少しずつ続けることが、上達への近道です。",
    vocabulary: ["最近 = saikin = belakangan ini", "文化 = bunka = budaya", "続ける = tsuzukeru = melanjutkan"],
    questions: ["本文のテーマは何ですか。", "日本語を勉強する理由は何ですか。", "上達のために何が大切ですか。"],
    answerKey: ["日本語の勉強についてです。", "仕事や文化への興味のためです。", "毎日少しずつ続けることです。"],
  },
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { level = "N5", topic = "daily life" } = await req.json();
  const access = user.role === "ADMIN" || user.role === "SUPER_ADMIN"
    ? { allowed: true, plan: "ADMIN" }
    : await canAccessReading(user.id);

  if (!access.allowed) {
    return NextResponse.json({ error: access.reason ?? "Reading unavailable.", access }, { status: 403 });
  }

  const nihongoAccess = await getNihongoAccess(user.id);
  const cached = await findCachedPassage(String(level), String(topic));

  if (cached && (nihongoAccess.isTrial || !process.env.OPENAI_API_KEY)) {
    return NextResponse.json(formatPassage(cached, access));
  }

  if (nihongoAccess.isTrial) {
    const seeded = await seedFallbackPassage(String(level), String(topic));
    return NextResponse.json(formatPassage(seeded, access));
  }

  if (!process.env.OPENAI_API_KEY) {
    const seeded = cached ?? (await seedFallbackPassage(String(level), String(topic)));
    return NextResponse.json(formatPassage(seeded, access));
  }

  const generated = await generateReadingWithOpenAI(String(level), String(topic));
  const saved = await prisma.readingPassage.create({
    data: {
      title: generated.title,
      level: String(level),
      topic: String(topic),
      contentJa: generated.passage,
      contentId: `ai-${String(level).toLowerCase()}-${slugify(String(topic))}-${Date.now()}`,
      contentType: "READING",
      vocabularyJson: generated.vocabulary as Prisma.InputJsonArray,
      questionsJson: generated.questions as Prisma.InputJsonArray,
      answerKeyJson: generated.answerKey as Prisma.InputJsonArray,
      note: generated.note,
      sourceType: "AI_GENERATED",
    },
  });

  return NextResponse.json(formatPassage(saved, access));
}

async function findCachedPassage(level: string, topic: string) {
  const exactTopic = await prisma.readingPassage.findFirst({
    where: {
      level,
      contentType: "READING",
      sourceType: "CACHED",
      OR: [
        { topic: { contains: topic, mode: "insensitive" } },
        { title: { contains: topic, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  if (exactTopic) return exactTopic;

  return prisma.readingPassage.findFirst({
    where: { level, contentType: "READING", sourceType: "CACHED" },
    orderBy: { createdAt: "asc" },
  });
}

async function seedFallbackPassage(level: string, topic: string) {
  const fallback = fallbackPassages[level as keyof typeof fallbackPassages] ?? fallbackPassages.N5;

  return prisma.readingPassage.upsert({
    where: { contentId: `cached-${level.toLowerCase()}-${slugify(topic || fallback.title)}` },
    update: {},
    create: {
      title: fallback.title,
      level,
      topic: topic || "daily life",
      contentJa: fallback.passage,
      contentId: `cached-${level.toLowerCase()}-${slugify(topic || fallback.title)}`,
      contentType: "READING",
      vocabularyJson: fallback.vocabulary,
      questionsJson: fallback.questions,
      answerKeyJson: fallback.answerKey,
      note: "Trial mode memakai cached reading dari database.",
      sourceType: "CACHED",
    },
  });
}

async function generateReadingWithOpenAI(level: string, topic: string) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Create JSON reading practice for Indonesian Japanese learners. Return title, passage, vocabulary string array, questions string array, answerKey string array, note. Reading questions must never be only a generic instruction such as 'Baca teks, lalu pilih jawaban paling tepat.' Always ask one clear target: who, what, where, when, why, how, or statement matching. Prefer Japanese question forms like '本文の内容と合っているものはどれですか。' or '本文によると、___ は何/どこ/いつ/だれ/どうしますか。'. Each answerKey item must cite or paraphrase the relevant Japanese phrase from the passage. Keep N5 simple; N4 may use slightly longer passages and light inference.",
        },
        {
          role: "user",
          content: `Level: ${level}. Topic: ${topic}.`,
        },
      ],
    });

    return JSON.parse(completion.choices[0]?.message?.content ?? "{}") as {
      title: string;
      passage: string;
      vocabulary: string[];
      questions: string[];
      answerKey: string[];
      note?: string;
    };
  } catch {
    const fallback = fallbackPassages[level as keyof typeof fallbackPassages] ?? fallbackPassages.N5;
    return { ...fallback, note: "AI provider belum bisa dihubungi, jadi fallback reading aktif." };
  }
}

function formatPassage(passage: {
  title: string;
  contentJa: string;
  vocabularyJson: Prisma.JsonValue;
  questionsJson: Prisma.JsonValue;
  answerKeyJson: Prisma.JsonValue | null;
  note: string | null;
  sourceType: string;
}, access: unknown) {
  return {
    title: passage.title,
    passage: passage.contentJa,
    vocabulary: Array.isArray(passage.vocabularyJson) ? passage.vocabularyJson : [],
    questions: Array.isArray(passage.questionsJson) ? passage.questionsJson : [],
    answerKey: Array.isArray(passage.answerKeyJson) ? passage.answerKeyJson : [],
    note: passage.note,
    sourceType: passage.sourceType,
    access,
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "reading";
}
