import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { getCertificateEligibility } from "@/lib/certificates/eligibility";
import { getCertificateProgram } from "@/lib/certificates/policy";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const appSlug = url.searchParams.get("appSlug") ?? "";
  const program = getCertificateProgram(appSlug);
  if (!program) {
    return NextResponse.json({ error: "Unsupported certificate app" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, role: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [eligibility, certificate] = await Promise.all([
    getCertificateEligibility(user, appSlug),
    prisma.courseCertificate.findUnique({
      where: {
        userId_appSlug_courseName: {
          userId: user.id,
          appSlug,
          courseName: program.courseName,
        },
      },
    }),
  ]);

  return NextResponse.json({
    appSlug,
    courseName: program.courseName,
    displayName: user.name ?? "",
    requiresDisplayName: !(user.name ?? "").trim(),
    certificate,
    ...eligibility,
  });
}
