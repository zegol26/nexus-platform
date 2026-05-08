export type ContinentMeta = {
  name: string;
  image: string;
  accent: string;
  tagline: string;
};

export const continentMetadata: Record<string, ContinentMeta> = {
  "Akatsuki Plains": {
    name: "Akatsuki Plains",
    image: "/Akatsuki plains.png",
    accent: "from-rose-500/40 via-amber-400/30 to-orange-500/40",
    tagline: "Padang fajar, tempat raid awal lahir.",
  },
  "Garuda Highlands": {
    name: "Garuda Highlands",
    image: "/Garuda Highlands.png",
    accent: "from-emerald-500/40 via-lime-300/30 to-teal-500/40",
    tagline: "Dataran tinggi sang Garuda, basis udara.",
  },
  "Tsukikage Isles": {
    name: "Tsukikage Isles",
    image: "/Tsukikage Isles.png",
    accent: "from-indigo-500/40 via-cyan-400/30 to-violet-500/40",
    tagline: "Kepulauan bayang bulan, sarang shinobi.",
  },
  "Mahendra Desert": {
    name: "Mahendra Desert",
    image: "/Mahendra Desert.png",
    accent: "from-amber-500/40 via-yellow-300/30 to-orange-600/40",
    tagline: "Gurun emas, reruntuhan candi kuno.",
  },
  "Arjuna Frostlands": {
    name: "Arjuna Frostlands",
    image: "/Arjuna Frostlands.png",
    accent: "from-sky-500/40 via-cyan-200/30 to-blue-700/40",
    tagline: "Tundra utara, benteng dari es abadi.",
  },
};

const VARIANT_PATTERN = /\s+([IVXLCDM]+)$/;

export function getContinentBaseName(continent: string | undefined | null): string {
  if (!continent) return "Akatsuki Plains";
  return continent.replace(VARIANT_PATTERN, "").trim();
}

export function getContinentMeta(continent: string | undefined | null): ContinentMeta {
  if (continent && continentMetadata[continent]) return continentMetadata[continent];
  const base = getContinentBaseName(continent);
  if (continentMetadata[base]) {
    const variant = continent && continent !== base ? continent.slice(base.length).trim() : null;
    return {
      ...continentMetadata[base],
      name: continent ?? base,
      tagline: variant
        ? `${continentMetadata[base].tagline} (Distrik ${variant})`
        : continentMetadata[base].tagline,
    };
  }
  return continentMetadata["Akatsuki Plains"];
}
