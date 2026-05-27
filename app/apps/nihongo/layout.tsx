import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { MobileSidebarDrawer } from "@/components/layout/MobileSidebarDrawer";
import { NihongoSidebar } from "@/components/apps/nihongo/NihongoSidebar";
import { NihongoThemeProvider } from "@/components/apps/nihongo/NihongoThemeProvider";
import { NihongoThemeShell } from "@/components/apps/nihongo/NihongoThemeShell";
import { NihongoThemeToggle } from "@/components/apps/nihongo/NihongoThemeToggle";
import { IdleLogout } from "@/components/platform/IdleLogout";
import { LogoutButton } from "@/components/platform/LogoutButton";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { isAdminRole, isValidAppAccess } from "@/lib/platform/access";

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

  const isAdmin = isAdminRole(user.role);

  const appAccess = user.appAccess as AppAccessWithApp[];

  const nihongoAccess = appAccess.find(
    (access: AppAccessWithApp) =>
      access.app.slug === "nihongo" && access.status === "ACTIVE"
  );

  const hasValidAccess =
    isAdmin || isValidAppAccess(nihongoAccess);

  if (!hasValidAccess) {
    redirect("/platform/dashboard");
  }

  return (
    <NihongoThemeProvider>
      <NihongoThemeShell>
        <div className="flex min-h-screen">
          <NihongoSidebar />
          <MobileSidebarDrawer label="Nihongo">
            <NihongoSidebar mobile />
          </MobileSidebarDrawer>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 px-4 py-3 pl-20 backdrop-blur lg:pl-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link
                    href="/platform/dashboard"
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {"<-"} Back to Platform
                  </Link>

                  <Link
                    href="/apps/nihongo/dashboard"
                    className="hidden text-base font-bold tracking-tight text-slate-950 sm:inline"
                  >
                    Nexus AI <span className="text-cyan-700">Nihongo</span>
                  </Link>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/apps/nihongo/curriculum"
                    className="hidden items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 sm:inline-flex"
                  >
                    Mulai Belajar
                  </Link>

                  <NihongoThemeToggle />

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
        <IdleLogout />
      </NihongoThemeShell>
    </NihongoThemeProvider>
  );
}

