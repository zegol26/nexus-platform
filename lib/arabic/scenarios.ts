import type { ArabicConversationScenario } from "./types";

export const arabicConversationScenarios: ArabicConversationScenario[] = [
  {
    id: "airport_immigration",
    title: "Imigrasi Bandara Saudi",
    description: "Latihan menjawab pertanyaan petugas imigrasi saat tiba di Jeddah atau Madinah.",
    arabicContext: "Bandara internasional, antrian imigrasi, petugas dengan seragam.",
    formality: "polite",
    openingLine: {
      speaker: "Petugas Imigrasi",
      arabic: "السلام عليكم. جواز السفر من فضلك.",
      transliteration: "Assalamu ‘alaikum. Jawaaz as-safar min fadhlik.",
      meaningId: "Assalamu’alaikum. Paspor tolong.",
      type: "fusha",
    },
  },
  {
    id: "taxi_to_hotel",
    title: "Naik Taksi ke Hotel",
    description: "Kasih alamat hotel, minta jalur cepat, dan minta berhenti.",
    arabicContext: "Di dalam taksi, sopir laki-laki, kamu duduk di belakang.",
    formality: "casual",
    openingLine: {
      speaker: "Sopir Taksi",
      arabic: "أهلاً، فين تبغى؟",
      transliteration: "Ahlan, feen tabghaa?",
      meaningId: "Halo, mau ke mana?",
      type: "saudi",
    },
  },
  {
    id: "order_food",
    title: "Pesan Makanan",
    description: "Order nasi, ayam, air, dan minta tidak pedas.",
    arabicContext: "Di restoran kasual atau food court mall.",
    formality: "casual",
    openingLine: {
      speaker: "Pelayan",
      arabic: "تفضل، إيش تبغى؟",
      transliteration: "Tafaddhal, eesh tabghaa?",
      meaningId: "Silakan, kamu mau apa?",
      type: "saudi",
    },
  },
  {
    id: "ask_direction_haram",
    title: "Tanya Arah di Masjidil Haram",
    description: "Cari pintu King Fahd, tempat wudhu, atau toilet.",
    arabicContext: "Di plaza Masjidil Haram yang luas, banyak jamaah.",
    formality: "polite",
    openingLine: {
      speaker: "Petugas Masjid (Asykar)",
      arabic: "تفضل، كيف أساعدك؟",
      transliteration: "Tafaddhal, kaifa usaa‘iduk?",
      meaningId: "Silakan, bagaimana saya bantu?",
      type: "fusha",
    },
  },
  {
    id: "supervisor_workplace",
    title: "Ngobrol dengan Atasan di Kerja",
    description: "Atasan memberi tugas pertama hari ini, kamu harus paham dan konfirmasi.",
    arabicContext: "Di pabrik atau lokasi kerja, atasan formal.",
    formality: "polite",
    openingLine: {
      speaker: "Atasan",
      arabic: "صباح الخير، تعال هنا.",
      transliteration: "Shabaah al-khair, ta‘aal hunaa.",
      meaningId: "Selamat pagi, ke sini.",
      type: "fusha",
    },
  },
  {
    id: "report_workplace_problem",
    title: "Lapor Masalah di Tempat Kerja",
    description: "Mesin rusak atau ada hal yang harus dilaporkan ke atasan.",
    arabicContext: "Di lokasi kerja, atasan sedang sibuk.",
    formality: "polite",
    openingLine: {
      speaker: "Atasan",
      arabic: "نعم، إيش المشكلة؟",
      transliteration: "Na‘am, eesh al-musykilah?",
      meaningId: "Ya, apa masalahnya?",
      type: "saudi",
    },
  },
  {
    id: "ask_help_lost",
    title: "Minta Bantuan saat Tersesat",
    description: "Kamu tersesat di sekitar masjid atau kota, butuh arahan dari orang lokal.",
    arabicContext: "Di area ramai dekat masjid atau pasar, malam hari.",
    formality: "polite",
    openingLine: {
      speaker: "Orang lewat",
      arabic: "تحتاج مساعدة؟",
      transliteration: "Tahtaaju musaa‘adah?",
      meaningId: "Kamu butuh bantuan?",
      type: "fusha",
    },
  },
  {
    id: "hotel_checkin",
    title: "Check-in di Hotel",
    description: "Cek reservasi, minta kunci kamar, tanya WiFi dan sarapan.",
    arabicContext: "Di lobi hotel umrah di Mekah.",
    formality: "polite",
    openingLine: {
      speaker: "Resepsionis",
      arabic: "أهلاً وسهلاً، كيف أساعدك؟",
      transliteration: "Ahlan wa sahlan, kaifa usaa‘iduk?",
      meaningId: "Selamat datang, bagaimana saya bantu?",
      type: "fusha",
    },
  },
  {
    id: "market_shopping",
    title: "Belanja di Pasar Tradisional",
    description: "Tawar harga kurma, kacang, atau oleh-oleh khas Saudi.",
    arabicContext: "Di pasar kurma atau souq tradisional.",
    formality: "casual",
    openingLine: {
      speaker: "Pedagang",
      arabic: "تفضل، أبغى أحطلك إيش؟",
      transliteration: "Tafaddhal, abghaa ahuttulak eesh?",
      meaningId: "Silakan, mau saya ambilkan apa?",
      type: "saudi",
    },
  },
  {
    id: "small_talk_local",
    title: "Small Talk dengan Orang Lokal",
    description: "Ngobrol santai dengan orang Saudi di kafe atau saat menunggu antrian.",
    arabicContext: "Di kafe Saudi yang ramai, sambil minum kopi Arab.",
    formality: "casual",
    openingLine: {
      speaker: "Saudi",
      arabic: "هلا، من أين أنت؟",
      transliteration: "Halaa, min aina anta?",
      meaningId: "Hai, kamu dari mana?",
      type: "saudi",
    },
  },
];

export function getArabicScenario(
  id: string
): ArabicConversationScenario | undefined {
  return arabicConversationScenarios.find((scenario) => scenario.id === id);
}
