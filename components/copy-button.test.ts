import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { CopyButton } from "./copy-button";

describe("CopyButton", () => {
  it("does not build deferred text until the button is pressed", () => {
    const text = vi.fn(() => "a very large export");

    const html = renderToStaticMarkup(
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
