export const fixedBillingPeriodDays: Record<string, number> = {
  MONTHLY: 30,
  QUARTERLY: 90,
  YEARLY: 365,
};

export function normalizeBillingPeriod(value?: string | null) {
  const period = String(value ?? "MONTHLY").toUpperCase();
  if (period in fixedBillingPeriodDays || period === "CUSTOM") return period;
  return "MONTHLY";
}

export function durationDaysForBillingPeriod(period: string, customDays: number) {
  const normalizedPeriod = normalizeBillingPeriod(period);
  if (normalizedPeriod in fixedBillingPeriodDays) {
    return fixedBillingPeriodDays[normalizedPeriod];
  }
  return Math.max(1, Math.round(Number(customDays) || 1));
}

export function priceCentsToRupiah(priceCents: number) {
  return Math.round((Number(priceCents) || 0) / 100);
}

export function rupiahToPriceCents(value: string | number) {
  const rawValue = typeof value === "string" ? value.replace(/[^\d]/g, "") : value;
  return Math.max(0, Math.round(Number(rawValue) || 0) * 100);
}
