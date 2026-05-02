import OpenAI from "openai";
import type { LessonInput, NihongoLessonContent, NihongoLessonTemplateVariant } from "./lessonContentTypes";
import { renderLessonContentMarkdown } from "./renderLessonContent";
import { validateLessonTemplateContent } from "./validateLessonContent";

type GeneratedTemplate = {
  title: string;
  contentJson: NihongoLessonContent;
  contentMd: string;
  level: string;
  topic: string;
};

type LessonBlueprint = Omit<NihongoLessonContent, "lessonTitle" | "level">;

const variantFocus: Record<NihongoLessonTemplateVariant, string> = {
  1: "fondasi yang pelan dan mudah diikuti",
  2: "pembahasan pola, perbandingan, dan jebakan umum",
  3: "contoh praktis dan latihan siap pakai",
};

export async function generateLessonTemplate(
  lesson: LessonInput,
  variant: NihongoLessonTemplateVariant
): Promise<GeneratedTemplate> {
  if (process.env.ENABLE_OPENAI_LESSON_TEMPLATE_GENERATION === "true" && process.env.OPENAI_API_KEY) {
    const aiTemplate = await tryGenerateWithOpenAI(lesson, variant);
    if (aiTemplate) return aiTemplate;
  }

  return buildFallbackTemplate(lesson, variant);
}

export function buildFallbackTemplate(
  lesson: LessonInput,
  variant: NihongoLessonTemplateVariant
): GeneratedTemplate {
  const topic = lesson.lessonType ?? lesson.module ?? lesson.title;
  const blueprint = buildLessonBlueprint(lesson, variant);
  const contentJson: NihongoLessonContent = {
    lessonTitle: lesson.title,
    level: lesson.level,
    ...blueprint,
  };

  return {
    title: `${lesson.title} - Variant ${variant}`,
    contentJson,
    contentMd: renderLessonContentMarkdown(contentJson),
    level: lesson.level,
    topic,
  };
}

