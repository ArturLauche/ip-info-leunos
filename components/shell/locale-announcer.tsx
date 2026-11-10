"use client";

import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/components/i18n-provider";
import { getNativeLocaleName } from "@/lib/locale-config";

/**
 * Announces a language switch once the new catalogs arrive. It lives in the
 * persistent shell, not in a language selector: on phones the sidebar copy is
 * hidden and the sheet's copy unmounts when the picker closes, so neither
 * could speak. Nothing is announced on the initial render.
 */
export function LocaleAnnouncer() {
  const { locale } = useI18n();
  const previous = useRef(locale);
  const [announcement, setAnnouncement] = useState<string>();

  useEffect(() => {
    if (previous.current === locale) return;
    previous.current = locale;
    setAnnouncement(getNativeLocaleName(locale));
  }, [locale]);

  return (
    <p
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      lang={locale}
    >
      {announcement}
    </p>
  );
}
