import { prisma } from "@/lib/db/prisma";
import { fixedBillingPeriodDays } from "@/lib/platform/pricing-policy";

type CatalogApp = {
  id: string;
  name: string;
  slug: string;
};

const appCodePrefixes: Record<string, string> = {
  arabic: "ARABIC",
  english: "ENGLISH_INTERVIEW",
  nihongo: "NIHONGO",
  pmp: "PMP",
};

const appLabels: Record<string, string> = {
  arabic: "Arabic",
  english: "English Interview",
  nihongo: "Nihongo",
  pmp: "PMP Exam Prep",
};

const periodLabels: Record<string, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

const periodMultipliers: Record<string, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  YEARLY: 10,
};

const defaultMonthlyPrices: Record<string, number> = {
  pmp: 25000000,
};

function catalogCode(app: CatalogApp, period: string) {
  const prefix = appCodePrefixes[app.slug] ?? app.slug.toUpperCase();
  return `${prefix}_${period}`;
}

function catalogName(app: CatalogApp, period: string) {
  const label = appLabels[app.slug] ?? app.name;
  return `${label} ${periodLabels[period]}`;
}

function catalogDescription(app: CatalogApp, period: string) {
  return `${catalogName(app, period)} access`;
}

export async function ensureSubscriptionPlanCatalog() {
  const apps = await prisma.platformApp.findMany({
    where: {
      slug: { in: Object.keys(appCodePrefixes) },
    },
    orderBy: { slug: "asc" },
  });

  for (const app of apps) {
    const existingPlans = await prisma.subscriptionPlan.findMany({
      where: { appId: app.id },
      select: {
        code: true,
        priceCents: true,
        currency: true,
        active: true,
        name: true,
        description: true,
        durationDays: true,
        billingPeriod: true,
      },
    });
    const planByCode = new Map(existingPlans.map((plan) => [plan.code, plan]));
    const monthlyCode = catalogCode(app, "MONTHLY");
    const existingMonthly = planByCode.get(monthlyCode);

    const monthlyPriceCents =
      existingMonthly?.priceCents ?? defaultMonthlyPrices[app.slug] ?? 12000000;
    const currency = existingMonthly?.currency ?? "IDR";

    for (const period of Object.keys(fixedBillingPeriodDays)) {
      const code = catalogCode(app, period);
      const name = catalogName(app, period);
      const description = catalogDescription(app, period);
      const existingPlan = planByCode.get(code);

      if (!existingPlan) {
        await prisma.subscriptionPlan.create({
          data: {
            appId: app.id,
            code,
            name,
            description,
            priceCents: monthlyPriceCents * periodMultipliers[period],
            currency,
            durationDays: fixedBillingPeriodDays[period],
            billingPeriod: period,
            active: existingMonthly?.active ?? true,
          },
        });
        continue;
      }

      if (
        existingPlan.name !== name ||
        existingPlan.description !== description ||
        existingPlan.currency !== currency ||
        existingPlan.durationDays !== fixedBillingPeriodDays[period] ||
        existingPlan.billingPeriod !== period
      ) {
        await prisma.subscriptionPlan.update({
          where: {
            appId_code: {
              appId: app.id,
              code,
            },
          },
          data: {
            name,
            description,
            currency,
            durationDays: fixedBillingPeriodDays[period],
            billingPeriod: period,
          },
        });
      }
    }
  }
}
