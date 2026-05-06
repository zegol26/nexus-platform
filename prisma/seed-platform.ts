import { prisma } from "./seed-client";
import { platformApps } from "../lib/platform/app-registry";
import bcrypt from "bcryptjs";

const platformSettings = [
  {
    key: "NIHONGO_LESSON_PRICE_CENTS",
    label: "Nihongo lesson price",
    value: "",
    valueType: "MONEY_CENTS",
    description: "Manual per-lesson price in cents. Leave empty when not offered yet.",
  },
  {
    key: "PAYMENT_QRIS_INFO",
    label: "QRIS payment information",
    value: "",
    valueType: "TEXTAREA",
    description: "Shown to users on Billing when they select QRIS.",
  },
  {
    key: "PAYMENT_BANK_INFO",
    label: "Bank transfer information",
    value: "",
    valueType: "TEXTAREA",
    description: "Shown to users on Billing when they select Bank Transfer.",
  },
];

export async function seedPlatform() {
  await ensureProductionSafeSchema();

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

  for (const setting of platformSettings) {
    await prisma.platformSetting.upsert({
      where: { key: setting.key },
      update: {
        label: setting.label,
        valueType: setting.valueType,
        description: setting.description,
      },
      create: setting,
    });
  }

  const [nihongoApp, englishApp] = await Promise.all([
    prisma.platformApp.findUnique({ where: { slug: "nihongo" } }),
    prisma.platformApp.findUnique({ where: { slug: "english" } }),
  ]);

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

  if (englishApp) {
    await prisma.subscriptionPlan.upsert({
      where: {
        appId_code: {
          appId: englishApp.id,
          code: "ENGLISH_INTERVIEW_MONTHLY",
        },
      },
      update: {
        name: "English Interview Monthly",
        description: "Monthly access to Nexus AI English interview practice",
        priceCents: 9900000,
        currency: "IDR",
        durationDays: 30,
        active: true,
      },
      create: {
        appId: englishApp.id,
        code: "ENGLISH_INTERVIEW_MONTHLY",
        name: "English Interview Monthly",
        description: "Monthly access to Nexus AI English interview practice",
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

  const adminApps = [nihongoApp, englishApp].filter(
    (app): app is NonNullable<typeof app> => Boolean(app)
  );

  for (const app of adminApps) {
    await prisma.appUserAccess.upsert({
      where: {
        userId_appId: {
          userId: admin.id,
          appId: app.id,
        },
      },
      update: {
        status: "ACTIVE",
        billingPlan: "ADMIN",
        billingPeriod: "NON_EXPIRING",
        accessExpiresAt: null,
      },
      create: {
        userId: admin.id,
        appId: app.id,
        status: "ACTIVE",
        billingPlan: "ADMIN",
        billingPeriod: "NON_EXPIRING",
        accessExpiresAt: null,
      },
    });
  }

  console.log(`Platform apps seeded: ${platformApps.length}`);
  console.log(`Admin login seeded: ${adminEmail}`);
}

async function ensureProductionSafeSchema() {
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "ReadingSourceType" AS ENUM ('CACHED', 'AI_GENERATED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PlatformSetting" (
      "id" TEXT NOT NULL,
      "key" TEXT NOT NULL,
      "label" TEXT NOT NULL,
      "value" TEXT,
      "valueType" TEXT NOT NULL DEFAULT 'TEXT',
      "description" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "PlatformSetting_key_key" ON "PlatformSetting"("key");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Subscription" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "appId" TEXT NOT NULL,
      "planId" TEXT,
      "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
      "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "expiresAt" TIMESTAMP(3),
      "canceledAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription"("userId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Subscription_appId_idx" ON "Subscription"("appId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PaymentProof" (
      "id" TEXT NOT NULL,
      "paymentId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "fileUrl" TEXT NOT NULL,
      "fileName" TEXT,
      "fileMimeType" TEXT,
      "note" TEXT,
      "status" TEXT NOT NULL DEFAULT 'WAITING_VERIFICATION',
      "reviewedBy" TEXT,
      "reviewedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PaymentProof_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "PaymentProof_paymentId_key" ON "PaymentProof"("paymentId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PaymentProof_userId_idx" ON "PaymentProof"("userId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PaymentProof_status_idx" ON "PaymentProof"("status");`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "FeatureUsage" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "appSlug" TEXT NOT NULL DEFAULT 'nihongo',
      "feature" TEXT NOT NULL,
      "count" INTEGER NOT NULL DEFAULT 0,
      "periodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "periodEnd" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "FeatureUsage_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "FeatureUsage_userId_appSlug_feature_periodStart_key" ON "FeatureUsage"("userId", "appSlug", "feature", "periodStart");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "FeatureUsage_userId_idx" ON "FeatureUsage"("userId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "FeatureUsage_feature_idx" ON "FeatureUsage"("feature");`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ReadingPassage" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "level" TEXT NOT NULL,
      "topic" TEXT NOT NULL,
      "contentJa" TEXT NOT NULL,
      "contentId" TEXT NOT NULL,
      "vocabularyJson" JSONB NOT NULL,
      "questionsJson" JSONB NOT NULL,
      "answerKeyJson" JSONB,
      "note" TEXT,
      "sourceType" "ReadingSourceType" NOT NULL DEFAULT 'CACHED',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ReadingPassage_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "ReadingPassage_contentId_key" ON "ReadingPassage"("contentId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ReadingPassage_level_idx" ON "ReadingPassage"("level");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ReadingPassage_topic_idx" ON "ReadingPassage"("topic");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ReadingPassage_sourceType_idx" ON "ReadingPassage"("sourceType");`);
}
