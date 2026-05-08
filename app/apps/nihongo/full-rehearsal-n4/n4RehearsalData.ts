import moduleQuiz100 from "./n4ModuleQuiz100.json";
import type { RehearsalSection } from "@/app/apps/nihongo/full-rehearsal-n5/n5RehearsalData";

const moduleQuizExercises = moduleQuiz100 as RehearsalSection["exercises"];

export const n4RehearsalSections: RehearsalSection[] = [
  {
    id: "n4-01-te-form-basics",
    order: 1,
    title: "Te-form untuk Sambungan Kalimat",
    subtitle: "Fondasi request, izin, progresif, dan urutan aksi",
    level: "N4",
    category: "grammar",
    explanation:
      "Bentuk て adalah pintu masuk banyak pola N4. Gunakan untuk menyambung aksi, meminta tolong, meminta izin, menyatakan keadaan sedang berlangsung, dan membuat pola setelah melakukan sesuatu.",
    patterns: [
      { label: "Sambungan aksi", japanese: "Vて、Vます", meaningId: "Melakukan V lalu V." },
      { label: "Request", japanese: "Vてください", meaningId: "Tolong lakukan V." },
      { label: "Izin", japanese: "Vてもいいです", meaningId: "Boleh melakukan V." },
      { label: "Progresif", japanese: "Vています", meaningId: "Sedang / dalam keadaan V." },
    ],
    examples: [
      { japanese: "朝ご飯を食べて、学校へ行きます。", romaji: "Asagohan o tabete, gakkou e ikimasu.", meaningId: "Saya sarapan lalu pergi ke sekolah." },
      { japanese: "ここで写真を撮ってもいいですか。", romaji: "Koko de shashin o totte mo ii desu ka.", meaningId: "Bolehkah mengambil foto di sini?" },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "「すみません、ここで写真を（　）もいいですか。」", choices: ["撮らなくて", "撮って", "撮る", "撮った"], answer: "撮って", explanation: "Pola izin memakai te-form + もいいですか." },
      { type: "short_answer", prompt: "Bentuk te dari 書きます adalah apa?", answer: "書いて", explanation: "Kata kerja kelompok 1 akhiran き berubah menjadi いて." },
    ],
  },
  {
    id: "n4-02-nai-obligation-prohibition",
    order: 2,
    title: "Nai-form, Kewajiban, dan Larangan",
    level: "N4",
    category: "grammar",
    explanation:
      "N4 sering menguji perbedaan tidak perlu, harus, dan dilarang. Jangan hanya melihat kata negatif; pahami fungsi seluruh pola.",
    patterns: [
      { label: "Harus", japanese: "Vなければなりません", meaningId: "Harus melakukan V." },
      { label: "Tidak perlu", japanese: "Vなくてもいいです", meaningId: "Tidak perlu melakukan V." },
      { label: "Dilarang", japanese: "Vてはいけません", meaningId: "Tidak boleh melakukan V." },
    ],
    examples: [
      { japanese: "明日までに宿題を出さなければなりません。", meaningId: "Saya harus mengumpulkan PR sebelum besok." },
      { japanese: "ここでたばこを吸ってはいけません。", meaningId: "Tidak boleh merokok di sini." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "病院の中で大きい声で話し（　）。", choices: ["てもいいです", "てはいけません", "たことがあります", "たいです"], answer: "てはいけません", explanation: "Larangan memakai てはいけません." },
    ],
  },
  {
    id: "n4-03-potential-and-ability",
    order: 3,
    title: "Potential Form: Bisa Melakukan",
    level: "N4",
    category: "grammar",
    explanation:
      "Bentuk potensial menyatakan kemampuan atau kemungkinan. Objek kemampuan sering memakai が, terutama pada pola seperti 日本語が話せます.",
    patterns: [
      { label: "Godan", japanese: "書く → 書ける", meaningId: "Bisa menulis." },
      { label: "Ichidan", japanese: "食べる → 食べられる", meaningId: "Bisa makan." },
      { label: "Irregular", japanese: "する → できる / 来る → 来られる", meaningId: "Bisa melakukan / bisa datang." },
    ],
    examples: [
      { japanese: "漢字が百字書けます。", meaningId: "Saya bisa menulis seratus kanji." },
      { japanese: "この店ではカードが使えます。", meaningId: "Di toko ini kartu bisa digunakan." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "私は漢字を百字（　）。", choices: ["書きます", "書けます", "書いています", "書きたいです"], answer: "書けます", explanation: "書けます adalah bentuk potensial dari 書きます." },
    ],
  },
  {
    id: "n4-04-giving-receiving",
    order: 4,
    title: "Memberi dan Menerima Bantuan",
    level: "N4",
    category: "grammar",
    explanation:
      "あげる・くれる・もらう menguji arah manfaat. Perhatikan siapa yang menerima bantuan, bukan hanya siapa yang melakukan aksi.",
    patterns: [
      { label: "Saya memberi manfaat", japanese: "Vてあげます", meaningId: "Melakukan V untuk orang lain." },
      { label: "Orang memberi manfaat ke saya", japanese: "Vてくれます", meaningId: "Orang melakukan V untuk saya." },
      { label: "Saya menerima bantuan", japanese: "Vてもらいます", meaningId: "Saya mendapat orang melakukan V." },
    ],
    examples: [
      { japanese: "先生に作文を直してもらいました。", meaningId: "Saya mendapat bantuan guru memperbaiki karangan." },
      { japanese: "友だちが駅まで迎えに来てくれました。", meaningId: "Teman datang menjemput saya sampai stasiun." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "先生（　）日本語を教えてもらいました。", choices: ["を", "に", "が", "で"], answer: "に", explanation: "Pemberi bantuan dalam pola てもらう biasanya ditandai に." },
    ],
  },
  {
    id: "n4-05-desire-third-person",
    order: 5,
    title: "Keinginan Diri Sendiri dan Orang Ketiga",
    level: "N4",
    category: "grammar",
    explanation:
      "たい dipakai untuk keinginan pembicara. Untuk orang ketiga, bahasa Jepang lebih natural memakai たがる atau mengutip perkataan orang tersebut.",
    patterns: [
      { label: "Diri sendiri", japanese: "Vたいです", meaningId: "Saya ingin V." },
      { label: "Orang ketiga", japanese: "Vたがっています", meaningId: "Dia terlihat ingin V." },
      { label: "Kutipan", japanese: "Vたいと言っています", meaningId: "Dia berkata ingin V." },
    ],
    examples: [
      { japanese: "私は日本へ行きたいです。", meaningId: "Saya ingin pergi ke Jepang." },
      { japanese: "田中さんは日本へ行きたがっています。", meaningId: "Tanaka terlihat ingin pergi ke Jepang." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "田中さんは日本へ（　）がっています。", choices: ["行きたい", "行きた", "行きたく", "行きたがって"], answer: "行きたがって", explanation: "Untuk orang ketiga gunakan たがる: 行きたがっています." },
    ],
  },
  {
    id: "n4-06-experience-before-after",
    order: 6,
    title: "Pengalaman, Sebelum, dan Setelah",
    level: "N4",
    category: "grammar",
    explanation:
      "たことがあります menyatakan pengalaman. 前に dan 後で mengatur urutan waktu, tetapi bentuk kata kerja sebelum keduanya berbeda.",
    patterns: [
      { label: "Pengalaman", japanese: "Vたことがあります", meaningId: "Pernah melakukan V." },
      { label: "Sebelum", japanese: "Vる前に", meaningId: "Sebelum V." },
      { label: "Setelah", japanese: "Vた後で", meaningId: "Setelah V." },
    ],
    examples: [
      { japanese: "富士山に登ったことがあります。", meaningId: "Saya pernah mendaki Gunung Fuji." },
      { japanese: "寝る前に、薬を飲みます。", meaningId: "Sebelum tidur, saya minum obat." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "富士山に登っ（　）があります。", choices: ["て", "たこと", "たり", "たいこと"], answer: "たこと", explanation: "Pola pengalaman memakai bentuk ta + ことがあります." },
    ],
  },
  {
    id: "n4-07-reason-comparison",
    order: 7,
    title: "Alasan dan Perbandingan",
    level: "N4",
    category: "grammar",
    explanation:
      "から dan ので sama-sama memberi alasan, tetapi ので lebih netral/sopan. より dan ほうが dipakai untuk membandingkan dua hal.",
    patterns: [
      { label: "Alasan langsung", japanese: "S1から、S2", meaningId: "Karena S1, S2." },
      { label: "Alasan netral", japanese: "S1ので、S2", meaningId: "Karena S1, S2." },
      { label: "Perbandingan", japanese: "AよりBのほうが...", meaningId: "B lebih ... daripada A." },
    ],
    examples: [
      { japanese: "電車が遅れたので、会議に遅れました。", meaningId: "Karena kereta terlambat, saya terlambat rapat." },
      { japanese: "大阪より東京のほうが人が多いです。", meaningId: "Tokyo lebih banyak orang daripada Osaka." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "大阪（　）東京のほうが人が多いです。", choices: ["から", "より", "まで", "に"], answer: "より", explanation: "より menandai pembanding." },
    ],
  },
  {
    id: "n4-08-plan-becoming",
    order: 8,
    title: "Rencana, Niat, dan Perubahan Kemampuan",
    level: "N4",
    category: "grammar",
    explanation:
      "つもり menekankan niat pribadi, 予定 menekankan jadwal/rencana, dan ようになる menyatakan perubahan keadaan atau kemampuan.",
    patterns: [
      { label: "Niat", japanese: "Vるつもりです", meaningId: "Berniat V." },
      { label: "Jadwal", japanese: "Vる予定です", meaningId: "Dijadwalkan V." },
      { label: "Menjadi bisa", japanese: "V可能形 + ようになりました", meaningId: "Menjadi bisa V." },
    ],
    examples: [
      { japanese: "来年、日本で働くつもりです。", meaningId: "Saya berniat bekerja di Jepang tahun depan." },
      { japanese: "日本語が少し話せるようになりました。", meaningId: "Saya menjadi bisa sedikit berbicara bahasa Jepang." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "日本語が少し話せる（　）なりました。", choices: ["ように", "ために", "ことに", "まえに"], answer: "ように", explanation: "Perubahan kemampuan memakai ようになりました." },
    ],
  },
  {
    id: "n4-09-kanji-vocabulary",
    order: 9,
    title: "Kanji dan Kosakata N4 dalam Konteks",
    level: "N4",
    category: "kanji",
    explanation:
      "N4 tidak cukup mengenali satu kanji. Latih jukugo dalam kalimat, bacaan panjang-pendek, serta pilihan kata yang cocok dengan objek.",
    patterns: [
      { label: "Dokumen", japanese: "資料・内容・提出・確認", meaningId: "Materi, isi, menyerahkan, mengecek." },
      { label: "Kerja/sekolah", japanese: "会議・報告・予定・変更", meaningId: "Rapat, laporan, jadwal, perubahan." },
      { label: "Kondisi", japanese: "原因・結果・条件・必要", meaningId: "Sebab, hasil, syarat, perlu." },
    ],
    examples: [
      { japanese: "資料の内容を確認してください。", meaningId: "Tolong cek isi materi." },
      { japanese: "予定を変更しました。", meaningId: "Saya mengubah jadwal." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "ここで（　）を撮ってもいいですか。", choices: ["写真", "写直", "真写", "社真"], answer: "写真", explanation: "写真 berarti foto; pilihan lain mengecoh bentuk/urutan kanji." },
    ],
  },
  {
    id: "n4-10-reading-comprehension",
    order: 10,
    title: "Reading Comprehension Mini N4",
    level: "N4",
    category: "review",
    explanation:
      "Dokkai N4 menguji hubungan sebab-akibat, urutan waktu, dan maksud pembicara. Baca kata penghubung seperti ので, のに, それから, しかし, dan 予定.",
    patterns: [
      { label: "Sebab", japanese: "ので / から", meaningId: "Menjelaskan alasan." },
      { label: "Kontras", japanese: "のに / しかし", meaningId: "Menunjukkan pertentangan." },
      { label: "Urutan", japanese: "前に / 後で / てから", meaningId: "Menentukan timeline." },
    ],
    examples: [
      { japanese: "雨が降っていたので、駅までタクシーで行きました。", meaningId: "Karena hujan, saya pergi ke stasiun naik taksi." },
      { japanese: "安いのに、あまり便利ではありません。", meaningId: "Walaupun murah, tidak begitu praktis." },
    ],
    exercises: [
      { type: "short_answer", prompt: "Apa yang harus dicari dulu saat membaca teks N4?", answer: "Hubungan antar kalimat: sebab, kontras, urutan, dan siapa melakukan apa.", explanation: "Dokkai sering salah bukan karena kosakata, tapi karena hubungan logika terlewat." },
    ],
  },
  {
    id: "n4-11-workplace-practical",
    order: 11,
    title: "Komunikasi Praktis N4/A2",
    level: "N4",
    category: "conversation",
    explanation:
      "Untuk komunikasi kerja, pilih ungkapan yang sopan, jelas, dan bertanggung jawab. N4 sering menguji bentuk sopan dalam konteks nyata.",
    patterns: [
      { label: "Minta klarifikasi", japanese: "もう一度説明していただけますか", meaningId: "Bisakah menjelaskan sekali lagi?" },
      { label: "Melapor", japanese: "報告します / 連絡します", meaningId: "Saya akan melapor / menghubungi." },
      { label: "Meminta izin", japanese: "てもよろしいでしょうか", meaningId: "Bolehkah saya ... ?" },
    ],
    examples: [
      { japanese: "体調が悪いので、早退してもよろしいでしょうか。", meaningId: "Karena kondisi badan kurang baik, bolehkah saya pulang lebih cepat?" },
      { japanese: "確認してから、すぐ連絡します。", meaningId: "Saya akan cek dulu, lalu segera menghubungi." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "Atasan memberi instruksi cepat, tetapi Anda belum paham. Pilih kalimat terbaik.", choices: ["もう一度、ゆっくり説明していただけますか。", "何？わかりません。", "説明が悪いです。", "あとでいいです。"], answer: "もう一度、ゆっくり説明していただけますか。", explanation: "Kalimat ini sopan, spesifik, dan sesuai konteks kerja." },
    ],
  },
  {
    id: "n4-12-module-100-questions",
    order: 12,
    title: "Paket 100 Soal JLPT N4 dari Modul",
    subtitle: "Bagian terakhir modul Sertifikat 2: latihan cepat sebelum mock test",
    level: "N4",
    category: "exercise",
    explanation:
      "Seratus soal ini dipadankan dari bagian akhir modul. Kerjakan sebagai rehearsal terakhir: jawab cepat, lalu buka pembahasan untuk mengecek kunci. Setelah ini, lanjut ke JLPT N4 Mock Test berbasis bank 1000 soal.",
    patterns: [
      { label: "Strategi", japanese: "文法・語彙・漢字・読解", meaningId: "Kerjakan pola, kosakata, kanji, dan pemahaman secara campur." },
      { label: "Target", japanese: "100問", meaningId: "Selesaikan satu paket penuh agar stamina ujian terbentuk." },
    ],
    examples: [
      { japanese: "今日は雨が＿＿、出かけません。", meaningId: "Contoh soal cloze grammar dari paket modul." },
      { japanese: "「〜てもいいです」の使い方が正しいのはどれ？", meaningId: "Contoh soal fungsi grammar dari paket modul." },
    ],
    exercises: moduleQuizExercises,
  },
];

export { rehearsalCategories } from "@/app/apps/nihongo/full-rehearsal-n5/n5RehearsalData";
