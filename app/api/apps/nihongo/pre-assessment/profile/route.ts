import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { calculateN5MockReadiness } from "@/lib/nihongo/mock-tests/readiness";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      nihongoProfile: {
        include: {
          badge: true,
          nextLesson: true,
        },
      },
      nihongoAssessments: {
        where: { status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: user.nihongoProfile,
    completed: Boolean(user.nihongoProfile?.assessmentCompletedAt),
    jlptN5MockReadiness: calculateN5MockReadiness({
      role: user.role,
      latestAssessmentScore: user.nihongoAssessments[0]?.overallScore ?? null,
      profileLevel: user.nihongoProfile?.currentLevel,
    }),
  });
}