function buildLessonBlueprint(lesson: LessonInput, variant: NihongoLessonTemplateVariant): LessonBlueprint {
  const title = lesson.title.toLowerCase();
  const description = lesson.description ?? "Materi inti Nexus AI Nihongo.";

  if (title.includes("hiragana")) {
    return makeKanaBlueprint({
      lesson,
      variant,
      objective: "Mengenali hiragana dasar dari あ sampai ん dan membaca suku kata sederhana tanpa romaji.",
      explanation:
        "Hiragana adalah aksara utama untuk kata asli Jepang, partikel, dan akhiran grammar. Di lesson ini fokusnya bukan percakapan, tapi membangun refleks baca: lihat huruf, langsung bunyi.",
      examples: [
        ["あ い う え お", "a i u e o", "baris vokal dasar"],
        ["か き く け こ", "ka ki ku ke ko", "baris K"],
        ["さ し す せ そ", "sa shi su se so", "baris S, perhatikan し = shi"],
      ],
      notes: [
        "Hiragana dibaca per suku kata, bukan per alfabet seperti bahasa Indonesia.",
        "し dibaca shi, ち dibaca chi, つ dibaca tsu. Ini sering terasa tidak simetris, tapi normal.",
        "Latih baris per baris dulu sebelum membaca kata.",
      ],
      mistakes: [
        "Membaca し sebagai si murni atau つ sebagai tu.",
        "Menghafal urutan tabel tanpa bisa mengenali huruf saat posisinya diacak.",
        "Terlalu cepat pindah ke kosakata sebelum bunyi dasar stabil.",
      ],
      practice: ["Baca acak: あ こ し え く.", "Tulis romaji untuk: か さ き す こ.", "Tutup romaji dan baca ulang 5 kali."],
      answers: ["a ko shi e ku", "ka sa ki su ko", "Jika masih ragu, ulangi baris vokal, K, dan S."],
      next: "Lanjut ke Katakana Foundation setelah kamu bisa mengenali huruf acak tanpa melihat tabel.",
    });
  }

  if (title.includes("katakana")) {
    return makeKanaBlueprint({
      lesson,
      variant,
      objective: "Mengenali katakana dasar dan membaca kata serapan sederhana.",
      explanation:
        "Katakana sering dipakai untuk kata serapan, nama asing, brand, dan istilah modern. Fokus lesson ini adalah membedakan bentuk yang mirip dan membaca bunyi pinjaman.",
      examples: [
        ["ア イ ウ エ オ", "a i u e o", "baris vokal katakana"],
        ["カ メ ラ", "kamera", "kamera"],
        ["コ ー ヒ ー", "koohii", "kopi"],
      ],
      notes: [
        "Tanda ー memperpanjang vokal sebelumnya, misalnya コーヒー = koohii.",
        "ソ dan ン mirip; ツ dan シ juga mirip. Perhatikan arah goresan dan proporsi.",
        "Katakana tetap mengikuti bunyi Jepang, jadi kata asing bisa berubah bunyi.",
      ],
      mistakes: [
        "Mengabaikan tanda panjang ー.",
        "Tertukar シ/ツ atau ソ/ン.",
        "Membaca kata serapan dengan pronunciation bahasa Inggris penuh.",
      ],
      practice: ["Baca: アイス.", "Baca: タクシー.", "Pilih mana yang panjang: コヒ atau コーヒー."],
      answers: ["aisu = es/ice cream", "takushii = taksi", "コーヒー punya vokal panjang."],
      next: "Latih katakana lewat nama makanan, transportasi, dan benda sekitar.",
    });
  }

  if (title.includes("dakuten") || title.includes("youon")) {
    return makeKanaBlueprint({
      lesson,
      variant,
      objective: "Membaca dakuten, handakuten, dan kombinasi youon seperti きゃ, しゅ, ちょ.",
      explanation:
        "Dakuten mengubah bunyi kana, misalnya か menjadi が. Handakuten mengubah baris H menjadi P. Youon menggabungkan kana i-row dengan や/ゆ/よ kecil.",
      examples: [
        ["か -> が", "ka -> ga", "bunyi menjadi bersuara"],
        ["は -> ぱ", "ha -> pa", "handakuten"],
        ["き + ゃ = きゃ", "ki + ya = kya", "youon"],
      ],
      notes: [
        "や/ゆ/よ kecil tidak dibaca sebagai suku kata penuh.",
        "じ dan ぢ sama-sama sering terdengar ji, tapi じ jauh lebih umum.",
        "Panjang bunyi dan kombinasi kecil sangat memengaruhi arti.",
      ],
      mistakes: ["Membaca きゃ sebagai ki-ya dua suku kata.", "Lupa membedakan は, ば, dan ぱ.", "Menganggap kana kecil sama seperti kana besar."],
      practice: ["Baca: がっこう.", "Baca: きょう.", "Bedakan: ひゃ, びゃ, ぴゃ."],
      answers: ["gakkou = sekolah", "kyou = hari ini", "hya, bya, pya."],
      next: "Gunakan flashcard untuk drill kombinasi kecil sampai otomatis.",
    });
  }

  if (title.includes("pronunciation")) {
    return makeConversationBlueprint({
      lesson,
      variant,
      objective: "Melatih bunyi dasar Jepang: vokal pendek/panjang, っ, dan ritme mora.",
      explanation:
        "Pronunciation Jepang relatif konsisten, tapi panjang-pendek bunyi bisa mengubah arti. Dengarkan mora satu per satu, lalu tirukan dengan tempo stabil.",
      examples: [
        ["おばさん / おばあさん", "obasan / obaasan", "bibi / nenek"],
        ["きて / きって", "kite / kitte", "datanglah / perangko"],
        ["ビル / ビール", "biru / biiru", "gedung / bir"],
      ],
      notes: ["Vokal panjang dihitung dua ketukan.", "っ membuat jeda kecil sebelum konsonan berikutnya.", "Jangan menekan aksen seperti bahasa Inggris."],
      mistakes: ["Menghapus vokal panjang.", "Membaca っ sebagai tsu penuh.", "Berbicara terlalu cepat sebelum ritme stabil."],
      practice: ["Rekam おばさん dan おばあさん.", "Ulangi きって sebanyak 5 kali.", "Baca ビル dan ビール bergantian."],
      answers: ["おばあさん lebih panjang pada あ.", "きって punya jeda sebelum te.", "ビール punya ii panjang."],
      next: "Gunakan recording di pre-assessment atau lesson untuk cek ritme.",
    });
  }

  if (title.includes("a は b") || title.includes("self introduction") || title.includes("greetings")) {
    return makeGrammarBlueprint({
      lesson,
      variant,
      objective: "Membuat perkenalan dan kalimat identitas sederhana dengan pola A は B です.",
      explanation: `${description} Pola ini dipakai untuk menyatakan identitas, status, atau informasi dasar secara sopan.`,
      examples: [
        ["わたしはミラです。", "Watashi wa Mira desu.", "Saya Mira."],
        ["わたしは学生です。", "Watashi wa gakusei desu.", "Saya pelajar."],
        ["これは本です。", "Kore wa hon desu.", "Ini buku."],
      ],
      notes: ["は dibaca wa saat menjadi partikel.", "です membuat kalimat terdengar sopan.", "A adalah topik, B adalah informasi tentang topik itu."],
      mistakes: ["Membaca partikel は sebagai ha.", "Menambahkan partikel setelah B sebelum です.", "Memakai を untuk identitas."],
      practice: ["Perkenalkan nama kamu.", "Buat kalimat: saya orang Indonesia.", "Ubah これは本です menjadi pertanyaan."],
      answers: ["わたしは___です。", "わたしはインドネシア人です。", "これは本ですか。"],
      next: "Lanjut ke question sentence か untuk membuat pertanyaan.",
    });
  }

  if (title.includes("question")) {
    return makeGrammarBlueprint({
      lesson,
      variant,
      objective: "Membuat pertanyaan sopan dengan partikel か.",
      explanation: "Partikel か diletakkan di akhir kalimat sopan untuk mengubah pernyataan menjadi pertanyaan.",
      examples: [
        ["これは本ですか。", "Kore wa hon desu ka.", "Apakah ini buku?"],
        ["田中さんは先生ですか。", "Tanaka-san wa sensei desu ka.", "Apakah Tanaka guru?"],
        ["日本語はむずかしいですか。", "Nihongo wa muzukashii desu ka.", "Apakah bahasa Jepang sulit?"],
      ],
      notes: ["Tidak perlu tanda tanya dalam tulisan Jepang formal.", "Intonasi naik membantu saat berbicara.", "Jawaban dasar: はい atau いいえ."],
      mistakes: ["Menaruh か di tengah kalimat.", "Menggabungkan か dengan tanda tanya berlebihan dalam latihan formal.", "Lupa memakai です/ます pada kalimat sopan."],
      practice: ["Ubah これはペンです menjadi pertanyaan.", "Tanya: apakah kamu pelajar?", "Jawab singkat dengan はい."],
      answers: ["これはペンですか。", "あなたは学生ですか。", "はい、学生です。"],
      next: "Latih tanya-jawab pendek di AI Tutor.",
    });
  }

  if (title.includes("particles は") || title.includes("particles に") || title.includes("particle")) {
    return particleBlueprint(lesson, variant);
  }

  if (title.includes("masu") || title.includes("past") || title.includes("negative") || title.includes("verbs dictionary")) {
    return verbFormBlueprint(lesson, variant);
  }

  if (title.includes("adjectives")) {
    return adjectiveBlueprint(lesson, variant);
  }

  if (title.includes("existence")) {
    return makeGrammarBlueprint({
      lesson,
      variant,
      objective: "Membedakan あります dan います untuk menyatakan keberadaan.",
      explanation: "あります dipakai untuk benda mati/tanaman/konsep, sedangkan います dipakai untuk manusia dan hewan.",
      examples: [
        ["つくえの上に本があります。", "Tsukue no ue ni hon ga arimasu.", "Ada buku di atas meja."],
        ["教室に先生がいます。", "Kyoushitsu ni sensei ga imasu.", "Ada guru di kelas."],
        ["公園に犬がいます。", "Kouen ni inu ga imasu.", "Ada anjing di taman."],
      ],
      notes: ["Tempat biasanya memakai に.", "Yang ada biasanya ditandai が.", "Pilih あります/います berdasarkan hidup atau tidak."],
      mistakes: ["Memakai あります untuk orang.", "Memakai で untuk lokasi keberadaan dasar.", "Lupa が setelah benda/orang yang ada."],
      practice: ["Ada tas di kelas.", "Ada teman di stasiun.", "Tidak ada buku."],
      answers: ["教室にかばんがあります。", "駅に友だちがいます。", "本がありません。"],
      next: "Latih lokasi dan benda sekitar kamar/kelas.",
    });
  }

  if (title.includes("counters") || title.includes("numbers") || title.includes("time") || title.includes("dates")) {
    return numbersBlueprint(lesson, variant);
  }

  if (title.includes("te-form") || title.includes("nai-form") || title.includes("must do") || title.includes("may do") || title.includes("prohibition") || title.includes("potential") || title.includes("giving") || title.includes("want to") || title.includes("experience") || title.includes("before") || title.includes("because") || title.includes("comparisons") || title.includes("plans") || title.includes("trying")) {
    return n4GrammarBlueprint(lesson, variant);
  }

  return makeConversationBlueprint({
    lesson,
    variant,
    objective: `Menggunakan ${lesson.title} dalam konteks praktis.`,
    explanation: `${description} Fokus lesson ini adalah memahami frasa yang sering muncul dan memakainya dalam situasi nyata.`,
    examples: practicalExamplesFor(title),
    notes: ["Mulai dari frasa pendek yang paling sering dipakai.", "Perhatikan tingkat kesopanan saat bicara dengan orang baru.", "Ulangi contoh sampai bisa mengganti detailnya."],
    mistakes: ["Menerjemahkan terlalu literal.", "Memakai gaya kasual di situasi formal.", "Tidak mengulang frasa dengan konteks sendiri."],
    practice: ["Buat satu dialog 2 baris.", "Ganti tempat/waktu pada contoh.", "Baca contoh dengan suara natural."],
    answers: ["Gunakan pola contoh sebagai kerangka.", "Ganti kata benda sesuai situasi.", "Pastikan akhir kalimat tetap sopan."],
    next: "Tanya AI Tutor untuk roleplay singkat sesuai situasi ini.",
  });
}

