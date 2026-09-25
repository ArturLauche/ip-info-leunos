export const SUPPORTED_LOCALES = [
  "de",
  "en",
  "es",
  "fr",
  "it",
  "nl",
  "pl",
  "pt-BR",
  "pt-PT",
  "ja",
  "ko",
  "ru",
  "uk",
  "zh-CN",
  "zh-TW",
  "ar",
  "hi",
  "id",
  "cs",
  "sv",
  "da",
  "nb",
  "fi",
  "el",
  "ro",
  "tr",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type Direction = "ltr" | "rtl";

export type LocaleDefinition = {
  nativeName: string;
  englishName: string;
  direction: Direction;
  /** BCP-47 value used for HTML lang and Intl formatting. */
  intlLocale: string;
  /** Schema.org inLanguage value. */
  schemaLanguage: string;
  /** Open Graph locale value, using an underscore and upper-case region. */
  openGraphLocale: string;
};

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "ip-info-locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const LOCALE_DEFINITIONS: Record<Locale, LocaleDefinition> = {
  de: {
    nativeName: "Deutsch",
    englishName: "German",
    direction: "ltr",
    intlLocale: "de-DE",
    schemaLanguage: "de-DE",
    openGraphLocale: "de_DE",
  },
  en: {
    nativeName: "English",
    englishName: "English",
    direction: "ltr",
    intlLocale: "en",
    schemaLanguage: "en",
    openGraphLocale: "en_US",
  },
  es: {
    nativeName: "Español",
    englishName: "Spanish",
    direction: "ltr",
    intlLocale: "es-ES",
    schemaLanguage: "es",
    openGraphLocale: "es_ES",
  },
  fr: {
    nativeName: "Français",
    englishName: "French",
    direction: "ltr",
    intlLocale: "fr-FR",
    schemaLanguage: "fr",
    openGraphLocale: "fr_FR",
  },
  it: {
    nativeName: "Italiano",
    englishName: "Italian",
    direction: "ltr",
    intlLocale: "it-IT",
    schemaLanguage: "it",
    openGraphLocale: "it_IT",
  },
  nl: {
    nativeName: "Nederlands",
    englishName: "Dutch",
    direction: "ltr",
    intlLocale: "nl-NL",
    schemaLanguage: "nl",
    openGraphLocale: "nl_NL",
  },
  pl: {
    nativeName: "Polski",
    englishName: "Polish",
    direction: "ltr",
    intlLocale: "pl-PL",
    schemaLanguage: "pl",
    openGraphLocale: "pl_PL",
  },
  "pt-BR": {
    nativeName: "Português (Brasil)",
    englishName: "Portuguese (Brazil)",
    direction: "ltr",
    intlLocale: "pt-BR",
    schemaLanguage: "pt-BR",
    openGraphLocale: "pt_BR",
  },
  "pt-PT": {
    nativeName: "Português (Portugal)",
    englishName: "Portuguese (Portugal)",
    direction: "ltr",
    intlLocale: "pt-PT",
    schemaLanguage: "pt-PT",
    openGraphLocale: "pt_PT",
  },
  ja: {
    nativeName: "日本語",
    englishName: "Japanese",
    direction: "ltr",
    intlLocale: "ja-JP",
    schemaLanguage: "ja",
    openGraphLocale: "ja_JP",
  },
  ko: {
    nativeName: "한국어",
    englishName: "Korean",
    direction: "ltr",
    intlLocale: "ko-KR",
    schemaLanguage: "ko",
    openGraphLocale: "ko_KR",
  },
  ru: {
    nativeName: "Русский",
    englishName: "Russian",
    direction: "ltr",
    intlLocale: "ru-RU",
    schemaLanguage: "ru",
    openGraphLocale: "ru_RU",
  },
  uk: {
    nativeName: "Українська",
    englishName: "Ukrainian",
    direction: "ltr",
    intlLocale: "uk-UA",
    schemaLanguage: "uk",
    openGraphLocale: "uk_UA",
  },
  "zh-CN": {
    nativeName: "简体中文",
    englishName: "Simplified Chinese",
    direction: "ltr",
    intlLocale: "zh-CN",
    schemaLanguage: "zh-CN",
    openGraphLocale: "zh_CN",
  },
  "zh-TW": {
    nativeName: "繁體中文",
    englishName: "Traditional Chinese",
    direction: "ltr",
    intlLocale: "zh-TW",
    schemaLanguage: "zh-TW",
    openGraphLocale: "zh_TW",
  },
  ar: {
    nativeName: "العربية",
    englishName: "Arabic",
    direction: "rtl",
    intlLocale: "ar",
    schemaLanguage: "ar",
    openGraphLocale: "ar_AR",
  },
  hi: {
    nativeName: "हिन्दी",
    englishName: "Hindi",
    direction: "ltr",
    intlLocale: "hi-IN",
    schemaLanguage: "hi",
    openGraphLocale: "hi_IN",
  },
  id: {
    nativeName: "Bahasa Indonesia",
    englishName: "Indonesian",
    direction: "ltr",
    intlLocale: "id-ID",
    schemaLanguage: "id",
    openGraphLocale: "id_ID",
  },
  cs: {
    nativeName: "Čeština",
    englishName: "Czech",
    direction: "ltr",
    intlLocale: "cs-CZ",
    schemaLanguage: "cs",
    openGraphLocale: "cs_CZ",
  },
  sv: {
    nativeName: "Svenska",
    englishName: "Swedish",
    direction: "ltr",
    intlLocale: "sv-SE",
    schemaLanguage: "sv",
    openGraphLocale: "sv_SE",
  },
  da: {
    nativeName: "Dansk",
    englishName: "Danish",
    direction: "ltr",
    intlLocale: "da-DK",
    schemaLanguage: "da",
    openGraphLocale: "da_DK",
  },
  nb: {
    nativeName: "Norsk bokmål",
    englishName: "Norwegian Bokmål",
    direction: "ltr",
    intlLocale: "nb-NO",
    schemaLanguage: "nb",
    openGraphLocale: "nb_NO",
  },
  fi: {
    nativeName: "Suomi",
    englishName: "Finnish",
    direction: "ltr",
    intlLocale: "fi-FI",
    schemaLanguage: "fi",
    openGraphLocale: "fi_FI",
  },
  el: {
    nativeName: "Ελληνικά",
    englishName: "Greek",
    direction: "ltr",
    intlLocale: "el-GR",
    schemaLanguage: "el",
    openGraphLocale: "el_GR",
  },
  ro: {
    nativeName: "Română",
    englishName: "Romanian",
    direction: "ltr",
    intlLocale: "ro-RO",
    schemaLanguage: "ro",
    openGraphLocale: "ro_RO",
  },
  tr: {
    nativeName: "Türkçe",
    englishName: "Turkish",
    direction: "ltr",
    intlLocale: "tr-TR",
    schemaLanguage: "tr",
    openGraphLocale: "tr_TR",
  },
};

