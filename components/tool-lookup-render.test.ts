import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { getToolTranslation } from "@/lib/tool-i18n";
import { DnsChecker } from "./dns-checker";
import { withI18n } from "./i18n-test-utils";
import { ResultPanel } from "./result-panel";
import { ToolSearchForm } from "./tool-search-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: () => {}, refresh: () => {} }),
}));

const t = getToolTranslation("en");
const render = (element: ReturnType<typeof createElement>) =>
  renderToStaticMarkup(withI18n(element));

describe("deep-linked lookups", () => {
  it("render the pending state on the server instead of flashing the empty state", () => {
    const html = render(createElement(DnsChecker, { initialTarget: "example.com" }));

    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain(t.dnsEmptyTitle);
  });

  it("show the empty state when there is nothing to look up", () => {
    const html = render(createElement(DnsChecker, { initialTarget: "   " }));

    expect(html).toContain(t.dnsEmptyTitle);
    expect(html).not.toContain("skeleton");
  });
});

describe("ToolSearchForm", () => {
  const props = { placeholder: "Host", submitLabel: "Go", onSubmit: () => {} };

  it("keeps a live region mounted so results can be announced", () => {
    const idle = render(createElement(ToolSearchForm, props));
    const done = render(
      createElement(ToolSearchForm, { ...props, resultMessage: "DNS records for example.com" }),
    );

    expect(idle).toMatch(/<p role="status" aria-live="polite"[^>]*class="sr-only"><\/p>/);
    expect(done).toContain("DNS records for example.com</p>");
  });

  it("forces the target field left-to-right inside RTL pages", () => {
    expect(render(createElement(ToolSearchForm, props))).toContain('dir="ltr"');
  });
});

describe("ResultPanel", () => {
  it("uses the success mark by default and a warning mark for empty lookups", () => {
    // children travel as the third createElement argument, the idiomatic form.
    const panel = (props: Omit<ComponentProps<typeof ResultPanel>, "children">) =>
      render(createElement(ResultPanel, props as ComponentProps<typeof ResultPanel>, "body"));
    const ok = panel({ title: "ok" });
    const empty = panel({ title: "empty", status: "warning" });

    expect(ok).toContain("text-success");
    expect(ok).not.toContain("text-warning");
    expect(empty).toContain("text-warning");
    expect(empty).not.toContain("text-success");
  });
});
