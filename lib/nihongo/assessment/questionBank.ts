export type AssessmentCategory =
  | "kana"
  | "kanji"
  | "particles"
  | "tense_forms"
  | "reading"
  | "listening"
  | "pronunciation";

export type AssessmentQuestionType =
  | "multiple_choice"
  | "audio_multiple_choice"
  | "reading_multiple_choice"
  | "pronunciation_upload";

export type AssessmentQuestion = {
  id: string;
  category: AssessmentCategory;
  type: AssessmentQuestionType;
  prompt: string;
  instructionIndonesian: string;
  options: string[];
  correctAnswer: string;
  explanationIndonesian: string;
  level: "absolute_beginner" | "n5" | "n4";
  tags: string[];
  audioUrl?: string;
  passage?: {
    japanese: string;
    kanaSupport?: string;
    indonesianHint?: string;
  };
};

const kanaQuestions: AssessmentQuestion[] = [
  {
    id: "kana-hira-001",
    category: "kana",
    type: "multiple_choice",
    prompt: "あ",
    instructionIndonesian: "Pilih romaji yang tepat untuk hiragana ini.",
    options: ["a", "i", "u", "e"],
    correctAnswer: "a",
    explanationIndonesian: "あ dibaca a.",
    level: "absolute_beginner",
    tags: ["kana"],
  },
  {
    id: "kana-hira-002",
    category: "kana",
    type: "multiple_choice",
    prompt: "き",
    instructionIndonesian: "Pilih romaji yang tepat untuk hiragana ini.",
    options: ["ki", "sa", "ke", "chi"],
    correctAnswer: "ki",
    explanationIndonesian: "き dibaca ki.",
    level: "absolute_beginner",
    tags: ["kana"],
  },
  {
    id: "kana-kata-001",
    category: "kana",
    type: "multiple_choice",
    prompt: "ネ",
    instructionIndonesian: "Pilih romaji yang tepat untuk katakana ini.",
    options: ["ne", "me", "nu", "re"],
    correctAnswer: "ne",
    explanationIndonesian: "ネ dibaca ne.",
    level: "absolute_beginner",
    tags: ["katakana"],
  },
  {
    id: "kana-romaji-001",
    category: "kana",
    type: "multiple_choice",
    prompt: "Romaji: sho",
    instructionIndonesian: "Pilih kana yang sesuai.",
    options: ["しょ", "しゃ", "ちょ", "じょ"],
    correctAnswer: "しょ",
    explanationIndonesian: "sho ditulis しょ.",
    level: "n5",
    tags: ["kana"],
  },
];

const kanjiQuestions: AssessmentQuestion[] = [
  {
    id: "kanji-meaning-001",
    category: "kanji",
    type: "multiple_choice",
    prompt: "山",
    instructionIndonesian: "Pilih arti kanji yang tepat.",
    options: ["gunung", "sungai", "orang", "hari"],
    correctAnswer: "gunung",
    explanationIndonesian: "山 berarti gunung dan umum di level N5.",
    level: "n5",
    tags: ["kanji"],
  },
  {
    id: "kanji-reading-001",
    category: "kanji",
    type: "multiple_choice",
    prompt: "学校",
    instructionIndonesian: "Pilih bacaan yang tepat.",
    options: ["がっこう", "せんせい", "でんしゃ", "ともだち"],
    correctAnswer: "がっこう",
    explanationIndonesian: "学校 dibaca がっこう, artinya sekolah.",
    level: "n5",
    tags: ["kanji", "reading"],
  },
  {
    id: "kanji-meaning-002",
    category: "kanji",
    type: "multiple_choice",
    prompt: "新しい",
    instructionIndonesian: "Pilih arti kata berkanji ini.",
    options: ["baru", "murah", "dekat", "sibuk"],
    correctAnswer: "baru",
    explanationIndonesian: "新しい berarti baru, kosakata umum N5/N4.",
    level: "n4",
    tags: ["kanji", "adjective_forms"],
  },
];

