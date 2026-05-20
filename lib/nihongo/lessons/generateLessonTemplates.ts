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
      objective: "Mengenali hiragana dasar dari ã‚ sampai ã‚“ dan membaca suku kata sederhana tanpa romaji.",
      explanation:
        "Hiragana adalah aksara utama untuk kata asli Jepang, partikel, dan akhiran grammar. Di lesson ini fokusnya bukan percakapan, tapi membangun refleks baca: lihat huruf, langsung bunyi.",
      examples: [
        ["ã‚ ã„ ã† ãˆ ãŠ", "a i u e o", "baris vokal dasar"],
        ["ã‹ ã ã ã‘ ã“", "ka ki ku ke ko", "baris K"],
        ["ã• ã— ã™ ã› ã", "sa shi su se so", "baris S, perhatikan ã— = shi"],
      ],
      notes: [
        "Hiragana dibaca per suku kata, bukan per alfabet seperti bahasa Indonesia.",
        "ã— dibaca shi, ã¡ dibaca chi, ã¤ dibaca tsu. Ini sering terasa tidak simetris, tapi normal.",
        "Latih baris per baris dulu sebelum membaca kata.",
      ],
      mistakes: [
        "Membaca ã— sebagai si murni atau ã¤ sebagai tu.",
        "Menghafal urutan tabel tanpa bisa mengenali huruf saat posisinya diacak.",
        "Terlalu cepat pindah ke kosakata sebelum bunyi dasar stabil.",
      ],
      practice: ["Baca acak: ã‚ ã“ ã— ãˆ ã.", "Tulis romaji untuk: ã‹ ã• ã ã™ ã“.", "Tutup romaji dan baca ulang 5 kali."],
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
        ["ã‚¢ ã‚¤ ã‚¦ ã‚¨ ã‚ª", "a i u e o", "baris vokal katakana"],
        ["ã‚« ãƒ¡ ãƒ©", "kamera", "kamera"],
        ["ã‚³ ãƒ¼ ãƒ’ ãƒ¼", "koohii", "kopi"],
      ],
      notes: [
        "Tanda ãƒ¼ memperpanjang vokal sebelumnya, misalnya ã‚³ãƒ¼ãƒ’ãƒ¼ = koohii.",
        "ã‚½ dan ãƒ³ mirip; ãƒ„ dan ã‚· juga mirip. Perhatikan arah goresan dan proporsi.",
        "Katakana tetap mengikuti bunyi Jepang, jadi kata asing bisa berubah bunyi.",
      ],
      mistakes: [
        "Mengabaikan tanda panjang ãƒ¼.",
        "Tertukar ã‚·/ãƒ„ atau ã‚½/ãƒ³.",
        "Membaca kata serapan dengan pronunciation bahasa Inggris penuh.",
      ],
      practice: ["Baca: ã‚¢ã‚¤ã‚¹.", "Baca: ã‚¿ã‚¯ã‚·ãƒ¼.", "Pilih mana yang panjang: ã‚³ãƒ’ atau ã‚³ãƒ¼ãƒ’ãƒ¼."],
      answers: ["aisu = es/ice cream", "takushii = taksi", "ã‚³ãƒ¼ãƒ’ãƒ¼ punya vokal panjang."],
      next: "Latih katakana lewat nama makanan, transportasi, dan benda sekitar.",
    });
  }

  if (title.includes("dakuten") || title.includes("youon")) {
    return makeKanaBlueprint({
      lesson,
      variant,
      objective: "Membaca dakuten, handakuten, dan kombinasi youon seperti ãã‚ƒ, ã—ã‚…, ã¡ã‚‡.",
      explanation:
        "Dakuten mengubah bunyi kana, misalnya ã‹ menjadi ãŒ. Handakuten mengubah baris H menjadi P. Youon menggabungkan kana i-row dengan ã‚„/ã‚†/ã‚ˆ kecil.",
      examples: [
        ["ã‹ -> ãŒ", "ka -> ga", "bunyi menjadi bersuara"],
        ["ã¯ -> ã±", "ha -> pa", "handakuten"],
        ["ã + ã‚ƒ = ãã‚ƒ", "ki + ya = kya", "youon"],
      ],
      notes: [
        "ã‚„/ã‚†/ã‚ˆ kecil tidak dibaca sebagai suku kata penuh.",
        "ã˜ dan ã¢ sama-sama sering terdengar ji, tapi ã˜ jauh lebih umum.",
        "Panjang bunyi dan kombinasi kecil sangat memengaruhi arti.",
      ],
      mistakes: ["Membaca ãã‚ƒ sebagai ki-ya dua suku kata.", "Lupa membedakan ã¯, ã°, dan ã±.", "Menganggap kana kecil sama seperti kana besar."],
      practice: ["Baca: ãŒã£ã“ã†.", "Baca: ãã‚‡ã†.", "Bedakan: ã²ã‚ƒ, ã³ã‚ƒ, ã´ã‚ƒ."],
      answers: ["gakkou = sekolah", "kyou = hari ini", "hya, bya, pya."],
      next: "Gunakan flashcard untuk drill kombinasi kecil sampai otomatis.",
    });
  }

  if (title.includes("pronunciation")) {
    return makeConversationBlueprint({
      lesson,
      variant,
      objective: "Melatih bunyi dasar Jepang: vokal pendek/panjang, ã£, dan ritme mora.",
      explanation:
        "Pronunciation Jepang relatif konsisten, tapi panjang-pendek bunyi bisa mengubah arti. Dengarkan mora satu per satu, lalu tirukan dengan tempo stabil.",
      examples: [
        ["ãŠã°ã•ã‚“ / ãŠã°ã‚ã•ã‚“", "obasan / obaasan", "bibi / nenek"],
        ["ãã¦ / ãã£ã¦", "kite / kitte", "datanglah / perangko"],
        ["ãƒ“ãƒ« / ãƒ“ãƒ¼ãƒ«", "biru / biiru", "gedung / bir"],
      ],
      notes: ["Vokal panjang dihitung dua ketukan.", "ã£ membuat jeda kecil sebelum konsonan berikutnya.", "Jangan menekan aksen seperti bahasa Inggris."],
      mistakes: ["Menghapus vokal panjang.", "Membaca ã£ sebagai tsu penuh.", "Berbicara terlalu cepat sebelum ritme stabil."],
      practice: ["Rekam ãŠã°ã•ã‚“ dan ãŠã°ã‚ã•ã‚“.", "Ulangi ãã£ã¦ sebanyak 5 kali.", "Baca ãƒ“ãƒ« dan ãƒ“ãƒ¼ãƒ« bergantian."],
      answers: ["ãŠã°ã‚ã•ã‚“ lebih panjang pada ã‚.", "ãã£ã¦ punya jeda sebelum te.", "ãƒ“ãƒ¼ãƒ« punya ii panjang."],
      next: "Gunakan recording di pre-assessment atau lesson untuk cek ritme.",
    });
  }

  if (title.includes("a ã¯ b") || title.includes("self introduction") || title.includes("greetings")) {
    return makeGrammarBlueprint({
      lesson,
      variant,
      objective: "Membuat perkenalan dan kalimat identitas sederhana dengan pola A ã¯ B ã§ã™.",
      explanation: `${description} Pola ini dipakai untuk menyatakan identitas, status, atau informasi dasar secara sopan.`,
      examples: [
        ["ã‚ãŸã—ã¯ãƒŸãƒ©ã§ã™ã€‚", "Watashi wa Mira desu.", "Saya Mira."],
        ["ã‚ãŸã—ã¯å­¦ç”Ÿã§ã™ã€‚", "Watashi wa gakusei desu.", "Saya pelajar."],
        ["ã“ã‚Œã¯æœ¬ã§ã™ã€‚", "Kore wa hon desu.", "Ini buku."],
      ],
      notes: ["ã¯ dibaca wa saat menjadi partikel.", "ã§ã™ membuat kalimat terdengar sopan.", "A adalah topik, B adalah informasi tentang topik itu."],
      mistakes: ["Membaca partikel ã¯ sebagai ha.", "Menambahkan partikel setelah B sebelum ã§ã™.", "Memakai ã‚’ untuk identitas."],
      practice: ["Perkenalkan nama kamu.", "Buat kalimat: saya orang Indonesia.", "Ubah ã“ã‚Œã¯æœ¬ã§ã™ menjadi pertanyaan."],
      answers: ["ã‚ãŸã—ã¯___ã§ã™ã€‚", "ã‚ãŸã—ã¯ã‚¤ãƒ³ãƒ‰ãƒã‚·ã‚¢äººã§ã™ã€‚", "ã“ã‚Œã¯æœ¬ã§ã™ã‹ã€‚"],
      next: "Lanjut ke question sentence ã‹ untuk membuat pertanyaan.",
    });
  }

  if (title.includes("question")) {
    return makeGrammarBlueprint({
      lesson,
      variant,
      objective: "Membuat pertanyaan sopan dengan partikel ã‹.",
      explanation: "Partikel ã‹ diletakkan di akhir kalimat sopan untuk mengubah pernyataan menjadi pertanyaan.",
      examples: [
        ["ã“ã‚Œã¯æœ¬ã§ã™ã‹ã€‚", "Kore wa hon desu ka.", "Apakah ini buku?"],
        ["ç”°ä¸­ã•ã‚“ã¯å…ˆç”Ÿã§ã™ã‹ã€‚", "Tanaka-san wa sensei desu ka.", "Apakah Tanaka guru?"],
        ["æ—¥æœ¬èªžã¯ã‚€ãšã‹ã—ã„ã§ã™ã‹ã€‚", "Nihongo wa muzukashii desu ka.", "Apakah bahasa Jepang sulit?"],
      ],
      notes: ["Tidak perlu tanda tanya dalam tulisan Jepang formal.", "Intonasi naik membantu saat berbicara.", "Jawaban dasar: ã¯ã„ atau ã„ã„ãˆ."],
      mistakes: ["Menaruh ã‹ di tengah kalimat.", "Menggabungkan ã‹ dengan tanda tanya berlebihan dalam latihan formal.", "Lupa memakai ã§ã™/ã¾ã™ pada kalimat sopan."],
      practice: ["Ubah ã“ã‚Œã¯ãƒšãƒ³ã§ã™ menjadi pertanyaan.", "Tanya: apakah kamu pelajar?", "Jawab singkat dengan ã¯ã„."],
      answers: ["ã“ã‚Œã¯ãƒšãƒ³ã§ã™ã‹ã€‚", "ã‚ãªãŸã¯å­¦ç”Ÿã§ã™ã‹ã€‚", "ã¯ã„ã€å­¦ç”Ÿã§ã™ã€‚"],
      next: "Latih tanya-jawab pendek di AI Tutor.",
    });
  }

  if (title.includes("particles ã¯") || title.includes("particles ã«") || title.includes("particle")) {
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
      objective: "Membedakan ã‚ã‚Šã¾ã™ dan ã„ã¾ã™ untuk menyatakan keberadaan.",
      explanation: "ã‚ã‚Šã¾ã™ dipakai untuk benda mati/tanaman/konsep, sedangkan ã„ã¾ã™ dipakai untuk manusia dan hewan.",
      examples: [
        ["ã¤ããˆã®ä¸Šã«æœ¬ãŒã‚ã‚Šã¾ã™ã€‚", "Tsukue no ue ni hon ga arimasu.", "Ada buku di atas meja."],
        ["æ•™å®¤ã«å…ˆç”ŸãŒã„ã¾ã™ã€‚", "Kyoushitsu ni sensei ga imasu.", "Ada guru di kelas."],
        ["å…¬åœ’ã«çŠ¬ãŒã„ã¾ã™ã€‚", "Kouen ni inu ga imasu.", "Ada anjing di taman."],
      ],
      notes: ["Tempat biasanya memakai ã«.", "Yang ada biasanya ditandai ãŒ.", "Pilih ã‚ã‚Šã¾ã™/ã„ã¾ã™ berdasarkan hidup atau tidak."],
      mistakes: ["Memakai ã‚ã‚Šã¾ã™ untuk orang.", "Memakai ã§ untuk lokasi keberadaan dasar.", "Lupa ãŒ setelah benda/orang yang ada."],
      practice: ["Ada tas di kelas.", "Ada teman di stasiun.", "Tidak ada buku."],
      answers: ["æ•™å®¤ã«ã‹ã°ã‚“ãŒã‚ã‚Šã¾ã™ã€‚", "é§…ã«å‹ã ã¡ãŒã„ã¾ã™ã€‚", "æœ¬ãŒã‚ã‚Šã¾ã›ã‚“ã€‚"],
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
  const isNiDeHe = lesson.title.includes("ã«") || lesson.title.includes("ã§") || lesson.title.includes("ã¸");
  return makeGrammarBlueprint({
    lesson,
    variant,
    objective: isNiDeHe ? "Membedakan ã«, ã§, dan ã¸ untuk waktu, lokasi, dan arah." : "Membedakan ã¯, ãŒ, dan ã‚’ dalam kalimat dasar.",
    explanation: isNiDeHe
      ? "ã« sering menandai waktu atau titik tujuan, ã§ menandai lokasi aktivitas, dan ã¸ menandai arah."
      : "ã¯ menandai topik, ãŒ menandai subjek/fokus, dan ã‚’ menandai objek langsung dari aksi.",
    examples: isNiDeHe
      ? [
          ["ä¸ƒæ™‚ã«èµ·ãã¾ã™ã€‚", "Shichi-ji ni okimasu.", "Saya bangun jam tujuh."],
          ["å­¦æ ¡ã§å‹‰å¼·ã—ã¾ã™ã€‚", "Gakkou de benkyou shimasu.", "Saya belajar di sekolah."],
          ["æ—¥æœ¬ã¸è¡Œãã¾ã™ã€‚", "Nihon e ikimasu.", "Saya pergi ke Jepang."],
        ]
      : [
          ["ã‚ãŸã—ã¯å­¦ç”Ÿã§ã™ã€‚", "Watashi wa gakusei desu.", "Saya pelajar."],
          ["é›¨ãŒé™ã£ã¦ã„ã¾ã™ã€‚", "Ame ga futte imasu.", "Hujan sedang turun."],
          ["ãƒ‘ãƒ³ã‚’é£Ÿã¹ã¾ã™ã€‚", "Pan o tabemasu.", "Saya makan roti."],
        ],
    notes: isNiDeHe
      ? ["ã« = titik waktu/tujuan/keberadaan.", "ã§ = tempat aktivitas berlangsung.", "ã¸ dibaca e saat menjadi partikel."]
      : ["ã¯ memberi konteks topik.", "ãŒ sering dipakai saat informasi subjek penting atau baru.", "ã‚’ hanya untuk objek aksi, bukan setelah ã§ã™."],
    mistakes: isNiDeHe
      ? ["Memakai ã§ untuk jam.", "Memakai ã« untuk semua lokasi aktivitas.", "Membaca ã¸ sebagai he saat partikel."]
      : ["Menaruh ã‚’ sebelum ã§ã™.", "Menganggap ã¯ dan ãŒ selalu bisa saling ganti.", "Lupa bahwa ã‚’ dibaca o."],
    practice: isNiDeHe ? ["Saya belajar di rumah.", "Saya tidur jam 10.", "Saya pergi ke stasiun."] : ["Saya minum air.", "Kucing ada.", "Saya adalah guru."],
    answers: isNiDeHe ? ["å®¶ã§å‹‰å¼·ã—ã¾ã™ã€‚", "åæ™‚ã«å¯ã¾ã™ã€‚", "é§…ã¸è¡Œãã¾ã™ã€‚"] : ["æ°´ã‚’é£²ã¿ã¾ã™ã€‚", "ã­ã“ãŒã„ã¾ã™ã€‚", "ã‚ãŸã—ã¯å…ˆç”Ÿã§ã™ã€‚"],
    next: "Kerjakan quiz partikel dan cek alasan pilihanmu, bukan hanya jawaban benar.",
  });
}

