export type GameResourceKey = "wood" | "food" | "stone" | "silver" | "gold";
export type GameResources = Record<GameResourceKey, number>;

export const initialResources: GameResources = {
  wood: 120,
  food: 120,
  stone: 40,
  silver: 10,
  gold: 0,
};

export const continents = [
  "Akatsuki Plains",
  "Garuda Highlands",
  "Tsukikage Isles",
  "Mahendra Desert",
  "Arjuna Frostlands",
] as const;

export const resourceLabels: Record<GameResourceKey, string> = {
  wood: "Wood",
  food: "Food",
  stone: "Stone",
  silver: "Silver",
  gold: "Gold",
};

export const unitCatalog = [
  { key: "ASHIGARU_SCOUT", name: "Ashigaru Scout", cost: { food: 20, wood: 15 }, attack: 8, defense: 4, speed: 9, rarity: "Common", unlockCastleLevel: 1 },
  { key: "BAMBOO_ARCHER", name: "Bamboo Archer", cost: { wood: 25, food: 10 }, attack: 12, defense: 5, speed: 8, rarity: "Common", unlockCastleLevel: 1 },
  { key: "STONE_GUARD", name: "Stone Guard", cost: { stone: 30, food: 20 }, attack: 10, defense: 18, speed: 4, rarity: "Uncommon", unlockCastleLevel: 2 },
  { key: "SILVER_SPEARMAN", name: "Silver Spearman", cost: { silver: 20, wood: 25, food: 20 }, attack: 24, defense: 16, speed: 6, rarity: "Uncommon", unlockCastleLevel: 3 },
  { key: "GARUDA_RIDER", name: "Garuda Rider", cost: { silver: 30, food: 40, stone: 20 }, attack: 35, defense: 18, speed: 10, rarity: "Rare", unlockCastleLevel: 4 },
  { key: "SHADOW_SHINOBI", name: "Shadow Shinobi", cost: { silver: 40, gold: 20, food: 30 }, attack: 50, defense: 20, speed: 11, rarity: "Epic", unlockCastleLevel: 5 },
  { key: "IRON_GOLEM", name: "Iron Golem", cost: { stone: 80, silver: 30, gold: 15 }, attack: 30, defense: 60, speed: 2, rarity: "Epic", unlockCastleLevel: 5 },
  { key: "TSUNAMI_MAGE", name: "Tsunami Mage", cost: { silver: 50, gold: 35, food: 50 }, attack: 70, defense: 35, speed: 5, rarity: "Legendary", unlockCastleLevel: 6 },
  { key: "DRAGON_CANNON_CREW", name: "Dragon Cannon Crew", cost: { wood: 100, stone: 70, gold: 40 }, attack: 95, defense: 40, speed: 3, rarity: "Legendary", unlockCastleLevel: 7 },
  { key: "CELESTIAL_SAMURAI", name: "Celestial Samurai", cost: { silver: 100, gold: 80, food: 100 }, attack: 130, defense: 100, speed: 7, rarity: "Mythic", unlockCastleLevel: 8 },
] as const;

export const heroes = [
  { key: "ARJUNA", name: "Arujin Veyra", title: "Celestial Archer", image: "/Hero/Arujin Veyra.png", aura: "cyan", style: "Balanced offense", attackBonus: 1.12, defenseBonus: 1.06, bestFor: "Archer, Samurai, precision attack" },
  { key: "BIMA", name: "Bymarax Khor", title: "Brutal Warlord", image: "/Hero/Bymarax Khor.png", aura: "rose", style: "Heavy offense", attackBonus: 1.18, defenseBonus: 1.04, bestFor: "Golem, Cannon, direct raid" },
  { key: "GATOTKACA", name: "Gatara Veyon", title: "Sky Guardian", image: "/Hero/Gatara Veyon.png", aura: "emerald", style: "Aerial hybrid", attackBonus: 1.1, defenseBonus: 1.14, bestFor: "Garuda Rider, anti-raid defense" },
  { key: "SRIKANDI", name: "Syrakane Noxa", title: "Shadow Tactician", image: "/Hero/Syrakane Noxa.png", aura: "violet", style: "Tactical precision", attackBonus: 1.15, defenseBonus: 1.08, bestFor: "Archer, Shinobi, ambush strategy" },
  { key: "SEMAR", name: "Semarion Eldra", title: "Ancient Sage", image: "/Hero/Semarion Eldra.png", aura: "amber", style: "Defensive wisdom", attackBonus: 1.05, defenseBonus: 1.2, bestFor: "Long-term kingdom protection" },
] as const;

export type HeroAura = "cyan" | "rose" | "emerald" | "violet" | "amber";

export const attackWeapons = [
  { key: "KERIS_METEOR_STRIKE", name: "Keris Meteor Strike", powerHint: "High", modifier: 1.45 },
  { key: "GARUDA_FLAME_DIVE", name: "Garuda Flame Dive", powerHint: "High", modifier: 1.38 },
  { key: "NAGA_THUNDER_CHAIN", name: "Naga Thunder Chain", powerHint: "Medium", modifier: 1.28 },
  { key: "HANABI_CANNON", name: "Hanabi Cannon", powerHint: "Medium", modifier: 1.22 },
  { key: "SHADOW_ECLIPSE_BLADE", name: "Shadow Eclipse Blade", powerHint: "Unstable", modifier: 1.5 },
  { key: "TSUNAMI_WAR_DRUM", name: "Tsunami War Drum", powerHint: "Medium", modifier: 1.18 },
  { key: "MOONLIGHT_KUNAI_STORM", name: "Moonlight Kunai Storm", powerHint: "Low", modifier: 1.1 },
  { key: "SOLAR_LOTUS_BOMB", name: "Solar Lotus Bomb", powerHint: "High", modifier: 1.42 },
  { key: "DRAGON_BREATH_SCROLL", name: "Dragon Breath Scroll", powerHint: "Unstable", modifier: 1.65 },
  { key: "WAYANG_PHANTOM_ARMY", name: "Wayang Phantom Army", powerHint: "Unstable", modifier: 1.55 },
] as const;

