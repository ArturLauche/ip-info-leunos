import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { CopyButton } from "./copy-button";
import { withI18n } from "./i18n-test-utils";
import { ResultActions } from "./result-actions";

const render = (element: ReturnType<typeof createElement>) =>
  renderToStaticMarkup(withI18n(element));

describe("ResultActions", () => {
  it("offers copy and download without serializing the result while rendering", () => {
    const toJSON = vi.fn(() => ({ ok: true }));

    const html = render(
      createElement(ResultActions, { data: { toJSON }, filename: "cdn-example.com" }),
    );

    expect(html).toContain("Copy");
    expect(html).toContain("Download JSON");
    expect(toJSON).not.toHaveBeenCalled();
  });
});

describe("CopyButton", () => {
  it("does not build deferred text until the button is pressed", () => {
    const text = vi.fn(() => "a very large export");

    const html = render(
      createElement(CopyButton, {
        text,
        label: "Copy",
        copiedLabel: "Copied",
        failedLabel: "Failed",
        showLabel: true,
      }),
    );

    expect(html).toContain("Copy");
    expect(text).not.toHaveBeenCalled();
  });
});