/**
 * Explicit aliases are intentionally kept in one place. Script subtags are
 * checked before the base language so zh-Hant and zh-HK never collapse into
 * Simplified Chinese.
 */
export const LOCALE_ALIASES: Readonly<Record<string, Locale>> = {
  de: "de",
  "de-at": "de",
  "de-ch": "de",
  "de-de": "de",
  en: "en",
  "en-au": "en",
  "en-ca": "en",
  "en-gb": "en",
  "en-us": "en",
  es: "es",
  "es-ar": "es",
  "es-es": "es",
  "es-mx": "es",
  fr: "fr",
  "fr-be": "fr",
  "fr-ca": "fr",
  "fr-ch": "fr",
  "fr-fr": "fr",
  it: "it",
  "it-ch": "it",
  "it-it": "it",
  nl: "nl",
  "nl-be": "nl",
  "nl-nl": "nl",
  pl: "pl",
  "pl-pl": "pl",
  pt: "pt-BR",
  "pt-br": "pt-BR",
  "pt-pt": "pt-PT",
  ja: "ja",
  "ja-jp": "ja",
  ko: "ko",
  "ko-kr": "ko",
  ru: "ru",
  "ru-ru": "ru",
  uk: "uk",
  "uk-ua": "uk",
  zh: "zh-CN",
  "zh-cn": "zh-CN",
  "zh-hans": "zh-CN",
  "zh-sg": "zh-CN",
  "zh-hant": "zh-TW",
  "zh-hant-hk": "zh-TW",
  "zh-hant-tw": "zh-TW",
  "zh-hk": "zh-TW",
  "zh-mo": "zh-TW",
  "zh-tw": "zh-TW",
  ar: "ar",
  "ar-ae": "ar",
  "ar-eg": "ar",
  "ar-sa": "ar",
  hi: "hi",
  "hi-in": "hi",
  id: "id",
  "id-id": "id",
  cs: "cs",
  "cs-cz": "cs",
  sv: "sv",
  "sv-se": "sv",
  da: "da",
  "da-dk": "da",
  nb: "nb",
  "nb-no": "nb",
  fi: "fi",
  "fi-fi": "fi",
  el: "el",
  "el-gr": "el",
  ro: "ro",
  "ro-ro": "ro",
  tr: "tr",
  "tr-tr": "tr",
};

