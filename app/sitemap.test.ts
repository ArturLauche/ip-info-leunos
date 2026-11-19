import { describe, expect, it } from "vitest";
import { canonicalUrl, siteConfig } from "@/lib/seo";
import sitemap from "./sitemap";
import { execFileSync } from "node:child_process";

const entries = sitemap();

function gitIsAvailable(): boolean {
  try {
    execFileSync("git", ["rev-parse", "--git-dir"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

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

  it("carries a tracked modification date per entry, or none at all", () => {
    expect(entries).not.toHaveLength(0);

    for (const entry of entries) {
      if (entry.lastModified === undefined) continue;

      // When present, the date must be a real, non-future git commit date —
      // never a build stamp, which would make unchanged pages look new.
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(String(entry.lastModified)).not.toBe("Invalid Date");
      expect(
        new Date(entry.lastModified as Date).getTime(),
      ).toBeLessThanOrEqual(Date.now());
    }
  });

  it("reflects each route's git history when git is available", () => {
    if (!gitIsAvailable()) return;

    for (const entry of entries) {
      expect(entry.lastModified).toBeInstanceOf(Date);
    }
  });

  it("does not enumerate deep-link routes that canonicalize elsewhere", () => {
    const urls = entries.map((entry) => entry.url);

    expect(urls).not.toContain(canonicalUrl("/asn/AS13335"));
    expect(urls).not.toContain(canonicalUrl("/check?q=example.com"));
  });
});
