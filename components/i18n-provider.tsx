"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { I18nDictionaries, I18nValue } from "@/lib/i18n-types";
import type { Locale } from "@/lib/locale-config";

const I18nContext = createContext<I18nValue | null>(null);

interface I18nProviderProps {
  locale: Locale;
  dictionaries: I18nDictionaries;
  children?: ReactNode;
}

/**
 * Carries the negotiated locale's catalogs to client components. The server
 * serializes exactly one language, so no visitor downloads the other 25.
 */
export function I18nProvider({
  locale,
  dictionaries,
  children,
}: I18nProviderProps) {
  const value = useMemo<I18nValue>(
    () => ({ locale, ...dictionaries }),
    [locale, dictionaries],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return value;
}