const LOCALE_BY_LOWERCASE = new Map<string, Locale>(
  SUPPORTED_LOCALES.map((locale) => [locale.toLowerCase(), locale]),
);

export function isSupportedLocale(
  value: string | null | undefined,
): value is Locale {
  return normalizeLocale(value) !== null;
}

/**
 * Alias lookups must never fall through to Object.prototype: an
 * Accept-Language tag or cookie value like "constructor" would otherwise
 * resolve to a truthy inherited key and reach locale-dependent renders as a
 * fake Locale, crashing them.
 */
function aliasLocale(key: string): Locale | null {
  return Object.hasOwn(LOCALE_ALIASES, key) ? LOCALE_ALIASES[key] : null;
}

export function normalizeLocale(
  value: string | null | undefined,
): Locale | null {
  if (!value) return null;
  const normalized = value.trim().replace(/_/g, "-");
  if (!normalized) return null;
  const lower = normalized.toLowerCase();
  return LOCALE_BY_LOWERCASE.get(lower) ?? aliasLocale(lower);
}

function resolveLanguageTag(tag: string): Locale | null {
  const normalized = tag.trim().replace(/_/g, "-");
  if (!normalized) return null;

  const exact = normalizeLocale(normalized);
  if (exact) return exact;

  const parts = normalized.toLowerCase().split("-");
  const script = parts.find((part) => /^[a-z]{4}$/.test(part));
  if (normalized.toLowerCase().startsWith("zh-") && script === "hant")
    return "zh-TW";
  if (normalized.toLowerCase().startsWith("zh-") && script === "hans")
    return "zh-CN";

  const base = parts[0];
  return base ? aliasLocale(base) : null;
}

/**
 * Negotiates a locale using an explicit preference first, then Accept-Language
 * quality values, and finally the safe English fallback.
 */
export function resolveLocale(
  acceptLanguage: string | null | undefined,
  savedLocale?: string | null,
): Locale {
  const saved = normalizeLocale(savedLocale);
  if (saved) return saved;
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const entries = acceptLanguage
    .split(",")
    .map((entry, index) => {
      const [rawTag, ...parameters] = entry.trim().split(";");
      const qualityParameter = parameters.find((parameter) =>
        parameter.trim().startsWith("q="),
      );
      const parsedQuality = qualityParameter
        ? Number.parseFloat(qualityParameter.trim().slice(2))
        : 1;
      return {
        tag: rawTag.trim(),
        quality: Number.isFinite(parsedQuality) ? parsedQuality : 0,
        index,
      };
    })
    .filter((entry) => entry.tag && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const entry of entries) {
    if (entry.tag === "*") return DEFAULT_LOCALE;
    const resolved = resolveLanguageTag(entry.tag);
    if (resolved) return resolved;
  }

  return DEFAULT_LOCALE;
}

export function getLocaleDefinition(locale: Locale): LocaleDefinition {
  return LOCALE_DEFINITIONS[locale];
}

export function getLocaleDirection(locale: Locale): Direction {
  return LOCALE_DEFINITIONS[locale].direction;
}

export function getLocaleSchemaLanguage(locale: Locale): string {
  return LOCALE_DEFINITIONS[locale].schemaLanguage;
}

export function getLocaleOpenGraphLanguage(locale: Locale): string {
  return LOCALE_DEFINITIONS[locale].openGraphLocale;
}

export function getNativeLocaleName(locale: Locale): string {
  return LOCALE_DEFINITIONS[locale].nativeName;
}

export function getIntlLocale(locale: Locale): string {
  return LOCALE_DEFINITIONS[locale].intlLocale;
}

export function parseLocaleCookie(
  header: string | null | undefined,
): Locale | null {
  if (!header) return null;
  const value = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE_NAME}=`))
    ?.slice(LOCALE_COOKIE_NAME.length + 1);
  if (!value) return null;
  try {
    return normalizeLocale(decodeURIComponent(value));
  } catch {
    return null;
  }
}
