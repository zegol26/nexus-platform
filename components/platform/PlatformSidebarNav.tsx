"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "Dashboard", href: "/platform/dashboard", marker: "01" },
  { label: "Apps", href: "/platform/apps", marker: "02" },
  { label: "Program", href: "/platform/programs", marker: "03" },
  { label: "Komunitas", href: "/platform/community", marker: "04" },
  { label: "Game", href: "/platform/game", marker: "05" },
  { label: "Billing", href: "/platform/billing", marker: "06" },
  { label: "Settings", href: "/platform/settings", marker: "07" },
];

export function PlatformSidebarNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <nav className="mt-5 space-y-0.5">
      {menuItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold transition ${
              active
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"
            }`}
          >
            <span
              className={`flex h-6 w-7 items-center justify-center rounded-md text-[10px] font-bold transition ${
                active
                  ? "bg-white/15 text-white"
                  : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700"
              }`}
            >
              {item.marker}
            </span>
            {item.label}
          </Link>
        );
      })}

      {isAdmin && (
        <div className="mt-2 space-y-0.5">
          <Link
            href="/admin/users"
            aria-current={isActive("/admin") ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold transition ${
              isActive("/admin")
                ? "bg-slate-950 text-white shadow-sm"
                : "bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-slate-950"
            }`}
          >
            <span className="flex h-6 w-7 items-center justify-center rounded-md bg-white/15 text-[10px] font-bold">
              AD
            </span>
            Admin Console
          </Link>
          <Link
            href="/platform/admin"
            aria-current={isActive("/platform/admin") ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold transition ${
              isActive("/platform/admin")
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"
            }`}
          >
            <span
              className={`flex h-6 w-7 items-center justify-center rounded-md text-[10px] font-bold transition ${
                isActive("/platform/admin")
                  ? "bg-white/15 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              AC
            </span>
            Access Control
          </Link>
          <Link
            href="/platform/admin/promos"
            aria-current={isActive("/platform/admin/promos") ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold transition ${
              isActive("/platform/admin/promos")
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"
            }`}
          >
            <span
              className={`flex h-6 w-7 items-center justify-center rounded-md text-[10px] font-bold transition ${
                isActive("/platform/admin/promos")
                  ? "bg-white/15 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              PR
            </span>
            Promo Campaign
          </Link>
        </div>
      )}
    </nav>
  );
}
