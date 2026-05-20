import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { LogoutButton } from "@/components/platform/LogoutButton";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { ensurePmpTrial } from "@/lib/pmp/access-guards";

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

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const pmpAccess = user.appAccess.find(
    (access) => access.app.slug === "pmp" && access.status === "ACTIVE"
  );

  if (!isAdmin && !pmpAccess) {
    await ensurePmpTrial(user.id);
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
              Back to Platform
            </Link>
            <Link href="/apps/pmp/dashboard" className="font-bold tracking-tight">
              PMP <span className="text-cyan-300">Exam Prep</span>
            </Link>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      <GlobalFooter product="PMP Exam Prep" />
    </div>
  );
}
