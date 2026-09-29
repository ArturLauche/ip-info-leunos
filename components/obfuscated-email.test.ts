import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { withI18n } from "./i18n-test-utils";
import { ObfuscatedEmail } from "./obfuscated-email";
import { splitEmail } from "@/lib/email";

/**
 * Guards the core anti-harvesting invariant: the server-rendered output must not
 * contain a plaintext "user@domain" address or a mailto: link. The real address
 * is only assembled in the browser after hydration (useEffect), so server
 * rendering keeps revealed === false and emits the obfuscated form instead.
 */
describe("ObfuscatedEmail server output", () => {
  it("never emits a plaintext address or mailto: in SSR HTML", () => {
    const parts = splitEmail("contact@example.com");
    expect(parts).not.toBeNull();

    const html = renderToStaticMarkup(
      withI18n(
        createElement(ObfuscatedEmail, { user: parts!.user, domain: parts!.domain }),
      ),
    );

    expect(html).not.toContain("contact@example.com");
    expect(html).not.toContain("mailto:");
    expect(html).not.toContain("@");
    expect(html).toContain("[at]");
    expect(html).toContain("[dot]");
  });
});
