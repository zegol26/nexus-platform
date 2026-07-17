import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { platformApps } from "@/lib/platform/app-registry";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const userId = String(body.userId ?? "");
  const appId = String(body.appId ?? "");
  const appSlug = String(body.appSlug ?? "");
  const action = String(body.action ?? "grant");
  const rawDurationDays = Number(body.durationDays ?? 30);
  const durationDays = Number.isFinite(rawDurationDays)
    ? Math.min(Math.max(Math.floor(rawDurationDays), 1), 3650)
    : 30;
  const reason = typeof body.reason === "string" ? body.reason : undefined;

  if (!userId || (!appId && !appSlug)) {
    return NextResponse.json({ error: "userId and appId or appSlug are required" }, { status: 400 });
  }

  let resolvedAppId = appId;
  if (appSlug) {
    const definition = platformApps.find((app) => app.slug === appSlug);
    if (!definition) {
      return NextResponse.json({ error: "Unknown platform app" }, { status: 400 });
    }

    const app = await prisma.platformApp.upsert({
      where: { slug: definition.slug },
      update: {
        name: definition.name,
        description: definition.description,
        status: "ACTIVE",
      },
      create: {
        slug: definition.slug,
        name: definition.name,
        description: definition.description,
        status: "ACTIVE",
      },
    });
    resolvedAppId = app.id;
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isTargetAdmin = targetUser.role === "ADMIN" || targetUser.role === "SUPER_ADMIN";

  if (action === "revoke") {
    await prisma.appUserAccess.updateMany({
      where: { userId, appId: resolvedAppId },
      data: {
        status: "REVOKED",
        accessExpiresAt: new Date(),
      },
    });

    await prisma.accessGrantAudit.create({
      data: { actorId: admin.id, userId, appId: resolvedAppId, action: "REVOKE_APP", reason },
    });

    return NextResponse.json({ ok: true });
  }

  const accessExpiresAt = isTargetAdmin ? null : new Date();
  if (accessExpiresAt) accessExpiresAt.setDate(accessExpiresAt.getDate() + durationDays);

  const access = await prisma.appUserAccess.upsert({
    where: {
      userId_appId: { userId, appId: resolvedAppId },
    },
    update: {
      status: "ACTIVE",
      billingPlan: isTargetAdmin ? "ADMIN" : "ADMIN_GRANT",
      billingPeriod: isTargetAdmin ? "NON_EXPIRING" : `${durationDays}_DAYS`,
      accessStartsAt: new Date(),
      accessExpiresAt,
    },
    create: {
      userId,
      appId: resolvedAppId,
      status: "ACTIVE",
      billingPlan: isTargetAdmin ? "ADMIN" : "ADMIN_GRANT",
      billingPeriod: isTargetAdmin ? "NON_EXPIRING" : `${durationDays}_DAYS`,
      accessExpiresAt,
    },
  });

  await prisma.accessGrantAudit.create({
    data: {
      actorId: admin.id,
      userId,
      appId: resolvedAppId,
      action: "GRANT_APP",
      reason,
      metadata: JSON.stringify({ durationDays: isTargetAdmin ? null : durationDays, nonExpiringAdmin: isTargetAdmin }),
    },
  });

  return NextResponse.json({ access });
}
