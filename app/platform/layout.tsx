import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { MobileSidebarDrawer } from "@/components/layout/MobileSidebarDrawer";
import { AiChanWidget } from "@/components/platform/AiChanWidget";
import { IdleLogout } from "@/components/platform/IdleLogout";
import { PlatformHeader } from "@/components/platform/PlatformHeader";
import { PlatformSidebar } from "@/components/platform/PlatformSidebar";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34%,#eef2ff_68%,#f8fafc_100%)] text-slate-950">
      <div className="flex min-h-screen">
        <PlatformSidebar />
        <MobileSidebarDrawer label="Platform">
          <PlatformSidebar mobile />
        </MobileSidebarDrawer>

        <div className="flex min-w-0 max-w-full flex-1 flex-col">
          <PlatformHeader />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
          <GlobalFooter product="Nexus Platform" />
        </div>
      </div>
      <AiChanWidget />
      <IdleLogout />
    </div>
  );
}
