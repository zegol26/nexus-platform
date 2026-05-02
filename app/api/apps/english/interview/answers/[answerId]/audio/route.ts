import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

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

  return new NextResponse(Buffer.from(answer.audioBase64, "base64"), {
    headers: {
      "Content-Type": answer.audioMimeType,
      "Cache-Control": "private, max-age=300",
    },
  });
}
