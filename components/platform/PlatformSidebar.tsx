import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

const menuItems = [
  { label: "Dashboard", href: "/platform/dashboard", marker: "01" },
  { label: "Apps", href: "/platform/apps", marker: "02" },
  { label: "Komunitas", href: "/platform/community", marker: "03" },
  { label: "Game", href: "/platform/game", marker: "04" },
  { label: "Billing", href: "/platform/billing", marker: "05" },
  { label: "Settings", href: "/platform/settings", marker: "06" },
];

export async function PlatformSidebar({ mobile = false }: { mobile?: boolean }) {
  const session = await getServerSession(authOptions);
  const role = session?.user
    ? (session.user as { role?: string }).role
    : undefined;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  return (
    <aside
      className={`min-h-screen w-72 shrink-0 border-r border-white/60 bg-white/75 p-6 shadow-xl shadow-slate-950/[0.03] backdrop-blur-2xl ${
        mobile ? "block" : "hidden lg:block"
      }`}
    >
      <Link href="/platform/dashboard" className="group block">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-3 shadow-lg shadow-slate-950/10 transition group-hover:-translate-y-0.5">
          <img
            src="/nexus-ai-logo.png"
            alt="Nexus Talenta Indonesia"
            className="h-24 w-full object-contain"
          />
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
          Platform
        </h2>
      </Link>

      <nav className="mt-7 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950 hover:shadow-sm"
          >
            <span className="flex h-8 w-10 items-center justify-center rounded-xl bg-slate-100 text-[11px] font-bold text-slate-500 transition group-hover:bg-blue-100 group-hover:text-blue-700">
              {item.marker}
            </span>
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <div className="mt-3 space-y-1">
            <Link
              href="/admin/users"
              className="flex items-center gap-3 rounded-2xl bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-slate-950"
            >
              <span className="flex h-8 w-10 items-center justify-center rounded-xl bg-white/15 text-[11px] font-bold">
                AD
              </span>
              Admin Console
            </Link>
            <Link
              href="/platform/admin"
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950 hover:shadow-sm"
            >
              <span className="flex h-8 w-10 items-center justify-center rounded-xl bg-slate-100 text-[11px] font-bold text-slate-500">
                AC
              </span>
              Access Control
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
