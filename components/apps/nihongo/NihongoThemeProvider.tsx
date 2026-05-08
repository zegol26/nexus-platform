"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const NIHONGO_THEMES = ["nexus", "squid", "rockstar"] as const;
export type NihongoTheme = (typeof NIHONGO_THEMES)[number];
export const NIHONGO_DEFAULT_THEME: NihongoTheme = "nexus";

const STORAGE_KEY = "nihongo-theme";

function isNihongoTheme(value: unknown): value is NihongoTheme {
  return (
    typeof value === "string" &&
    (NIHONGO_THEMES as readonly string[]).includes(value)
  );
}

type NihongoThemeContextValue = {
  theme: NihongoTheme;
  setTheme: (next: NihongoTheme) => void;
  mounted: boolean;
};

const NihongoThemeContext = createContext<NihongoThemeContextValue | null>(
  null
);

/**
 * Lightweight theme context for the Nihongo route.
 * Persists the choice in localStorage under `nihongo-theme`. We avoid
 * `next-themes` because its <script> injection trips Next.js 16's
 * "script inside React component" warning when nested below the root
 * layout, and we deliberately want the theme attribute scoped to the
 * Nihongo wrapper (not the <html> element) so other routes are not
 * affected.
 */
export function NihongoThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<NihongoTheme>(NIHONGO_DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (isNihongoTheme(stored)) {
          setThemeState(stored);
        }
      } catch {
        // ignore
      }
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const setTheme = useCallback((next: NihongoTheme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, mounted }),
    [theme, setTheme, mounted]
  );

  return (
    <NihongoThemeContext.Provider value={value}>
      {children}
    </NihongoThemeContext.Provider>
  );
}

export function useNihongoTheme(): NihongoThemeContextValue {
  const ctx = useContext(NihongoThemeContext);
  if (!ctx) {
    return {
      theme: NIHONGO_DEFAULT_THEME,
      setTheme: () => {},
      mounted: false,
    };
  }
  return ctx;
}
