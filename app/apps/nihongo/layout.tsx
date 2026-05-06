import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { MobileSidebarDrawer } from "@/components/layout/MobileSidebarDrawer";
import { NihongoSidebar } from "@/components/apps/nihongo/NihongoSidebar";
import { LogoutButton } from "@/components/platform/LogoutButton";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type AppAccessWithApp = {
  status: string;
  accessExpiresAt: Date | null;
  app: {
    slug: string;
  };
};

export default async function NihongoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      appAccess: {
        include: { app: true },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  const appAccess = user.appAccess as AppAccessWithApp[];

  const nihongoAccess = appAccess.find(
    (access: AppAccessWithApp) =>
      access.app.slug === "nihongo" && access.status === "ACTIVE"
  );

  const hasValidAccess =
    isAdmin ||
    Boolean(
      nihongoAccess &&
        (!nihongoAccess.accessExpiresAt ||
          nihongoAccess.accessExpiresAt > new Date())
    );

  if (!hasValidAccess) {
    redirect("/platform/dashboard");
  }

  return (
    <div data-theme="squid" className="min-h-screen bg-[#0f0f12] text-white">
      <div className="flex min-h-screen">
        <NihongoSidebar />
        <MobileSidebarDrawer label="Nihongo">
          <NihongoSidebar mobile />
        </MobileSidebarDrawer>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[#ED1A7F]/30 bg-[#0a0a0a]/95 px-4 py-3 pl-20 backdrop-blur lg:pl-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/platform/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-transparent px-3 py-1.5 text-[12px] font-semibold text-white/80 transition hover:border-[#ED1A7F] hover:text-[#ED1A7F]"
                >
                  ← Back to Platform
                </Link>

                <Link
                  href="/apps/nihongo/dashboard"
                  className="hidden text-base font-bold tracking-wide text-white hover:text-[#ED1A7F] sm:inline"
                >
                  Nexus AI <span className="text-[#ED1A7F]">Nihongo</span>
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/apps/nihongo/curriculum"
                  className="hidden items-center gap-2 rounded-md bg-[#ED1A7F] px-5 py-2 text-[12px] font-bold text-white shadow-[0_0_18px_rgba(237,26,127,0.45)] transition hover:bg-[#FF2D8F] sm:inline-flex"
                >
                  Mulai Belajar
                </Link>

                <LogoutButton />
              </div>
            </div>
          </header>

          <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            {children}
          </main>
          <GlobalFooter product="Nexus AI Nihongo" />
        </div>
      </div>
    </div>
  );
}
