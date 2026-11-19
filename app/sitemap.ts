import type { MetadataRoute } from "next";
import { execFileSync } from "node:child_process";
import { canonicalUrl } from "@/lib/seo";

/**
 * Source files whose history defines a route's real last significant change.
 * `git log` picks the newest commit among all pathspecs, so touching any of
 * them bumps exactly that route's timestamp.
 */
const routeSources: Record<string, string[]> = {
  "/": ["app/page.tsx", "components/ip-display.tsx"],
  "/check": ["app/check", "components/ip-lookup.tsx"],
  "/asn": ["app/asn", "components/asn", "lib/asn*.ts"],
  "/dns": ["app/dns", "components/dns-checker.tsx", "lib/dns-records.ts"],
  "/whois": ["app/whois", "components/whois-checker.tsx", "lib/whois.ts"],
  "/cdn": ["app/cdn", "components/cdn-checker.tsx", "lib/cdn-detection.ts"],
  "/ping": ["app/ping", "components/ping-checker.tsx", "lib/ping.ts"],
  "/reputation": [
    "app/reputation",
    "components/reputation-checker.tsx",
    "lib/reputation",
  ],
  "/privacy-policy": ["app/privacy-policy", "lib/privacy.ts"],
  "/terms-of-use": ["app/terms-of-use", "lib/terms.ts"],
};

/**
 * Last commit date that touched the route's sources, or `null` when no git
 * history is available (Docker builds strip `.git`). An inaccurate
 * build-stamped date would make unchanged pages look new on every deploy, so
 * the field is omitted instead — an omitted `lastmod` is simply ignored by
 * crawlers, a wrong one degrades trust in the signal.
 */
function gitLastModified(pathspecs: string[]): Date | null {
  try {
    const iso = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", ...pathspecs],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "/", changeFrequency: "daily" as const, priority: 1 },
    { path: "/check", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/asn", changeFrequency: "weekly" as const, priority: 0.85 },
    { path: "/ping", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/dns", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/whois", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/cdn", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/reputation", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/privacy-policy", changeFrequency: "monthly" as const, priority: 0.3 },
    { path: "/terms-of-use", changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  return routes.map((route) => ({
    url: canonicalUrl(route.path),
    lastModified: gitLastModified(routeSources[route.path]) ?? undefined,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
