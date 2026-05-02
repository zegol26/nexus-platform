import { prisma } from "./seed-client";

const badges = [
  {
    id: "resilience-swordsman",
    nameIndonesian: "Pendekar Tangguh",
    nameJapanese: "不屈の剣士",
    archetype: "Resilience Swordsman",
    levelRequirement: "Absolute Beginner / N5 Starter",
    motivationalMessage:
      "Mulai dari dasar bukan kelemahan. Konsistensi kecilmu akan membuka jalan ke level berikutnya.",
    iconUrl: "/badges/nihongo/resilience-swordsman.svg",
  },
  {
    id: "determined-ninja",
    nameIndonesian: "Ninja Pantang Menyerah",
    nameJapanese: "あきらめない忍者",
    archetype: "Determined Ninja",
    levelRequirement: "N5 Foundation",
    motivationalMessage:
      "Fondasinya sudah terbentuk. Sekarang waktunya bergerak lincah melewati grammar dan kanji dasar.",
    iconUrl: "/badges/nihongo/determined-ninja.svg",
  },
  {
    id: "hero-student",
    nameIndonesian: "Murid Pahlawan",
    nameJapanese: "努力のヒーロー学生",
    archetype: "Hero Student",
    levelRequirement: "Absolute Beginner / N5 Starter",
    motivationalMessage:
      "Belajar terstruktur adalah kekuatanmu. Satu latihan rapi setiap hari akan terasa besar nanti.",
    iconUrl: "/badges/nihongo/hero-student.svg",
  },
  {
    id: "mastery-fighter",
    nameIndonesian: "Petarung Master",
    nameJapanese: "達人ファイター",
    archetype: "Mastery Fighter",
    levelRequirement: "N4 Candidate",
    motivationalMessage:
      "Kamu sudah dekat dengan target N4. Pertajam detail kecil agar kemampuanmu makin stabil.",
    iconUrl: "/badges/nihongo/mastery-fighter.svg",
  },
  {
    id: "rising-teammate",
    nameIndonesian: "Rekan Tim yang Tangguh",
    nameJapanese: "成長するチームメイト",
    archetype: "Rising Teammate",
    levelRequirement: "N5 Strong",
    motivationalMessage:
      "Kamu punya dasar yang kuat dan siap naik kelas bersama ritme belajar yang konsisten.",
    iconUrl: "/badges/nihongo/rising-teammate.svg",
  },
  {
    id: "limitless-sensei",
    nameIndonesian: "Sensei Tanpa Batas",
    nameJapanese: "無限の先生",
    archetype: "Limitless Sensei",
    levelRequirement: "N4 Developing",
    motivationalMessage:
      "Kamu mulai membaca pola yang lebih kompleks. Jaga percaya diri, lalu rapikan akurasi.",
    iconUrl: "/badges/nihongo/limitless-sensei.svg",
  },
  {
    id: "adventure-captain",
    nameIndonesian: "Kapten Petualang",
    nameJapanese: "冒険キャプテン",
    archetype: "Adventure Captain",
    levelRequirement: "N4 Starter",
    motivationalMessage:
      "Kamu siap masuk wilayah N4. Jelajahi grammar baru dengan rasa penasaran yang kuat.",
    iconUrl: "/badges/nihongo/adventure-captain.svg",
  },
];

export async function seedNihongoBadges() {
  for (const badge of badges) {
    await prisma.nihongoBadge.upsert({
      where: { id: badge.id },
      update: badge,
      create: badge,
    });
  }

  console.log(`Nihongo badges seeded: ${badges.length}`);
}