function makeKanaBlueprint(input: {
  lesson: LessonInput;
  variant: NihongoLessonTemplateVariant;
  objective: string;
  explanation: string;
  examples: Array<[string, string, string]>;
  notes: string[];
  mistakes: string[];
  practice: string[];
  answers: string[];
  next: string;
}): LessonBlueprint {
  return applyVariant(input, "Kana bukan grammar percakapan. Ukurannya adalah akurasi mengenali huruf, bunyi, dan kombinasi.");
}

function makeGrammarBlueprint(input: {
  lesson: LessonInput;
  variant: NihongoLessonTemplateVariant;
  objective: string;
  explanation: string;
  examples: Array<[string, string, string]>;
  notes: string[];
  mistakes: string[];
  practice: string[];
  answers: string[];
  next: string;
}): LessonBlueprint {
  return applyVariant(input, "Grammar dipahami paling cepat lewat pola kecil, contoh jelas, lalu variasi terkontrol.");
}

function makeConversationBlueprint(input: {
  lesson: LessonInput;
  variant: NihongoLessonTemplateVariant;
  objective: string;
  explanation: string;
  examples: Array<[string, string, string]>;
  notes: string[];
  mistakes: string[];
  practice: string[];
  answers: string[];
  next: string;
}): LessonBlueprint {
  return applyVariant(input, "Untuk conversation, targetnya adalah bisa merespons singkat, sopan, dan natural.");
}

