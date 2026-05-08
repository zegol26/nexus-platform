export type RehearsalSection = {
  id: string;
  order: number;
  title: string;
  subtitle?: string;
  level: "N5" | "N4";
  category:
    | "grammar"
    | "vocabulary"
    | "kanji"
    | "conversation"
    | "exercise"
    | "review";
  explanation: string;
  patterns: {
    label: string;
    japanese: string;
    romaji?: string;
    meaningId: string;
  }[];
  examples: {
    japanese: string;
    hiragana?: string;
    romaji?: string;
    meaningId: string;
  }[];
  exercises: {
    type:
      | "fill_blank"
      | "translate_id_to_ja"
      | "classify"
      | "short_answer"
      | "multiple_choice";
    prompt: string;
    choices?: string[];
    answer?: string;
    explanation?: string;
  }[];
};

export const n5RehearsalSections: RehearsalSection[] = [
  {
    id: "n5-01-imasu-arimasu",
    order: 1,
    title: "Makhluk Hidup dan Benda: います / あります",
    subtitle: "Membedakan orang, hewan, tanaman, dan benda",
    level: "N5",
    category: "grammar",
    explanation:
      "Gunakan います untuk orang, hewan, dan makhluk seperti hantu. Gunakan あります untuk benda mati dan tanaman. Pola ini sering muncul saat menjelaskan keberadaan sesuatu.",
    patterns: [
      { label: "Makhluk hidup", japanese: "N が います", romaji: "N ga imasu", meaningId: "Ada N." },
      { label: "Benda atau tanaman", japanese: "N が あります", romaji: "N ga arimasu", meaningId: "Ada N." },
      { label: "Tempat", japanese: "Tempat に N が います / あります", meaningId: "Di tempat ada N." },
    ],
    examples: [
      { japanese: "公園に犬がいます。", hiragana: "こうえんにいぬがいます。", romaji: "Kouen ni inu ga imasu.", meaningId: "Di taman ada anjing." },
      { japanese: "机の上に本があります。", hiragana: "つくえのうえにほんがあります。", romaji: "Tsukue no ue ni hon ga arimasu.", meaningId: "Di atas meja ada buku." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "Pilih jawaban yang paling tepat: 庭に花が__。", choices: ["います", "あります", "です"], answer: "あります", explanation: "花 adalah tanaman, jadi gunakan あります." },
      { type: "classify", prompt: "Klasifikasikan: 先生、猫、車、桜。", answer: "先生・猫 = います。車・桜 = あります。", explanation: "Orang dan hewan memakai います; benda dan tanaman memakai あります." },
    ],
  },
  {
    id: "n5-02-greetings-self-introduction",
    order: 2,
    title: "Salam dan Perkenalan Diri",
    level: "N5",
    category: "conversation",
    explanation:
      "Perkenalan N5 biasanya memakai salam, nama, asal, pekerjaan atau status, lalu penutup sopan. Jangan menganggap です sebagai partikel; です adalah kopula sopan.",
    patterns: [
      { label: "Perkenalan", japanese: "はじめまして。私は N です。", romaji: "Hajimemashite. Watashi wa N desu.", meaningId: "Salam kenal. Saya N." },
      { label: "Asal", japanese: "インドネシアから来ました。", romaji: "Indonesia kara kimashita.", meaningId: "Saya berasal dari Indonesia." },
      { label: "Penutup", japanese: "どうぞよろしくお願いします。", romaji: "Douzo yoroshiku onegaishimasu.", meaningId: "Mohon bantuannya / senang berkenalan." },
    ],
    examples: [
      { japanese: "はじめまして。私はアユです。学生です。", romaji: "Hajimemashite. Watashi wa Ayu desu. Gakusei desu.", meaningId: "Salam kenal. Saya Ayu. Saya pelajar." },
      { japanese: "おはようございます。今日もよろしくお願いします。", romaji: "Ohayou gozaimasu. Kyou mo yoroshiku onegaishimasu.", meaningId: "Selamat pagi. Hari ini juga mohon bantuannya." },
    ],
    exercises: [
      { type: "fill_blank", prompt: "Lengkapi kalimat berikut: 私は学生__。", answer: "です", explanation: "です membuat kalimat nominal menjadi sopan." },
      { type: "translate_id_to_ja", prompt: "Coba terjemahkan ke bahasa Jepang: Salam kenal. Saya Rina.", answer: "はじめまして。私はリナです。", explanation: "Gunakan はじめまして untuk awal perkenalan." },
    ],
  },
  {
    id: "n5-03-demonstratives",
    order: 3,
    title: "Penunjuk: これ・それ・あれ / この・その・あの",
    level: "N5",
    category: "grammar",
    explanation:
      "これ・それ・あれ berdiri sendiri sebagai benda. この・その・あの harus diikuti kata benda. Keduanya menunjukkan jarak dari pembicara dan lawan bicara.",
    patterns: [
      { label: "Ini / itu", japanese: "これ / それ / あれ は N です", meaningId: "Ini / itu adalah N." },
      { label: "Benda ini", japanese: "この / その / あの + N", meaningId: "N ini / itu." },
      { label: "Tempat", japanese: "ここ / そこ / あそこ", meaningId: "Di sini / di situ / di sana." },
    ],
    examples: [
      { japanese: "これは私のかばんです。", romaji: "Kore wa watashi no kaban desu.", meaningId: "Ini tas saya." },
      { japanese: "あの人は先生です。", romaji: "Ano hito wa sensei desu.", meaningId: "Orang itu guru." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "Pilih jawaban yang paling tepat: __本は高いです。", choices: ["これ", "この", "ここ"], answer: "この", explanation: "Sebelum kata benda 本, gunakan この." },
      { type: "short_answer", prompt: "Apa perbedaan これ dan この?", answer: "これ berdiri sendiri; この harus diikuti kata benda.", explanation: "Contoh: これは本です dan この本は新しいです." },
    ],
  },
  {
    id: "n5-04-no-possession",
    order: 4,
    title: "Kepemilikan dengan の",
    level: "N5",
    category: "grammar",
    explanation:
      "Partikel の menghubungkan dua kata benda. Artinya bisa kepemilikan, asal, jenis, atau hubungan antar benda.",
    patterns: [
      { label: "Kepemilikan", japanese: "Pemilik の Benda", meaningId: "Benda milik pemilik." },
      { label: "Atribut", japanese: "日本語 の 本", romaji: "Nihongo no hon", meaningId: "Buku bahasa Jepang." },
    ],
    examples: [
      { japanese: "これは母の時計です。", hiragana: "これはははのとけいです。", romaji: "Kore wa haha no tokei desu.", meaningId: "Ini jam tangan ibu saya." },
      { japanese: "田中さんは日本語の先生です。", romaji: "Tanaka-san wa nihongo no sensei desu.", meaningId: "Tanaka adalah guru bahasa Jepang." },
    ],
    exercises: [
      { type: "fill_blank", prompt: "Lengkapi kalimat berikut: 私__本です。", answer: "の", explanation: "私の本 berarti buku saya." },
      { type: "translate_id_to_ja", prompt: "Coba terjemahkan ke bahasa Jepang: Mobil ayah.", answer: "父の車", explanation: "父の車 berarti mobil ayah." },
    ],
  },
  {
    id: "n5-05-mo-to-particles",
    order: 5,
    title: "Partikel も dan と",
    level: "N5",
    category: "grammar",
    explanation:
      "も berarti juga. と dapat berarti dan untuk menghubungkan kata benda, atau dengan saat melakukan aktivitas bersama seseorang.",
    patterns: [
      { label: "Juga", japanese: "N も", romaji: "N mo", meaningId: "N juga." },
      { label: "Dan", japanese: "A と B", romaji: "A to B", meaningId: "A dan B." },
      { label: "Bersama", japanese: "人 と V", meaningId: "Melakukan V bersama orang." },
    ],
    examples: [
      { japanese: "私も学生です。", romaji: "Watashi mo gakusei desu.", meaningId: "Saya juga pelajar." },
      { japanese: "友だちと映画を見ます。", romaji: "Tomodachi to eiga o mimasu.", meaningId: "Saya menonton film bersama teman." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "Pilih jawaban yang paling tepat: 私__行きます。意味: Saya juga pergi.", choices: ["も", "と", "を"], answer: "も", explanation: "Untuk arti juga, gunakan も." },
    ],
  },
  {
    id: "n5-06-counters-price",
    order: 6,
    title: "Bilangan, Counter, dan Harga",
    level: "N5",
    category: "vocabulary",
    explanation:
      "Bahasa Jepang memakai counter sesuai jenis benda. Untuk harga, gunakan 円 dan pola いくらですか untuk bertanya harga.",
    patterns: [
      { label: "Harga", japanese: "N は いくらですか", meaningId: "Berapa harga N?" },
      { label: "Jumlah umum", japanese: "一つ、二つ、三つ", romaji: "hitotsu, futatsu, mittsu", meaningId: "Satu, dua, tiga benda umum." },
      { label: "Orang", japanese: "一人、二人、三人", romaji: "hitori, futari, sannin", meaningId: "Satu, dua, tiga orang." },
    ],
    examples: [
      { japanese: "このパンは二百円です。", romaji: "Kono pan wa nihyaku-en desu.", meaningId: "Roti ini 200 yen." },
      { japanese: "りんごを三つください。", romaji: "Ringo o mittsu kudasai.", meaningId: "Tolong beri tiga apel." },
    ],
    exercises: [
      { type: "short_answer", prompt: "Klik untuk melihat pembahasan: Bagaimana bertanya harga tas ini?", answer: "このかばんはいくらですか。", explanation: "Gunakan この + kata benda + はいくらですか." },
    ],
  },
  {
    id: "n5-07-location-position",
    order: 7,
    title: "Lokasi dan Posisi",
    level: "N5",
    category: "vocabulary",
    explanation:
      "Untuk menyatakan posisi, gabungkan kata benda dengan の lalu kata posisi seperti 上, 下, 前, 後ろ, 中, 外, 右, 左, 近く.",
    patterns: [
      { label: "Atas", japanese: "N の 上", romaji: "N no ue", meaningId: "Di atas N." },
      { label: "Dalam", japanese: "N の 中", romaji: "N no naka", meaningId: "Di dalam N." },
      { label: "Dekat", japanese: "N の 近く", romaji: "N no chikaku", meaningId: "Di dekat N." },
    ],
    examples: [
      { japanese: "駅の前に銀行があります。", romaji: "Eki no mae ni ginkou ga arimasu.", meaningId: "Di depan stasiun ada bank." },
      { japanese: "猫は椅子の下にいます。", romaji: "Neko wa isu no shita ni imasu.", meaningId: "Kucing ada di bawah kursi." },
    ],
    exercises: [
      { type: "fill_blank", prompt: "Lengkapi kalimat berikut: 机__上にペンがあります。", answer: "の", explanation: "Gunakan の untuk menghubungkan benda dengan posisi." },
    ],
  },
  {
    id: "n5-08-movement-particles",
    order: 8,
    title: "Pergerakan: へ・に・で・と",
    level: "N5",
    category: "grammar",
    explanation:
      "へ dan に menandai tujuan. で menandai alat transportasi atau tempat aktivitas. と menandai teman atau pasangan aktivitas.",
    patterns: [
      { label: "Tujuan", japanese: "Tempat へ / に 行きます", meaningId: "Pergi ke tempat." },
      { label: "Kendaraan", japanese: "Kendaraan で 行きます", meaningId: "Pergi dengan kendaraan." },
      { label: "Bersama", japanese: "人 と 行きます", meaningId: "Pergi bersama orang." },
    ],
    examples: [
      { japanese: "バスで学校へ行きます。", romaji: "Basu de gakkou e ikimasu.", meaningId: "Saya pergi ke sekolah dengan bus." },
      { japanese: "友だちと図書館に行きます。", romaji: "Tomodachi to toshokan ni ikimasu.", meaningId: "Saya pergi ke perpustakaan bersama teman." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "Pilih jawaban yang paling tepat: 電車__会社へ行きます。", choices: ["で", "を", "が"], answer: "で", explanation: "電車 adalah alat transportasi, jadi gunakan で." },
    ],
  },
  {
    id: "n5-09-purpose-ni-iku",
    order: 9,
    title: "Tujuan Aktivitas: Verb Stem + に行く",
    level: "N5",
    category: "grammar",
    explanation:
      "Gunakan bentuk stem dari kata kerja masu lalu に行く, に来る, atau に帰る untuk menyatakan tujuan pergi, datang, atau pulang.",
    patterns: [
      { label: "Pergi untuk V", japanese: "V-stem に 行きます", meaningId: "Pergi untuk melakukan V." },
      { label: "Datang untuk V", japanese: "V-stem に 来ます", meaningId: "Datang untuk melakukan V." },
    ],
    examples: [
      { japanese: "日本語を勉強しに来ました。", romaji: "Nihongo o benkyou shi ni kimashita.", meaningId: "Saya datang untuk belajar bahasa Jepang." },
      { japanese: "デパートへ買い物に行きます。", romaji: "Depaato e kaimono ni ikimasu.", meaningId: "Saya pergi ke department store untuk berbelanja." },
    ],
    exercises: [
      { type: "short_answer", prompt: "Klik untuk melihat pembahasan: Bentuk stem dari 食べます adalah apa?", answer: "食べ", explanation: "食べます menjadi 食べ, lalu bisa dipakai dalam 食べに行きます." },
    ],
  },
  {
    id: "n5-10-daily-activities-o",
    order: 10,
    title: "Aktivitas Harian dengan を + Kata Kerja",
    level: "N5",
    category: "grammar",
    explanation:
      "Partikel を menandai objek langsung dari kata kerja, misalnya makan nasi, minum air, membaca buku, dan menonton film.",
    patterns: [
      { label: "Objek", japanese: "N を Vます", romaji: "N o V-masu", meaningId: "Melakukan V pada N." },
      { label: "Rutinitas", japanese: "毎日 N を Vます", meaningId: "Setiap hari melakukan V pada N." },
    ],
    examples: [
      { japanese: "朝ご飯を食べます。", romaji: "Asagohan o tabemasu.", meaningId: "Saya makan sarapan." },
      { japanese: "毎晩、本を読みます。", romaji: "Maiban, hon o yomimasu.", meaningId: "Setiap malam saya membaca buku." },
    ],
    exercises: [
      { type: "fill_blank", prompt: "Lengkapi kalimat berikut: 水__飲みます。", answer: "を", explanation: "水 adalah objek dari 飲みます, jadi gunakan を." },
    ],
  },
  {
    id: "n5-11-invitations",
    order: 11,
    title: "Ajakan: ましょう / ませんか",
    level: "N5",
    category: "conversation",
    explanation:
      "ましょう dipakai untuk mengajak atau menyarankan secara langsung. ませんか terdengar lebih lembut seperti 'bagaimana kalau'.",
    patterns: [
      { label: "Ayo", japanese: "Vましょう", meaningId: "Ayo melakukan V." },
      { label: "Bagaimana kalau", japanese: "Vませんか", meaningId: "Maukah / bagaimana kalau melakukan V?" },
    ],
    examples: [
      { japanese: "一緒に昼ご飯を食べましょう。", romaji: "Issho ni hirugohan o tabemashou.", meaningId: "Ayo makan siang bersama." },
      { japanese: "日曜日に映画を見ませんか。", romaji: "Nichiyoubi ni eiga o mimasen ka.", meaningId: "Bagaimana kalau menonton film pada hari Minggu?" },
    ],
    exercises: [
      { type: "translate_id_to_ja", prompt: "Coba terjemahkan ke bahasa Jepang: Ayo belajar bersama.", answer: "一緒に勉強しましょう。", explanation: "Gunakan 一緒に untuk bersama dan しましょう untuk ajakan." },
    ],
  },
  {
    id: "n5-12-past-tense",
    order: 12,
    title: "Bentuk Lampau: ました / ませんでした",
    level: "N5",
    category: "grammar",
    explanation:
      "Bentuk lampau sopan positif memakai ました. Bentuk lampau sopan negatif memakai ませんでした.",
    patterns: [
      { label: "Lampau positif", japanese: "Vました", meaningId: "Sudah melakukan V." },
      { label: "Lampau negatif", japanese: "Vませんでした", meaningId: "Tidak melakukan V." },
    ],
    examples: [
      { japanese: "昨日、宿題をしました。", romaji: "Kinou, shukudai o shimashita.", meaningId: "Kemarin saya mengerjakan PR." },
      { japanese: "先週、学校へ行きませんでした。", romaji: "Senshuu, gakkou e ikimasen deshita.", meaningId: "Minggu lalu saya tidak pergi ke sekolah." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "Pilih jawaban yang paling tepat: 昨日、映画を見__。", choices: ["ました", "ます", "ません"], answer: "ました", explanation: "昨日 menunjukkan lampau, jadi gunakan 見ました." },
    ],
  },
  {
    id: "n5-13-giving-receiving",
    order: 13,
    title: "Memberi dan Menerima",
    level: "N5",
    category: "grammar",
    explanation:
      "あげる berarti memberi dari saya atau pihak dekat ke orang lain. もらう berarti menerima. くれる berarti orang lain memberi kepada saya atau pihak dekat saya.",
    patterns: [
      { label: "Memberi", japanese: "A は B に N を あげます", meaningId: "A memberi N kepada B." },
      { label: "Menerima", japanese: "A は B に / から N を もらいます", meaningId: "A menerima N dari B." },
      { label: "Memberi ke saya", japanese: "A は 私 に N を くれます", meaningId: "A memberi N kepada saya." },
    ],
    examples: [
      { japanese: "私は友だちに本をあげました。", romaji: "Watashi wa tomodachi ni hon o agemashita.", meaningId: "Saya memberi buku kepada teman." },
      { japanese: "母は私に時計をくれました。", romaji: "Haha wa watashi ni tokei o kuremashita.", meaningId: "Ibu memberi jam tangan kepada saya." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "Pilih jawaban yang paling tepat: 友だちは私に花を__。", choices: ["くれました", "あげました", "行きました"], answer: "くれました", explanation: "Orang lain memberi kepada saya, jadi gunakan くれました." },
    ],
  },
  {
    id: "n5-14-adjectives-ga",
    order: 14,
    title: "Kata Sifat dan Partikel が",
    level: "N5",
    category: "grammar",
    explanation:
      "Kata sifat-i berakhir dengan い, sedangkan kata sifat-na membutuhkan な saat menerangkan kata benda. Partikel が sering dipakai untuk subjek sifat atau rasa suka.",
    patterns: [
      { label: "Kata sifat-i", japanese: "N は Aい です", meaningId: "N bersifat A." },
      { label: "Kata sifat-na", japanese: "N は Aな です", meaningId: "N bersifat A." },
      { label: "Subjek sifat", japanese: "N が Aです", meaningId: "N yang memiliki sifat A." },
    ],
    examples: [
      { japanese: "この部屋は広いです。", romaji: "Kono heya wa hiroi desu.", meaningId: "Kamar ini luas." },
      { japanese: "日本語は簡単ではありません。", romaji: "Nihongo wa kantan dewa arimasen.", meaningId: "Bahasa Jepang tidak mudah." },
    ],
    exercises: [
      { type: "fill_blank", prompt: "Lengkapi kalimat berikut: 静か__町です。", answer: "な", explanation: "静か adalah kata sifat-na, jadi saat menerangkan 町 gunakan 静かな町." },
    ],
  },
  {
    id: "n5-15-te-imasu",
    order: 15,
    title: "Aksi Sedang Berlangsung: ています",
    level: "N5",
    category: "grammar",
    explanation:
      "Bentuk ています menyatakan aksi sedang berlangsung atau keadaan yang masih berlanjut. Bentuk negatifnya ていません.",
    patterns: [
      { label: "Sedang", japanese: "Vて います", meaningId: "Sedang melakukan V." },
      { label: "Tidak sedang", japanese: "Vて いません", meaningId: "Tidak sedang melakukan V." },
      { label: "Pertanyaan", japanese: "Vて いますか", meaningId: "Apakah sedang melakukan V?" },
    ],
    examples: [
      { japanese: "今、日本語を勉強しています。", romaji: "Ima, nihongo o benkyou shite imasu.", meaningId: "Sekarang saya sedang belajar bahasa Jepang." },
      { japanese: "弟は寝ていません。", romaji: "Otouto wa nete imasen.", meaningId: "Adik laki-laki saya tidak sedang tidur." },
    ],
    exercises: [
      { type: "translate_id_to_ja", prompt: "Coba terjemahkan ke bahasa Jepang: Saya sedang menulis surat.", answer: "私は手紙を書いています。", explanation: "書きます menjadi 書いて, lalu tambah います." },
    ],
  },
  {
    id: "n5-16-requests",
    order: 16,
    title: "Permintaan Sopan: てください / ないでください",
    level: "N5",
    category: "conversation",
    explanation:
      "てください berarti tolong lakukan. ないでください berarti tolong jangan lakukan. Keduanya sering muncul dalam instruksi kelas dan kehidupan sehari-hari.",
    patterns: [
      { label: "Tolong lakukan", japanese: "Vて ください", meaningId: "Tolong lakukan V." },
      { label: "Tolong jangan", japanese: "Vないで ください", meaningId: "Tolong jangan melakukan V." },
    ],
    examples: [
      { japanese: "ここに名前を書いてください。", romaji: "Koko ni namae o kaite kudasai.", meaningId: "Tolong tulis nama di sini." },
      { japanese: "写真を撮らないでください。", romaji: "Shashin o toranaide kudasai.", meaningId: "Tolong jangan mengambil foto." },
    ],
    exercises: [
      { type: "fill_blank", prompt: "Lengkapi kalimat berikut: 静かにして__。", answer: "ください", explanation: "静かにしてください berarti tolong tenang." },
    ],
  },
  {
    id: "n5-17-likes-ability",
    order: 17,
    title: "Suka, Tidak Suka, dan Kemampuan",
    level: "N5",
    category: "grammar",
    explanation:
      "すき, きらい, じょうず, へた, dan とくい biasanya memakai が untuk hal yang disukai atau kemampuan yang dibicarakan.",
    patterns: [
      { label: "Suka", japanese: "N が 好きです", meaningId: "Suka N." },
      { label: "Tidak suka", japanese: "N が 嫌いです", meaningId: "Tidak suka N." },
      { label: "Mahir", japanese: "N が 上手です / 得意です", meaningId: "Mahir dalam N." },
    ],
    examples: [
      { japanese: "私は日本の音楽が好きです。", romaji: "Watashi wa Nihon no ongaku ga suki desu.", meaningId: "Saya suka musik Jepang." },
      { japanese: "兄は料理が上手です。", romaji: "Ani wa ryouri ga jouzu desu.", meaningId: "Kakak laki-laki saya pandai memasak." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "Pilih jawaban yang paling tepat: サッカー__好きです。", choices: ["が", "を", "で"], answer: "が", explanation: "Dengan 好きです, objek rasa suka memakai が." },
    ],
  },
  {
    id: "n5-18-sequence-tari",
    order: 18,
    title: "Urutan dan Contoh Aktivitas: てから / たりたりする",
    level: "N5",
    category: "grammar",
    explanation:
      "てから berarti setelah melakukan sesuatu. たりたりする dipakai untuk menyebut beberapa contoh aktivitas, bukan daftar lengkap.",
    patterns: [
      { label: "Setelah", japanese: "Vて から、...", meaningId: "Setelah melakukan V, ..." },
      { label: "Contoh aktivitas", japanese: "Vたり、Vたり します", meaningId: "Melakukan hal seperti V dan V." },
    ],
    examples: [
      { japanese: "宿題をしてから、テレビを見ます。", romaji: "Shukudai o shite kara, terebi o mimasu.", meaningId: "Setelah mengerjakan PR, saya menonton TV." },
      { japanese: "休みの日に掃除したり、買い物したりします。", romaji: "Yasumi no hi ni souji shitari, kaimono shitari shimasu.", meaningId: "Pada hari libur saya melakukan hal seperti bersih-bersih dan berbelanja." },
    ],
    exercises: [
      { type: "short_answer", prompt: "Klik untuk melihat pembahasan: Apa fungsi たりたりします?", answer: "Menyebut contoh aktivitas, bukan semua aktivitas.", explanation: "Pola ini memberi nuansa 'antara lain'." },
    ],
  },
  {
    id: "n5-19-experience",
    order: 19,
    title: "Pengalaman: たことがあります",
    level: "N5",
    category: "grammar",
    explanation:
      "Pola たことがあります menyatakan pernah melakukan sesuatu. Kata kerja harus memakai bentuk ta.",
    patterns: [
      { label: "Pernah", japanese: "Vた ことが あります", meaningId: "Pernah melakukan V." },
      { label: "Belum pernah", japanese: "Vた ことが ありません", meaningId: "Belum pernah melakukan V." },
    ],
    examples: [
      { japanese: "日本へ行ったことがあります。", romaji: "Nihon e itta koto ga arimasu.", meaningId: "Saya pernah pergi ke Jepang." },
      { japanese: "寿司を食べたことがありません。", romaji: "Sushi o tabeta koto ga arimasen.", meaningId: "Saya belum pernah makan sushi." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "Pilih jawaban yang paling tepat: 京都へ行っ__ことがあります。", choices: ["た", "て", "ます"], answer: "た", explanation: "Pola pengalaman memakai bentuk ta." },
    ],
  },
  {
    id: "n5-20-advice",
    order: 20,
    title: "Saran: たほうがいい / ないほうがいい",
    level: "N5",
    category: "grammar",
    explanation:
      "たほうがいい berarti sebaiknya melakukan sesuatu. ないほうがいい berarti sebaiknya tidak melakukan sesuatu.",
    patterns: [
      { label: "Sebaiknya", japanese: "Vた ほうがいいです", meaningId: "Sebaiknya melakukan V." },
      { label: "Sebaiknya tidak", japanese: "Vない ほうがいいです", meaningId: "Sebaiknya tidak melakukan V." },
    ],
    examples: [
      { japanese: "早く寝たほうがいいです。", romaji: "Hayaku neta hou ga ii desu.", meaningId: "Sebaiknya tidur lebih cepat." },
      { japanese: "冷たい水を飲まないほうがいいです。", romaji: "Tsumetai mizu o nomanai hou ga ii desu.", meaningId: "Sebaiknya tidak minum air dingin." },
    ],
    exercises: [
      { type: "translate_id_to_ja", prompt: "Coba terjemahkan ke bahasa Jepang: Sebaiknya pergi ke rumah sakit.", answer: "病院へ行ったほうがいいです。", explanation: "行く bentuk ta adalah 行った." },
    ],
  },
  {
    id: "n5-21-comparison",
    order: 21,
    title: "Perbandingan: より / のほうが / いちばん",
    level: "N5",
    category: "grammar",
    explanation:
      "より menandai pembanding. のほうが menunjukkan pilihan yang lebih. いちばん berarti paling di antara beberapa pilihan.",
    patterns: [
      { label: "Lebih dari", japanese: "A は B より Aです", meaningId: "A lebih ... daripada B." },
      { label: "Yang lebih", japanese: "A のほうが B より Aです", meaningId: "A lebih ... daripada B." },
      { label: "Paling", japanese: "N の中で A が いちばん ...", meaningId: "Di antara N, A paling ..." },
    ],
    examples: [
      { japanese: "電車はバスより速いです。", romaji: "Densha wa basu yori hayai desu.", meaningId: "Kereta lebih cepat daripada bus." },
      { japanese: "季節の中で春がいちばん好きです。", romaji: "Kisetsu no naka de haru ga ichiban suki desu.", meaningId: "Di antara musim, saya paling suka musim semi." },
    ],
    exercises: [
      { type: "fill_blank", prompt: "Lengkapi kalimat berikut: 犬は猫__大きいです。", answer: "より", explanation: "より menandai pembanding." },
    ],
  },
  {
    id: "n5-22-desire",
    order: 22,
    title: "Keinginan: たいです",
    level: "N5",
    category: "grammar",
    explanation:
      "たいです menyatakan keinginan pembicara. Bentuk negatifnya たくないです. Untuk mengutip keinginan orang lain, gunakan と言っています.",
    patterns: [
      { label: "Ingin", japanese: "V-stem たいです", meaningId: "Ingin melakukan V." },
      { label: "Tidak ingin", japanese: "V-stem たくないです", meaningId: "Tidak ingin melakukan V." },
      { label: "Katanya ingin", japanese: "Vたい と言っています", meaningId: "Mengatakan ingin melakukan V." },
    ],
    examples: [
      { japanese: "日本で働きたいです。", romaji: "Nihon de hatarakitai desu.", meaningId: "Saya ingin bekerja di Jepang." },
      { japanese: "妹は新しい自転車を買いたいと言っています。", romaji: "Imouto wa atarashii jitensha o kaitai to itte imasu.", meaningId: "Adik perempuan saya mengatakan ingin membeli sepeda baru." },
    ],
    exercises: [
      { type: "short_answer", prompt: "Klik untuk melihat pembahasan: Bentuk negatif dari 食べたいです adalah apa?", answer: "食べたくないです。", explanation: "たい berubah seperti kata sifat-i: たい menjadi たくない." },
    ],
  },
  {
    id: "n5-23-enter-exit",
    order: 23,
    title: "Masuk dan Keluar: に入る / を出る",
    level: "N5",
    category: "grammar",
    explanation:
      "Masuk ke tempat memakai に入る. Keluar dari tempat memakai を出る. Pola ini penting untuk tempat seperti kelas, rumah, stasiun, dan kamar.",
    patterns: [
      { label: "Masuk", japanese: "Tempat に 入ります", meaningId: "Masuk ke tempat." },
      { label: "Keluar", japanese: "Tempat を 出ます", meaningId: "Keluar dari tempat." },
    ],
    examples: [
      { japanese: "教室に入ります。", romaji: "Kyoushitsu ni hairimasu.", meaningId: "Saya masuk ke kelas." },
      { japanese: "駅を出て、右へ行きます。", romaji: "Eki o dete, migi e ikimasu.", meaningId: "Keluar dari stasiun, lalu pergi ke kanan." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "Pilih jawaban yang paling tepat: 部屋__出ます。", choices: ["を", "に", "が"], answer: "を", explanation: "Keluar dari tempat memakai を出ます." },
    ],
  },
  {
    id: "n5-24-intention",
    order: 24,
    title: "Rencana dan Niat: つもりです",
    level: "N5",
    category: "grammar",
    explanation:
      "つもりです menyatakan niat atau rencana yang sudah cukup jelas. Gunakan bentuk kamus untuk niat melakukan dan bentuk nai untuk niat tidak melakukan.",
    patterns: [
      { label: "Berniat", japanese: "Vる つもりです", meaningId: "Berniat melakukan V." },
      { label: "Berniat tidak", japanese: "Vない つもりです", meaningId: "Berniat tidak melakukan V." },
    ],
    examples: [
      { japanese: "来年、日本へ行くつもりです。", romaji: "Rainen, Nihon e iku tsumori desu.", meaningId: "Tahun depan saya berniat pergi ke Jepang." },
      { japanese: "今日はゲームをしないつもりです。", romaji: "Kyou wa geemu o shinai tsumori desu.", meaningId: "Hari ini saya berniat tidak bermain game." },
    ],
    exercises: [
      { type: "translate_id_to_ja", prompt: "Coba terjemahkan ke bahasa Jepang: Saya berniat belajar malam ini.", answer: "今晩、勉強するつもりです。", explanation: "Gunakan bentuk kamus 勉強する sebelum つもりです." },
    ],
  },
  {
    id: "n5-25-change",
    order: 25,
    title: "Perubahan: くなる / になる",
    level: "N5",
    category: "grammar",
    explanation:
      "Untuk kata sifat-i, ubah い menjadi く lalu tambah なります. Untuk kata sifat-na dan kata benda, gunakan になります.",
    patterns: [
      { label: "Kata sifat-i", japanese: "Aい → Aく なります", meaningId: "Menjadi A." },
      { label: "Kata sifat-na", japanese: "Aな → Aに なります", meaningId: "Menjadi A." },
      { label: "Kata benda", japanese: "N に なります", meaningId: "Menjadi N." },
    ],
    examples: [
      { japanese: "だんだん暑くなります。", romaji: "Dandan atsuku narimasu.", meaningId: "Lama-lama menjadi panas." },
      { japanese: "日本語が上手になりました。", romaji: "Nihongo ga jouzu ni narimashita.", meaningId: "Bahasa Jepang saya menjadi lebih mahir." },
    ],
    exercises: [
      { type: "fill_blank", prompt: "Lengkapi kalimat berikut: 静か__なりました。", answer: "に", explanation: "静か adalah kata sifat-na, jadi gunakan に なりました." },
    ],
  },
  {
    id: "n5-26-mae-ni",
    order: 26,
    title: "Sebelum: 前に",
    level: "N5",
    category: "grammar",
    explanation:
      "前に berarti sebelum. Sebelum 前に, kata kerja memakai bentuk kamus, sedangkan kata benda memakai の前に.",
    patterns: [
      { label: "Sebelum V", japanese: "Vる 前に", meaningId: "Sebelum melakukan V." },
      { label: "Sebelum N", japanese: "N の 前に", meaningId: "Sebelum N." },
    ],
    examples: [
      { japanese: "寝る前に、歯を磨きます。", romaji: "Neru mae ni, ha o migakimasu.", meaningId: "Sebelum tidur, saya menyikat gigi." },
      { japanese: "テストの前に、復習します。", romaji: "Tesuto no mae ni, fukushuu shimasu.", meaningId: "Sebelum tes, saya review pelajaran." },
    ],
    exercises: [
      { type: "multiple_choice", prompt: "Pilih jawaban yang paling tepat: 食べる__、手を洗います。", choices: ["前に", "後で", "より"], answer: "前に", explanation: "Artinya sebelum makan, jadi gunakan 前に." },
    ],
  },
  {
    id: "n5-27-sugiru",
    order: 27,
    title: "Terlalu: すぎる",
    level: "N5",
    category: "grammar",
    explanation:
      "すぎる berarti terlalu. Untuk kata kerja, gunakan stem. Untuk kata sifat-i, hapus い lalu tambah すぎます. Untuk kata sifat-na, langsung tambah すぎます.",
    patterns: [
      { label: "Kata kerja", japanese: "V-stem すぎます", meaningId: "Terlalu banyak melakukan V." },
      { label: "Kata sifat-i", japanese: "Aすぎます", meaningId: "Terlalu A." },
      { label: "Kata sifat-na", japanese: "Aすぎます", meaningId: "Terlalu A." },
    ],
    examples: [
      { japanese: "昨日、食べすぎました。", romaji: "Kinou, tabesugimashita.", meaningId: "Kemarin saya makan terlalu banyak." },
      { japanese: "この問題は難しすぎます。", romaji: "Kono mondai wa muzukashisugimasu.", meaningId: "Soal ini terlalu sulit." },
    ],
    exercises: [
      { type: "short_answer", prompt: "Klik untuk melihat pembahasan: Bentuk dari 高い + すぎます adalah apa?", answer: "高すぎます。", explanation: "Hapus い dari 高い, lalu tambah すぎます." },
    ],
  },
  {
    id: "n5-28-permission",
    order: 28,
    title: "Izin: てもいいです / なくてもいいです",
    level: "N5",
    category: "conversation",
    explanation:
      "てもいいです berarti boleh melakukan sesuatu. なくてもいいです berarti tidak perlu melakukan sesuatu.",
    patterns: [
      { label: "Boleh", japanese: "Vて もいいです", meaningId: "Boleh melakukan V." },
      { label: "Tidak perlu", japanese: "Vなくても いいです", meaningId: "Tidak perlu melakukan V." },
    ],
    examples: [
      { japanese: "ここで写真を撮ってもいいです。", romaji: "Koko de shashin o totte mo ii desu.", meaningId: "Boleh mengambil foto di sini." },
      { japanese: "明日、来なくてもいいです。", romaji: "Ashita, konakute mo ii desu.", meaningId: "Besok tidak perlu datang." },
    ],
    exercises: [
      { type: "translate_id_to_ja", prompt: "Coba terjemahkan ke bahasa Jepang: Boleh duduk di sini.", answer: "ここに座ってもいいです。", explanation: "座ります menjadi 座って, lalu tambah もいいです." },
    ],
  },
  {
    id: "n5-29-obligation",
    order: 29,
    title: "Kewajiban: なければなりません",
    level: "N5",
    category: "grammar",
    explanation:
      "なければなりません berarti harus melakukan sesuatu. Bentuk ini dibuat dari bentuk negatif kata kerja, lalu akhiran ない berubah menjadi なければなりません.",
    patterns: [
      { label: "Harus", japanese: "Vない → Vなければなりません", meaningId: "Harus melakukan V." },
      { label: "Versi praktis", japanese: "勉強しなければなりません", meaningId: "Harus belajar." },
    ],
    examples: [
      { japanese: "毎日、漢字を練習しなければなりません。", romaji: "Mainichi, kanji o renshuu shinakereba narimasen.", meaningId: "Setiap hari harus berlatih kanji." },
      { japanese: "七時までに家へ帰らなければなりません。", romaji: "Shichi-ji made ni ie e kaeranakereba narimasen.", meaningId: "Harus pulang ke rumah sebelum pukul tujuh." },
    ],
    exercises: [
      { type: "fill_blank", prompt: "Lengkapi kalimat berikut: 薬を飲ま__なりません。", answer: "なければ", explanation: "飲まない berubah menjadi 飲まなければなりません." },
    ],
  },
  {
    id: "n5-30-kanji-topic-bank",
    order: 30,
    title: "Bank Topik Kanji N5",
    subtitle: "Tema penting untuk review cepat sebelum mock test",
    level: "N5",
    category: "kanji",
    explanation:
      "Review kanji N5 lebih mudah jika dikelompokkan berdasarkan topik. Fokus pada makna, bacaan dasar, dan contoh kata yang sering muncul di soal.",
    patterns: [
      { label: "Diri dan keluarga", japanese: "私・人・父・母・子・女・男", meaningId: "Saya, orang, ayah, ibu, anak, perempuan, laki-laki." },
      { label: "Waktu", japanese: "日・月・火・水・木・金・土・時・分・年", meaningId: "Hari, bulan, unsur hari, jam, menit, tahun." },
      { label: "Tempat dan arah", japanese: "上・下・中・外・右・左・前・後・東・西・南・北", meaningId: "Posisi dan arah." },
      { label: "Aktivitas", japanese: "行・来・帰・見・聞・読・書・食・飲・買", meaningId: "Pergi, datang, pulang, melihat, mendengar, membaca, menulis, makan, minum, membeli." },
      { label: "Sekolah dan hidup harian", japanese: "学・校・先・生・友・本・語・電・車・駅", meaningId: "Belajar, sekolah, guru, teman, buku, bahasa, listrik, kendaraan, stasiun." },
    ],
    examples: [
      { japanese: "毎朝、電車で学校へ行きます。", romaji: "Maiasa, densha de gakkou e ikimasu.", meaningId: "Setiap pagi saya pergi ke sekolah dengan kereta." },
      { japanese: "母は駅の前で友だちを待っています。", romaji: "Haha wa eki no mae de tomodachi o matte imasu.", meaningId: "Ibu sedang menunggu teman di depan stasiun." },
    ],
    exercises: [
      { type: "classify", prompt: "Klasifikasikan kanji berikut: 食、駅、母、前、読。", answer: "食・読 = aktivitas. 駅 = tempat/transportasi. 母 = keluarga. 前 = posisi.", explanation: "Klasifikasi topik membantu menebak konteks soal." },
      { type: "multiple_choice", prompt: "Pilih makna yang paling tepat untuk kanji 読。", choices: ["membaca", "menulis", "mendengar"], answer: "membaca", explanation: "読 muncul dalam 読みます, artinya membaca." },
    ],
  },
];

export const rehearsalCategories = [
  { id: "all", label: "Semua" },
  { id: "grammar", label: "Tata Bahasa" },
  { id: "vocabulary", label: "Kosakata" },
  { id: "kanji", label: "Kanji" },
  { id: "conversation", label: "Percakapan" },
  { id: "exercise", label: "Latihan" },
  { id: "review", label: "Review" },
] as const;
