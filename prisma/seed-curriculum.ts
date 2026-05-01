import { prisma } from "./seed-client";

export async function seedCurriculum() {

  const lessons = [
  // Foundations
  { title: "Hiragana Foundation", description: "Belajar semua huruf hiragana dasar あ〜ん.", level: "Beginner", order: 1, track: "JLPT", module: "Foundations", lessonType: "kana" },
  { title: "Katakana Foundation", description: "Belajar semua huruf katakana dasar ア〜ン.", level: "Beginner", order: 2, track: "JLPT", module: "Foundations", lessonType: "kana" },
  { title: "Dakuten, Handakuten, and Youon", description: "Belajar が・ぱ・きゃ・しゅ dan kombinasi bunyi Jepang.", level: "Beginner", order: 3, track: "JLPT", module: "Foundations", lessonType: "kana" },
  { title: "Japanese Pronunciation Basics", description: "Panjang pendek bunyi, double consonant っ, dan intonasi dasar.", level: "Beginner", order: 4, track: "JLPT", module: "Foundations", lessonType: "pronunciation" },

  // N5 Core
  { title: "Basic Greetings and Self Introduction", description: "Salam, perkenalan diri, nama, negara, pekerjaan.", level: "N5", order: 5, track: "JLPT", module: "N5 Communication", lessonType: "conversation" },
  { title: "A は B です", description: "Pola kalimat dasar: saya adalah..., ini adalah....", level: "N5", order: 6, track: "JLPT", module: "N5 Grammar", lessonType: "grammar" },
  { title: "Question Sentences か", description: "Membuat pertanyaan sederhana dengan か.", level: "N5", order: 7, track: "JLPT", module: "N5 Grammar", lessonType: "grammar" },
  { title: "Particles は・が・を", description: "Memahami topik, subjek, dan objek dalam kalimat Jepang.", level: "N5", order: 8, track: "JLPT", module: "N5 Grammar", lessonType: "grammar" },
  { title: "Particles に・で・へ", description: "Tempat, arah, waktu, dan lokasi aktivitas.", level: "N5", order: 9, track: "JLPT", module: "N5 Grammar", lessonType: "grammar" },
  { title: "Numbers, Time, and Dates", description: "Angka, jam, tanggal, hari, bulan, dan umur.", level: "N5", order: 10, track: "JLPT", module: "N5 Vocabulary", lessonType: "vocabulary" },
  { title: "Basic Verbs Dictionary Form", description: "Kata kerja dasar seperti 食べる・飲む・行く・見る.", level: "N5", order: 11, track: "JLPT", module: "N5 Grammar", lessonType: "grammar" },
  { title: "Masu Form", description: "Bentuk sopan kata kerja: 食べます・行きます.", level: "N5", order: 12, track: "JLPT", module: "N5 Grammar", lessonType: "grammar" },
  { title: "Past and Negative Forms", description: "ません・ました・ませんでした dan bentuk negatif dasar.", level: "N5", order: 13, track: "JLPT", module: "N5 Grammar", lessonType: "grammar" },
  { title: "Adjectives い and な", description: "Kata sifat Jepang dan cara menggunakannya dalam kalimat.", level: "N5", order: 14, track: "JLPT", module: "N5 Grammar", lessonType: "grammar" },
  { title: "Existence あります・います", description: "Menyatakan ada/tidak ada benda dan makhluk hidup.", level: "N5", order: 15, track: "JLPT", module: "N5 Grammar", lessonType: "grammar" },
  { title: "Counters and Quantity", description: "Menghitung benda, orang, waktu, dan frekuensi.", level: "N5", order: 16, track: "JLPT", module: "N5 Vocabulary", lessonType: "vocabulary" },

  // N4 Core
  { title: "Te-form Basics", description: "Membuat bentuk て untuk request dan kalimat sambung.", level: "N4", order: 17, track: "JLPT", module: "N4 Grammar", lessonType: "grammar" },
  { title: "Te-form Requests てください", description: "Meminta tolong dan memberi instruksi sederhana.", level: "N4", order: 18, track: "JLPT", module: "N4 Grammar", lessonType: "grammar" },
  { title: "Te-form Progressive ています", description: "Menyatakan sedang melakukan atau keadaan berlanjut.", level: "N4", order: 19, track: "JLPT", module: "N4 Grammar", lessonType: "grammar" },
  { title: "Nai-form Basics", description: "Bentuk negatif informal kata kerja.", level: "N4", order: 20, track: "JLPT", module: "N4 Grammar", lessonType: "grammar" },
  { title: "Must Do なければなりません", description: "Menyatakan kewajiban atau harus melakukan sesuatu.", level: "N4", order: 21, track: "JLPT", module: "N4 Grammar", lessonType: "grammar" },
  { title: "May Do てもいいです", description: "Meminta dan memberi izin.", level: "N4", order: 22, track: "JLPT", module: "N4 Grammar", lessonType: "grammar" },
  { title: "Prohibition てはいけません", description: "Menyatakan larangan.", level: "N4", order: 23, track: "JLPT", module: "N4 Grammar", lessonType: "grammar" },
  { title: "Potential Form", description: "Bentuk kemampuan: 行ける・食べられる・できる.", level: "N4", order: 24, track: "JLPT", module: "N4 Grammar", lessonType: "grammar" },
  { title: "Giving and Receiving", description: "あげる・くれる・もらう dan arah pemberian.", level: "N4", order: 25, track: "JLPT", module: "N4 Grammar", lessonType: "grammar" },
  { title: "Want to Do たい", description: "Menyatakan keinginan melakukan sesuatu.", level: "N4", order: 26, track: "JLPT", module: "N4 Grammar", lessonType: "grammar" },
  { title: "Experience たことがあります", description: "Menyatakan pengalaman pernah melakukan sesuatu.", level: "N4", order: 27, track: "JLPT", module: "N4 Grammar", lessonType: "grammar" },
  { title: "Before and After まえに・あとで", description: "Mengurutkan aktivitas berdasarkan waktu.", level: "N4", order: 28, track: "JLPT", module: "N4 Grammar", lessonType: "grammar" },
  { title: "Because から・ので", description: "Memberikan alasan dan sebab.", level: "N4", order: 29, track: "JLPT", module: "N4 Grammar", lessonType: "grammar" },
  { title: "Comparisons より・ほうが", description: "Membandingkan dua hal.", level: "N4", order: 30, track: "JLPT", module: "N4 Grammar", lessonType: "grammar" },
  { title: "Plans and Intentions つもり・予定", description: "Menyatakan rencana dan niat.", level: "N4", order: 31, track: "JLPT", module: "N4 Grammar", lessonType: "grammar" },
  { title: "Trying and Becoming てみる・になる", description: "Mencoba melakukan dan perubahan keadaan.", level: "N4", order: 32, track: "JLPT", module: "N4 Grammar", lessonType: "grammar" },

  // JFT A2 Practical
  { title: "Daily Shopping Japanese", description: "Bahasa Jepang untuk belanja, harga, jumlah, dan permintaan.", level: "A2", order: 33, track: "JFT", module: "Daily Life", lessonType: "conversation" },
  { title: "Restaurant and Food Ordering", description: "Memesan makanan, tanya bahan, dan pembayaran.", level: "A2", order: 34, track: "JFT", module: "Daily Life", lessonType: "conversation" },
  { title: "Train and Direction Japanese", description: "Tanya arah, naik kereta, pindah jalur, dan lokasi.", level: "A2", order: 35, track: "JFT", module: "Daily Life", lessonType: "conversation" },
  { title: "Clinic and Health Japanese", description: "Menjelaskan gejala sakit dan memahami instruksi dokter.", level: "A2", order: 36, track: "JFT", module: "Daily Life", lessonType: "conversation" },
  { title: "Workplace Greeting", description: "Salam kerja dasar dan komunikasi sopan di tempat kerja.", level: "A2", order: 37, track: "JFT", module: "Workplace", lessonType: "conversation" },
  { title: "Work Instructions", description: "Memahami instruksi sederhana dari atasan atau rekan kerja.", level: "A2", order: 38, track: "JFT", module: "Workplace", lessonType: "conversation" },
  { title: "Reporting Problems at Work", description: "Melaporkan masalah, keterlambatan, kerusakan, dan kesalahan.", level: "A2", order: 39, track: "JFT", module: "Workplace", lessonType: "conversation" },
  { title: "Polite Requests at Work", description: "Meminta bantuan, konfirmasi, dan izin secara sopan.", level: "A2", order: 40, track: "JFT", module: "Workplace", lessonType: "conversation" },
];

  await prisma.nihongoLesson.deleteMany();

  await prisma.nihongoLesson.createMany({
    data: lessons,
  });

  console.log(`Lessons seeded: ${lessons.length}`);
}
