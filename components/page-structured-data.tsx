import { StructuredData } from "@/components/structured-data";
import type { Locale } from "@/lib/i18n";
import {
  buildWebPageGraph,
  type BreadcrumbEntry,
} from "@/lib/structured-data";

interface PageStructuredDataProps {
  path: string;
  name: string;
  description: string;
  locale: Locale;
  breadcrumbs?: BreadcrumbEntry[];
  appId?: string;
}

export function PageStructuredData({
  path,
  name,
  description,
  locale,
  breadcrumbs,
  appId,
}: PageStructuredDataProps) {
  return (
    <StructuredData
      data={buildWebPageGraph({
        path,
        name,
        description,
        locale,
        breadcrumbs,
        appId,
      })}
    />
  );
}
