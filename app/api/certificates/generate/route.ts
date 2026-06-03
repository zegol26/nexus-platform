import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { getCertificateEligibility } from "@/lib/certificates/eligibility";
import { createCertificateId } from "@/lib/certificates/ids";
import { getCertificateProgram } from "@/lib/certificates/policy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { appSlug?: unknown } | null;
  const appSlug = typeof body?.appSlug === "string" ? body.appSlug : "";
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

  const displayName = (user.name ?? "").trim();
  if (!displayName) {
    return NextResponse.json(
      { error: "Please fill your profile name before generating a certificate." },
      { status: 409 }
    );
  }

  const eligibility = await getCertificateEligibility(user, appSlug);
  if (!eligibility.eligible) {
    return NextResponse.json(
      { error: "Selesaikan 100% course untuk membuka diploma certificate.", eligibility },
      { status: 403 }
    );
  }

  const certificate = await prisma.courseCertificate.upsert({
    where: {
      userId_appSlug_courseName: {
        userId: user.id,
        appSlug,
        courseName: program.courseName,
      },
    },
    update: {
      displayName,
    },
    create: {
      userId: user.id,
      appSlug,
      courseName: program.courseName,
      displayName,
      certificateId: createCertificateId(appSlug),
    },
  });

  return NextResponse.json({ certificate, eligibility });
}
