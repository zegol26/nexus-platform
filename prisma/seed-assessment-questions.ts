import "dotenv/config";
import { prisma } from "./seed-client";

type SeedQuestion = {
  sourceKey: string;
  level: "N5" | "N4";
  skill: "vocabulary" | "grammar" | "particle" | "kanji" | "reading";
  questionType: "multiple_choice" | "fill_blank" | "reading_mcq";
  prompt: string;
  passage?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
};

const validParticles = new Set(["は", "が", "を", "に", "で", "へ", "と", "も", "の", "から", "まで", "より"]);

const n5Vocabulary = [
  ["n5-vocab-01", "学校", "sekolah", ["sekolah", "kantor", "rumah sakit", "stasiun"], "学校 berarti sekolah."],
  ["n5-vocab-02", "水", "air", ["air", "api", "uang", "buku"], "水 berarti air."],
  ["n5-vocab-03", "今日", "hari ini", ["hari ini", "kemarin", "besok", "minggu depan"], "今日 berarti hari ini."],
  ["n5-vocab-04", "先生", "guru", ["guru", "murid", "teman", "dokter"], "先生 berarti guru."],
  ["n5-vocab-05", "電車", "kereta", ["kereta", "mobil", "sepeda", "pesawat"], "電車 berarti kereta."],
  ["n5-vocab-06", "食べます", "makan", ["makan", "minum", "membaca", "pergi"], "食べます berarti makan."],
  ["n5-vocab-07", "高い", "mahal/tinggi", ["mahal/tinggi", "murah", "baru", "sepi"], "高い berarti mahal atau tinggi."],
  ["n5-vocab-08", "友だち", "teman", ["teman", "keluarga", "guru", "anak"], "友だち berarti teman."],
  ["n5-vocab-09", "毎日", "setiap hari", ["setiap hari", "setiap bulan", "sekarang", "sebentar"], "毎日 berarti setiap hari."],
  ["n5-vocab-10", "小さい", "kecil", ["kecil", "besar", "panjang", "cepat"], "小さい berarti kecil."],
] as const;

const n4Vocabulary = [
  ["n4-vocab-01", "予約", "reservasi", ["reservasi", "biaya", "jadwal", "alamat"], "予約 berarti reservasi."],
  ["n4-vocab-02", "説明", "penjelasan", ["penjelasan", "pertanyaan", "jawaban", "percakapan"], "説明 berarti penjelasan."],
  ["n4-vocab-03", "必要", "perlu", ["perlu", "mudah", "terkenal", "berbahaya"], "必要 berarti perlu."],
  ["n4-vocab-04", "準備", "persiapan", ["persiapan", "perjalanan", "pekerjaan", "belanja"], "準備 berarti persiapan."],
  ["n4-vocab-05", "遅れます", "terlambat", ["terlambat", "menunggu", "membayar", "menjawab"], "遅れます berarti terlambat."],
  ["n4-vocab-06", "選びます", "memilih", ["memilih", "mencuci", "berjalan", "membuka"], "選びます berarti memilih."],
  ["n4-vocab-07", "急に", "tiba-tiba", ["tiba-tiba", "pelan-pelan", "biasanya", "selalu"], "急に berarti tiba-tiba."],
  ["n4-vocab-08", "連絡", "kontak/menghubungi", ["kontak/menghubungi", "latihan", "pengalaman", "larangan"], "連絡 berarti kontak/menghubungi."],
  ["n4-vocab-09", "故障", "kerusakan", ["kerusakan", "aturan", "rencana", "hasil"], "故障 berarti kerusakan."],
  ["n4-vocab-10", "比べます", "membandingkan", ["membandingkan", "mencoba", "mengirim", "mengundang"], "比べます berarti membandingkan."],
] as const;

const n5Grammar = [
  ["n5-grammar-01", "わたしは学生__。", "です", ["です", "ます", "でした", "ません"], "Kalimat identitas memakai です."],
  ["n5-grammar-02", "これは本です__。", "か", ["か", "を", "に", "で"], "か di akhir membuat pertanyaan."],
  ["n5-grammar-03", "昨日、映画を見__。", "ました", ["ます", "ました", "ません", "ませんでした"], "昨日 membutuhkan bentuk lampau ました."],
  ["n5-grammar-04", "明日、学校へ行き__。", "ます", ["ます", "ました", "ませんでした", "でした"], "明日 memakai non-lampau."],
  ["n5-grammar-05", "この本は高く__です。", "ない", ["ない", "ありません", "ません", "では"], "Negatif い-adjective: 高くない."],
  ["n5-grammar-06", "部屋に机が__。", "あります", ["あります", "います", "です", "します"], "机 benda mati, jadi あります."],
  ["n5-grammar-07", "公園に犬が__。", "います", ["います", "あります", "です", "行きます"], "犬 makhluk hidup, jadi います."],
  ["n5-grammar-08", "静か__町です。", "な", ["な", "い", "の", "で"], "な-adjective menerangkan noun dengan な."],
  ["n5-grammar-09", "コーヒーを飲み__。", "ません", ["ません", "ないです", "でした", "です"], "Negatif sopan kata kerja: 飲みません."],
  ["n5-grammar-10", "朝ごはんを食べて、学校へ__。", "行きます", ["行きます", "あります", "います", "です"], "Setelah sarapan, pergi ke sekolah."],
] as const;

