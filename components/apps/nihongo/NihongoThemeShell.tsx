"use client";

import { useNihongoTheme } from "./NihongoThemeProvider";

/**
 * Reads the current Nihongo theme and applies it as a `data-theme`
 * attribute on a wrapper div so the scoped CSS overrides in
 * `app/globals.css` activate. The wrapper is intentionally inside the
 * Nihongo layout — never on `<html>` — so /platform and /admin routes
 * are not affected by the toggle.
 */
export function NihongoThemeShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useNihongoTheme();

  return (
    <div data-theme={theme} className="min-h-screen">
      {children}
    </div>
  );
}
