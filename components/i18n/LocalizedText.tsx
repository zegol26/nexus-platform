"use client";

import { getUiText, type UiTextKey } from "./dictionary";
import { useLanguage } from "./LanguageProvider";

export function LocalizedText({ id }: { id: UiTextKey }) {
  const { language } = useLanguage();
  return <>{getUiText(id, language)}</>;
}
