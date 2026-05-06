import { prisma } from "./seed-client";

const readings = [
  {
    contentId: "cached-n5-daily-morning",
    title: "N5 Daily Morning",
    level: "N5",
    topic: "daily life",
    contentJa: "私は毎朝七時に起きます。朝ご飯を食べて、学校へ行きます。学校で日本語を勉強します。昼休みに友だちと話します。午後五時に家へ帰ります。",
    vocabularyJson: ["毎朝 = maiasa = setiap pagi", "勉強します = benkyou shimasu = belajar", "友だち = tomodachi = teman"],
    questionsJson: ["主人公は何時に起きますか。", "どこで日本語を勉強しますか。", "午後、どこへ帰りますか。"],
    answerKeyJson: ["七時に起きます。", "学校で勉強します。", "家へ帰ります。"],
  },
  {
    contentId: "cached-n4-station-restaurant",
    title: "N4 Restaurant Near The Station",
    level: "N4",
    topic: "restaurant station",
    contentJa: "昨日、友だちと駅の近くのレストランへ行きました。その店は安いのに、とてもおいしかったです。食べた後で、図書館へ行って日本語の本を借りました。",
    vocabularyJson: ["駅 = eki = stasiun", "安いのに = yasui noni = walaupun murah", "借りました = karimashita = meminjam"],
    questionsJson: ["どこへ行きましたか。", "その店はどうでしたか。", "食べた後で何をしましたか。"],
    answerKeyJson: ["駅の近くのレストランへ行きました。", "安いのにおいしかったです。", "図書館で日本語の本を借りました。"],
  },
  {
    contentId: "cached-n3-continuing-study",
    title: "N3 Continuing Study",
    level: "N3",
    topic: "study culture work",
    contentJa: "最近、日本語を勉強する人が増えています。仕事のために学ぶ人もいれば、日本の文化に興味がある人もいます。毎日少しずつ続けることが、上達への近道です。",
    vocabularyJson: ["最近 = saikin = belakangan ini", "文化 = bunka = budaya", "続ける = tsuzukeru = melanjutkan"],
    questionsJson: ["本文のテーマは何ですか。", "日本語を勉強する理由は何ですか。", "上達のために何が大切ですか。"],
    answerKeyJson: ["日本語の勉強についてです。", "仕事や文化への興味のためです。", "毎日少しずつ続けることです。"],
  },
];

export async function seedReadingPassages() {
  for (const reading of readings) {
    await prisma.readingPassage.upsert({
      where: { contentId: reading.contentId },
      update: {
        title: reading.title,
        level: reading.level,
        topic: reading.topic,
        contentJa: reading.contentJa,
        vocabularyJson: reading.vocabularyJson,
        questionsJson: reading.questionsJson,
        answerKeyJson: reading.answerKeyJson,
        note: "Cached database reading for trial users.",
        sourceType: "CACHED",
      },
      create: {
        ...reading,
        note: "Cached database reading for trial users.",
        sourceType: "CACHED",
      },
    });
  }

  console.log(`Reading passages seeded: ${readings.length}`);
}
