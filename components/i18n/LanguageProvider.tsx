"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const UI_LANGUAGES = ["id", "en"] as const;
export type UiLanguage = (typeof UI_LANGUAGES)[number];

const STORAGE_KEY = "nexus-ui-language";
const DEFAULT_LANGUAGE: UiLanguage = "id";

type LanguageContextValue = {
  language: UiLanguage;
  setLanguage: (language: UiLanguage) => void;
  mounted: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isUiLanguage(value: unknown): value is UiLanguage {
  return (
    typeof value === "string" &&
    (UI_LANGUAGES as readonly string[]).includes(value)
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] =
    useState<UiLanguage>(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (isUiLanguage(stored)) {
          setLanguageState(stored);
        }
      } catch {
        // Keep the default language when storage is unavailable.
      }
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "id" ? "id" : "en";
    document.documentElement.dataset.uiLanguage = language;
  }, [language]);

  const setLanguage = useCallback((next: UiLanguage) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage errors; the in-memory preference still applies.
    }
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, mounted }),
    [language, mounted, setLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: DEFAULT_LANGUAGE,
      setLanguage: () => {},
      mounted: false,
    };
  }
  return context;
}
