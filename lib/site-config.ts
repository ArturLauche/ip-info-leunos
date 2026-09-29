/**
 * Catalog-free site constants. Client components import these instead of
 * `lib/seo.ts`, which pulls every locale catalog into the bundle.
 */

export const siteConfig = {
  name: "IP Info",
  shortName: "IP Info",
  description:
    "Free network tools for public IP addresses, ASN, DNS, WHOIS, CDN detection, reachability and IP reputation.",
  url: "https://ip-info.leunos.com",
  locale: "en_US",
  keywords: [
    "public IP",
    "my IP",
    "IP lookup",
    "ASN lookup",
    "DNS lookup",
    "WHOIS",
    "CDN check",
    "PeeringDB",
    "ping test",
    "network analysis",
    "IP reputation",
    "blacklist check",
  ],
};

/**
 * Canonical URL without a trailing slash on the site root, so `<link rel="canonical">`,
 * the sitemap, and JSON-LD `@id`/`url` values all agree.
 */
export function canonicalUrl(path = "/"): string {
  const url = new URL(path || "/", siteConfig.url);
  if (url.pathname === "/") {
    return `${siteConfig.url}${url.search}${url.hash}`;
  }
  const pathname = url.pathname.replace(/\/+$/, "");
  return `${url.origin}${pathname}${url.search}${url.hash}`;
}
