import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { SiteHeader } from "@/components/shell/site-header";
import { SiteFooter } from "@/components/shell/site-footer";
import {
  getGroupTitle,
  navGroups,
  type ToolKey,
} from "@/components/shell/nav-config";

interface ToolPageShellProps {
  locale: Locale;
  active: ToolKey;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: ReactNode;
}

/**
 * Page frame for every tool: a sticky top header with the tool rail, a centred
 * content column with a consistent page header (eyebrow → title → subtitle),
 * and the site footer. Full-width by design so data tables breathe.
 */
export function ToolPageShell({
  locale,
  active,
  icon: Icon,
  title,
  subtitle,
  children,
}: ToolPageShellProps) {
  const group = navGroups.find((entry) =>
    entry.items.some((item) => item.key === active),
  );
  const sectionLabel = group ? getGroupTitle(group.id, locale) : "";

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SiteHeader locale={locale} active={active} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex items-start gap-3.5 sm:gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 sm:size-12">
            <Icon className="size-5 sm:size-6" />
          </span>
          <div className="min-w-0 flex-1">
            {sectionLabel && (
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {sectionLabel}
              </p>
            )}
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground sm:mt-1 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-2 sm:text-[0.95rem]">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="mt-6 sm:mt-8">{children}</div>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
