import Link from "next/link";
import { getServerSession } from "next-auth";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { authOptions } from "@/lib/auth/auth-options";
import { PlatformSidebarNav } from "./PlatformSidebarNav";

export async function PlatformSidebar({ mobile = false }: { mobile?: boolean }) {
  const session = await getServerSession(authOptions);
  const role = session?.user
    ? (session.user as { role?: string }).role
    : undefined;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  return (
    <aside
      className={`min-h-screen w-56 shrink-0 border-r border-white/60 bg-white/75 px-3 py-5 shadow-xl shadow-slate-950/[0.03] backdrop-blur-2xl ${
        mobile ? "block" : "hidden lg:block"
      }`}
    >
      <Link href="/platform/dashboard" className="group block">
        <div className="rounded-xl border border-slate-200/80 bg-white p-2 shadow-lg shadow-slate-950/10 transition group-hover:-translate-y-0.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/nexus-ai-logo.png"
            alt="Nexus Talenta Indonesia"
            className="h-14 w-full object-contain"
          />
        </div>
        <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
          <LocalizedText id="platform.sidebarTitle" />
        </h2>
      </Link>

      <PlatformSidebarNav isAdmin={isAdmin} />
    </aside>
  );
}
