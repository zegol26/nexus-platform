import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  attackWeapons,
  continents,
  conversions,
  deckCards,
  defenseWeapons,
  learningRewards,
  unitCatalog,
} from "../lib/game/config";
import { publicConversions, publicDeckCards, publicUnitCatalog } from "../lib/game/public-config";

const errors: string[] = [];

if (continents.length !== 5) errors.push("Game harus memiliki tepat 5 continent.");
if (unitCatalog.length !== 10) errors.push("Army unit catalog harus berisi 10 unit.");
if (attackWeapons.length !== 10) errors.push("Attack weapon catalog harus berisi 10 weapon.");
if (defenseWeapons.length !== 10) errors.push("Defense weapon catalog harus berisi 10 defense system.");
if (deckCards.length !== 10) errors.push("Deck card catalog harus berisi 10 card.");

for (const weapon of [...attackWeapons, ...defenseWeapons]) {
  if (weapon.modifier < 1.05 || weapon.modifier > 1.85) {
    errors.push(`Modifier weapon di luar batas aman: ${weapon.name}`);
  }
}

for (const rewardType of ["LESSON_COMPLETED", "READING_COMPLETED", "MOCK_N5_COMPLETED", "MOCK_N4_COMPLETED"] as const) {
  if (!learningRewards[rewardType]) errors.push(`Reward wajib belum tersedia: ${rewardType}`);
}

for (const conversion of Object.values(conversions)) {
  const fromValue = Object.values(conversion.from).reduce((sum, value) => sum + Number(value), 0);
  const toValue = Object.values(conversion.to).reduce((sum, value) => sum + Number(value), 0);
  if (fromValue <= 0 || toValue <= 0) errors.push(`Konversi tidak valid: ${conversion.label}`);
}

const publicConfigText = readFileSync(resolve(process.cwd(), "lib/game/public-config.ts"), "utf8");
if (publicConfigText.includes("modifier")) {
  errors.push("Public game config tidak boleh mengekspos modifier tersembunyi.");
}
if (!Object.keys(publicConversions).length || !publicUnitCatalog.length || !publicDeckCards.length) {
  errors.push("Public game config belum lengkap untuk UI client.");
}

for (const file of [
  "app/platform/game/page.tsx",
  "app/apps/nihongo/game/page.tsx",
  "components/game/PlatformGameDashboard.tsx",
  "app/api/game/me/route.ts",
  "app/api/game/battle/attack/route.ts",
  "app/api/game/leaderboard/route.ts",
]) {
  if (!existsSync(resolve(process.cwd(), file))) errors.push(`File game wajib tidak ditemukan: ${file}`);
}

if (errors.length) {
  console.error("Validasi game gagal:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Validasi game berhasil.");
