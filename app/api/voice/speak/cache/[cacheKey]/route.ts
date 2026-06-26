import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ cacheKey: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cacheKey } = await context.params;
  const cached = await prisma.voiceTtsCache.findUnique({
    where: { cacheKey },
  });

  if (!cached) {
    return NextResponse.json({ error: "Audio cache not found." }, { status: 404 });
  }

  await prisma.voiceTtsCache.update({
    where: { cacheKey },
    data: { lastUsedAt: new Date() },
  });

  const audio = Buffer.from(cached.audioBase64, "base64");

  const range = request.headers.get("range");
  const baseHeaders = {
    "Content-Type": cached.audioMimeType,
    "Cache-Control": "private, max-age=86400",
    "Accept-Ranges": "bytes",
    "X-TTS-Cache": "hit",
    "X-Voice-Provider": cached.provider,
  };

  if (range) {
    const rangeMatch = range.match(/bytes=(\d+)-(\d*)/);
    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
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
