"use client";

import { useEffect, useState } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { resolveLocale, type Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";

/**
 * Root-layout error boundary. Only renders when the root layout itself fails,
 * so it cannot use the app shell, ThemeProvider, or server-negotiated locale:
 * it ships its own minimal <html>/<body> with font variables, resolves locale
 * from the browser, and offers a plain reload. Deliberately unstyled beyond
 * system-safe inline CSS so it never depends on the (possibly broken) layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(resolveLocale(navigator.languages?.join(",") ?? navigator.language ?? null));
  }, []);

  useEffect(() => {
    console.error(error);
  }, [error]);

  const t = getToolTranslation(locale);

  return (
    <html lang={locale}>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <main
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1rem",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "28rem" }}>
            <h1 style={{ fontSize: "1.125rem", fontWeight: 600 }}>{t.errorTitle}</h1>
            <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", opacity: 0.7 }}>
              {t.errorDescription}
            </p>
            {error.digest && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", opacity: 0.5 }}>{error.digest}</p>
            )}
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: "1rem",
                padding: "0.625rem 1.25rem",
                borderRadius: "0.375rem",
                border: "1px solid currentColor",
                background: "transparent",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              {t.errorRetry}
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
