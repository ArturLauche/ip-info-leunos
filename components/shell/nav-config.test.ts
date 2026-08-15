import { describe, expect, it } from "vitest";
import { activeToolFromPathname } from "./nav-config";

describe("activeToolFromPathname", () => {
  it("maps the home route and trailing slashes", () => {
    expect(activeToolFromPathname("/")).toBe("home");
    expect(activeToolFromPathname("")).toBe("home");
    expect(activeToolFromPathname("/whois/")).toBe("whois");
  });

  it("maps tool roots and nested routes", () => {
    expect(activeToolFromPathname("/check")).toBe("check");
    expect(activeToolFromPathname("/asn")).toBe("asn");
    expect(activeToolFromPathname("/asn/AS8881")).toBe("asn");
    expect(activeToolFromPathname("/ping")).toBe("ping");
    expect(activeToolFromPathname("/dns")).toBe("dns");
    expect(activeToolFromPathname("/whois")).toBe("whois");
    expect(activeToolFromPathname("/cdn")).toBe("cdn");
    expect(activeToolFromPathname("/reputation")).toBe("reputation");
  });

  it("leaves legal pages without an active tool", () => {
    expect(activeToolFromPathname("/privacy-policy")).toBeUndefined();
    expect(activeToolFromPathname("/terms-of-use")).toBeUndefined();
  });
});
