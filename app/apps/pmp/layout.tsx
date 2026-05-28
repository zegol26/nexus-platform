import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { IdleLogout } from "@/components/platform/IdleLogout";
import { LogoutButton } from "@/components/platform/LogoutButton";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { isAdminRole, isValidAppAccess } from "@/lib/platform/access";

export const dynamic = "force-dynamic";

export default async function PmpLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { appAccess: { include: { app: true } } },
  });

  if (!user) {
    redirect("/login");
  }

  const isAdmin = isAdminRole(user.role);
  const pmpAccess = user.appAccess.find(
    (access) => access.app.slug === "pmp" && access.status === "ACTIVE"
  );

  if (!isAdmin && !isValidAppAccess(pmpAccess)) {
    redirect("/platform/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/platform/dashboard"
              className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              <LocalizedText id="nav.backToPlatform" />
            </Link>
            <Link href="/apps/pmp/dashboard" className="font-bold tracking-tight">
              PMP <span className="text-cyan-300">Exam Prep</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle compact />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      <GlobalFooter product="PMP Exam Prep" />
      <IdleLogout />
    </div>
  );
}
