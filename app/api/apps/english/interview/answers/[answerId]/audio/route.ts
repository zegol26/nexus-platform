import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ answerId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { answerId } = await context.params;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const answer = await prisma.englishInterviewAnswer.findUnique({
    where: { id: answerId },
  });

  if (!answer) {
    return NextResponse.json({ error: "Answer not found" }, { status: 404 });
  }

  const canReview = user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "TEACHER";
  if (answer.userId !== user.id && !canReview) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const audio = Buffer.from(answer.audioBase64, "base64");
  const range = request.headers.get("range");
  const contentType = normalizeAudioMimeType(answer.audioMimeType);
  const baseHeaders = {
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=300",
    "Content-Type": contentType,
    "Content-Disposition": `inline; filename="${getAudioFileName(answer.fileName, contentType)}"`,
    Vary: "Range",
  };

  if (range) {
    const rangeMatch = range.match(/bytes=(\d*)-(\d*)/);

    if (rangeMatch) {
      const start = rangeMatch[1] ? Number(rangeMatch[1]) : 0;
      const end = rangeMatch[2] ? Number(rangeMatch[2]) : audio.length - 1;
      const safeEnd = Math.min(end, audio.length - 1);

      if (start <= safeEnd && start < audio.length) {
        const chunk = audio.subarray(start, safeEnd + 1);

        return new NextResponse(chunk, {
          status: 206,
          headers: {
            ...baseHeaders,
            "Content-Length": String(chunk.length),
            "Content-Range": `bytes ${start}-${safeEnd}/${audio.length}`,
          },
        });
      }
    }

    return new NextResponse(null, {
      status: 416,
      headers: {
        ...baseHeaders,
        "Content-Range": `bytes */${audio.length}`,
      },
    });
  }

  return new NextResponse(audio, {
    headers: {
      ...baseHeaders,
      "Content-Length": String(audio.length),
    },
  });
}

function normalizeAudioMimeType(mimeType: string) {
  const [type] = mimeType.split(";");

  if (type === "audio/x-m4a" || type === "audio/m4a") return "audio/mp4";
  if (type === "audio/x-wav") return "audio/wav";

  return type || "application/octet-stream";
}

function getAudioFileName(fileName: string | null, contentType: string) {
  if (fileName) return fileName.replace(/"/g, "");

  if (contentType === "audio/mp4") return "english-interview.m4a";
  if (contentType === "audio/wav") return "english-interview.wav";
  if (contentType === "audio/mpeg") return "english-interview.mp3";

  return "english-interview.webm";
}