const n4Grammar = [
  ["n4-grammar-01", "名前を書いて__。", "ください", ["ください", "たい", "こと", "から"], "てください dipakai untuk meminta/instruksi."],
  ["n4-grammar-02", "今、日本語を勉強して__。", "います", ["います", "あります", "ください", "でした"], "ている menunjukkan sedang melakukan."],
  ["n4-grammar-03", "日本へ行き__です。", "たい", ["たい", "ながら", "そう", "より"], "たい menyatakan ingin melakukan."],
  ["n4-grammar-04", "漢字を読んだことが__。", "あります", ["あります", "います", "します", "できます"], "たことがあります menyatakan pengalaman."],
  ["n4-grammar-05", "雨です__、家で勉強します。", "から", ["から", "まで", "より", "へ"], "から memberi alasan."],
  ["n4-grammar-06", "ここで写真を撮って__いけません。", "は", ["は", "が", "を", "に"], "てはいけません menyatakan larangan."],
  ["n4-grammar-07", "日本語が話せる__なりました。", "ように", ["ように", "ために", "ところ", "ばかり"], "ようになりました = menjadi bisa."],
  ["n4-grammar-08", "東京は大阪__人が多いです。", "より", ["より", "まで", "から", "へ"], "より dipakai untuk perbandingan."],
  ["n4-grammar-09", "宿題をし__なりません。", "なければ", ["なければ", "ても", "たり", "ながら"], "なければなりません = harus."],
  ["n4-grammar-10", "この漢字は読むことが__。", "できます", ["できます", "あります", "います", "します"], "ことができます = bisa melakukan."],
] as const;

const n5Particles = [
  ["n5-particle-01", "わたし__学生です。", "は", ["は", "を", "で", "へ"], "は menandai topik."],
  ["n5-particle-02", "パン__食べます。", "を", ["を", "に", "の", "から"], "を menandai objek."],
  ["n5-particle-03", "学校__勉強します。", "で", ["で", "に", "を", "も"], "で menandai lokasi aktivitas."],
  ["n5-particle-04", "七時__起きます。", "に", ["に", "で", "を", "へ"], "に menandai waktu spesifik."],
  ["n5-particle-05", "日本__行きます。", "へ", ["へ", "を", "が", "と"], "へ menandai arah dan dibaca e."],
  ["n5-particle-06", "先生__話します。", "と", ["と", "の", "まで", "より"], "と berarti dengan."],
  ["n5-particle-07", "これは私__本です。", "の", ["の", "も", "が", "で"], "の menunjukkan kepemilikan."],
  ["n5-particle-08", "水__飲みます。", "を", ["を", "は", "に", "で"], "飲みます membutuhkan objek dengan を."],
] as const;

const n4Particles = [
  ["n4-particle-01", "駅__歩いて行きます。", "まで", ["まで", "から", "より", "を"], "まで berarti sampai."],
  ["n4-particle-02", "家__会社まで電車で行きます。", "から", ["から", "まで", "より", "へ"], "から berarti dari."],
  ["n4-particle-03", "兄__私のほうが背が高いです。", "より", ["より", "まで", "から", "と"], "より dipakai dalam perbandingan."],
  ["n4-particle-04", "友だち__プレゼントをもらいました。", "に", ["に", "を", "で", "へ"], "もらう sering memakai に untuk pemberi."],
  ["n4-particle-05", "日本語__手紙を書きます。", "で", ["で", "に", "を", "が"], "で menandai alat/bahasa yang dipakai."],
  ["n4-particle-06", "日曜日__働くことがあります。", "も", ["も", "を", "へ", "より"], "も berarti juga/bahkan."],
  ["n4-particle-07", "先生__質問しました。", "に", ["に", "で", "を", "まで"], "質問する kepada seseorang memakai に."],
  ["n4-particle-08", "友だち__映画を見ました。", "と", ["と", "の", "から", "より"], "と berarti bersama/dengan."],
] as const;

