import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots", () => {
  it("keeps tool pages crawlable while keeping API JSON out of the crawl path", () => {
    const result = robots();

    expect(result.rules).toMatchObject({
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    });
    expect(result.sitemap).toBe("https://ip-info.leunos.com/sitemap.xml");
  });
});
