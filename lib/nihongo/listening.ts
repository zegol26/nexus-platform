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
  const kanji = toStringArray(passage.kanjiJson) ?? splitLines(passage.contentJa);
  const romaji = toStringArray(passage.romajiJson) ?? toStringArray(passage.vocabularyJson) ?? [];
  const translation =
    toStringArray(passage.translationJson) ?? toStringArray(passage.questionsJson) ?? [];
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
  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