function verbFormBlueprint(lesson: LessonInput, variant: NihongoLessonTemplateVariant): LessonBlueprint {
  return makeGrammarBlueprint({
    lesson,
    variant,
    objective: "Mengenali bentuk kata kerja dasar, ã¾ã™, negatif, lampau, dan lampau negatif.",
    explanation: "Kata kerja Jepang berubah bentuk untuk menunjukkan sopan/tidak, waktu, dan negatif. Lesson ini mengunci pola ã¾ã™, ã¾ã›ã‚“, ã¾ã—ãŸ, ã¾ã›ã‚“ã§ã—ãŸ.",
    examples: [
      ["æ¯Žæ—¥ã€æœ¬ã‚’èª­ã¿ã¾ã™ã€‚", "Mainichi hon o yomimasu.", "Saya membaca buku setiap hari."],
      ["ä»Šæ—¥ã¯è¡Œãã¾ã›ã‚“ã€‚", "Kyou wa ikimasen.", "Hari ini saya tidak pergi."],
      ["æ˜¨æ—¥ã€æ˜ ç”»ã‚’è¦‹ã¾ã—ãŸã€‚", "Kinou eiga o mimashita.", "Kemarin saya menonton film."],
    ],
    notes: ["ã¾ã™ = non-lampau sopan.", "ã¾ã›ã‚“ = non-lampau negatif sopan.", "ã¾ã—ãŸ = lampau sopan, ã¾ã›ã‚“ã§ã—ãŸ = lampau negatif sopan."],
    mistakes: ["Memakai ã¾ã—ãŸ untuk besok.", "Lupa ã§ã—ãŸ pada bentuk negatif lampau.", "Mencampur dictionary form dan masu form tanpa tahu konteks."],
    practice: ["Ubah é£Ÿã¹ã¾ã™ ke negatif.", "Ubah è¦‹ã¾ã™ ke lampau.", "Ubah è¡Œãã¾ã™ ke lampau negatif."],
    answers: ["é£Ÿã¹ã¾ã›ã‚“ã€‚", "è¦‹ã¾ã—ãŸã€‚", "è¡Œãã¾ã›ã‚“ã§ã—ãŸã€‚"],
    next: "Lanjutkan ke adjective atau te-form setelah empat bentuk sopan ini stabil.",
  });
}

