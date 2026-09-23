import { cookies, headers } from "next/headers";

import {
  LOCALE_COOKIE_NAME,
  resolveLocale,
  type Locale,
} from "@/lib/locale-config";

/**
 * Resolves the locale once for a server render. A validated explicit cookie
 * always wins over browser negotiation, so a deliberate choice survives
 * navigation, reloads, and a later visit.
 */
export async function getRequestLocale(): Promise<Locale> {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  return resolveLocale(
    headerStore.get("accept-language"),
    cookieStore.get(LOCALE_COOKIE_NAME)?.value,
  );
}
