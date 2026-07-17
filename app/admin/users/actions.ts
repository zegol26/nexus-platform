"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";
import { platformApps } from "@/lib/platform/app-registry";

const storyArcDefinition = platformApps.find((app) => app.slug === "storyarc");

export async function setTeachingRole(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Admin access required.");
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!userId || !["USER", "TEACHER"].includes(role)) throw new Error("Invalid teaching role update.");
  if (userId === admin.id) throw new Error("You cannot change your own admin role here.");
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target || !["USER", "TEACHER"].includes(target.role)) throw new Error("Only learner and teacher accounts can be changed here.");
  await prisma.user.update({ where: { id: userId }, data: { role: role as "USER" | "TEACHER" } });
  revalidatePath("/admin/users");
}

export async function setStoryArcAccess(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Admin access required.");
  if (!storyArcDefinition) throw new Error("StoryArc is missing from the app registry.");

  const userId = String(formData.get("userId") ?? "");
  const action = String(formData.get("accessAction") ?? "");
  const requestedDuration = Number(formData.get("durationDays") ?? 365);
  const durationDays = Number.isFinite(requestedDuration)
    ? Math.min(Math.max(Math.floor(requestedDuration), 1), 3650)
    : 365;
  if (!userId || !["grant", "revoke"].includes(action)) {
    throw new Error("Invalid StoryArc access update.");
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) throw new Error("User not found.");

  const targetIsAdmin = target.role === "ADMIN" || target.role === "SUPER_ADMIN";
  const now = new Date();
  const expiresAt = targetIsAdmin ? null : new Date(now);
  if (expiresAt) expiresAt.setUTCDate(expiresAt.getUTCDate() + durationDays);

  await prisma.$transaction(async (tx) => {
    const app = await tx.platformApp.upsert({
      where: { slug: storyArcDefinition.slug },
      update: {
        name: storyArcDefinition.name,
        description: storyArcDefinition.description,
        status: "ACTIVE",
      },
      create: {
        slug: storyArcDefinition.slug,
        name: storyArcDefinition.name,
        description: storyArcDefinition.description,
        status: "ACTIVE",
      },
    });

    if (action === "revoke") {
      await tx.appUserAccess.updateMany({
        where: { userId, appId: app.id },
        data: { status: "REVOKED", accessExpiresAt: now },
      });
    } else {
      await tx.appUserAccess.upsert({
        where: { userId_appId: { userId, appId: app.id } },
        update: {
          status: "ACTIVE",
          billingPlan: targetIsAdmin ? "ADMIN" : "ADMIN_GRANT",
          billingPeriod: targetIsAdmin ? "NON_EXPIRING" : `${durationDays}_DAYS`,
          accessStartsAt: now,
          accessExpiresAt: expiresAt,
        },
        create: {
          userId,
          appId: app.id,
          status: "ACTIVE",
          billingPlan: targetIsAdmin ? "ADMIN" : "ADMIN_GRANT",
          billingPeriod: targetIsAdmin ? "NON_EXPIRING" : `${durationDays}_DAYS`,
          accessStartsAt: now,
          accessExpiresAt: expiresAt,
        },
      });
    }

    await tx.accessGrantAudit.create({
      data: {
        actorId: admin.id,
        userId,
        appId: app.id,
        action: action === "grant" ? "GRANT_APP" : "REVOKE_APP",
        reason: "StoryArc access managed from admin users console",
        metadata: JSON.stringify({
          appSlug: "storyarc",
          durationDays: action === "grant" && !targetIsAdmin ? durationDays : null,
          nonExpiringAdmin: action === "grant" && targetIsAdmin,
        }),
      },
    });
  });

  revalidatePath("/admin/users");
  revalidatePath("/platform/admin");
}