function applyVariant(input: {
  lesson: LessonInput;
  variant: NihongoLessonTemplateVariant;
  objective: string;
  explanation: string;
  examples: Array<[string, string, string]>;
  notes: string[];
  mistakes: string[];
  practice: string[];
  answers: string[];
  next: string;
}, lens: string): LessonBlueprint {
  const variantLead =
    input.variant === 1
      ? "Mulai pelan dari bentuk utama."
      : input.variant === 2
        ? "Sekarang lihat perbandingan dan alasan di balik polanya."
        : "Sekarang pakai materi ini dalam contoh yang lebih praktis.";

  return {
    objective: input.objective,
    explanationIndonesian: `${input.explanation} ${variantLead} ${lens}`,
    japaneseExamples: input.examples.map(([japanese, romaji, translationIndonesian]) => ({
      japanese,
      romaji,
      translationIndonesian,
    })),
    grammarNotes: input.notes,
    commonMistakes: input.mistakes,
    miniPractice: input.practice,
    answerKey: input.answers,
    summary: `${input.lesson.title} fokus pada ${variantFocus[input.variant]}. Materinya harus nyambung langsung dengan ${input.lesson.lessonType ?? input.lesson.module ?? "topik lesson"}.`,
    recommendedNextStep: input.next,
  };
}

