import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const userId = String(body.userId ?? "");
  const appId = String(body.appId ?? "");
  const action = String(body.action ?? "grant");
  const durationDays = Number(body.durationDays ?? 30);
  const reason = typeof body.reason === "string" ? body.reason : undefined;

  if (!userId || !appId) {
    return NextResponse.json({ error: "userId and appId are required" }, { status: 400 });
  }

  if (action === "revoke") {
    await prisma.appUserAccess.updateMany({
      where: { userId, appId },
      data: {
        status: "REVOKED",
        accessExpiresAt: new Date(),
      },
    });

    await prisma.accessGrantAudit.create({
      data: { actorId: admin.id, userId, appId, action: "REVOKE_APP", reason },
    });

    return NextResponse.json({ ok: true });
  }

  const accessExpiresAt = new Date();
  accessExpiresAt.setDate(accessExpiresAt.getDate() + durationDays);

  const access = await prisma.appUserAccess.upsert({
    where: {
      userId_appId: { userId, appId },
    },
    update: {
      status: "ACTIVE",
      billingPlan: "ADMIN_GRANT",
      billingPeriod: `${durationDays}_DAYS`,
      accessStartsAt: new Date(),
      accessExpiresAt,
    },
    create: {
      userId,
      appId,
      status: "ACTIVE",
      billingPlan: "ADMIN_GRANT",
      billingPeriod: `${durationDays}_DAYS`,
      accessExpiresAt,
    },
  });

  await prisma.accessGrantAudit.create({
    data: {
      actorId: admin.id,
      userId,
      appId,
      action: "GRANT_APP",
      reason,
      metadata: JSON.stringify({ durationDays }),
    },
  });

  return NextResponse.json({ access });
}
