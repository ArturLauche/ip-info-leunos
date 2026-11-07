import { getLocaleSchemaLanguage, type Locale } from "@/lib/i18n";
import {
  canonicalUrl,
  defaultOpenGraphImage,
  documentTitle,
  siteConfig,
} from "@/lib/seo";

export interface BreadcrumbEntry {
  name: string;
  path: string;
}

export interface BreadcrumbList extends Record<string, unknown> {
  "@type": "BreadcrumbList";
  "@id": string;
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

export interface WebPageGraph extends Record<string, unknown> {
  "@context": "https://schema.org";
  "@graph": Array<Record<string, unknown>>;
}

const openGraphImageWidth = 1200;
const openGraphImageHeight = 630;

function openGraphImage(caption: string) {
  return {
    "@type": "ImageObject",
    url: new URL(defaultOpenGraphImage, siteConfig.url).toString(),
    width: openGraphImageWidth,
    height: openGraphImageHeight,
    caption,
  };
}

/**
 * Builds the visible-page breadcrumb trail. The home page is the root and has
 * no trail; every other page gets Home → (optional parent) → current page.
 */
export function buildPageBreadcrumbs({
  path,
  title,
  homeTitle,
  parent,
}: {
  path: string;
  title: string;
  homeTitle: string;
  parent?: BreadcrumbEntry;
}): BreadcrumbEntry[] {
  if (path === "/") return [];

  const entries: BreadcrumbEntry[] = [{ name: homeTitle, path: "/" }];
  if (parent && parent.path !== path) entries.push(parent);
  entries.push({ name: title, path });

  return entries;
}

export function buildBreadcrumbList(
  entries: BreadcrumbEntry[],
): BreadcrumbList | null {
  if (entries.length === 0) return null;

  const last = entries[entries.length - 1];

  return {
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl(last.path)}#breadcrumb`,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: canonicalUrl(entry.path),
    })),
  };
}

/**
 * A `WebPage` node that ties the route to the site graph, its language, the
 * social image, and the matching `WebApplication` node. Breadcrumbs are only
 * emitted when the route has a trail (not for the home page).
 */
export function buildWebPageGraph({
  path,
  name,
  description,
  locale,
  breadcrumbs = [],
  appId,
}: {
  path: string;
  name: string;
  description: string;
  locale: Locale;
  breadcrumbs?: BreadcrumbEntry[];
  appId?: string;
}): WebPageGraph {
  const url = canonicalUrl(path);
  const breadcrumb = buildBreadcrumbList(breadcrumbs);
  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: documentTitle(name),
    description,
    inLanguage: getLocaleSchemaLanguage(locale),
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    primaryImageOfPage: openGraphImage(`${siteConfig.name} – ${name}`),
  };

  if (appId) {
    webPage.about = { "@id": appId };
    webPage.mainEntity = { "@id": appId };
  }

  if (breadcrumb) {
    webPage.breadcrumb = { "@id": breadcrumb["@id"] };
  }

  return {
    "@context": "https://schema.org",
    "@graph": breadcrumb ? [webPage, breadcrumb] : [webPage],
  };
}