function particleBlueprint(lesson: LessonInput, variant: NihongoLessonTemplateVariant): LessonBlueprint {
  const isNiDeHe = lesson.title.includes("に") || lesson.title.includes("で") || lesson.title.includes("へ");
  return makeGrammarBlueprint({
    lesson,
    variant,
    objective: isNiDeHe ? "Membedakan に, で, dan へ untuk waktu, lokasi, dan arah." : "Membedakan は, が, dan を dalam kalimat dasar.",
    explanation: isNiDeHe
      ? "に sering menandai waktu atau titik tujuan, で menandai lokasi aktivitas, dan へ menandai arah."
      : "は menandai topik, が menandai subjek/fokus, dan を menandai objek langsung dari aksi.",
    examples: isNiDeHe
      ? [
          ["七時に起きます。", "Shichi-ji ni okimasu.", "Saya bangun jam tujuh."],
          ["学校で勉強します。", "Gakkou de benkyou shimasu.", "Saya belajar di sekolah."],
          ["日本へ行きます。", "Nihon e ikimasu.", "Saya pergi ke Jepang."],
        ]
      : [
          ["わたしは学生です。", "Watashi wa gakusei desu.", "Saya pelajar."],
          ["雨が降っています。", "Ame ga futte imasu.", "Hujan sedang turun."],
          ["パンを食べます。", "Pan o tabemasu.", "Saya makan roti."],
        ],
    notes: isNiDeHe
      ? ["に = titik waktu/tujuan/keberadaan.", "で = tempat aktivitas berlangsung.", "へ dibaca e saat menjadi partikel."]
      : ["は memberi konteks topik.", "が sering dipakai saat informasi subjek penting atau baru.", "を hanya untuk objek aksi, bukan setelah です."],
    mistakes: isNiDeHe
      ? ["Memakai で untuk jam.", "Memakai に untuk semua lokasi aktivitas.", "Membaca へ sebagai he saat partikel."]
      : ["Menaruh を sebelum です.", "Menganggap は dan が selalu bisa saling ganti.", "Lupa bahwa を dibaca o."],
    practice: isNiDeHe ? ["Saya belajar di rumah.", "Saya tidur jam 10.", "Saya pergi ke stasiun."] : ["Saya minum air.", "Kucing ada.", "Saya adalah guru."],
    answers: isNiDeHe ? ["家で勉強します。", "十時に寝ます。", "駅へ行きます。"] : ["水を飲みます。", "ねこがいます。", "わたしは先生です。"],
    next: "Kerjakan quiz partikel dan cek alasan pilihanmu, bukan hanya jawaban benar.",
  });
}

function verbFormBlueprint(lesson: LessonInput, variant: NihongoLessonTemplateVariant): LessonBlueprint {
  return makeGrammarBlueprint({
    lesson,
    variant,
    objective: "Mengenali bentuk kata kerja dasar, ます, negatif, lampau, dan lampau negatif.",
    explanation: "Kata kerja Jepang berubah bentuk untuk menunjukkan sopan/tidak, waktu, dan negatif. Lesson ini mengunci pola ます, ません, ました, ませんでした.",
    examples: [
      ["毎日、本を読みます。", "Mainichi hon o yomimasu.", "Saya membaca buku setiap hari."],
      ["今日は行きません。", "Kyou wa ikimasen.", "Hari ini saya tidak pergi."],
      ["昨日、映画を見ました。", "Kinou eiga o mimashita.", "Kemarin saya menonton film."],
    ],
    notes: ["ます = non-lampau sopan.", "ません = non-lampau negatif sopan.", "ました = lampau sopan, ませんでした = lampau negatif sopan."],
    mistakes: ["Memakai ました untuk besok.", "Lupa でした pada bentuk negatif lampau.", "Mencampur dictionary form dan masu form tanpa tahu konteks."],
    practice: ["Ubah 食べます ke negatif.", "Ubah 見ます ke lampau.", "Ubah 行きます ke lampau negatif."],
    answers: ["食べません。", "見ました。", "行きませんでした。"],
    next: "Lanjutkan ke adjective atau te-form setelah empat bentuk sopan ini stabil.",
  });
}