function adjectiveBlueprint(lesson: LessonInput, variant: NihongoLessonTemplateVariant): LessonBlueprint {
  return makeGrammarBlueprint({
    lesson,
    variant,
    objective: "Membedakan ã„-adjective dan ãª-adjective dalam kalimat positif, negatif, dan lampau.",
    explanation: "ã„-adjective berubah langsung pada akhir kata, sedangkan ãª-adjective memakai ã§ã™/ã§ã—ãŸ dan ãª saat menerangkan kata benda.",
    examples: [
      ["ã“ã®æœ¬ã¯é«˜ã„ã§ã™ã€‚", "Kono hon wa takai desu.", "Buku ini mahal."],
      ["ã“ã®æœ¬ã¯é«˜ããªã„ã§ã™ã€‚", "Kono hon wa takakunai desu.", "Buku ini tidak mahal."],
      ["é™ã‹ãªç”ºã§ã™ã€‚", "Shizuka na machi desu.", "Ini kota yang tenang."],
    ],
    notes: ["ã„-adjective negatif: ã„ menjadi ããªã„.", "ã„-adjective lampau: ã„ menjadi ã‹ã£ãŸ.", "ãª-adjective butuh ãª sebelum kata benda: é™ã‹ãªç”º."],
    mistakes: ["Mengucapkan é«˜ã„ã˜ã‚ƒãªã„ untuk ã„-adjective dasar.", "Lupa ãª pada é™ã‹ãªç”º.", "Membuat ãã‚Œã„ menjadi ãã‚Œããªã„ padahal ãã‚Œã„ adalah ãª-adjective."],
    practice: ["Ubah ãŠã„ã—ã„ ke negatif.", "Ubah é«˜ã„ ke lampau.", "Buat frasa: kota yang tenang."],
    answers: ["ãŠã„ã—ããªã„ã§ã™ã€‚", "é«˜ã‹ã£ãŸã§ã™ã€‚", "é™ã‹ãªç”ºã§ã™ã€‚"],
    next: "Latih 5 kata sifat ã„ dan 5 kata sifat ãª dengan benda di sekitarmu.",
  });
}

