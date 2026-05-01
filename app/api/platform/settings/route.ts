import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      name: typeof body.name === "string" ? body.name.trim() : undefined,
      avatarUrl:
        typeof body.avatarUrl === "string" ? body.avatarUrl.trim() || null : undefined,
      learningReminderEnabled:
        typeof body.learningReminderEnabled === "boolean"
          ? body.learningReminderEnabled
          : undefined,
      learningReminderTime:
        typeof body.learningReminderTime === "string"
          ? body.learningReminderTime.trim() || null
          : undefined,
      learningGoal:
        typeof body.learningGoal === "string" ? body.learningGoal.trim() || null : undefined,
    },
  });

  return NextResponse.json({
    user: {
      name: user.name,
      avatarUrl: user.avatarUrl,
      learningReminderEnabled: user.learningReminderEnabled,
      learningReminderTime: user.learningReminderTime,
      learningGoal: user.learningGoal,
    },
  });
}
