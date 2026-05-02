import OpenAI from "openai";

export async function generateEnglishInterviewTtsBase64(text: string) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      audioBase64: null,
      audioMimeType: null,
      audioProvider: "not_configured",
    };
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts",
      voice: process.env.OPENAI_ENGLISH_TTS_VOICE ?? "alloy",
      input: text,
      instructions:
        "Speak in a clear, neutral, internationally understandable English accent. Use a calm professional interview tone.",
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    return {
      audioBase64: buffer.toString("base64"),
      audioMimeType: "audio/mpeg",
      audioProvider: "openai",
    };
  } catch (error) {
    console.error("English interview TTS generation failed.", error);
    return {
      audioBase64: null,
      audioMimeType: null,
      audioProvider: "failed",
    };
  }
}
