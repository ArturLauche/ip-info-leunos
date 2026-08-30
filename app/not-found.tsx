import { headers } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { resolveLocale } from "@/lib/i18n";
import { documentTitle } from "@/lib/seo";
import { getToolTranslation } from "@/lib/tool-i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = resolveLocale((await headers()).get("accept-language"));
  const t = getToolTranslation(locale);

  return {
    title: { absolute: documentTitle(t.notFoundTitle) },
    description: t.notFoundDescription,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}

/**
 * Localized 404 surface inside the app shell — without it, unknown paths
 * fall through to Next's default English error page.
 */
export default async function NotFound() {
  const locale = resolveLocale((await headers()).get("accept-language"));
  const t = getToolTranslation(locale);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      // The shell's shared `PageTransition` animates every route; marking this
      // as a stage is all a page needs to take part in it.
      data-transition-stage="panel"
      className="flex flex-1 flex-col items-center justify-center px-4 py-16 outline-none"
    >
      <Card className="bg-grid w-full max-w-md items-center gap-3 overflow-hidden p-8 text-center sm:p-12">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
          <Compass aria-hidden="true" className="size-6" />
        </span>
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          {t.notFoundTitle}
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {t.notFoundDescription}
        </p>
        <Button asChild className="mt-2">
          <Link href="/">
            <ArrowLeft aria-hidden="true" className="size-4" />
            {t.notFoundBackHome}
          </Link>
        </Button>
      </Card>
    </main>
  );
}
