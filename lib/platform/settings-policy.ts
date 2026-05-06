export const platformSettingKeys = {
  lessonPriceCents: "NIHONGO_LESSON_PRICE_CENTS",
  qrisInfo: "PAYMENT_QRIS_INFO",
  bankInfo: "PAYMENT_BANK_INFO",
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
    description: "Shown to users on Billing when they select QRIS.",
  },
  {
    key: platformSettingKeys.bankInfo,
    label: "Bank transfer information",
    value: "",
    valueType: "TEXTAREA",
    description: "Shown to users on Billing when they select Bank Transfer.",
  },
] as const;

export function mapBillingSettings(settings: Array<{ key: string; value: string | null }>) {
  const map = new Map(settings.map((setting) => [setting.key, setting.value ?? ""]));

  return {
    lessonPriceCents: map.get(platformSettingKeys.lessonPriceCents) ?? "",
    qrisInfo: map.get(platformSettingKeys.qrisInfo) ?? "",
    bankInfo: map.get(platformSettingKeys.bankInfo) ?? "",
  };
}
