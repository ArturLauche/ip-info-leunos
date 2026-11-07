import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { getTranslation, type Locale } from "@/lib/i18n";
import { getPrivacyContent } from "@/lib/privacy";
import { getToolTranslation } from "@/lib/tool-i18n";
import { getTermsContent } from "@/lib/terms";
import { canonicalUrl } from "@/lib/site-config";
import { buildPageBreadcrumbs } from "@/lib/structured-data";
import {
  getGroupTitle,
  getNavLabel,
  navGroups,
  type ToolKey,
} from "@/components/shell/nav-config";
import { PageStructuredData } from "@/components/page-structured-data";
import { ToolStructuredData } from "@/components/tool-structured-data";

interface ToolPageShellProps {
  locale: Locale;
  active?: ToolKey;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Canonical path when it differs from the active nav item, e.g. /asn/AS13335. */
  structuredPath?: string;
  /** Concise label for the last breadcrumb item; defaults to the page title. */
  breadcrumbLabel?: string;
  /** Disable structured data when the route canonicalizes to another path. */
  structuredData?: boolean;
  /** Document title for structured data when it differs from the visible H1. */
  seoTitle?: string;
}

export function ToolPageShell({
  locale,
  active,
  icon: Icon,
  title,
  subtitle,
  children,
  structuredPath,
  breadcrumbLabel,
  structuredData = true,
  seoTitle,
}: ToolPageShellProps) {
  const toolT = getToolTranslation(locale);
  const coreT = getTranslation(locale);
  const group = navGroups.find((entry) =>
    entry.items.some((item) => item.key === active),
  );
  const activeItem = navGroups
    .flatMap((entry) => entry.items)
    .find((item) => item.key === active);
  const canonicalPath = structuredData
    ? structuredPath ?? activeItem?.href
    : undefined;
  const breadcrumbs = canonicalPath
    ? buildPageBreadcrumbs({
        path: canonicalPath,
        title: breadcrumbLabel ?? title,
        homeTitle: coreT.homeTitle,
        parent:
          activeItem && canonicalPath !== activeItem.href
            ? {
                name: getNavLabel(activeItem.key, { core: coreT, tool: toolT }),
                path: activeItem.href,
              }
            : undefined,
      })
    : [];
  const appId =
    active && canonicalPath
      ? `${canonicalUrl(canonicalPath)}#web-application`
      : undefined;
  const sectionLabel = group ? getGroupTitle(group.id, { tool: toolT }) : "";
  const privacyLabel = getPrivacyContent(locale).navLabel;
  const termsLabel = getTermsContent(locale).navLabel;

  return (
    <>
      {canonicalPath && (
        <PageStructuredData
          path={canonicalPath}
          name={seoTitle ?? title}
          description={subtitle}
          locale={locale}
          breadcrumbs={breadcrumbs}
          appId={appId}
        />
      )}
      {active && canonicalPath && (
        <ToolStructuredData
          tool={active}
          path={canonicalPath}
          locale={locale}
          name={title}
          description={subtitle}
        />
      )}
      <header
        className="app-page-header border-b border-border/60"
        data-transition-stage="header"
      >
        <div className="app-page-header-inner mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
            <span
              className="app-page-icon flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 sm:size-12"
              data-transition-item="icon"
            >
              <Icon aria-hidden="true" className="size-5 sm:size-6" />
            </span>
            <div className="min-w-0 flex-1" data-transition-item="text">
              {sectionLabel && (
                <p className="app-page-eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {sectionLabel}
                </p>
              )}
              <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-foreground sm:mt-1 sm:text-3xl">
                {title}
              </h1>
              <p className="app-page-subtitle mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-2 sm:text-[0.95rem]">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="app-page-main mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 outline-none"
        data-transition-stage="panel"
      >
        {children}
      </main>

      <footer
        className="app-page-footer border-t border-border/60"
        data-transition-stage="footer"
      >
        <div className="app-page-footer-inner mx-auto flex w-full max-w-6xl flex-wrap items-center justify-end gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/privacy-policy"
            className="rounded-md px-2 py-2 text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            {privacyLabel}
          </Link>
          <Link
            href="/terms-of-use"
            className="rounded-md px-2 py-2 text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            {termsLabel}
          </Link>
        </div>
      </footer>
    </>
  );
}