const particleQuestions: AssessmentQuestion[] = [
  {
    id: "particle-001",
    category: "particles",
    type: "multiple_choice",
    prompt: "わたし___インドネシア人です。",
    instructionIndonesian: "Pilih partikel yang paling tepat.",
    options: ["は", "を", "で", "へ"],
    correctAnswer: "は",
    explanationIndonesian: "は menandai topik: saya adalah orang Indonesia.",
    level: "n5",
    tags: ["particles"],
  },
  {
    id: "particle-002",
    category: "particles",
    type: "multiple_choice",
    prompt: "パン___食べます。",
    instructionIndonesian: "Pilih partikel objek yang tepat.",
    options: ["を", "に", "の", "から"],
    correctAnswer: "を",
    explanationIndonesian: "を menandai objek yang dimakan.",
    level: "n5",
    tags: ["particles"],
  },
  {
    id: "particle-003",
    category: "particles",
    type: "multiple_choice",
    prompt: "駅___友だちに会います。",
    instructionIndonesian: "Pilih partikel lokasi kejadian yang tepat.",
    options: ["で", "を", "も", "と"],
    correctAnswer: "で",
    explanationIndonesian: "で dipakai untuk lokasi aktivitas atau kejadian.",
    level: "n5",
    tags: ["particles"],
  },
  {
    id: "particle-004",
    category: "particles",
    type: "multiple_choice",
    prompt: "月曜日___金曜日___働きます。",
    instructionIndonesian: "Pilih pasangan partikel untuk rentang waktu.",
    options: ["から / まで", "と / も", "が / を", "へ / の"],
    correctAnswer: "から / まで",
    explanationIndonesian: "から dan まで berarti dari Senin sampai Jumat.",
    level: "n4",
    tags: ["particles"],
  },
];

const tenseQuestions: AssessmentQuestion[] = [
  {
    id: "tense-verb-001",
    category: "tense_forms",
    type: "multiple_choice",
    prompt: "昨日、映画を___。",
    instructionIndonesian: "Pilih bentuk lampau sopan yang tepat dari 見ます.",
    options: ["見ました", "見ます", "見ません", "見ませんでした"],
    correctAnswer: "見ました",
    explanationIndonesian: "昨日 menunjukkan lampau, jadi bentuk sopannya 見ました.",
    level: "n5",
    tags: ["verb_forms"],
  },
  {
    id: "tense-verb-002",
    category: "tense_forms",
    type: "multiple_choice",
    prompt: "明日、学校へ___。",
    instructionIndonesian: "Pilih bentuk sekarang/masa depan negatif sopan dari 行きます.",
    options: ["行きません", "行きました", "行きませんでした", "行きます"],
    correctAnswer: "行きません",
    explanationIndonesian: "明日 memakai bentuk non-lampau; negatif sopannya 行きません.",
    level: "n5",
    tags: ["verb_forms"],
  },
  {
    id: "tense-adj-001",
    category: "tense_forms",
    type: "multiple_choice",
    prompt: "この本は___です。",
    instructionIndonesian: "Pilih bentuk negatif dari たかい.",
    options: ["たかくない", "たかかった", "たかくなかった", "たかいでした"],
    correctAnswer: "たかくない",
    explanationIndonesian: "Negatif い-adjective: たかい menjadi たかくない.",
    level: "n5",
    tags: ["adjective_forms"],
  },
  {
    id: "tense-adj-002",
    category: "tense_forms",
    type: "multiple_choice",
    prompt: "昨日の町は___です。",
    instructionIndonesian: "Pilih bentuk lampau dari しずか.",
    options: ["しずかでした", "しずかです", "しずかではありません", "しずかくないです"],
    correctAnswer: "しずかでした",
    explanationIndonesian: "Lampau な-adjective dengan です menjadi でした.",
    level: "n4",
    tags: ["adjective_forms"],
  },
];

