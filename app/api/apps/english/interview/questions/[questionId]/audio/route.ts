import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateEnglishInterviewTtsBase64 } from "@/lib/english/interview/tts";

function devLog(message: string, metadata?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[english-interview-audio] ${message}`, metadata ?? "");
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await context.params;

  let question = await prisma.englishInterviewQuestion.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  if (!question.audioBase64) {
    devLog("tts cache miss", { questionId: question.id });
    const audio = await generateEnglishInterviewTtsBase64(question.audioText);
    question = await prisma.englishInterviewQuestion.update({
      where: { id: question.id },
      data: {
        audioBase64: audio.audioBase64,
        audioMimeType: audio.audioMimeType,
        audioProvider: audio.audioProvider,
      },
    });
  } else {
    devLog("tts cache hit", { questionId: question.id });
  }

  if (!question.audioBase64 || !question.audioMimeType) {
    return NextResponse.json({ error: "Audio is not available yet." }, { status: 404 });
  }

  return new NextResponse(Buffer.from(question.audioBase64, "base64"), {
    headers: {
      "Content-Type": question.audioMimeType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
