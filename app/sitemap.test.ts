import { describe, expect, it } from "vitest";
import { canonicalUrl, siteConfig } from "@/lib/seo";
import sitemap from "./sitemap";

const entries = sitemap();

describe("sitemap", () => {
  it("covers every indexable route with a canonical absolute URL", () => {
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual(
      expect.arrayContaining([
        siteConfig.url,
        canonicalUrl("/check"),
        canonicalUrl("/asn"),
        canonicalUrl("/ping"),
        canonicalUrl("/dns"),
        canonicalUrl("/whois"),
        canonicalUrl("/cdn"),
        canonicalUrl("/reputation"),
        canonicalUrl("/privacy-policy"),
        canonicalUrl("/terms-of-use"),
      ]),
    );
  });

  it("lists every URL exactly once", () => {
    const urls = entries.map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
  });

  it("carries a freshness timestamp on every entry", () => {
    expect(entries).not.toHaveLength(0);

    for (const entry of entries) {
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(String(entry.lastModified)).not.toBe("Invalid Date");
    }
  });

  it("does not enumerate deep-link routes that canonicalize elsewhere", () => {
    const urls = entries.map((entry) => entry.url);

    expect(urls).not.toContain(canonicalUrl("/asn/AS13335"));
    expect(urls).not.toContain(canonicalUrl("/check?q=example.com"));
  });
});
