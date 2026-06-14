import Link from "next/link";

import { getTranslation, type Locale } from "@/lib/i18n";
import { siteConfig } from "@/lib/seo";
import { BrandMark } from "./brand-mark";
import { getNavItems } from "./nav-config";

interface SiteFooterProps {
  locale: Locale;
}

/** Slim site footer: brand, quick tool links, and data-source attribution. */
export function SiteFooter({ locale }: SiteFooterProps) {
  const t = getTranslation(locale);
  const items = getNavItems(locale);

  return (
    <footer className="mt-12 border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-2.5">
          <BrandMark className="size-7" />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            {siteConfig.name}
          </span>
        </div>

        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-muted-foreground">
          {t.footerDataBy}{" "}
          <a
            href="https://ip-api.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            ip-api.com
          </a>
        </p>
      </div>
    </footer>
  );
}