const n5Kanji = [
  ["n5-kanji-01", "山", "やま", ["やま", "かわ", "ひと", "みず"], "山 dibaca やま."],
  ["n5-kanji-02", "川", "sungai", ["sungai", "gunung", "sekolah", "mobil"], "川 berarti sungai."],
  ["n5-kanji-03", "日", "hari/matahari", ["hari/matahari", "bulan", "api", "uang"], "日 berarti hari atau matahari."],
  ["n5-kanji-04", "人", "orang", ["orang", "anak", "guru", "teman"], "人 berarti orang."],
  ["n5-kanji-05", "学校", "がっこう", ["がっこう", "でんしゃ", "せんせい", "ともだち"], "学校 dibaca がっこう."],
  ["n5-kanji-06", "水曜日", "すいようび", ["すいようび", "げつようび", "きんようび", "にちようび"], "水曜日 dibaca すいようび."],
] as const;

const n4Kanji = [
  ["n4-kanji-01", "新しい", "あたらしい", ["あたらしい", "いそがしい", "たのしい", "むずかしい"], "新しい dibaca あたらしい."],
  ["n4-kanji-02", "仕事", "しごと", ["しごと", "じかん", "じしょ", "しつもん"], "仕事 dibaca しごと."],
  ["n4-kanji-03", "交通", "transportasi/lalu lintas", ["transportasi/lalu lintas", "makanan", "keluarga", "cuaca"], "交通 berarti transportasi/lalu lintas."],
  ["n4-kanji-04", "病院", "びょういん", ["びょういん", "びよういん", "ぎんこう", "こうえん"], "病院 dibaca びょういん."],
  ["n4-kanji-05", "経験", "pengalaman", ["pengalaman", "rencana", "aturan", "janji"], "経験 berarti pengalaman."],
  ["n4-kanji-06", "説明", "せつめい", ["せつめい", "れんらく", "よやく", "じゅんび"], "説明 dibaca せつめい."],
] as const;

const n5Reading = [
  ["n5-reading-01", "ミラさんは毎朝七時に起きます。朝ごはんを食べて、学校へ行きます。", "ミラさんはいつ起きますか。", "七時", ["七時", "八時", "毎晩", "学校"], "Teks menyebut 七時に起きます."],
  ["n5-reading-02", "これは田中さんの本です。日本語の本です。とてもおもしろいです。", "本は誰のものですか。", "田中さん", ["田中さん", "先生", "私", "友だち"], "田中さんの本 berarti buku milik Tanaka."],
  ["n5-reading-03", "昨日、友だちと映画を見ました。映画は長かったですが、おもしろかったです。", "映画はどうでしたか。", "おもしろかったです", ["おもしろかったです", "短かったです", "安かったです", "静かでした"], "おもしろかったです berarti menarik."],
  ["n5-reading-04", "駅の前にコンビニがあります。コンビニのとなりに小さいレストランがあります。", "レストランはどこですか。", "コンビニのとなり", ["コンビニのとなり", "駅の中", "学校の前", "家の後ろ"], "となり berarti sebelah."],
  ["n5-reading-05", "今日は雨です。公園へ行きません。家で本を読みます。", "今日は何をしますか。", "家で本を読みます", ["家で本を読みます", "公園へ行きます", "映画を見ます", "学校で勉強します"], "Karena hujan, ia membaca buku di rumah."],
  ["n5-reading-06", "私はコーヒーが好きです。でも、母はお茶が好きです。", "母は何が好きですか。", "お茶", ["お茶", "コーヒー", "水", "ジュース"], "母はお茶が好きです."],
] as const;

const n4Reading = [
  ["n4-reading-01", "来週、日本語の試験があります。毎日一時間ぐらい漢字を勉強しています。", "何を勉強していますか。", "漢字", ["漢字", "料理", "英語", "運転"], "漢字を勉強しています."],
  ["n4-reading-02", "昨日は雨だったので、出かけないで家で映画を見ました。", "なぜ家にいましたか。", "雨だったから", ["雨だったから", "忙しかったから", "病気だったから", "映画館が遠いから"], "雨だったので menunjukkan alasan."],
  ["n4-reading-03", "この店は駅から近いし、値段も安いので、よく昼ごはんを食べに行きます。", "この店に行く理由は何ですか。", "近くて安いから", ["近くて安いから", "新しいから", "静かだから", "広いから"], "近い dan 安い adalah alasan."],
  ["n4-reading-04", "山田さんは日本に行ったことがあります。でも、北海道へはまだ行ったことがありません。", "山田さんについて正しいものはどれですか。", "北海道へはまだ行っていません", ["北海道へはまだ行っていません", "日本へ行ったことがありません", "北海道に住んでいます", "毎年北海道へ行きます"], "まだ行ったことがありません berarti belum pernah."],
  ["n4-reading-05", "仕事が終わってから、スーパーで買い物して帰ります。", "いつ買い物しますか。", "仕事が終わってから", ["仕事が終わってから", "朝ごはんの前", "会社へ行く前", "寝てから"], "終わってから berarti setelah selesai."],
  ["n4-reading-06", "この漢字は難しそうですが、何回も書けば覚えられます。", "どうすれば覚えられますか。", "何回も書く", ["何回も書く", "一回だけ読む", "聞くだけ", "使わない"], "何回も書けば berarti jika menulis berkali-kali."],
] as const;

