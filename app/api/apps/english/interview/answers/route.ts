import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

const supportedMimeTypes = new Set([
  "audio/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
]);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("audio");
  const questionId = String(formData.get("questionId") ?? "");
  const durationSec = Math.round(Number(formData.get("durationSec") ?? 0));

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Audio recording is required." }, { status: 400 });
  }

  if (!questionId) {
    return NextResponse.json({ error: "questionId is required." }, { status: 400 });
  }

  if (!supportedMimeTypes.has(file.type)) {
    return NextResponse.json({ error: "Unsupported audio format." }, { status: 400 });
  }

  if (durationSec < 1 || durationSec > 180) {
    return NextResponse.json({ error: "Recording must be between 1 second and 3 minutes." }, { status: 400 });
  }

  if (file.size > 12 * 1024 * 1024) {
    return NextResponse.json({ error: "Audio file is too large. Maximum size is 12MB." }, { status: 400 });
  }

  const question = await prisma.englishInterviewQuestion.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    return NextResponse.json({ error: "Question not found." }, { status: 404 });
  }

  const audioBase64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  const answer = await prisma.englishInterviewAnswer.create({
    data: {
      userId: user.id,
      questionId,
      audioBase64,
      audioMimeType: file.type,
      durationSec,
      fileName: file.name,
      status: "SUBMITTED",
    },
  });

  return NextResponse.json({
    answerId: answer.id,
    status: answer.status,
    submittedAt: answer.submittedAt,
  });
}
