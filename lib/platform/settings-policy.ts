export const platformSettingKeys = {
  lessonPriceCents: "NIHONGO_LESSON_PRICE_CENTS",
  qrisInfo: "PAYMENT_QRIS_INFO",
  bankInfo: "PAYMENT_BANK_INFO",
  midtransMode: "MIDTRANS_MODE",
  midtransEnabled: "MIDTRANS_ENABLED",
  promoCampaigns: "PROMO_CAMPAIGNS_JSON",
} as const;

export const defaultPlatformSettings = [
  {
    key: platformSettingKeys.lessonPriceCents,
    label: "Nihongo lesson price",
    value: "",
    valueType: "MONEY_CENTS",
    description: "Manual per-lesson price in cents. Leave empty when not offered yet.",
  },
  {
    key: platformSettingKeys.qrisInfo,
    label: "QRIS payment information",
    value: "",
    valueType: "TEXTAREA",
    description: "Legacy field retained for existing records. User checkout is handled by Midtrans.",
  },
  {
    key: platformSettingKeys.bankInfo,
    label: "Bank transfer information",
    value: "",
    valueType: "TEXTAREA",
    description: "Legacy field retained for existing records. User checkout is handled by Midtrans.",
  },
  {
    key: platformSettingKeys.midtransMode,
    label: "Midtrans mode",
    value: "sandbox",
    valueType: "TEXT",
    description: "Use sandbox before production. Switch to production only after live keys are ready.",
  },
  {
    key: platformSettingKeys.midtransEnabled,
    label: "Midtrans checkout enabled",
    value: "false",
    valueType: "BOOLEAN",
    description: "When false, users cannot create checkout invoices.",
  },
  {
    key: platformSettingKeys.promoCampaigns,
    label: "Promo campaigns",
    value: "",
    valueType: "JSON",
    description: "Reusable promo campaigns shown and managed from the promo admin UI.",
  },
] as const;

export function mapBillingSettings(settings: Array<{ key: string; value: string | null }>) {
  const map = new Map(settings.map((setting) => [setting.key, setting.value ?? ""]));

  return {
    lessonPriceCents: map.get(platformSettingKeys.lessonPriceCents) ?? "",
    qrisInfo: map.get(platformSettingKeys.qrisInfo) ?? "",
    bankInfo: map.get(platformSettingKeys.bankInfo) ?? "",
    midtransMode: map.get(platformSettingKeys.midtransMode) ?? "sandbox",
    midtransEnabled: map.get(platformSettingKeys.midtransEnabled) ?? "false",
    promoCampaigns: map.get(platformSettingKeys.promoCampaigns) ?? "",
  };
}