function adjectiveBlueprint(lesson: LessonInput, variant: NihongoLessonTemplateVariant): LessonBlueprint {
  return makeGrammarBlueprint({
    lesson,
    variant,
    objective: "Membedakan い-adjective dan な-adjective dalam kalimat positif, negatif, dan lampau.",
    explanation: "い-adjective berubah langsung pada akhir kata, sedangkan な-adjective memakai です/でした dan な saat menerangkan kata benda.",
    examples: [
      ["この本は高いです。", "Kono hon wa takai desu.", "Buku ini mahal."],
      ["この本は高くないです。", "Kono hon wa takakunai desu.", "Buku ini tidak mahal."],
      ["静かな町です。", "Shizuka na machi desu.", "Ini kota yang tenang."],
    ],
    notes: ["い-adjective negatif: い menjadi くない.", "い-adjective lampau: い menjadi かった.", "な-adjective butuh な sebelum kata benda: 静かな町."],
    mistakes: ["Mengucapkan 高いじゃない untuk い-adjective dasar.", "Lupa な pada 静かな町.", "Membuat きれい menjadi きれくない padahal きれい adalah な-adjective."],
    practice: ["Ubah おいしい ke negatif.", "Ubah 高い ke lampau.", "Buat frasa: kota yang tenang."],
    answers: ["おいしくないです。", "高かったです。", "静かな町です。"],
    next: "Latih 5 kata sifat い dan 5 kata sifat な dengan benda di sekitarmu.",
  });
}

function numbersBlueprint(lesson: LessonInput, variant: NihongoLessonTemplateVariant): LessonBlueprint {
  return makeGrammarBlueprint({
    lesson,
    variant,
    objective: "Menggunakan angka, waktu, tanggal, atau counter sesuai topik lesson.",
    explanation: "Angka Jepang punya beberapa bacaan khusus saat bertemu jam, tanggal, orang, dan benda. Jangan hanya hafal 1-10; latih dalam konteks.",
    examples: [
      ["今、七時です。", "Ima, shichi-ji desu.", "Sekarang jam tujuh."],
      ["三人います。", "San-nin imasu.", "Ada tiga orang."],
      ["本を二冊買いました。", "Hon o ni-satsu kaimashita.", "Saya membeli dua buku."],
    ],
    notes: ["Jam memakai 時, menit memakai 分.", "Orang memakai counter 人.", "Benda umum sering memakai つ atau counter spesifik seperti 冊 untuk buku."],
    mistakes: ["Memakai angka biasa tanpa counter.", "Tertukar よじ dan しちじ.", "Lupa bacaan khusus seperti ひとり dan ふたり."],
    practice: ["Tulis jam 4.", "Tulis dua orang.", "Tulis tiga buku."],
    answers: ["四時 / よじ", "二人 / ふたり", "三冊 / さんさつ"],
    next: "Gunakan angka dalam kalimat belanja atau jadwal harian.",
  });
}

function n4GrammarBlueprint(lesson: LessonInput, variant: NihongoLessonTemplateVariant): LessonBlueprint {
  const title = lesson.title.toLowerCase();
  if (title.includes("te-form")) {
    return makeGrammarBlueprint({
      lesson,
      variant,
      objective: "Memakai bentuk て untuk menyambung aksi, meminta, atau menjelaskan keadaan.",
      explanation: "て-form adalah pintu masuk banyak grammar N4. Bentuk ini tidak punya satu arti tunggal; fungsinya tergantung pola setelahnya.",
      examples: [["名前を書いてください。", "Namae o kaite kudasai.", "Tolong tulis nama."], ["朝ごはんを食べて、学校へ行きます。", "Asagohan o tabete, gakkou e ikimasu.", "Saya sarapan lalu pergi ke sekolah."], ["今、勉強しています。", "Ima, benkyou shite imasu.", "Sekarang saya sedang belajar."]],
      notes: ["てください = meminta tolong/instruksi.", "ている = sedang/keadaan berlanjut.", "て bisa menyambung urutan aksi."],
      mistakes: ["Mengira semua て berarti 'dan'.", "Salah perubahan 行く menjadi 行って.", "Lupa konteks pola setelah て."],
      practice: ["Tolong dengarkan.", "Saya makan lalu tidur.", "Saya sedang membaca."],
      answers: ["聞いてください。", "食べて、寝ます。", "読んでいます。"],
      next: "Review kelompok perubahan te-form sebelum masuk pola N4 berikutnya.",
    });
  }

  return makeGrammarBlueprint({
    lesson,
    variant,
    objective: `Memahami pola N4: ${lesson.title}.`,
    explanation: `${lesson.description ?? lesson.title} Pola N4 perlu dipelajari dari fungsi, bentuk, lalu contoh konteks.`,
    examples: [
      ["日本へ行きたいです。", "Nihon e ikitai desu.", "Saya ingin pergi ke Jepang."],
      ["漢字を読んだことがあります。", "Kanji o yonda koto ga arimasu.", "Saya pernah membaca kanji."],
      ["雨ですから、家で勉強します。", "Ame desu kara, ie de benkyou shimasu.", "Karena hujan, saya belajar di rumah."],
    ],
    notes: ["Identifikasi kata kerja dasar sebelum mengubah bentuk.", "Perhatikan partikel yang selalu ikut pola.", "Bandingkan arti literal dan fungsi naturalnya."],
    mistakes: ["Menghafal arti tanpa bentuk.", "Memakai pola N4 dengan kata kerja yang belum diubah.", "Lupa tingkat kesopanan di akhir kalimat."],
    practice: ["Buat satu kalimat memakai pola lesson.", "Ubah contoh menjadi negatif jika memungkinkan.", "Tanya AI Tutor untuk 2 contoh tambahan."],
    answers: ["Jawaban mengikuti pola utama lesson.", "Cek bentuk kata kerja sebelum pola.", "Pastikan partikel tetap sesuai."],
    next: "Buka contoh percakapan variant 3 lalu buat kalimat versi kamu sendiri.",
  });
}

