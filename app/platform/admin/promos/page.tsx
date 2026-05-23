import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { PromoCampaignClient, type PromoCampaign } from "@/components/admin/PromoCampaignClient";
import { authOptions } from "@/lib/auth/auth-options";
import { nexusPromos } from "@/lib/nexus/marketing";
import { ensurePlatformSettings, getBillingSettings } from "@/lib/platform/settings";

export const dynamic = "force-dynamic";

function parsePromos(raw: string | undefined): PromoCampaign[] {
  if (!raw) {
    return nexusPromos.map((promo) => ({
      ...promo,
      message: `Gunakan kode ${promo.code} untuk promo ${promo.title} di Nexus Talenta Indonesia Academy.`,
    }));
  }

  try {
    const parsed = JSON.parse(raw) as PromoCampaign[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((promo) => promo.code && promo.title);
  } catch {
    return [];
  }
}

export default async function PromoAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/platform/dashboard");
  }

  await ensurePlatformSettings();
  const billingSettings = await getBillingSettings();

  return (
    <PromoCampaignClient
      initialPromos={parsePromos(billingSettings.promoCampaigns)}
      billingSettings={billingSettings}
    />
  );
}
