import Link from "next/link";
import { LogoutButton } from "@/components/platform/LogoutButton";
import { ProfileMenu } from "@/components/platform/ProfileMenu";

export function PlatformHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 px-4 py-4 pl-20 backdrop-blur-2xl sm:px-8 lg:pl-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            Platform Console
          </p>
          <p className="text-xs text-slate-500">
            Access, billing, progress, and learning operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 sm:inline-flex"
          >
            Academy Home
          </Link>
          <ProfileMenu />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
