import { createElement, type ReactElement } from "react";

import { I18nProvider } from "@/components/i18n-provider";
import { getI18nDictionaries } from "@/lib/i18n-dictionaries";
import type { Locale } from "@/lib/locale-config";

/**
 * Wraps an element in the provider the root layout supplies, using the real
 * catalogs for `locale`. Tests that reset modules pass the provider they
 * imported afterwards so component and context share one module instance.
 */
export function withI18n(
  element: ReactElement,
  locale: Locale = "en",
  Provider: typeof I18nProvider = I18nProvider,
): ReactElement {
  return createElement(
    Provider,
    { locale, dictionaries: getI18nDictionaries(locale) },
    element,
  );
}
