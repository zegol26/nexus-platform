import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const userId = String(body.userId ?? "");
  const lessonId = String(body.lessonId ?? "");
  const action = String(body.action ?? "grant");
  const durationDays = body.durationDays ? Number(body.durationDays) : null;
  const reason = typeof body.reason === "string" ? body.reason : undefined;

  if (!userId || !lessonId) {
    return NextResponse.json({ error: "userId and lessonId are required" }, { status: 400 });
  }

  if (action === "revoke") {
    await prisma.lessonAccess.updateMany({
      where: { userId, lessonId },
      data: {
        status: "REVOKED",
        expiresAt: new Date(),
      },
    });

    await prisma.accessGrantAudit.create({
      data: { actorId: admin.id, userId, lessonId, action: "REVOKE_LESSON", reason },
    });

    return NextResponse.json({ ok: true });
  }

  const expiresAt = durationDays ? new Date() : null;
  if (expiresAt && durationDays) expiresAt.setDate(expiresAt.getDate() + durationDays);

  const access = await prisma.lessonAccess.upsert({
    where: {
      userId_lessonId: { userId, lessonId },
    },
    update: {
      status: "ACTIVE",
      grantedBy: admin.id,
      expiresAt,
    },
    create: {
      userId,
      lessonId,
      status: "ACTIVE",
      grantedBy: admin.id,
      expiresAt,
    },
  });

  await prisma.accessGrantAudit.create({
    data: {
      actorId: admin.id,
      userId,
      lessonId,
      action: "GRANT_LESSON",
      reason,
      metadata: JSON.stringify({ durationDays }),
    },
  });

  return NextResponse.json({ access });
}
