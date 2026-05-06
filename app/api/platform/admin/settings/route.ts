import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { ensurePlatformSettings, platformSettingKeys } from "@/lib/platform/settings";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const role = session?.user ? (session.user as { role?: string }).role : undefined;

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensurePlatformSettings();
  const body = await req.json();

  const planUpdates = Array.isArray(body.plans) ? body.plans : [];
  const settings = body.settings && typeof body.settings === "object" ? body.settings : {};

  for (const item of planUpdates) {
    const id = String(item.id ?? "");
    const priceCents = Number(item.priceCents);
    const durationDays = Number(item.durationDays);
    const active = Boolean(item.active);

    if (!id || !Number.isFinite(priceCents) || priceCents < 0 || !Number.isFinite(durationDays) || durationDays < 1) {
      continue;
    }

    await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        priceCents: Math.round(priceCents),
        durationDays: Math.round(durationDays),
        active,
      },
    });
  }

  const allowedSettingKeys = [
    platformSettingKeys.lessonPriceCents,
    platformSettingKeys.qrisInfo,
    platformSettingKeys.bankInfo,
  ];

  for (const key of allowedSettingKeys) {
    if (!(key in settings)) continue;
    const rawValue = String(settings[key] ?? "");
    const value = key === platformSettingKeys.lessonPriceCents && rawValue
      ? String(Math.max(0, Math.round(Number(rawValue) || 0)))
      : rawValue;

    await prisma.platformSetting.update({
      where: { key },
      data: { value },
    });
  }

  return NextResponse.json({ ok: true });
}
