import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { NihongoBottomNav } from "@/components/apps/nihongo/NihongoBottomNav";
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
  let isTrialMode = false;

  if (!session?.user?.email) {
    isTrialMode = true;
  } else {
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
  }

  return (
    <NihongoThemeProvider>
      <NihongoThemeShell>
        <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden">
          <header className="sticky top-0 z-20 min-w-0 border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur sm:px-6">
            <div className="mx-auto flex max-w-5xl min-w-0 items-center justify-between gap-2">
              <Link
                href={isTrialMode ? "/overview/nihongo" : "/platform/dashboard"}
                className="min-w-0 shrink-0 truncate rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                {"<-"} {isTrialMode ? "Overview" : <LocalizedText id="nav.backToPlatform" />}
              </Link>

              <Link
                href={isTrialMode ? "/apps/nihongo/pre-assessment" : "/apps/nihongo/dashboard"}
                className="min-w-0 truncate text-sm font-bold tracking-tight text-slate-950"
              >
                Nexus AI <span className="text-cyan-700">Nihongo</span>
              </Link>

              <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
                <LanguageToggle compact />
                <NihongoThemeToggle />
                {isTrialMode ? (
                  <Link
                    href="/login"
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Login
                  </Link>
                ) : (
                  <LogoutButton />
                )}
              </div>
            </div>
          </header>

          <main className="min-w-0 w-full flex-1 overflow-x-hidden px-4 pb-8 pt-5 sm:px-6 sm:pt-8">
            {children}
          </main>

          <div className="pb-24 sm:pb-28">
            <GlobalFooter product="Nexus AI Nihongo" />
          </div>
        </div>

        <NihongoBottomNav trialMode={isTrialMode} />
        {isTrialMode ? null : <IdleLogout />}
      </NihongoThemeShell>
    </NihongoThemeProvider>
  );
}