function practicalExamplesFor(title: string): Array<[string, string, string]> {
  if (title.includes("shopping")) {
    return [["これはいくらですか。", "Kore wa ikura desu ka.", "Ini berapa harganya?"], ["これをください。", "Kore o kudasai.", "Saya mau yang ini."], ["カードで払えますか。", "Kaado de haraemasu ka.", "Bisa bayar dengan kartu?"]];
  }
  if (title.includes("restaurant")) {
    return [["メニューをください。", "Menyuu o kudasai.", "Tolong berikan menu."], ["水をお願いします。", "Mizu o onegai shimasu.", "Tolong air putih."], ["これは何ですか。", "Kore wa nan desu ka.", "Ini apa?"]];
  }
  if (title.includes("train") || title.includes("direction")) {
    return [["駅はどこですか。", "Eki wa doko desu ka.", "Stasiun di mana?"], ["この電車は新宿へ行きますか。", "Kono densha wa Shinjuku e ikimasu ka.", "Kereta ini pergi ke Shinjuku?"], ["右へ曲がってください。", "Migi e magatte kudasai.", "Tolong belok kanan."]];
  }
  if (title.includes("clinic") || title.includes("health")) {
    return [["頭が痛いです。", "Atama ga itai desu.", "Kepala saya sakit."], ["薬をください。", "Kusuri o kudasai.", "Tolong beri obat."], ["いつからですか。", "Itsu kara desu ka.", "Sejak kapan?"]];
  }
  return [["おはようございます。", "Ohayou gozaimasu.", "Selamat pagi."], ["よろしくお願いします。", "Yoroshiku onegai shimasu.", "Mohon kerja samanya."], ["もう一度お願いします。", "Mou ichido onegai shimasu.", "Tolong sekali lagi."]];
}

async function tryGenerateWithOpenAI(
  lesson: LessonInput,
  variant: NihongoLessonTemplateVariant
): Promise<GeneratedTemplate | null> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_LESSON_MODEL ?? "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Create strict JSON for a Japanese lesson for Indonesian learners. The content must be specific to the lesson title and lesson type. Do not use generic examples unless they directly teach this lesson.",
        },
        {
          role: "user",
          content: JSON.stringify({
            lesson,
            variant,
            focus: variantFocus[variant],
            requiredKeys: [
              "lessonTitle",
              "level",
              "objective",
              "explanationIndonesian",
              "japaneseExamples",
              "grammarNotes",
              "commonMistakes",
              "miniPractice",
              "answerKey",
              "summary",
              "recommendedNextStep",
            ],
          }),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;

    const contentJson = JSON.parse(raw) as NihongoLessonContent;
    const validation = validateLessonTemplateContent(contentJson);
    if (!validation.valid) return null;

    return {
      title: `${lesson.title} - Variant ${variant}`,
      contentJson,
      contentMd: renderLessonContentMarkdown(contentJson),
      level: lesson.level,
      topic: lesson.lessonType ?? lesson.module ?? lesson.title,
    };
  } catch (error) {
    console.error("OpenAI lesson template generation failed; using deterministic fallback.", error);
    return null;
  }
}
