"use client";

import { signOut } from "next-auth/react";
import { getUiText } from "@/components/i18n/dictionary";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function LogoutButton() {
  const { language } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-full border border-white/10 bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-rose-600"
    >
      {getUiText("auth.logout", language)}
    </button>
  );
}