const readingQuestions: AssessmentQuestion[] = [
  {
    id: "reading-001",
    category: "reading",
    type: "reading_multiple_choice",
    prompt: "ミラさんは毎朝七時に起きます。朝ごはんを食べて、八時に学校へ行きます。学校で日本語を勉強します。",
    instructionIndonesian: "Apa ide utama bacaan ini?",
    options: [
      "Rutinitas pagi dan belajar di sekolah",
      "Rencana liburan ke Jepang",
      "Cara membeli makanan",
      "Perjalanan pulang malam",
    ],
    correctAnswer: "Rutinitas pagi dan belajar di sekolah",
    explanationIndonesian: "Teks membahas bangun pagi, sarapan, pergi ke sekolah, dan belajar bahasa Jepang.",
    level: "n5",
    tags: ["reading"],
    passage: {
      japanese:
        "ミラさんは毎朝七時に起きます。朝ごはんを食べて、八時に学校へ行きます。学校で日本語を勉強します。",
      kanaSupport:
        "ミラさんは まいあさ しちじに おきます。あさごはんを たべて、はちじに がっこうへ いきます。がっこうで にほんごを べんきょうします。",
      indonesianHint: "Bacaan pendek tentang rutinitas pagi.",
    },
  },
  {
    id: "reading-002",
    category: "reading",
    type: "reading_multiple_choice",
    prompt: "週末、田中さんは友だちと新しいレストランへ行きました。料理は少し高かったですが、とてもおいしかったです。また行きたいと言っていました。",
    instructionIndonesian: "Menurut bacaan, bagaimana makanan di restoran itu?",
    options: ["Enak tetapi agak mahal", "Murah tetapi tidak enak", "Jauh dan tutup", "Tidak ada makanan"],
    correctAnswer: "Enak tetapi agak mahal",
    explanationIndonesian: "少し高かった berarti agak mahal, とてもおいしかった berarti sangat enak.",
    level: "n4",
    tags: ["reading", "adjective_forms"],
    passage: {
      japanese:
        "週末、田中さんは友だちと新しいレストランへ行きました。料理は少し高かったですが、とてもおいしかったです。また行きたいと言っていました。",
      kanaSupport:
        "しゅうまつ、たなかさんは ともだちと あたらしい レストランへ いきました。りょうりは すこし たかかったですが、とても おいしかったです。また いきたいと いっていました。",
      indonesianHint: "Perhatikan kata sifat lampau dan kontras ですが.",
    },
  },
];

export const preAssessmentListeningQuestions: AssessmentQuestion[] = [
  {
    id: "listening-001",
    category: "listening",
    type: "audio_multiple_choice",
    prompt: "Audio placeholder: あした、九時に駅で会いましょう。",
    instructionIndonesian: "Dengarkan audio, lalu pilih tempat bertemu.",
    options: ["駅", "学校", "図書館", "会社"],
    correctAnswer: "駅",
    explanationIndonesian: "Kalimat menyebut 駅で会いましょう, bertemu di stasiun.",
    level: "n5",
    tags: ["listening", "particles"],
    audioUrl: "/audio/nihongo/pre-assessment/listening-001.mp3",
  },
  {
    id: "listening-002",
    category: "listening",
    type: "audio_multiple_choice",
    prompt: "Audio placeholder: きのうは雨でしたから、家で勉強しました。",
    instructionIndonesian: "Dengarkan audio, lalu pilih alasan orang itu belajar di rumah.",
    options: ["Karena hujan", "Karena sakit", "Karena libur panjang", "Karena ada ujian"],
    correctAnswer: "Karena hujan",
    explanationIndonesian: "雨でしたから berarti karena hujan.",
    level: "n4",
    tags: ["listening", "reading"],
    audioUrl: "/audio/nihongo/pre-assessment/listening-002.mp3",
  },
];

export const pronunciationPrompt = {
  id: "pronunciation-001",
  category: "pronunciation" as const,
  type: "pronunciation_upload" as const,
  prompt:
    "わたしは日本語を勉強しています。毎日少しずつ練習します。日本で友だちと話したいです。",
  kanaSupport:
    "わたしは にほんごを べんきょうしています。まいにち すこしずつ れんしゅうします。にほんで ともだちと はなしたいです。",
  instructionIndonesian:
    "Baca teks Jepang ini dengan suara jelas. Rekam langsung atau unggah file audio.",
};

export function generatePreAssessmentQuestionBank(): AssessmentQuestion[] {
  return [
    ...kanaQuestions,
    ...kanjiQuestions,
    ...particleQuestions,
    ...tenseQuestions,
    ...readingQuestions,
    ...preAssessmentListeningQuestions,
  ];
}

export function getFallbackAssessmentQuestions(): AssessmentQuestion[] {
  return generatePreAssessmentQuestionBank();
}
