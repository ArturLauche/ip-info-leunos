import { getTranslation } from "@/lib/i18n";
import type { I18nDictionaries } from "@/lib/i18n-types";
import type { Locale } from "@/lib/locale-config";
import { getToolTranslation } from "@/lib/tool-i18n";
import { getUiCopy } from "@/lib/ui-copy";

/**
 * Server-only. Resolves the catalogs for one locale so the root layout can hand
 * a single language to the client instead of bundling all of them.
 */
export function getI18nDictionaries(locale: Locale): I18nDictionaries {
  return {
    core: getTranslation(locale),
    tool: getToolTranslation(locale),
    ui: getUiCopy(locale),
  };
}
