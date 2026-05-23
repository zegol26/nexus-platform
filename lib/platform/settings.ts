import { prisma } from "@/lib/db/prisma";
import { defaultPlatformSettings, mapBillingSettings, platformSettingKeys } from "@/lib/platform/settings-policy";

export { platformSettingKeys } from "@/lib/platform/settings-policy";

export async function ensurePlatformSettings() {
  await Promise.all(
    defaultPlatformSettings.map((setting) =>
      prisma.platformSetting.upsert({
        where: { key: setting.key },
        update: {
          label: setting.label,
          valueType: setting.valueType,
          description: setting.description,
        },
        create: setting,
      })
    )
  );
}

export async function getBillingSettings() {
  await ensurePlatformSettings();
  const settings = await prisma.platformSetting.findMany({
    where: {
      key: {
        in: [
          platformSettingKeys.lessonPriceCents,
          platformSettingKeys.qrisInfo,
          platformSettingKeys.bankInfo,
          platformSettingKeys.midtransMode,
          platformSettingKeys.midtransEnabled,
          platformSettingKeys.promoCampaigns,
        ],
      },
    },
  });

  return mapBillingSettings(settings);
}
