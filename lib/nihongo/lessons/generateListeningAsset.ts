import { mkdir, writeFile } from "fs/promises";
import path from "path";
import OpenAI from "openai";
import type { LessonInput, NihongoListeningContent } from "./lessonContentTypes";

export async function generateListeningScript(lesson: LessonInput): Promise<NihongoListeningContent> {
  if (process.env.OPENAI_API_KEY) {
    const aiScript = await tryGenerateScriptWithOpenAI(lesson);
    if (aiScript) return aiScript;
  }

  return {
    scriptJapanese:
      "わたしは毎日日本語を勉強します。今日は新しい文法を練習します。先生の説明を聞いて、ノートを書きます。友だちと短い会話をします。少しずつ上手になります。",
    scriptRomaji:
      "Watashi wa mainichi nihongo o benkyou shimasu. Kyou wa atarashii bunpou o renshuu shimasu. Sensei no setsumei o kiite, nooto o kakimasu. Tomodachi to mijikai kaiwa o shimasu. Sukoshi zutsu jouzu ni narimasu.",
    translationId:
      "Saya belajar bahasa Jepang setiap hari. Hari ini saya berlatih grammar baru. Saya mendengarkan penjelasan guru dan menulis catatan. Saya melakukan percakapan pendek dengan teman. Sedikit demi sedikit saya menjadi lebih mahir.",
  };
}

export async function generateListeningAudio(params: {
  lessonId: string;
  scriptJapanese: string;
}): Promise<{ audioUrl?: string; audioMimeType?: string; audioProvider?: string; durationSec?: number }> {
  if (!process.env.OPENAI_API_KEY || process.env.ENABLE_OPENAI_TTS !== "true") {
    return {
      audioProvider: "not_configured",
    };
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts",
      voice: process.env.OPENAI_TTS_VOICE ?? "alloy",
      input: params.scriptJapanese,
    });

    const uploadDir = path.join(process.cwd(), "public", "generated-audio", "nihongo", "lessons");
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${params.lessonId}.mp3`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, Buffer.from(await response.arrayBuffer()));

    return {
      audioUrl: `/generated-audio/nihongo/lessons/${fileName}`,
      audioMimeType: "audio/mpeg",
      audioProvider: "openai",
    };
  } catch (error) {
    console.error("OpenAI TTS failed; saving listening script without audio.", error);
    return {
      audioProvider: "failed",
    };
  }
}

async function tryGenerateScriptWithOpenAI(lesson: LessonInput): Promise<NihongoListeningContent | null> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_LESSON_MODEL ?? "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Create a beginner-friendly Japanese listening script for Indonesian learners. Return JSON with scriptJapanese, scriptRomaji, translationId. The scriptJapanese must be 4-8 natural N5/N4 sentences.",
        },
        {
          role: "user",
          content: JSON.stringify({
            lessonTitle: lesson.title,
            level: lesson.level,
            description: lesson.description,
            lessonType: lesson.lessonType,
          }),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as NihongoListeningContent;
    if (!parsed.scriptJapanese || !parsed.scriptRomaji || !parsed.translationId) return null;
    return parsed;
  } catch (error) {
    console.error("OpenAI listening script generation failed; using fallback.", error);
    return null;
  }
}
