export type CastleStage = {
  level: number;
  name: string;
  era: string;
  description: string;
};

export const castleStages: CastleStage[] = [
  { level: 1, name: "Reclaimed Frontier", era: "Tier I", description: "Tanah baru baru saja dibuka. Hanya pondok kayu sederhana." },
  { level: 2, name: "Bamboo Outpost", era: "Tier I", description: "Pos jaga bambu pertama berdiri di tepi desa." },
  { level: 3, name: "Wooden Hold", era: "Tier II", description: "Pagar kayu mengelilingi dua rumah utama dan menara pengintai." },
  { level: 4, name: "Stone Hamlet", era: "Tier II", description: "Fondasi batu pertama. Penduduk mulai bertambah." },
  { level: 5, name: "Walled Village", era: "Tier III", description: "Tembok batu lengkap dengan menara sudut. Cross-continent attack terbuka." },
  { level: 6, name: "Stone Bastion", era: "Tier III", description: "Benteng batu utama berdiri di pusat desa." },
  { level: 7, name: "Samurai Keep", era: "Tier IV", description: "Keep samurai dengan menara lonceng dan barak." },
  { level: 8, name: "Castle Town", era: "Tier IV", description: "Kota kastel ramai. Distrik pengrajin dan kuil aktif." },
  { level: 9, name: "Great Fortress", era: "Tier V", description: "Benteng agung dengan empat menara dan parit batu." },
  { level: 10, name: "Imperial Citadel", era: "Tier V", description: "Citadel kekaisaran. Mahkota emas tertanam di atas keep." },
];

export function getCastleStage(level: number): CastleStage {
  const clamped = Math.min(Math.max(Math.round(level), 1), 10);
  return castleStages[clamped - 1];
}
