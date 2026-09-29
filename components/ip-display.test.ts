import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getTranslation } from "@/lib/i18n";
import { withI18n } from "./i18n-test-utils";
import { describeIpLookup, IpDisplay } from "./ip-display";

const t = getTranslation("en");

describe("describeIpLookup", () => {
  it("names the lookup kind and the address it resolved to", () => {
    expect(describeIpLookup("203.0.113.7", null, false, t)).toBe(
      `${t.yourIpAddresses}: 203.0.113.7`,
    );
    expect(describeIpLookup(null, "2001:db8::1", true, t)).toBe(
      `${t.queriedIpAddress}: 2001:db8::1`,
    );
  });

  it("prefers IPv4 when both families resolved", () => {
    expect(describeIpLookup("198.51.100.4", "2001:db8::4", true, t)).toBe(
      `${t.queriedIpAddress}: 198.51.100.4`,
    );
  });

  it("falls back to the plain title when no address is known", () => {
    expect(describeIpLookup(null, null, false, t)).toBe(t.yourIpAddresses);
  });
});

describe("IpDisplay", () => {
  it("keeps a live region mounted next to the loading skeleton", () => {
    const html = renderToStaticMarkup(
      withI18n(createElement(IpDisplay, { targetIp: "198.51.100.4" })),
    );

    // The region must precede the content and stay empty until a result exists.
    const regionAt = html.indexOf('aria-live="polite"');
    expect(regionAt).toBeGreaterThan(-1);
    expect(html.indexOf('aria-live="polite"', regionAt + 1)).toBe(-1);
    expect(html.slice(regionAt, html.indexOf("</p>", regionAt))).toMatch(/>$/);
    expect(html.indexOf('aria-busy="true"')).toBeGreaterThan(regionAt);
  });
});