function buildQuestions(): SeedQuestion[] {
  return [
    ...simple(n5Vocabulary, "N5", "vocabulary", "multiple_choice", 1, "Apa arti/bacaan kata ini?"),
    ...simple(n4Vocabulary, "N4", "vocabulary", "multiple_choice", 2, "Apa arti/bacaan kata ini?"),
    ...simple(n5Grammar, "N5", "grammar", "fill_blank", 1, "Lengkapi kalimat berikut."),
    ...simple(n4Grammar, "N4", "grammar", "fill_blank", 2, "Lengkapi kalimat berikut."),
    ...simple(n5Particles, "N5", "particle", "fill_blank", 1, "Pilih partikel yang tepat."),
    ...simple(n4Particles, "N4", "particle", "fill_blank", 2, "Pilih partikel yang tepat."),
    ...simple(n5Kanji, "N5", "kanji", "multiple_choice", 1, "Pilih arti atau bacaan yang tepat."),
    ...simple(n4Kanji, "N4", "kanji", "multiple_choice", 2, "Pilih arti atau bacaan yang tepat."),
    ...reading(n5Reading, "N5", 1),
    ...reading(n4Reading, "N4", 2),
  ];
}

function simple(
  rows: ReadonlyArray<readonly [string, string, string, readonly string[], string]>,
  level: "N5" | "N4",
  skill: SeedQuestion["skill"],
  questionType: SeedQuestion["questionType"],
  difficulty: 1 | 2 | 3,
  prefix: string
): SeedQuestion[] {
  return rows.map(([sourceKey, prompt, correctAnswer, options, explanation]) => ({
    sourceKey,
    level,
    skill,
    questionType,
    prompt: `${prefix}\n${prompt}`,
    options: [...options],
    correctAnswer,
    explanation,
    difficulty: sourceKey.includes("-09") || sourceKey.includes("-10") ? 3 : difficulty,
    tags: [level.toLowerCase(), skill],
  }));
}

function reading(
  rows: ReadonlyArray<readonly [string, string, string, string, readonly string[], string]>,
  level: "N5" | "N4",
  difficulty: 1 | 2
): SeedQuestion[] {
  return rows.map(([sourceKey, passage, prompt, correctAnswer, options, explanation]) => ({
    sourceKey,
    level,
    skill: "reading",
    questionType: "reading_mcq",
    passage,
    prompt,
    options: [...options],
    correctAnswer,
    explanation,
    difficulty: sourceKey.includes("-05") || sourceKey.includes("-06") ? 3 : difficulty,
    tags: [level.toLowerCase(), "reading", "sentence_meaning"],
  }));
}

function validateQuestion(question: SeedQuestion) {
  const errors: string[] = [];
  if (!question.prompt.trim()) errors.push("empty prompt");
  if (!question.explanation.trim()) errors.push("empty explanation");
  if (question.options.length !== 4) errors.push("options length must be 4");
  if (new Set(question.options).size !== question.options.length) errors.push("duplicate options");
  if (!question.options.includes(question.correctAnswer)) errors.push("correctAnswer missing from options");
  if (question.skill === "particle" && !validParticles.has(question.correctAnswer)) {
    errors.push(`invalid particle answer: ${question.correctAnswer}`);
  }

  if (errors.length > 0) {
    throw new Error(`${question.sourceKey}: ${errors.join("; ")}`);
  }
}

async function main() {
  const questions = buildQuestions();
  questions.forEach(validateQuestion);

  for (const question of questions) {
    await prisma.assessmentQuestion.upsert({
      where: { sourceKey: question.sourceKey },
      update: question,
      create: question,
    });
  }

  const byLevel = questions.reduce<Record<string, number>>((acc, question) => {
    acc[question.level] = (acc[question.level] ?? 0) + 1;
    return acc;
  }, {});
  const bySkill = questions.reduce<Record<string, number>>((acc, question) => {
    acc[question.skill] = (acc[question.skill] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Assessment questions seeded: ${questions.length}`);
  console.log(`By level: ${JSON.stringify(byLevel)}`);
  console.log(`By skill: ${JSON.stringify(bySkill)}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