function numbersBlueprint(lesson: LessonInput, variant: NihongoLessonTemplateVariant): LessonBlueprint {
  return makeGrammarBlueprint({
    lesson,
    variant,
    objective: "Menggunakan angka, waktu, tanggal, atau counter sesuai topik lesson.",
    explanation: "Angka Jepang punya beberapa bacaan khusus saat bertemu jam, tanggal, orang, dan benda. Jangan hanya hafal 1-10; latih dalam konteks.",
    examples: [
      ["ä»Šã€ä¸ƒæ™‚ã§ã™ã€‚", "Ima, shichi-ji desu.", "Sekarang jam tujuh."],
      ["ä¸‰äººã„ã¾ã™ã€‚", "San-nin imasu.", "Ada tiga orang."],
      ["æœ¬ã‚’äºŒå†Šè²·ã„ã¾ã—ãŸã€‚", "Hon o ni-satsu kaimashita.", "Saya membeli dua buku."],
    ],
    notes: ["Jam memakai æ™‚, menit memakai åˆ†.", "Orang memakai counter äºº.", "Benda umum sering memakai ã¤ atau counter spesifik seperti å†Š untuk buku."],
    mistakes: ["Memakai angka biasa tanpa counter.", "Tertukar ã‚ˆã˜ dan ã—ã¡ã˜.", "Lupa bacaan khusus seperti ã²ã¨ã‚Š dan ãµãŸã‚Š."],
    practice: ["Tulis jam 4.", "Tulis dua orang.", "Tulis tiga buku."],
    answers: ["å››æ™‚ / ã‚ˆã˜", "äºŒäºº / ãµãŸã‚Š", "ä¸‰å†Š / ã•ã‚“ã•ã¤"],
    next: "Gunakan angka dalam kalimat belanja atau jadwal harian.",
  });
}

