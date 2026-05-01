import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { NihongoSidebar } from "@/components/apps/nihongo/NihongoSidebar";
import { LogoutButton } from "@/components/platform/LogoutButton";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

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
  const nihongoAccess = user.appAccess.find(
    (access) => access.app.slug === "nihongo" && access.status === "ACTIVE"
  );
  const hasValidAccess =
    isAdmin ||
    (nihongoAccess &&
      (!nihongoAccess.accessExpiresAt || nihongoAccess.accessExpiresAt > new Date()));

  if (!hasValidAccess) {
    redirect("/platform/dashboard");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef8fb_45%,#f8fafc_100%)] text-slate-950">
      <div className="flex min-h-screen">
        <NihongoSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/platform/dashboard"
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back to Platform
                </Link>
                <Link
                  href="/apps/nihongo/dashboard"
                  className="hidden text-sm font-semibold text-slate-700 hover:text-slate-950 sm:inline"
                >
                  Nexus AI Nihongo
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/apps/nihongo/curriculum"
                  className="hidden rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white sm:inline-flex"
                >
                  Learn
                </Link>
                <LogoutButton />
              </div>
            </div>
          </header>

          <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
