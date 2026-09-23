import {
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
  normalizeLocale,
  parseLocaleCookie,
  type Locale,
} from "@/lib/locale-config";

export const LOCALE_STORAGE_KEY = "ip-info-locale";

export function localeCookieHeader(locale: Locale): string {
  return [
    `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}`,
    `Max-Age=${LOCALE_COOKIE_MAX_AGE}`,
    "Path=/",
    "SameSite=Lax",
  ].join("; ");
}

export function persistLocalePreference(locale: Locale): void {
  if (typeof document !== "undefined") {
    document.cookie = localeCookieHeader(locale);
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Storage can be disabled by privacy settings; the functional cookie is
      // still sufficient for server-rendered navigation.
    }
  }
}

export function readClientLocalePreference(): Locale | null {
  if (typeof document === "undefined") return null;
  const cookieLocale = parseLocaleCookie(document.cookie);

  if (cookieLocale) return cookieLocale;

  try {
    return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return null;
  }
}
