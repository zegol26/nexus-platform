import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";
import { listeningSlug, type ListeningImportItem } from "@/lib/nihongo/listening";

export const runtime = "nodejs";

const maxAudioBytes = 8 * 1024 * 1024;

function readField(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function readArrayOrSplit(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

function pickField(
  raw: Record<string, unknown> | null,
  keys: readonly string[]
): unknown {
  if (!raw) return undefined;
  for (const key of keys) {
    if (raw[key] !== undefined) return raw[key];
  }
  const nested = raw.content;
  if (nested && typeof nested === "object") {
    const c = nested as Record<string, unknown>;
    for (const key of keys) {
      if (c[key] !== undefined) return c[key];
    }
  }
  return undefined;
}

const WRAPPER_KEYS = [
  "articles",
  "items",
  "entries",
  "data",
  "listening",
  "passages",
] as const;

type UnwrapResult =
  | { kind: "single"; entry: Record<string, unknown> | null }
  | { kind: "bulk" };

function unwrapEntry(parsed: unknown): UnwrapResult {
  if (Array.isArray(parsed)) {
    if (parsed.length > 1) return { kind: "bulk" };
    const first = parsed[0];
    return {
      kind: "single",
      entry:
        first && typeof first === "object"
          ? (first as Record<string, unknown>)
          : null,
    };
  }
  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    for (const wrapper of WRAPPER_KEYS) {
      const value = obj[wrapper];
      if (Array.isArray(value)) {
        if (value.length > 1) return { kind: "bulk" };
        const first = value[0];
        return {
          kind: "single",
          entry:
            first && typeof first === "object"
              ? (first as Record<string, unknown>)
              : null,
        };
      }
    }
    return { kind: "single", entry: obj };
  }
  return { kind: "single", entry: null };
}

const KANJI_KEYS = ["kanji", "japanese", "ja", "text"] as const;
const ROMAJI_KEYS = ["romaji", "latin", "pronunciation", "kana"] as const;
const TRANSLATION_KEYS = [
  "translation",
  "indonesia",
  "indonesian",
  "id",
  "terjemahan",
  "english",
  "en",
  "meaning",
] as const;

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const audio = formData.get("audio");
  const metadata = formData.get("metadata");

  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: "Audio file wajib diupload." }, { status: 400 });
  }

  if (audio.size > maxAudioBytes) {
    return NextResponse.json({ error: "Audio terlalu besar. Maksimum MVP adalah 8MB." }, { status: 400 });
  }

  let jsonRaw: Record<string, unknown> | null = null;

  if (metadata instanceof File && metadata.size > 0) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(await metadata.text());
    } catch {
      return NextResponse.json({ error: "JSON metadata tidak valid." }, { status: 400 });
    }

    const unwrapped = unwrapEntry(parsed);
    if (unwrapped.kind === "bulk") {
      return NextResponse.json(
        { error: "Bulk JSON terbaca, tapi MVP hanya mendukung satu entry per submit." },
        { status: 400 }
      );
    }
    jsonRaw = unwrapped.entry;
  }

  const formTitle = readField(formData.get("title"));
  const formLevel = readField(formData.get("level")).toUpperCase();
  const formCategory = readField(formData.get("topic"));
  const formDurationRaw = readField(formData.get("durationSec"));
  const formDuration = formDurationRaw ? Number.parseInt(formDurationRaw, 10) : NaN;

  const jsonTitleRaw = pickField(jsonRaw, ["title", "name"]);
  const jsonLevelRaw = pickField(jsonRaw, ["level"]);
  const jsonCategoryRaw = pickField(jsonRaw, ["category", "topic"]);
  const jsonDurationRaw = pickField(jsonRaw, ["durationSec", "duration"]);

  const jsonTitle = typeof jsonTitleRaw === "string" ? jsonTitleRaw.trim() : "";
  const jsonLevel =
    typeof jsonLevelRaw === "string" ? jsonLevelRaw.trim().toUpperCase() : "";
  const jsonCategory =
    typeof jsonCategoryRaw === "string" ? jsonCategoryRaw.trim() : "";
  const jsonDuration =
    typeof jsonDurationRaw === "number"
      ? Math.max(Math.floor(jsonDurationRaw), 0)
      : null;

  const title = formTitle || jsonTitle;
  const level = formLevel || jsonLevel;
  const category = formCategory || jsonCategory;
  const duration =
    Number.isFinite(formDuration) && formDuration >= 0 ? formDuration : jsonDuration;

  if (!title) {
    return NextResponse.json(
      { error: "Title wajib diisi (di form atau JSON)." },
      { status: 400 }
    );
  }
  if (!level) {
    return NextResponse.json(
      { error: "Level wajib diisi (di form atau JSON)." },
      { status: 400 }
    );
  }
  if (!category) {
    return NextResponse.json(
      { error: "Category wajib diisi (di form atau JSON)." },
      { status: 400 }
    );
  }

  const kanji = readArrayOrSplit(pickField(jsonRaw, KANJI_KEYS));
  const romaji = readArrayOrSplit(pickField(jsonRaw, ROMAJI_KEYS));
  const translation = readArrayOrSplit(pickField(jsonRaw, TRANSLATION_KEYS));

  const item: ListeningImportItem = {
    title,
    level,
    category,
    kanji,
    romaji,
    translation,
    durationSec: duration,
  };
  const bytes = Buffer.from(await audio.arrayBuffer());
  const audioMimeType = audio.type || "audio/mpeg";
  const audioUrl = `data:${audioMimeType};base64,${bytes.toString("base64")}`;
  const contentId = listeningSlug(item.title);
  const metadataFilename = metadata instanceof File ? metadata.name : null;
  const importType = metadataFilename ? "LISTENING_AUDIO_JSON" : "LISTENING_AUDIO_FORM";
  const auditPayload = {
    importType,
    uploadedBy: admin.email,
    uploadedAt: new Date().toISOString(),
    originalAudioName: audio.name,
    originalMetadataName: metadataFilename,
  } satisfies Prisma.InputJsonObject;

  const passage = await prisma.readingPassage.upsert({
    where: { contentId },
    update: {
      title: item.title,
      level: item.level,
      topic: item.category,
      contentJa: item.kanji.join("\n"),
      contentType: "LISTENING",
      audioUrl,
      audioMimeType,
      durationSec: item.durationSec,
      kanjiJson: item.kanji as Prisma.InputJsonValue,
      romajiJson: item.romaji as Prisma.InputJsonValue,
      translationJson: item.translation as Prisma.InputJsonValue,
      vocabularyJson: item.romaji as Prisma.InputJsonValue,
      questionsJson: item.translation as Prisma.InputJsonValue,
      answerKeyJson: auditPayload,
      sourceType: "CACHED",
    },
    create: {
      title: item.title,
      level: item.level,
      topic: item.category,
      contentJa: item.kanji.join("\n"),
      contentId,
      contentType: "LISTENING",
      audioUrl,
      audioMimeType,
      durationSec: item.durationSec,
      kanjiJson: item.kanji as Prisma.InputJsonValue,
      romajiJson: item.romaji as Prisma.InputJsonValue,
      translationJson: item.translation as Prisma.InputJsonValue,
      vocabularyJson: item.romaji as Prisma.InputJsonValue,
      questionsJson: item.translation as Prisma.InputJsonValue,
      answerKeyJson: auditPayload,
      sourceType: "CACHED",
    },
  });

  return NextResponse.json({ ok: true, passage });
}
