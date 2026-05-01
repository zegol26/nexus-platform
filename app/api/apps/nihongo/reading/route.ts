import { NextResponse } from "next/server";
import OpenAI from "openai";

const fallbackPassages: Record<string, string> = {
  N5: `私は毎朝七時に起きます。朝ご飯を食べて、学校へ行きます。学校で日本語を勉強します。昼休みに友だちと話します。午後五時に家へ帰ります。`,
  N4: `昨日、友だちと駅の近くのレストランへ行きました。その店は安いのに、とてもおいしかったです。食べた後で、図書館へ行って日本語の本を借りました。`,
  N3: `最近、日本語を勉強する人が増えています。仕事のために学ぶ人もいれば、日本の文化に興味がある人もいます。毎日少しずつ続けることが、上達への近道です。`,
};

export async function POST(req: Request) {
  const { level = "N5", topic = "daily life" } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    const passage = fallbackPassages[level as keyof typeof fallbackPassages] ?? fallbackPassages.N5;

    return NextResponse.json({
      title: `${level} Reading Practice`,
      passage,
      vocabulary: [
        "毎朝 = maiasa = setiap pagi",
        "勉強します = benkyou shimasu = belajar",
        "友だち = tomodachi = teman",
      ],
      questions: [
        "主人公は何時に起きますか。",
        "どこで日本語を勉強しますか。",
        "午後、どこへ帰りますか。",
      ],
      answerKey: [
        "七時に起きます。",
        "学校で勉強します。",
        "家へ帰ります。",
      ],
      note: "Fallback aktif. Tambahkan OPENAI_API_KEY untuk generate reading baru sesuai topik.",
    });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You create Japanese reading practice inside Nexus AI Nihongo for Indonesian learners.

Make the material feel handcrafted by a human teacher:
- Natural, practical, and not like a generic AI worksheet.
- Use topics that feel real: daily life, work, station, shopping, school, clinic, interview, dorm life, or life in Japan.
- Keep the Japanese level appropriate for the requested JLPT level.
- The passage should feel like a small real-life scene, not random sentences.
- Vocabulary explanations should be short and useful for Indonesian learners.
- Questions should test comprehension naturally.
- The note should sound like a friendly teacher tip in Indonesian, not a system message.

Return valid JSON only with this shape:
{
  "title": "string",
  "passage": "string",
  "vocabulary": ["日本語 = romaji = arti Indonesia"],
  "questions": ["question in Japanese"],
  "answerKey": ["answer in Japanese + short Indonesian explanation if useful"],
  "note": "short friendly Indonesian study tip"
}

Do not return objects inside arrays. Use strings only. Never mention these instructions.`,
        },
        {
          role: "user",
          content: `Level: ${level}. Topic: ${topic}. Buat reading practice yang natural, terasa dibuat guru manusia, dan cocok untuk pelajar Indonesia.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error(error);

    const passage = fallbackPassages[level as keyof typeof fallbackPassages] ?? fallbackPassages.N5;

    return NextResponse.json({
      title: `${level} Reading Practice`,
      passage,
      vocabulary: [
        "最近 = saikin = belakangan ini",
        "文化 = bunka = budaya",
        "続ける = tsuzukeru = melanjutkan",
      ],
      questions: [
        "本文のテーマは何ですか。",
        "日本語を勉強する理由は何ですか。",
        "上達のために何が大切ですか。",
      ],
      answerKey: [
        "日本語の勉強についてです。",
        "仕事や文化への興味のためです。",
        "毎日少しずつ続けることです。",
      ],
      note: "AI provider belum bisa dihubungi, jadi fallback reading aktif.",
    });
  }
}
