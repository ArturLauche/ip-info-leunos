import { describe, expect, it } from "vitest";
import { extractVisitorIps } from "./visitor-ip";

describe("extractVisitorIps", () => {
  it("prefers the Vercel header and records each source", () => {
    const result = extractVisitorIps(
      new Headers({
        "x-vercel-forwarded-for": "8.8.8.8",
        "x-forwarded-for": "2606:4700:4700::1111, 1.1.1.1",
      }),
    );
    expect(result.ipv4).toBe("8.8.8.8");
    expect(result.ipv6).toBe("2606:4700:4700::1111");
    expect(result.localIpChecks).toEqual([
      { ip: "8.8.8.8", source: "x-vercel-forwarded-for", version: 4 },
      { ip: "2606:4700:4700::1111", source: "x-forwarded-for[0]", version: 6 },
      { ip: "1.1.1.1", source: "x-forwarded-for[1]", version: 4 },
    ]);
  });

  it("drops private, malformed and duplicate addresses", () => {
    const result = extractVisitorIps(
      new Headers({
        "x-forwarded-for": "10.0.0.1, not-an-ip, 9.9.9.9, 9.9.9.9",
        "x-real-ip": "127.0.0.1",
      }),
    );
    expect(result).toEqual({
      ipv4: "9.9.9.9",
      ipv6: null,
      localIpChecks: [{ ip: "9.9.9.9", source: "x-forwarded-for[2]", version: 4 }],
    });
  });

  it("returns nothing without forwarding headers", () => {
    expect(extractVisitorIps(new Headers())).toEqual({ ipv4: null, ipv6: null, localIpChecks: [] });
  });
});
