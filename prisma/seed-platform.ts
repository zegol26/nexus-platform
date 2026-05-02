import { prisma } from "./seed-client";
import { platformApps } from "../lib/platform/app-registry";
import bcrypt from "bcryptjs";

export async function seedPlatform() {
  for (const app of platformApps) {
    await prisma.platformApp.upsert({
      where: { slug: app.slug },
      update: {
        name: app.name,
        description: app.description,
        status: app.status === "active" ? "ACTIVE" : "COMING_SOON",
      },
      create: {
        slug: app.slug,
        name: app.name,
        description: app.description,
        status: app.status === "active" ? "ACTIVE" : "COMING_SOON",
      },
    });
  }

  const nihongoApp = await prisma.platformApp.findUnique({
    where: { slug: "nihongo" },
  });

  if (nihongoApp) {
    await prisma.subscriptionPlan.upsert({
      where: {
        appId_code: {
          appId: nihongoApp.id,
          code: "NIHONGO_MONTHLY",
        },
      },
      update: {
        name: "Nihongo Monthly",
        description: "Monthly access to Nexus AI Nihongo",
        priceCents: 9900000,
        currency: "IDR",
        durationDays: 30,
        active: true,
      },
      create: {
        appId: nihongoApp.id,
        code: "NIHONGO_MONTHLY",
        name: "Nihongo Monthly",
        description: "Monthly access to Nexus AI Nihongo",
        priceCents: 9900000,
        currency: "IDR",
        durationDays: 30,
        active: true,
      },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@nexus.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "NexusAdmin123!";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: { password: true },
  });
  const passwordData = existingAdmin?.password
    ? {}
    : { password: await bcrypt.hash(adminPassword, 10) };

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      name: "Nexus Admin",
      ...passwordData,
    },
    create: {
      email: adminEmail,
      name: "Nexus Admin",
      role: "ADMIN",
      ...passwordData,
    },
  });

  if (nihongoApp) {
    const adminExpiresAt = new Date();
    adminExpiresAt.setFullYear(adminExpiresAt.getFullYear() + 1);

    await prisma.appUserAccess.upsert({
      where: {
        userId_appId: {
          userId: admin.id,
          appId: nihongoApp.id,
        },
      },
      update: {
        status: "ACTIVE",
        billingPlan: "ADMIN",
        billingPeriod: "ANNUAL",
        accessExpiresAt: adminExpiresAt,
      },
      create: {
        userId: admin.id,
        appId: nihongoApp.id,
        status: "ACTIVE",
        billingPlan: "ADMIN",
        billingPeriod: "ANNUAL",
        accessExpiresAt: adminExpiresAt,
      },
    });
  }

  console.log(`Platform apps seeded: ${platformApps.length}`);
  console.log(`Admin login seeded: ${adminEmail}`);
}
