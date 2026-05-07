import type { ReadingPassage } from "@prisma/client";

export type ListeningLine = {
  kanji: string;
  romaji: string;
  translation: string;
};

export type ListeningContent = {
  id: string;
  title: string;
  level: string;
  category: string;
  audioUrl: string | null;
  audioMimeType: string | null;
  durationSec: number | null;
  lines: ListeningLine[];
  createdAt: Date;
};

export type ListeningImportItem = {
  title: string;
  level: string;
  category: string;
  kanji: string[];
  romaji: string[];
  translation: string[];
  durationSec?: number | null;
};

export function parseListeningPassage(passage: ReadingPassage): ListeningContent {
  const kanji =
    toStringArray(passage.kanjiJson) ??
    extractTransliterationField(passage.translationJson, [
      "kanji",
      "japanese",
      "ja",
    ]) ??
    extractFromLines(passage.translationJson, ["japanese", "kanji", "ja"]) ??
    splitLines(passage.contentJa);
  const romaji =
    toStringArray(passage.romajiJson) ??
    toStringArray(passage.vocabularyJson) ??
    extractTransliterationField(passage.translationJson, [
      "romaji",
      "latin",
      "kana",
    ]) ??
    extractFromLines(passage.translationJson, ["romaji", "latin", "kana"]) ??
    [];
  const translation =
    toStringArray(passage.translationJson) ??
    extractTransliterationField(passage.translationJson, [
      "indonesia",
      "indonesian",
      "id",
      "translation",
      "terjemahan",
    ]) ??
    extractFromLines(passage.translationJson, [
      "indonesia",
      "indonesian",
      "id",
      "translation",
      "terjemahan",
    ]) ??
    extractTransliterationField(passage.questionsJson, [
      "indonesia",
      "indonesian",
      "translation",
    ]) ??
    extractFromLines(passage.questionsJson, [
      "indonesia",
      "indonesian",
      "translation",
    ]) ??
    toStringArray(passage.questionsJson) ??
    [];
  const maxLength = Math.max(kanji.length, romaji.length, translation.length);

  return {
    id: passage.id,
    title: passage.title,
    level: passage.level,
    category: passage.topic,
    audioUrl: passage.audioUrl,
    audioMimeType: passage.audioMimeType,
    durationSec: passage.durationSec,
    createdAt: passage.createdAt,
    lines: Array.from({ length: maxLength }).map((_, index) => ({
      kanji: kanji[index] ?? "",
      romaji: romaji[index] ?? "",
      translation: translation[index] ?? "",
    })),
  };
}

export function validateListeningImport(value: unknown): { ok: true; items: ListeningImportItem[] } | { ok: false; error: string } {
  const rawItems = Array.isArray(value) ? value : [value];

  if (!rawItems.length || rawItems.some((item) => !item || typeof item !== "object")) {
    return { ok: false, error: "JSON harus berupa object atau array object." };
  }

  const items: ListeningImportItem[] = [];

  for (const rawItem of rawItems) {
    const item = rawItem as Record<string, unknown>;
    const title = typeof item.title === "string" ? item.title.trim() : "";
    const level = typeof item.level === "string" ? item.level.trim().toUpperCase() : "";
    const category = typeof item.category === "string" ? item.category.trim() : "";
    const kanji = toStringArray(item.kanji);
    const romaji = toStringArray(item.romaji);
    const translation = toStringArray(item.translation);
    const durationSec = typeof item.durationSec === "number" ? Math.max(Math.floor(item.durationSec), 0) : null;

    if (!title) return { ok: false, error: "Title wajib diisi." };
    if (!level) return { ok: false, error: "Level wajib diisi." };
    if (!category) return { ok: false, error: "Category wajib diisi." };
    if (!kanji?.length) return { ok: false, error: "Kanji transcript wajib berupa array berisi teks." };
    if (romaji && romaji.length !== kanji.length) {
      return { ok: false, error: "Jumlah baris romaji harus sama dengan kanji." };
    }
    if (translation && translation.length !== kanji.length) {
      return { ok: false, error: "Jumlah baris translation harus sama dengan kanji." };
    }

    items.push({
      title,
      level,
      category,
      kanji,
      romaji: romaji ?? [],
      translation: translation ?? [],
      durationSec,
    });
  }

  return { ok: true, items };
}

export function listeningSlug(title: string) {
  return `listening-${title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80)}`;
}

function toStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const filtered = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
  return filtered.length ? filtered : null;
}

/**
 * Read `{ <field>: string[] }` (or under nested `content`) from a JSON
 * column. Lets us recover `indonesia`, `romaji`, etc. when an admin
 * uploaded a payload that wasn't fully normalized into the dedicated
 * Prisma columns.
 */
function extractTransliterationField(
  json: unknown,
  keys: readonly string[]
): string[] | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  const obj = json as Record<string, unknown>;
  for (const key of keys) {
    const direct = toStringArray(obj[key]);
    if (direct?.length) return direct;
  }
  const nested = obj.content;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const c = nested as Record<string, unknown>;
    for (const key of keys) {
      const direct = toStringArray(c[key]);
      if (direct?.length) return direct;
    }
  }
  return null;
}

/**
 * Read a per-line array of objects — `[ { japanese, romaji, indonesia } ]`
 * — and pull a single field across every line. Used to recover the
 * Indonesian translation when listening JSON was uploaded as a list of
 * line objects rather than parallel arrays.
 */
function extractFromLines(
  json: unknown,
  keys: readonly string[]
): string[] | null {
  const list = collectLineList(json);
  if (!list) return null;
  const result: string[] = [];
  for (const line of list) {
    if (!line || typeof line !== "object") continue;
    const obj = line as Record<string, unknown>;
    let value: string | null = null;
    for (const key of keys) {
      if (typeof obj[key] === "string") {
        value = (obj[key] as string).trim();
        break;
      }
    }
    if (value) result.push(value);
  }
  return result.length ? result : null;
}

function collectLineList(json: unknown): unknown[] | null {
  if (!json) return null;
  if (Array.isArray(json) && json.every((item) => item && typeof item === "object")) {
    return json;
  }
  if (typeof json !== "object") return null;
  const obj = json as Record<string, unknown>;
  for (const wrapper of [
    "lines",
    "transcript",
    "items",
    "entries",
    "content",
  ] as const) {
    const value = obj[wrapper];
    if (Array.isArray(value) && value.every((item) => item && typeof item === "object")) {
      return value;
    }
  }
  return null;
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
