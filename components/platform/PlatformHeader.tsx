import Link from "next/link";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LogoutButton } from "@/components/platform/LogoutButton";
import { ProfileMenu } from "@/components/platform/ProfileMenu";

export function PlatformHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 px-4 py-4 pl-20 backdrop-blur-2xl sm:px-8 lg:pl-8">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0" aria-hidden />

        <div className="ml-auto flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <Link
            href="/"
            className="hidden rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 sm:inline-flex"
          >
            <LocalizedText id="nav.academyHome" />
          </Link>
          <LanguageToggle />
          <ProfileMenu />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
