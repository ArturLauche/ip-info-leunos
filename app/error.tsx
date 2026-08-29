"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { resolveLocale, type Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Route-level error boundary inside the app shell. Locale comes from the
 * browser (no server context reaches a client boundary), mirroring the
 * Accept-Language negotiation used on the server.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(resolveLocale(navigator.languages?.join(",") ?? navigator.language ?? null));
  }, []);

  useEffect(() => {
    console.error(error);
  }, [error]);

  const t = getToolTranslation(locale);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-1 flex-col items-center justify-center px-4 py-16 outline-none"
      data-transition-stage="panel"
    >
      <Card className="w-full max-w-md items-center gap-3 overflow-hidden p-8 text-center sm:p-12">
        <span className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20">
          <AlertTriangle aria-hidden="true" className="size-6" />
        </span>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          {t.errorTitle}
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {t.errorDescription}
        </p>
        {error.digest && (
          <p className="font-mono text-xs break-all text-muted-foreground/70">
            {error.digest}
          </p>
        )}
        <Button type="button" onClick={reset} className="mt-2">
          <RotateCw aria-hidden="true" className="size-4" />
          {t.errorRetry}
        </Button>
      </Card>
    </main>
  );
}
