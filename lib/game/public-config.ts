import type { GameResources } from "@/lib/game/config";

export const publicResourceLabels: Record<keyof GameResources, string> = {
  wood: "Wood",
  food: "Food",
  stone: "Stone",
  silver: "Silver",
  gold: "Gold",
};

export const publicUnitCatalog = [
  { key: "ASHIGARU_SCOUT", name: "Ashigaru Scout", attack: 8, defense: 4, unlockCastleLevel: 1 },
  { key: "BAMBOO_ARCHER", name: "Bamboo Archer", attack: 12, defense: 5, unlockCastleLevel: 1 },
  { key: "STONE_GUARD", name: "Stone Guard", attack: 10, defense: 18, unlockCastleLevel: 2 },
  { key: "SILVER_SPEARMAN", name: "Silver Spearman", attack: 24, defense: 16, unlockCastleLevel: 3 },
  { key: "GARUDA_RIDER", name: "Garuda Rider", attack: 35, defense: 18, unlockCastleLevel: 4 },
  { key: "SHADOW_SHINOBI", name: "Shadow Shinobi", attack: 50, defense: 20, unlockCastleLevel: 5 },
] as const;

export const publicConversions = {
  WOOD_TO_STONE: { label: "10 Wood -> 1 Stone" },
  STONE_TO_SILVER: { label: "8 Stone -> 1 Silver" },
  SILVER_TO_GOLD: { label: "6 Silver -> 1 Gold" },
  FOOD_TO_WOOD: { label: "5 Food -> 3 Wood" },
  WOOD_TO_FOOD: { label: "5 Wood -> 3 Food" },
} as const;

export const publicHeroCatalog = [
  { key: "ARJUNA", name: "Arujin Veyra", title: "Celestial Archer", image: "/Hero/Arujin Veyra.png", aura: "cyan", style: "Balanced offense", attackBonus: 1.12, defenseBonus: 1.06, bestFor: "Archer, Samurai, presisi" },
  { key: "BIMA", name: "Bymarax Khor", title: "Brutal Warlord", image: "/Hero/Bymarax Khor.png", aura: "rose", style: "Heavy offense", attackBonus: 1.18, defenseBonus: 1.04, bestFor: "Golem, Cannon, raid langsung" },
  { key: "GATOTKACA", name: "Gatara Veyon", title: "Sky Guardian", image: "/Hero/Gatara Veyon.png", aura: "emerald", style: "Aerial hybrid", attackBonus: 1.1, defenseBonus: 1.14, bestFor: "Garuda Rider, anti-raid" },
  { key: "SRIKANDI", name: "Syrakane Noxa", title: "Shadow Tactician", image: "/Hero/Syrakane Noxa.png", aura: "violet", style: "Tactical precision", attackBonus: 1.15, defenseBonus: 1.08, bestFor: "Archer, Shinobi, ambush" },
  { key: "SEMAR", name: "Semarion Eldra", title: "Ancient Sage", image: "/Hero/Semarion Eldra.png", aura: "amber", style: "Defensive wisdom", attackBonus: 1.05, defenseBonus: 1.2, bestFor: "Long-term defense kerajaan" },
] as const;

export const publicDeckCards = [
  { key: "KANA_FOCUS_CARD", name: "Kana Focus Card", description: "+10% flashcard reward selama 30 menit." },
  { key: "KANJI_BLADE_CARD", name: "Kanji Blade Card", description: "+8% serangan jika menyelesaikan lesson kanji hari ini." },
  { key: "BUNPOU_SHIELD_CARD", name: "Bunpou Shield Card", description: "+10% defense setelah quiz completion." },
  { key: "MOCK_TEST_BANNER", name: "Mock Test Banner", description: "+15% morale setelah mock test score di atas 80%." },
  { key: "READING_SCOUT", name: "Reading Scout", description: "Melihat perkiraan defense musuh." },
  { key: "FOOD_CARAVAN", name: "Food Caravan", description: "+20% Food reward untuk lesson completion." },
] as const;
