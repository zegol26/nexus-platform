export type ConceptQuestion = {
  id: string;
  prompt: string;
  deck: string;
  level: "Beginner" | "N5" | "N4" | "N3" | "A2";
  category: "kana" | "grammar" | "vocabulary" | "kanji" | "conversation";
  answer: string;
  options: string[];
  example: string;
};

export const conceptQuestions: ConceptQuestion[] = [
  {
    id: "beginner-kana-story-001",
    level: "Beginner",
    category: "kana",
    deck: "Foundations - Hiragana Visual Discrimination",
    prompt:
      "Cerita mini: Rina melihat tulisan さかな di menu kantin. Huruf pertama pada kata itu adalah apa?\n\nPilih huruf yang benar-benar muncul di awal kata さかな.",
    options: ["さ", "ち", "き", "す"],
    answer: "さ",
    example:
      "Analisis: Soal ini mengetes pengenalan bentuk dalam kata utuh, bukan hafalan satu huruf. さ sering tertukar dengan ち/き karena sama-sama punya garis melengkung dan potongan garis pendek.",
  },
  {
    id: "beginner-kana-story-002",
    level: "Beginner",
    category: "kana",
    deck: "Foundations - Hiragana Sound Discrimination",
    prompt:
      "Cerita mini: Di kelas, guru berkata きって, artinya perangko. Bagian kecil っ di tengah kata menunjukkan apa?",
    options: [
      "bunyi konsonan ditahan sebentar",
      "vokal panjang",
      "bunyi n",
      "kata menjadi pertanyaan",
    ],
    answer: "bunyi konsonan ditahan sebentar",
    example:
      "Analisis: っ kecil membuat konsonan setelahnya ditahan/ganda, seperti kitte. Ini konsep pronunciation dasar yang sering membuat arti kata berubah.",
  },
  {
    id: "beginner-kana-story-003",
    level: "Beginner",
    category: "kana",
    deck: "Foundations - Hiragana Similar Shapes",
    prompt:
      "Cerita mini: Kamu menyalin kata ねこ, tetapi hampir menulis れこ. Apa huruf pertama yang benar untuk kata 'kucing'?",
    options: ["ね", "れ", "わ", "ぬ"],
    answer: "ね",
    example:
      "Analisis: ね, れ, わ, dan ぬ punya bentuk berputar yang mirip. Soal ini melatih ketelitian visual dalam konteks kata, bukan melihat huruf terpisah.",
  },
  {
    id: "beginner-kana-story-004",
    level: "Beginner",
    category: "kana",
    deck: "Foundations - Katakana Long Vowel",
    prompt:
      "Cerita mini: Di kafe Jepang, menu menulis コーヒー. Tanda ー pada kata itu berfungsi sebagai apa?",
    options: [
      "memanjangkan bunyi vokal",
      "menggandakan konsonan",
      "mengubah ha menjadi pa",
      "menandai objek",
    ],
    answer: "memanjangkan bunyi vokal",
    example:
      "Analisis: Dalam katakana, ー memanjangkan vokal sebelumnya. コーヒー dibaca koohii, bukan kohi pendek.",
  },
  {
    id: "beginner-kana-story-005",
    level: "Beginner",
    category: "kana",
    deck: "Foundations - Dakuten",
    prompt:
      "Cerita mini: Kata かばん berarti tas. Apa efek tanda dakuten pada か sehingga menjadi が?",
    options: [
      "ka berubah menjadi ga",
      "ka berubah menjadi pa",
      "ka menjadi vokal panjang",
      "ka menjadi huruf kecil",
    ],
    answer: "ka berubah menjadi ga",
    example:
      "Analisis: Dakuten mengubah bunyi tak bersuara menjadi bersuara, misalnya か ka menjadi が ga. Ini fondasi sebelum membaca kata seperti がっこう.",
  },
  {
    id: "beginner-kana-story-006",
    level: "Beginner",
    category: "kana",
    deck: "Foundations - Handakuten",
    prompt:
      "Cerita mini: Kamu membaca パン di minimarket. Tanda bulat kecil pada パ menunjukkan bunyi apa?",
    options: ["pa", "ba", "ha", "wa"],
    answer: "pa",
    example:
      "Analisis: Handakuten, yaitu bulatan kecil, mengubah deret H menjadi P: は ha, ば ba, ぱ pa. パン dibaca pan.",
  },
  {
    id: "beginner-kana-story-007",
    level: "Beginner",
    category: "kana",
    deck: "Foundations - Youon",
    prompt:
      "Cerita mini: Di papan kelas tertulis きょう. Kombinasi きょ terbentuk dari き + ょ kecil. Bagaimana bunyinya?",
    options: ["kyo", "kiyo", "kya", "sho"],
    answer: "kyo",
    example:
      "Analisis: ょ kecil melebur dengan き menjadi satu suku bunyi kyo. Jika や/ゆ/よ besar, bunyinya menjadi terpisah seperti ki-yo.",
  },
  {
    id: "beginner-kana-story-008",
    level: "Beginner",
    category: "kana",
    deck: "Foundations - Katakana Similar Shapes",
    prompt:
      "Cerita mini: Kamu melihat kata ソファ di label toko furnitur. Huruf pertama ソ sering tertukar dengan huruf apa?",
    options: ["ン", "ツ", "シ", "リ"],
    answer: "ン",
    example:
      "Analisis: ソ dan ン mirip karena sama-sama dua goresan, tetapi arah/kemiringan goresannya berbeda. Ini jebakan klasik katakana.",
  },
  {
    id: "beginner-kana-story-009",
    level: "Beginner",
    category: "kana",
    deck: "Foundations - Katakana Similar Shapes",
    prompt:
      "Cerita mini: Di daftar belanja ada チーズ. Huruf チ dibaca apa?",
    options: ["chi", "tsu", "shi", "te"],
    answer: "chi",
    example:
      "Analisis: チ dibaca chi. Distractor ツ/シ sering mengecoh karena bentuk katakana dan bunyi mirip di telinga pemula.",
  },
  {
    id: "beginner-kana-story-010",
    level: "Beginner",
    category: "kana",
    deck: "Foundations - Hiragana Reading",
    prompt:
      "Cerita mini: Kamu mau menulis 'stasiun' dalam hiragana: えき. Mana urutan bunyi yang benar?",
    options: ["e-ki", "ki-e", "ke-i", "e-gi"],
    answer: "e-ki",
    example:
      "Analisis: え dibaca e dan き dibaca ki, jadi えき adalah e-ki. Soal ini menguji urutan baca, bukan hanya satu karakter.",
  },
  {
    id: "beginner-kana-story-011",
    level: "Beginner",
    category: "kana",
    deck: "Foundations - Particle Kana Reading",
    prompt:
      "Cerita mini: Dalam kalimat わたしは学生です, huruf は sebagai partikel dibaca apa?",
    options: ["wa", "ha", "ba", "pa"],
    answer: "wa",
    example:
      "Analisis: は biasanya dibaca ha, tetapi sebagai partikel topik dibaca wa. Ini sulit untuk Beginner karena aturan bacaan bergantung fungsi.",
  },
  {
    id: "beginner-kana-story-012",
    level: "Beginner",
    category: "kana",
    deck: "Foundations - Particle Kana Reading",
    prompt:
      "Cerita mini: Dalam kalimat ごはんを食べます, huruf を sebagai partikel biasanya dibaca apa?",
    options: ["o", "wo", "wa", "no"],
    answer: "o",
    example:
      "Analisis: を secara historis bisa ditulis wo, tetapi dalam penggunaan modern sebagai partikel objek dibaca o. Ini penting sebelum masuk pola N5.",
  },
  {
    id: "beginner-vocab-context-001",
    level: "Beginner",
    category: "vocabulary",
    deck: "Beginner Vocabulary - Daily Objects",
    prompt:
      "Cerita mini: Di kelas, guru menunjuk satu benda di meja lalu berkata これはペンです。 Benda apa yang paling mungkin sedang ditunjuk?",
    options: ["pulpen", "buku", "tas", "jam"],
    answer: "pulpen",
    example:
      "Analisis: ペン adalah kata serapan katakana untuk pulpen. Distractor sengaja dari benda kelas lain supaya pelajar membaca konteks, bukan menebak dari tema sekolah saja.",
  },
  {
    id: "beginner-vocab-context-002",
    level: "Beginner",
    category: "vocabulary",
    deck: "Beginner Vocabulary - Places",
    prompt:
      "Cerita mini: Riko berkata えきで友だちを待ちます。 Setelah temannya datang, mereka naik kereta. えき merujuk ke tempat apa?",
    options: ["stasiun", "sekolah", "rumah sakit", "toko"],
    answer: "stasiun",
    example:
      "Analisis: えき berarti stasiun. Konteks menunggu teman di suatu tempat membantu membedakan dari がっこう, びょういん, atau みせ.",
  },
  {
    id: "beginner-vocab-context-003",
    level: "Beginner",
    category: "vocabulary",
    deck: "Beginner Vocabulary - Food and Drink",
    prompt:
      "Cerita mini: Saat sarapan, Yuta berkata みずを飲みます。 Dari kata kerja 飲みます, benda apa yang paling cocok?",
    options: ["air", "nasi", "teh", "ikan"],
    answer: "air",
    example:
      "Analisis: みず berarti air. Kata kerja 飲みます memberi petunjuk bahwa benda itu sesuatu yang diminum.",
  },
  {
    id: "beginner-vocab-context-004",
    level: "Beginner",
    category: "vocabulary",
    deck: "Beginner Vocabulary - People",
    prompt:
      "Cerita mini: Di sekolah, seorang murid masuk kelas lalu berkata せんせい、おはようございます。 Orang yang disapa kemungkinan siapa?",
    options: ["guru", "teman", "ibu", "pegawai toko"],
    answer: "guru",
    example:
      "Analisis: せんせい berarti guru. Salam di sekolah memberi konteks sosial yang membuat jawabannya tidak sekadar hafalan kata.",
  },
  {
    id: "beginner-vocab-context-005",
    level: "Beginner",
    category: "vocabulary",
    deck: "Beginner Vocabulary - Time",
    prompt:
      "Cerita mini: Hari ini Taro belum belajar. Ia menulis di jadwal: あした、日本語を勉強します。 Kapan ia akan belajar?",
    options: ["besok", "hari ini", "kemarin", "pagi ini"],
    answer: "besok",
    example:
      "Analisis: あした berarti besok. Soal ini menuntut pelajar memahami kata waktu sederhana dalam kalimat penuh.",
  },
  {
    id: "beginner-kanji-context-001",
    level: "Beginner",
    category: "kanji",
    deck: "Beginner Kanji - Visual Meaning",
    prompt:
      "Cerita mini: Di kalender kelas, guru menunjuk 日 pada nama-nama hari seperti 日曜日. Pilih makna dasar yang paling cocok untuk kanji itu.",
    options: ["hari/matahari", "bulan", "orang", "air"],
    answer: "hari/matahari",
    example:
      "Analisis: 日 punya makna dasar hari atau matahari. Ini fondasi sebelum membaca 日本, 日曜日, dan 今日.",
  },
  {
    id: "beginner-kanji-context-002",
    level: "Beginner",
    category: "kanji",
    deck: "Beginner Kanji - Similar Simple Kanji",
    prompt:
      "Cerita mini: Setelah olahraga, Sora berkata （　）をください。 Pilih kanji yang paling cocok untuk mengisi bagian kosong.",
    options: ["水", "木", "火", "人"],
    answer: "水",
    example:
      "Analisis: 水 berarti air. 木 berarti pohon/kayu, 火 api, dan 人 orang. Ini menguji empat kanji dasar yang sering muncul sejak awal.",
  },
  {
    id: "beginner-kanji-context-003",
    level: "Beginner",
    category: "kanji",
    deck: "Beginner Kanji - People",
    prompt:
      "Cerita mini: Dalam formulir peserta, kolom jumlah ditulis 三人. Kanji 人 membantu menunjukkan jenis hitungan apa?",
    options: ["orang", "buku", "gunung", "uang"],
    answer: "orang",
    example:
      "Analisis: 人 berarti orang. Bentuknya sederhana, tetapi sangat produktif dalam kata seperti 日本人 dan 一人.",
  },
  {
    id: "beginner-kanji-context-004",
    level: "Beginner",
    category: "kanji",
    deck: "Beginner Kanji - Direction",
    prompt:
      "Cerita mini: Di peta gedung, toilet berada di 下の階 dan restoran di 上の階. Pasangan makna mana yang paling cocok?",
    options: ["上 = atas, 下 = bawah", "上 = bawah, 下 = atas", "上 = kiri, 下 = kanan", "上 = luar, 下 = dalam"],
    answer: "上 = atas, 下 = bawah",
    example:
      "Analisis: 上 berarti atas dan 下 berarti bawah. Pasangan kanji arah seperti ini sering muncul di instruksi lokasi.",
  },
  {
    id: "beginner-kanji-context-005",
    level: "Beginner",
    category: "kanji",
    deck: "Beginner Kanji - Numbers",
    prompt:
      "Cerita mini: Petugas memanggil nomor antrean 一, 二, lalu 三. Nomor berapa yang dipanggil setelah 二?",
    options: ["3", "2", "4", "10"],
    answer: "3",
    example:
      "Analisis: 三 berarti tiga. Pengecoh angka dasar membantu pelajar membedakan bentuk 一, 二, 三, dan 十.",
  },
  {
    id: "beginner-grammar-context-001",
    level: "Beginner",
    category: "grammar",
    deck: "Beginner Grammar - A は B です",
    prompt:
      "Cerita mini: Kamu memperkenalkan diri sebagai pelajar. Kalimat mana yang paling tepat?",
    options: ["私は学生です。", "私を学生です。", "私に学生です。", "私で学生です。"],
    answer: "私は学生です。",
    example:
      "Analisis: Pola dasar identitas adalah A は B です. は menandai topik, bukan objek atau tempat.",
  },
  {
    id: "beginner-grammar-context-002",
    level: "Beginner",
    category: "grammar",
    deck: "Beginner Grammar - Question か",
    prompt:
      "Cerita mini: Kamu ingin bertanya apakah ini buku Tanaka. Kalimat mana yang paling tepat?",
    options: ["これは田中さんの本ですか。", "これは田中さんの本です。", "これは田中さんの本ですよ。", "これは田中さんの本を。"],
    answer: "これは田中さんの本ですか。",
    example:
      "Analisis: Pertanyaan sopan memakai か di akhir kalimat. Tanpa か, kalimatnya hanya pernyataan.",
  },
  {
    id: "beginner-grammar-context-003",
    level: "Beginner",
    category: "grammar",
    deck: "Beginner Grammar - の Possession",
    prompt:
      "Cerita mini: Ada beberapa buku di meja. Kamu ingin menunjukkan buku milikmu. Pilihan mana yang benar?",
    options: ["私の本", "私を本", "私に本", "私で本"],
    answer: "私の本",
    example:
      "Analisis: の menghubungkan pemilik dan benda. 私の本 berarti buku saya.",
  },
  {
    id: "beginner-grammar-context-004",
    level: "Beginner",
    category: "grammar",
    deck: "Beginner Grammar - Object を",
    prompt:
      "Cerita mini: Kamu sedang makan siang dan melakukan aksi 飲みます pada 水. Pilih kalimat yang paling tepat.",
    options: ["水を飲みます。", "水に飲みます。", "水で飲みます。", "水は飲みますか。"],
    answer: "水を飲みます。",
    example:
      "Analisis: 水 adalah objek dari 飲みます, jadi memakai を. Ini mulai menantang karena pelajar harus melihat fungsi kata dalam kalimat.",
  },
  {
    id: "beginner-grammar-context-005",
    level: "Beginner",
    category: "grammar",
    deck: "Beginner Grammar - Place に",
    prompt:
      "Cerita mini: Di meja ada buku. Kalimat mana yang paling natural?",
    options: ["机の上に本があります。", "机の上で本があります。", "机の上を本があります。", "机の上へ本があります。"],
    answer: "机の上に本があります。",
    example:
      "Analisis: Keberadaan benda di lokasi memakai に + あります. で dipakai untuk tempat aktivitas, bukan keberadaan.",
  },
  {
    id: "beginner-conversation-context-001",
    level: "Beginner",
    category: "conversation",
    deck: "Beginner Conversation - Greetings",
    prompt:
      "Situasi: Kamu bertemu guru pada pagi hari. Ungkapan mana yang paling tepat?",
    options: ["おはようございます。", "おやすみなさい。", "いただきます。", "ただいま。"],
    answer: "おはようございます。",
    example:
      "Analisis: おはようございます adalah salam pagi yang sopan. おやすみなさい untuk malam/tidur, いただきます sebelum makan, ただいま saat pulang.",
  },
  {
    id: "beginner-conversation-context-002",
    level: "Beginner",
    category: "conversation",
    deck: "Beginner Conversation - Self Introduction",
    prompt:
      "Situasi: Ini pertama kali kamu bertemu teman kelas baru. Kalimat pembuka yang paling tepat adalah?",
    options: ["はじめまして。", "ごちそうさまでした。", "いってきます。", "おかえりなさい。"],
    answer: "はじめまして。",
    example:
      "Analisis: はじめまして dipakai saat pertama kali bertemu. Ini fondasi perkenalan diri sebelum lanjut ke nama dan asal.",
  },
  {
    id: "beginner-conversation-context-003",
    level: "Beginner",
    category: "conversation",
    deck: "Beginner Conversation - Asking Price",
    prompt:
      "Situasi: Di toko, kamu ingin bertanya harga barang. Ungkapan mana yang paling tepat?",
    options: ["いくらですか。", "どこですか。", "だれですか。", "なんじですか。"],
    answer: "いくらですか。",
    example:
      "Analisis: いくらですか berarti berapa harganya. どこ untuk tempat, だれ untuk orang, なんじ untuk jam.",
  },
  {
    id: "beginner-conversation-context-004",
    level: "Beginner",
    category: "conversation",
    deck: "Beginner Conversation - Apology and Attention",
    prompt:
      "Situasi: Kamu ingin memanggil staf toko dengan sopan. Pilih ungkapan yang paling natural.",
    options: ["すみません。", "いただきます。", "おめでとう。", "こんばんは。"],
    answer: "すみません。",
    example:
      "Analisis: すみません bisa dipakai untuk permisi, meminta perhatian, atau meminta maaf. Dalam toko, ini cara sopan memanggil staf.",
  },
  {
    id: "beginner-conversation-context-005",
    level: "Beginner",
    category: "conversation",
    deck: "Beginner Conversation - Classroom Request",
    prompt:
      "Situasi: Kamu tidak mendengar ucapan guru dan ingin meminta diulang. Kalimat mana yang paling tepat?",
    options: ["もう一度お願いします。", "おなかがすきました。", "お先に失礼します。", "ごめんください。"],
    answer: "もう一度お願いします。",
    example:
      "Analisis: もう一度お願いします berarti tolong sekali lagi. Ini practical classroom phrase yang menantang karena bukan sekadar salam.",
  },
  {
    id: "n5-c09-particle-purpose-001",
    level: "N5",
    category: "grammar",
    deck: "Curriculum 09 - Particles に・で・へ",
    prompt:
      "スーパー（　）買い物（　）行きます。\n\nPilih pasangan partikel yang paling tepat.",
    options: ["に / を", "で / に", "へ / に", "を / へ"],
    answer: "へ / に",
    example:
      "Analisis: Soal ini menguji dua konsep sekaligus. へ menunjukkan arah tujuan, sedangkan 買い物に行きます berarti pergi untuk berbelanja. で mengecoh karena pelajar sering fokus pada lokasi aktivitas, padahal kalimatnya menekankan pergi menuju supermarket untuk melakukan aktivitas.",
  },
  {
    id: "n5-c08-particle-topic-subject-001",
    level: "N5",
    category: "grammar",
    deck: "Curriculum 08 - Particles は・が・を",
    prompt:
      "A: だれが来ましたか。\nB: 田中さん（　）来ました。\n\nPartikel mana yang paling tepat?",
    options: ["は", "が", "を", "に"],
    answer: "が",
    example:
      "Analisis: Pertanyaan だれが meminta subjek baru sebagai jawaban. Karena informasi barunya adalah Tanaka-san, partikel が lebih tepat daripada は. は biasanya menandai topik yang sudah sedang dibahas.",
  },
  {
    id: "n5-c09-particle-place-action-001",
    level: "N5",
    category: "grammar",
    deck: "Curriculum 09 - Particles に・で・へ",
    prompt:
      "図書館（　）日本語を勉強します。\n\nPartikel mana yang menunjukkan tempat terjadinya aktivitas?",
    options: ["に", "で", "へ", "を"],
    answer: "で",
    example:
      "Analisis: 勉強します adalah aktivitas, dan lokasi aktivitas memakai で. に mengecoh karena sama-sama bisa berhubungan dengan tempat, tetapi に lebih sering untuk keberadaan, tujuan, atau waktu spesifik.",
  },
  {
    id: "n5-c15-existence-001",
    level: "N5",
    category: "grammar",
    deck: "Curriculum 15 - あります・います",
    prompt:
      "教室に学生が三人（　）。\n\nPilih bentuk yang paling tepat untuk menyatakan keberadaan manusia.",
    options: ["あります", "います", "です", "行きます"],
    answer: "います",
    example:
      "Analisis: 学生 adalah manusia, jadi keberadaannya dinyatakan dengan います. あります dipakai untuk benda atau tanaman, bukan orang/hewan.",
  },
  {
    id: "n5-c13-negative-past-001",
    level: "N5",
    category: "grammar",
    deck: "Curriculum 13 - Past and Negative Forms",
    prompt:
      "昨日、朝ごはんを食べません（　）。\n\nBentuk mana yang membuat kalimat berarti 'Kemarin saya tidak sarapan'?",
    options: ["でした", "ました", "です", "ません"],
    answer: "でした",
    example:
      "Analisis: Bentuk negatif lampau dari 食べます adalah 食べませんでした. Pilihan ました mengecoh karena bentuk lampau positif, bukan negatif.",
  },
  {
    id: "n5-c14-i-adjective-past-001",
    level: "N5",
    category: "grammar",
    deck: "Curriculum 14 - Adjectives い and な",
    prompt:
      "昨日のテストは（　）。\n\nPilih bentuk lampau yang benar dari むずかしい.",
    options: [
      "むずかしいでした",
      "むずかしかったです",
      "むずかしくです",
      "むずかしだったです",
    ],
    answer: "むずかしかったです",
    example:
      "Analisis: Kata sifat い berubah menjadi 〜かったです untuk bentuk lampau sopan. Kesalahan umum adalah menempelkan でした langsung ke むずかしい.",
  },
  {
    id: "n5-c10-time-particle-001",
    level: "N5",
    category: "grammar",
    deck: "Curriculum 10 - Numbers, Time, and Dates",
    prompt:
      "毎日七時（　）起きます。\n\nPartikel mana yang tepat untuk waktu yang spesifik?",
    options: ["で", "に", "を", "へ"],
    answer: "に",
    example:
      "Analisis: 七時 adalah waktu spesifik, jadi memakai に. で tidak dipakai untuk menandai waktu terjadinya rutinitas seperti ini.",
  },
  {
    id: "n5-c11-object-verb-001",
    level: "N5",
    category: "grammar",
    deck: "Curriculum 11 - Basic Verbs",
    prompt:
      "毎朝、コーヒー（　）飲みます。\n\nPartikel mana yang menandai objek yang diminum?",
    options: ["が", "を", "に", "で"],
    answer: "を",
    example:
      "Analisis: コーヒー adalah objek langsung dari 飲みます, jadi memakai を. が mengecoh karena sering muncul setelah benda, tetapi fungsinya bukan objek langsung.",
  },
  {
    id: "n5-c41-kanji-water-001",
    level: "N5",
    category: "kanji",
    deck: "Curriculum 41 - Kanji N5 Foundation",
    prompt:
      "毎朝、大学へ行く前に（　）を飲みます。\n\nPilih kanji yang paling masuk akal secara arti dan bentuk.",
    options: ["水", "氷", "永", "決"],
    answer: "水",
    example:
      "Analisis: Kalimat membutuhkan 'air', yaitu 水. 氷 mirip tetapi berarti es, 永 berarti selamanya, dan 決 punya radikal air sehingga bisa mengecoh secara visual.",
  },
  {
    id: "n5-c41-kanji-day-001",
    level: "N5",
    category: "kanji",
    deck: "Curriculum 41 - Kanji N5 Foundation",
    prompt:
      "今日は月曜日です。明日は（　）曜日です。\n\nPilih kanji hari yang benar.",
    options: ["火", "水", "木", "金"],
    answer: "火",
    example:
      "Analisis: Setelah 月曜日 adalah 火曜日. Soal ini mengetes urutan hari dan pengenalan kanji, bukan arti satu huruf secara terpisah.",
  },
  {
    id: "n5-c10-counter-people-001",
    level: "N5",
    category: "vocabulary",
    deck: "Curriculum 16 - Counters and Quantity",
    prompt:
      "A: 何人で行きますか。\nB: 友だちと（　）で行きます。\n\nJika yang pergi adalah dua orang, pilih jawaban yang tepat.",
    options: ["二つ", "二人", "二本", "二日"],
    answer: "二人",
    example:
      "Analisis: Untuk menghitung orang, bentuk khususnya 一人 dan 二人. 二つ untuk benda umum, 二本 untuk benda panjang, dan 二日 untuk tanggal/durasi dua hari.",
  },
  {
    id: "n5-c07-question-ka-001",
    level: "N5",
    category: "grammar",
    deck: "Curriculum 07 - Question Sentences か",
    prompt:
      "これは田中さんの本です（　）。\n\nApa yang paling tepat untuk mengubah kalimat ini menjadi pertanyaan sopan?",
    options: ["ね", "よ", "か", "を"],
    answer: "か",
    example:
      "Analisis: Dalam kalimat sopan, か di akhir kalimat membuat pertanyaan. ね dan よ adalah partikel akhir kalimat, tetapi bukan penanda pertanyaan netral.",
  },
  {
    id: "n4-c22-permission-teform-001",
    level: "N4",
    category: "grammar",
    deck: "Curriculum 22 - May Do てもいいです",
    prompt:
      "「すみません、ここで写真を（　）もいいですか。」\n\nPilih bentuk kata kerja yang benar.",
    options: ["撮らなくて", "撮って", "撮る", "撮った"],
    answer: "撮って",
    example:
      "Analisis: Pola meminta izin adalah te-form + もいいですか. Karena kata kerjanya 撮る, bentuk te-form-nya 撮って. Bentuk kamus 撮る dan lampau 撮った tidak bisa langsung masuk ke pola ini.",
  },
  {
    id: "n4-c26-third-person-want-001",
    level: "N4",
    category: "grammar",
    deck: "Curriculum 26 - Want to Do たい",
    prompt:
      "田中さんは日本へ（　）がっています。\n\nPilih bentuk yang paling tepat untuk keinginan orang ketiga.",
    options: ["行きたい", "行きた", "行きたく", "行きたがって"],
    answer: "行きたがって",
    example:
      "Analisis: 〜たい dipakai terutama untuk keinginan diri sendiri. Untuk orang ketiga, gunakan 〜たがる; dalam kalimat ini bentuknya 行きたがっています.",
  },
  {
    id: "n4-c21-obligation-001",
    level: "N4",
    category: "grammar",
    deck: "Curriculum 21 - Must Do なければなりません",
    prompt:
      "明日テストがありますから、今晩勉強（　）。\n\nPilih bentuk yang paling tepat untuk konteks kewajiban sebelum tes.",
    options: [
      "しなければなりません",
      "してもいいです",
      "してはいけません",
      "したことがあります",
    ],
    answer: "しなければなりません",
    example:
      "Analisis: なければなりません menyatakan kewajiban. してもいいです berarti boleh, してはいけません berarti dilarang, dan したことがあります berarti pernah melakukan.",
  },
  {
    id: "n4-c23-prohibition-001",
    level: "N4",
    category: "grammar",
    deck: "Curriculum 23 - Prohibition てはいけません",
    prompt:
      "病院の中で大きい声で話し（　）。\n\nPilih pola yang paling tepat untuk aturan di dalam rumah sakit.",
    options: [
      "てもいいです",
      "てはいけません",
      "たことがあります",
      "たいです",
    ],
    answer: "てはいけません",
    example:
      "Analisis: てはいけません menyatakan larangan. Pilihan てもいいです adalah kebalikannya, yaitu izin.",
  },
  {
    id: "n4-c24-potential-001",
    level: "N4",
    category: "grammar",
    deck: "Curriculum 24 - Potential Form",
    prompt:
      "私は漢字を百字（　）。\n\nKonteksnya kemampuan menulis kanji. Pilih bentuk kata kerja yang tepat.",
    options: ["書きます", "書けます", "書いています", "書きたいです"],
    answer: "書けます",
    example:
      "Analisis: Bentuk potensial dari 書きます adalah 書けます. 書きます hanya menyatakan menulis, bukan kemampuan.",
  },
  {
    id: "n4-c25-giving-receiving-001",
    level: "N4",
    category: "grammar",
    deck: "Curriculum 25 - Giving and Receiving",
    prompt:
      "先生（　）日本語を教えてもらいました。\n\nPartikel mana yang tepat untuk orang yang memberi bantuan/aksi kepada saya?",
    options: ["を", "に", "が", "で"],
    answer: "に",
    example:
      "Analisis: Dalam pola 〜てもらう, pemberi bantuan biasanya ditandai dengan に. Ini menguji arah pemberian manfaat, bukan sekadar arti kata kerja.",
  },
  {
    id: "n4-c27-experience-001",
    level: "N4",
    category: "grammar",
    deck: "Curriculum 27 - Experience たことがあります",
    prompt:
      "富士山に登っ（　）があります。\n\nPilih bentuk yang benar untuk menyatakan pengalaman pernah melakukan sesuatu.",
    options: ["て", "たこと", "たり", "たいこと"],
    answer: "たこと",
    example:
      "Analisis: Pola pengalaman adalah bentuk ta + ことがあります. Karena 登る menjadi 登った, frasa lengkapnya 登ったことがあります.",
  },
  {
    id: "n4-c28-before-after-001",
    level: "N4",
    category: "grammar",
    deck: "Curriculum 28 - Before and After まえに・あとで",
    prompt:
      "寝る（　）、歯を磨きます。\n\nUrutan kegiatannya: sikat gigi dulu, lalu tidur. Pilih pola yang tepat.",
    options: ["あとで", "まえに", "ながら", "から"],
    answer: "まえに",
    example:
      "Analisis: V dictionary form + まえに berarti sebelum melakukan V. 寝るあとで salah karena あとで berarti setelah, dan biasanya bentuknya 寝たあとで.",
  },
  {
    id: "n4-c29-node-kara-001",
    level: "N4",
    category: "grammar",
    deck: "Curriculum 29 - Because から・ので",
    prompt:
      "電車が遅れた（　）、会議に遅れました。\n\nDalam laporan yang agak sopan/netral, pilih penghubung alasan yang paling natural.",
    options: ["ので", "でも", "より", "まで"],
    answer: "ので",
    example:
      "Analisis: ので memberi alasan dengan nada lebih netral atau sopan daripada から. Pilihan lain tidak menyatakan sebab dalam struktur ini.",
  },
  {
    id: "n4-c30-comparison-001",
    level: "N4",
    category: "grammar",
    deck: "Curriculum 30 - Comparisons より・ほうが",
    prompt:
      "大阪（　）東京のほうが人が多いです。\n\nKalimat membandingkan Osaka dan Tokyo. Pilih partikel pembanding yang tepat.",
    options: ["から", "より", "まで", "に"],
    answer: "より",
    example:
      "Analisis: より menandai pembanding. XよりYのほうが... berarti Y lebih ... daripada X.",
  },
  {
    id: "n4-c31-plan-001",
    level: "N4",
    category: "grammar",
    deck: "Curriculum 31 - Plans and Intentions つもり・予定",
    prompt:
      "来年、日本で働く（　）です。\n\nJika kalimat ini menyatakan niat pribadi, pilih jawaban yang paling tepat.",
    options: ["予定", "つもり", "こと", "ところ"],
    answer: "つもり",
    example:
      "Analisis: つもりです menyatakan niat pribadi. 予定です lebih terdengar seperti jadwal/rencana yang sudah tersusun.",
  },
  {
    id: "n4-c32-become-001",
    level: "N4",
    category: "grammar",
    deck: "Curriculum 32 - Trying and Becoming てみる・になる",
    prompt:
      "日本語が少し話せる（　）なりました。\n\nKonteksnya perubahan kemampuan setelah belajar. Pilih pola yang tepat.",
    options: ["ように", "ために", "ことに", "まえに"],
    answer: "ように",
    example:
      "Analisis: V potential + ようになりました menyatakan perubahan kemampuan. 話せるようになりました berarti menjadi bisa berbicara.",
  },
  {
    id: "n4-c42-kanji-photo-001",
    level: "N4",
    category: "kanji",
    deck: "Curriculum 42 - Kanji N4 Foundation",
    prompt:
      "ここで（　）を撮ってもいいですか。\n\nKonteksnya meminta izin mengambil sesuatu dengan kamera. Pilih kata yang paling tepat.",
    options: ["写真", "写直", "真写", "社真"],
    answer: "写真",
    example:
      "Analisis: 写真 berarti foto. Pengecoh memakai kanji yang mirip atau urutan yang tertukar, sehingga soal mengetes ketelitian visual dan kosakata konteks.",
  },
  {
    id: "a2-c39-printer-report-001",
    level: "A2",
    category: "conversation",
    deck: "Curriculum 39 - Reporting Problems at Work",
    prompt:
      "Situasi: Anda tidak sengaja merusakkan printer kantor. Apa yang paling tepat Anda katakan kepada atasan?",
    options: [
      "すみません、プリンターが壊れました。",
      "ごめんなさい、プリンターを壊しました。",
      "申し訳ありません、プリンターを壊してしまいました。",
      "プリンターが動かないから、直してください。",
    ],
    answer: "申し訳ありません、プリンターを壊してしまいました。",
    example:
      "Analisis: Ini menguji sociolinguistic competence. 申し訳ありません formal untuk atasan, を壊してしまいました mengakui bahwa saya merusakkannya dan menunjukkan penyesalan/ketidaksengajaan. A terlalu pasif, B terlalu kasual, D terdengar menyuruh.",
  },
  {
    id: "a2-c38-work-instruction-001",
    level: "A2",
    category: "conversation",
    deck: "Curriculum 38 - Work Instructions",
    prompt:
      "Situasi: Atasan memberi instruksi cepat, tetapi Anda belum paham. Kalimat mana yang paling tepat?",
    options: [
      "もう一度、ゆっくり説明していただけますか。",
      "わかりません。もういいです。",
      "ちょっと待って。何？",
      "説明が悪いです。",
    ],
    answer: "もう一度、ゆっくり説明していただけますか。",
    example:
      "Analisis: Pilihan benar sopan, spesifik, dan meminta klarifikasi. A2 workplace bukan hanya tahu arti, tapi memilih ungkapan yang menjaga hubungan kerja.",
  },
  {
    id: "a2-c40-permission-work-001",
    level: "A2",
    category: "conversation",
    deck: "Curriculum 40 - Polite Requests at Work",
    prompt:
      "Situasi: Anda ingin pulang lebih cepat karena sakit. Apa kalimat yang paling tepat kepada atasan?",
    options: [
      "体調が悪いので、早退してもよろしいでしょうか。",
      "病気です。帰ります。",
      "早く帰りたいです。",
      "帰ってもいい？",
    ],
    answer: "体調が悪いので、早退してもよろしいでしょうか。",
    example:
      "Analisis: よろしいでしょうか lebih sopan daripada いいですか, dan ので memberi alasan secara halus. Pilihan lain terlalu langsung atau kasual untuk atasan.",
  },
  {
    id: "a2-c33-shopping-quantity-001",
    level: "A2",
    category: "conversation",
    deck: "Curriculum 33 - Daily Shopping Japanese",
    prompt:
      "Situasi: Di toko, Anda ingin membeli dua roti ini. Apa kalimat paling natural?",
    options: [
      "このパンを二つください。",
      "このパンが二人ください。",
      "このパンを二本ください。",
      "このパンに二つください。",
    ],
    answer: "このパンを二つください。",
    example:
      "Analisis: パン sebagai benda umum bisa memakai counter 二つ. を menandai barang yang diminta. 二人 untuk orang dan 二本 untuk benda panjang.",
  },
  {
    id: "a2-c34-restaurant-allergy-001",
    level: "A2",
    category: "conversation",
    deck: "Curriculum 34 - Restaurant and Food Ordering",
    prompt:
      "Situasi: Anda alergi telur dan ingin memastikan makanan tidak mengandung telur. Pilih kalimat yang paling tepat.",
    options: [
      "卵が入っていますか。",
      "卵を入れてください。",
      "卵を食べたいです。",
      "卵は高いですか。",
    ],
    answer: "卵が入っていますか。",
    example:
      "Analisis: 入っていますか menanyakan apakah suatu bahan terkandung di dalam makanan. Ini menguji pemahaman situasi restoran, bukan sekadar arti 卵.",
  },
  {
    id: "a2-c35-train-transfer-001",
    level: "A2",
    category: "conversation",
    deck: "Curriculum 35 - Train and Direction Japanese",
    prompt:
      "Situasi: Anda perlu tahu apakah harus ganti kereta. Apa pertanyaan yang paling tepat?",
    options: [
      "乗り換えが必要ですか。",
      "電車を食べますか。",
      "駅はおいしいですか。",
      "切符を忘れましたか。",
    ],
    answer: "乗り換えが必要ですか。",
    example:
      "Analisis: 乗り換え berarti transfer/ganti kendaraan, 必要ですか berarti apakah perlu. Distractor lain sengaja tidak cocok secara konteks walau memakai kosakata transportasi.",
  },
  {
    id: "a2-c36-clinic-symptom-001",
    level: "A2",
    category: "conversation",
    deck: "Curriculum 36 - Clinic and Health Japanese",
    prompt:
      "Situasi: Di klinik, Anda ingin mengatakan demam sejak kemarin. Pilih kalimat yang paling tepat.",
    options: [
      "昨日から熱があります。",
      "昨日まで熱を食べます。",
      "明日から元気でした。",
      "熱が安いです。",
    ],
    answer: "昨日から熱があります。",
    example:
      "Analisis: 昨日から menunjukkan sejak kemarin, dan 熱があります adalah pola natural untuk demam. Soal ini menguji kolokasi medis dasar.",
  },
  {
    id: "a2-c37-work-greeting-001",
    level: "A2",
    category: "conversation",
    deck: "Curriculum 37 - Workplace Greeting",
    prompt:
      "Situasi: Anda bertemu rekan kerja di kantor pada siang hari setelah sama-sama bekerja. Ungkapan mana yang paling natural?",
    options: [
      "お疲れ様です。",
      "いただきます。",
      "おやすみなさい。",
      "いらっしゃいませ。",
    ],
    answer: "お疲れ様です。",
    example:
      "Analisis: お疲れ様です adalah salam kerja serbaguna. いただきます untuk sebelum makan, おやすみなさい untuk tidur/berpisah malam, dan いらっしゃいませ dipakai staf toko kepada pelanggan.",
  },
  {
    id: "n3-kanji-context-001",
    level: "N3",
    category: "kanji",
    deck: "Kanji N3 - Context and Similar Kanji",
    prompt:
      "会議の前に、資料の内容を（　）してください。\n\nKonteksnya persiapan rapat dan pemeriksaan isi materi. Pilih kata yang paling natural.",
    options: ["確認", "経験", "関係", "研究"],
    answer: "確認",
    example:
      "Analisis: 内容を確認する berarti mengecek/memastikan isi. 経験 adalah pengalaman, 関係 adalah hubungan, 研究 adalah penelitian. Semua tampak formal, tapi hanya 確認 cocok dengan objek 内容.",
  },
  {
    id: "n3-kanji-context-002",
    level: "N3",
    category: "kanji",
    deck: "Kanji N3 - Jukugo Precision",
    prompt:
      "この仕事は明日までに（　）する必要があります。\n\nKonteksnya tugas harus masuk sebelum batas waktu. Pilih kata yang paling tepat.",
    options: ["提出", "出発", "外出", "輸出"],
    answer: "提出",
    example:
      "Analisis: 提出する berarti menyerahkan dokumen/tugas. 出発 berangkat, 外出 keluar, 輸出 ekspor. Distractor semuanya memakai 出, jadi pelajar harus membaca keseluruhan jukugo.",
  },
  {
    id: "n3-kanji-context-003",
    level: "N3",
    category: "kanji",
    deck: "Kanji N3 - Similar Meaning Trap",
    prompt:
      "電車が遅れた（　）を駅員に聞きました。\n\nKamu ingin tahu kenapa kereta terlambat. Pilih kata yang paling cocok.",
    options: ["原因", "結果", "条件", "目的"],
    answer: "原因",
    example:
      "Analisis: 原因 adalah penyebab, 結果 adalah hasil, 条件 adalah syarat/kondisi, 目的 adalah tujuan. Kalimat menanyakan kenapa kereta terlambat, jadi perlu 原因.",
  },
  {
    id: "n3-kanji-context-004",
    level: "N3",
    category: "kanji",
    deck: "Kanji N3 - Abstract Noun Context",
    prompt:
      "アンケートの（　）を見て、計画を変えました。\n\nSetelah melihat data dari survei, rencana diubah. Pilih kata yang paling cocok.",
    options: ["結果", "原因", "経験", "関係"],
    answer: "結果",
    example:
      "Analisis: アンケートの結果 berarti hasil survei. 原因 adalah sebab, 経験 pengalaman, 関係 hubungan. Ini menguji kolokasi, bukan arti kanji tunggal.",
  },
  {
    id: "n3-kanji-context-005",
    level: "N3",
    category: "kanji",
    deck: "Kanji N3 - Similar Kanji and Radicals",
    prompt:
      "明日の会議のために、資料を（　）しておいてください。\n\nKonteksnya melakukan sesuatu pada materi sebelum rapat besok. Pilih kata yang paling natural.",
    options: ["準備", "準決", "基準", "備品"],
    answer: "準備",
    example:
      "Analisis: 準備する berarti menyiapkan. 基準 berarti standar, 備品 barang/perlengkapan, dan 準決 bukan kata yang tepat di konteks ini. Pengecoh memakai kanji 準/備 agar visualnya dekat.",
  },
  {
    id: "n3-kanji-context-006",
    level: "N3",
    category: "kanji",
    deck: "Kanji N3 - Workplace Kanji",
    prompt:
      "トラブルがあったので、すぐ上司に（　）しました。\n\nPilih kata yang paling tepat dalam konteks melapor ke atasan.",
    options: ["報告", "広告", "告白", "報道"],
    answer: "報告",
    example:
      "Analisis: 上司に報告する berarti melapor kepada atasan. 広告 iklan, 告白 pengakuan/pernyataan cinta, 報道 pemberitaan. Semua mengandung 報/告 atau bunyi mirip, jadi harus lihat konteks.",
  },
  {
    id: "n3-kanji-context-007",
    level: "N3",
    category: "kanji",
    deck: "Kanji N3 - Kanji Compound Reading",
    prompt:
      "この条件では契約できません。\n\nBacaan 条件 yang benar adalah apa?",
    options: ["じょうけん", "じょうげん", "しょうけん", "じょけん"],
    answer: "じょうけん",
    example:
      "Analisis: 条件 dibaca じょうけん dan berarti syarat/kondisi. Distractor menguji panjang vokal じょう, dakuten, dan bunyi しょう yang sering tertukar.",
  },
  {
    id: "n3-kanji-context-008",
    level: "N3",
    category: "kanji",
    deck: "Kanji N3 - Kanji Compound Reading",
    prompt:
      "明日までに資料を提出してください。\n\nBacaan 提出 yang benar adalah apa?",
    options: ["ていしゅつ", "たいしゅつ", "ていで", "だいしゅつ"],
    answer: "ていしゅつ",
    example:
      "Analisis: 提出 dibaca ていしゅつ. Soal ini sengaja memakai pilihan yang dekat secara bunyi karena N3 menuntut akurasi onyomi dalam jukugo.",
  },
  {
    id: "n3-kanji-context-009",
    level: "N3",
    category: "kanji",
    deck: "Kanji N3 - Kanji with Multiple Compounds",
    prompt:
      "薬を飲む前に、医者に（　）してください。\n\nKonteksnya meminta pendapat dokter sebelum minum obat. Pilih kata yang paling natural.",
    options: ["相談", "相手", "談話", "商談"],
    answer: "相談",
    example:
      "Analisis: 医者に相談する berarti berkonsultasi dengan dokter. 相手 lawan bicara/pihak lain, 談話 percakapan, 商談 negosiasi bisnis. Kanji 相 dan 談 muncul di beberapa kata, tapi fungsi katanya berbeda.",
  },
  {
    id: "n3-kanji-context-010",
    level: "N3",
    category: "kanji",
    deck: "Kanji N3 - Similar Abstract Words",
    prompt:
      "予定が変わったので、集合時間を（　）しました。\n\nJadwal berubah, lalu waktu berkumpul ikut disesuaikan. Pilih kata yang paling tepat.",
    options: ["変更", "変化", "変色", "更新"],
    answer: "変更",
    example:
      "Analisis: 時間を変更する berarti mengubah waktu. 変化 adalah perubahan keadaan, 変色 perubahan warna, 更新 pembaruan/update. Soal ini menguji pilihan jukugo yang cocok dengan objek.",
  },
  {
    id: "n3-kanji-context-011",
    level: "N3",
    category: "kanji",
    deck: "Kanji N3 - Similar Shapes",
    prompt:
      "雨で道が暗くて危ないです。\n\nDari konteks jalan saat hujan, nuansa 暗 yang paling tepat adalah apa?",
    options: ["gelap", "murah/aman", "buruk", "hangat"],
    answer: "gelap",
    example:
      "Analisis: 暗い berarti gelap. 安 punya bacaan on yang sama an tetapi berarti aman/murah, 悪 berarti buruk, 温 berarti hangat. Ini menguji kanji mirip bunyi, bukan hanya arti umum.",
  },
  {
    id: "n3-kanji-context-012",
    level: "N3",
    category: "kanji",
    deck: "Kanji N3 - Contextual Meaning",
    prompt:
      "来月から新しい制度が始まります。\n\nDalam konteks ini, 度 pada 制度 memberi nuansa apa?",
    options: ["sistem/aturan", "suhu", "sekali/kali", "tingkat lantai"],
    answer: "sistem/aturan",
    example:
      "Analisis: 制度 berarti sistem/aturan. Kanji 度 bisa muncul di suhu atau frekuensi, tetapi dalam jukugo 制度 maknanya bukan 'derajat' atau 'sekali'.",
  },
  {
    id: "n3-kanji-context-013",
    level: "N3",
    category: "kanji",
    deck: "Kanji N3 - Verb Compound Context",
    prompt:
      "橋を（　）と、右にコンビニがあります。\n\nPilih kanji/kata yang paling tepat untuk 'menyeberangi jembatan'.",
    options: ["渡る", "通る", "曲がる", "戻る"],
    answer: "渡る",
    example:
      "Analisis: 橋を渡る adalah kolokasi natural untuk menyeberangi jembatan. 通る berarti melewati, 曲がる belok, 戻る kembali. Semua mungkin berhubungan dengan arah, tapi hanya 渡る cocok dengan 橋を.",
  },
  {
    id: "n3-kanji-context-014",
    level: "N3",
    category: "kanji",
    deck: "Kanji N3 - Workplace Deadline",
    prompt:
      "レポートの（　）は金曜日です。\n\nKonteksnya laporan harus selesai/masuk pada hari Jumat. Pilih kata yang paling tepat.",
    options: ["期限", "期間", "時間", "機嫌"],
    answer: "期限",
    example:
      "Analisis: 期限 berarti deadline/batas waktu. 期間 periode, 時間 waktu/jam, 機嫌 suasana hati. Distractor sengaja dekat bunyi dan bentuk.",
  },
  {
    id: "n3-kanji-context-015",
    level: "N3",
    category: "kanji",
    deck: "Kanji N3 - Hardest Context Choice",
    prompt:
      "新しいプロジェクトの（　）を全員に説明しました。\n\nDalam rapat awal, semua orang perlu tahu arah utama proyek. Pilih kata yang paling tepat.",
    options: ["目的", "原因", "方法", "結果"],
    answer: "目的",
    example:
      "Analisis: プロジェクトの目的 berarti tujuan proyek. 原因 sebab, 方法 metode, 結果 hasil. Keempatnya sama-sama kata abstrak N3 dan bisa muncul di rapat, jadi jawaban harus ditentukan dari makna kalimat.",
  },
];
