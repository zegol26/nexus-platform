import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const forbiddenWords = [
  "gue",
  "gw",
  "lo",
  "lu",
  "bro",
  "coy",
  "anjir",
  "anjay",
  "bangsat",
  "wkwk",
];

const requiredFiles = [
  "app/platform/community/page.tsx",
  "lib/community/moderation.ts",
  "lib/community/eligibility.ts",
  "components/platform/community/CommunityPage.tsx",
  "components/platform/community/CommunityInfoCard.tsx",
  "components/platform/community/CommunityRulesCard.tsx",
  "components/platform/community/RoomList.tsx",
  "components/platform/community/RoomCreateDialog.tsx",
  "components/platform/community/ChatRoomPanel.tsx",
  "components/platform/community/ChatMessageCard.tsx",
  "components/platform/community/MessageComposer.tsx",
  "components/platform/community/OnigiriBadge.tsx",
  "components/platform/community/LoadingState.tsx",
  "app/api/platform/community/rooms/[roomId]/route.ts",
  "app/api/platform/community/messages/[messageId]/route.ts",
];

const errors: string[] = [];

for (const file of requiredFiles) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) {
    errors.push(`File wajib tidak ditemukan: ${file}`);
    continue;
  }
  auditForbiddenWords(file, readFileSync(path, "utf8"));
}

const route = readFileSync(resolve(process.cwd(), "app/platform/community/page.tsx"), "utf8");
const rules = readFileSync(resolve(process.cwd(), "components/platform/community/CommunityRulesCard.tsx"), "utf8");
const loading = readFileSync(resolve(process.cwd(), "components/platform/community/LoadingState.tsx"), "utf8") +
  readFileSync(resolve(process.cwd(), "components/platform/community/CommunityPage.tsx"), "utf8") +
  readFileSync(resolve(process.cwd(), "components/platform/community/ChatRoomPanel.tsx"), "utf8") +
  readFileSync(resolve(process.cwd(), "components/platform/community/ChatMessageCard.tsx"), "utf8") +
  readFileSync(resolve(process.cwd(), "components/platform/community/MessageComposer.tsx"), "utf8") +
  readFileSync(resolve(process.cwd(), "components/platform/community/RoomCreateDialog.tsx"), "utf8");
const display = readFileSync(resolve(process.cwd(), "lib/community/display.ts"), "utf8");

if (!route.includes("CommunityPage")) errors.push("Route /platform/community belum memakai CommunityPage.");
if (!rules.includes("Aturan Komunitas")) errors.push("Section Aturan Komunitas belum ditemukan.");

const roomAdminRoute = readFileSync(resolve(process.cwd(), "app/api/platform/community/rooms/[roomId]/route.ts"), "utf8");
const messageAdminRoute = readFileSync(resolve(process.cwd(), "app/api/platform/community/messages/[messageId]/route.ts"), "utf8");
if (!roomAdminRoute.includes("DELETE")) errors.push("Admin delete room route belum tersedia.");
if (!messageAdminRoute.includes("DELETE")) errors.push("Admin delete message route belum tersedia.");

for (const text of [
  "Sedang memuat komunitas",
  "Sedang memuat room",
  "Sedang memuat percakapan",
  "Sedang mengirim pesan",
  "Sedang membuat room",
  "Sedang menyimpan onigiri",
  "Sedang memproses data",
  "Gagal memuat data. Coba lagi.",
]) {
  if (!loading.includes(text)) errors.push(`Loading/error text belum ditemukan: ${text}`);
}

for (const threshold of ["10", "50", "100", "500", "1000"]) {
  if (!display.includes(threshold)) errors.push(`Threshold onigiri belum ditemukan: ${threshold}`);
}

if (errors.length) {
  console.error("Validasi community gagal:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Validasi community berhasil.");

function auditForbiddenWords(label: string, content: string) {
  for (const word of forbiddenWords) {
    const pattern = new RegExp(`(^|[^a-zA-Z])${escapeRegExp(word)}([^a-zA-Z]|$)`, "i");
    if (pattern.test(content)) errors.push(`${label} mengandung kata terlarang: ${word}`);
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
