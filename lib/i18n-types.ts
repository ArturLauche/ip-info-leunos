import type { Translation } from "@/lib/i18n";
import type { Locale } from "@/lib/locale-config";
import type { ToolTranslation } from "@/lib/tool-i18n";
import type { UiCopy } from "@/lib/ui-copy";

/** The three catalogs a client component may read, already narrowed to one locale. */
export type I18nDictionaries = {
  core: Translation;
  tool: ToolTranslation;
  ui: UiCopy;
};

export type I18nValue = I18nDictionaries & { locale: Locale };
