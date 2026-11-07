import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("lists every public page with a canonical URL and a build timestamp", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toEqual([
      "https://ip-info.leunos.com",
      "https://ip-info.leunos.com/check",
      "https://ip-info.leunos.com/asn",
      "https://ip-info.leunos.com/ping",
      "https://ip-info.leunos.com/dns",
      "https://ip-info.leunos.com/whois",
      "https://ip-info.leunos.com/cdn",
      "https://ip-info.leunos.com/reputation",
      "https://ip-info.leunos.com/privacy-policy",
      "https://ip-info.leunos.com/terms-of-use",
    ]);

    for (const entry of entries) {
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(Number.isNaN((entry.lastModified as Date).getTime())).toBe(false);
    }
  });

  it("uses the real revision dates for legal pages instead of the build time", () => {
    const entries = sitemap();
    const byUrl = new Map(entries.map((entry) => [entry.url, entry]));

    expect(
      (byUrl.get("https://ip-info.leunos.com/privacy-policy")?.lastModified as Date).toISOString(),
    ).toBe("2026-09-25T00:00:00.000Z");
    expect(
      (byUrl.get("https://ip-info.leunos.com/terms-of-use")?.lastModified as Date).toISOString(),
    ).toBe("2026-06-15T00:00:00.000Z");
  });
});