export const defenseWeapons = [
  { key: "BOROBUDUR_STONE_WALL", name: "Borobudur Stone Wall", powerHint: "High", modifier: 1.55 },
  { key: "BAMBOO_SPIKE_FOREST", name: "Bamboo Spike Forest", powerHint: "Medium", modifier: 1.24 },
  { key: "NAGA_WATER_SHIELD", name: "Naga Water Shield", powerHint: "High", modifier: 1.42 },
  { key: "GARUDA_SKY_BARRIER", name: "Garuda Sky Barrier", powerHint: "Medium", modifier: 1.34 },
  { key: "SHADOW_MIRROR_GATE", name: "Shadow Mirror Gate", powerHint: "Unstable", modifier: 1.58 },
  { key: "LOTUS_HEALING_SHRINE", name: "Lotus Healing Shrine", powerHint: "Medium", modifier: 1.22 },
  { key: "SILVER_MOON_TOWER", name: "Silver Moon Tower", powerHint: "Low", modifier: 1.1 },
  { key: "DRAGON_SCALE_DOME", name: "Dragon Scale Dome", powerHint: "High", modifier: 1.7 },
  { key: "WIND_CHIME_TRAP", name: "Wind Chime Trap", powerHint: "Medium", modifier: 1.26 },
  { key: "WAYANG_ILLUSION_WALL", name: "Wayang Illusion Wall", powerHint: "Unstable", modifier: 1.62 },
] as const;

export const deckCards = [
  { key: "KANA_FOCUS_CARD", name: "Kana Focus Card", description: "+10% flashcard reward selama 30 menit." },
  { key: "KANJI_BLADE_CARD", name: "Kanji Blade Card", description: "+8% serangan jika menyelesaikan lesson kanji hari ini." },
  { key: "BUNPOU_SHIELD_CARD", name: "Bunpou Shield Card", description: "+10% defense setelah quiz completion." },
  { key: "MOCK_TEST_BANNER", name: "Mock Test Banner", description: "+15% morale setelah mock test score di atas 80%." },
  { key: "READING_SCOUT", name: "Reading Scout", description: "Melihat perkiraan defense musuh." },
  { key: "FOOD_CARAVAN", name: "Food Caravan", description: "+20% Food reward untuk lesson completion." },
  { key: "STONE_MASON", name: "Stone Mason", description: "-10% biaya upgrade castle." },
  { key: "SILVER_TRADE_ROUTE", name: "Silver Trade Route", description: "Konversi resource lebih baik satu kali." },
  { key: "GOLD_BLESSING", name: "Gold Blessing", description: "Rare card dari N4 mock test." },
  { key: "SEMAR_WISDOM", name: "Semar Wisdom", description: "Mengurangi battle loss sebesar 15%." },
] as const;

export const learningRewards = {
  FLASHCARD_CORRECT: { resources: { wood: 3, food: 2, stone: 0, silver: 0, gold: 0 }, xp: 1, dailyKey: "flashcardCount", dailyLimit: 300 },
  FLASHCARD_STREAK_10: { resources: { wood: 20, food: 15, stone: 5, silver: 0, gold: 0 }, xp: 10 },
  QUIZ_CORRECT: { resources: { wood: 5, food: 3, stone: 2, silver: 0, gold: 0 }, xp: 3, dailyKey: "quizCount", dailyLimit: 100 },
  QUIZ_COMPLETED: { resources: { wood: 20, food: 15, stone: 10, silver: 0, gold: 0 }, xp: 15 },
  MOCK_N5_COMPLETED: { resources: { wood: 80, food: 80, stone: 40, silver: 20, gold: 0 }, xp: 60, dailyKey: "mockCount", dailyLimit: 5 },
  MOCK_N4_COMPLETED: { resources: { wood: 120, food: 100, stone: 60, silver: 35, gold: 0 }, xp: 100, dailyKey: "mockCount", dailyLimit: 5 },
  LESSON_COMPLETED: { resources: { wood: 40, food: 35, stone: 20, silver: 10, gold: 0 }, xp: 30 },
  READING_COMPLETED: { resources: { wood: 30, food: 25, stone: 20, silver: 8, gold: 0 }, xp: 25 },
} as const;

export const conversions = {
  WOOD_TO_STONE: { label: "10 Wood -> 1 Stone", from: { wood: 10 }, to: { stone: 1 } },
  STONE_TO_SILVER: { label: "8 Stone -> 1 Silver", from: { stone: 8 }, to: { silver: 1 } },
  SILVER_TO_GOLD: { label: "6 Silver -> 1 Gold", from: { silver: 6 }, to: { gold: 1 } },
  FOOD_TO_WOOD: { label: "5 Food -> 3 Wood", from: { food: 5 }, to: { wood: 3 } },
  WOOD_TO_FOOD: { label: "5 Wood -> 3 Food", from: { wood: 5 }, to: { food: 3 } },
} as const;

export function castleDefenseMultiplier(level: number) {
  return [1, 1, 1.08, 1.16, 1.25, 1.35, 1.47, 1.6, 1.75, 1.92, 2.1][Math.min(Math.max(level, 1), 10)] ?? 1;
}
