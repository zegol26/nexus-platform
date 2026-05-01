import { LogoutButton } from "@/components/platform/LogoutButton";
import { ProfileMenu } from "@/components/platform/ProfileMenu";

export function PlatformHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 px-8 py-4 backdrop-blur-2xl">
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
          <ProfileMenu />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