function n4GrammarBlueprint(lesson: LessonInput, variant: NihongoLessonTemplateVariant): LessonBlueprint {
  const title = lesson.title.toLowerCase();
  if (title.includes("te-form")) {
    return makeGrammarBlueprint({
      lesson,
      variant,
      objective: "Memakai bentuk ã¦ untuk menyambung aksi, meminta, atau menjelaskan keadaan.",
      explanation: "ã¦-form adalah pintu masuk banyak grammar N4. Bentuk ini tidak punya satu arti tunggal; fungsinya tergantung pola setelahnya.",
      examples: [["åå‰ã‚’æ›¸ã„ã¦ãã ã•ã„ã€‚", "Namae o kaite kudasai.", "Tolong tulis nama."], ["æœã”ã¯ã‚“ã‚’é£Ÿã¹ã¦ã€å­¦æ ¡ã¸è¡Œãã¾ã™ã€‚", "Asagohan o tabete, gakkou e ikimasu.", "Saya sarapan lalu pergi ke sekolah."], ["ä»Šã€å‹‰å¼·ã—ã¦ã„ã¾ã™ã€‚", "Ima, benkyou shite imasu.", "Sekarang saya sedang belajar."]],
      notes: ["ã¦ãã ã•ã„ = meminta tolong/instruksi.", "ã¦ã„ã‚‹ = sedang/keadaan berlanjut.", "ã¦ bisa menyambung urutan aksi."],
      mistakes: ["Mengira semua ã¦ berarti 'dan'.", "Salah perubahan è¡Œã menjadi è¡Œã£ã¦.", "Lupa konteks pola setelah ã¦."],
      practice: ["Tolong dengarkan.", "Saya makan lalu tidur.", "Saya sedang membaca."],
      answers: ["èžã„ã¦ãã ã•ã„ã€‚", "é£Ÿã¹ã¦ã€å¯ã¾ã™ã€‚", "èª­ã‚“ã§ã„ã¾ã™ã€‚"],
      next: "Review kelompok perubahan te-form sebelum masuk pola N4 berikutnya.",
    });
  }

  return makeGrammarBlueprint({
    lesson,
    variant,
    objective: `Memahami pola N4: ${lesson.title}.`,
    explanation: `${lesson.description ?? lesson.title} Pola N4 perlu dipelajari dari fungsi, bentuk, lalu contoh konteks.`,
    examples: [
      ["æ—¥æœ¬ã¸è¡ŒããŸã„ã§ã™ã€‚", "Nihon e ikitai desu.", "Saya ingin pergi ke Jepang."],
      ["æ¼¢å­—ã‚’èª­ã‚“ã ã“ã¨ãŒã‚ã‚Šã¾ã™ã€‚", "Kanji o yonda koto ga arimasu.", "Saya pernah membaca kanji."],
      ["é›¨ã§ã™ã‹ã‚‰ã€å®¶ã§å‹‰å¼·ã—ã¾ã™ã€‚", "Ame desu kara, ie de benkyou shimasu.", "Karena hujan, saya belajar di rumah."],
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
    return [["ã“ã‚Œã¯ã„ãã‚‰ã§ã™ã‹ã€‚", "Kore wa ikura desu ka.", "Ini berapa harganya?"], ["ã“ã‚Œã‚’ãã ã•ã„ã€‚", "Kore o kudasai.", "Saya mau yang ini."], ["ã‚«ãƒ¼ãƒ‰ã§æ‰•ãˆã¾ã™ã‹ã€‚", "Kaado de haraemasu ka.", "Bisa bayar dengan kartu?"]];
  }
  if (title.includes("restaurant")) {
    return [["ãƒ¡ãƒ‹ãƒ¥ãƒ¼ã‚’ãã ã•ã„ã€‚", "Menyuu o kudasai.", "Tolong berikan menu."], ["æ°´ã‚’ãŠé¡˜ã„ã—ã¾ã™ã€‚", "Mizu o onegai shimasu.", "Tolong air putih."], ["ã“ã‚Œã¯ä½•ã§ã™ã‹ã€‚", "Kore wa nan desu ka.", "Ini apa?"]];
  }
  if (title.includes("train") || title.includes("direction")) {
    return [["é§…ã¯ã©ã“ã§ã™ã‹ã€‚", "Eki wa doko desu ka.", "Stasiun di mana?"], ["ã“ã®é›»è»Šã¯æ–°å®¿ã¸è¡Œãã¾ã™ã‹ã€‚", "Kono densha wa Shinjuku e ikimasu ka.", "Kereta ini pergi ke Shinjuku?"], ["å³ã¸æ›²ãŒã£ã¦ãã ã•ã„ã€‚", "Migi e magatte kudasai.", "Tolong belok kanan."]];
  }
  if (title.includes("clinic") || title.includes("health")) {
    return [["é ­ãŒç—›ã„ã§ã™ã€‚", "Atama ga itai desu.", "Kepala saya sakit."], ["è–¬ã‚’ãã ã•ã„ã€‚", "Kusuri o kudasai.", "Tolong beri obat."], ["ã„ã¤ã‹ã‚‰ã§ã™ã‹ã€‚", "Itsu kara desu ka.", "Sejak kapan?"]];
  }
  return [["ãŠã¯ã‚ˆã†ã”ã–ã„ã¾ã™ã€‚", "Ohayou gozaimasu.", "Selamat pagi."], ["ã‚ˆã‚ã—ããŠé¡˜ã„ã—ã¾ã™ã€‚", "Yoroshiku onegai shimasu.", "Mohon kerja samanya."], ["ã‚‚ã†ä¸€åº¦ãŠé¡˜ã„ã—ã¾ã™ã€‚", "Mou ichido onegai shimasu.", "Tolong sekali lagi."]];
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

