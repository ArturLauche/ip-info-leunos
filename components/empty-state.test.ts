import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Waypoints } from "lucide-react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  const base = { icon: Waypoints, title: "Nothing yet", description: "Run a lookup" };

  it("renders the centred content without a footer band by default", () => {
    const html = renderToStaticMarkup(createElement(EmptyState, base));

    expect(html).toContain("Nothing yet");
    expect(html).toContain("Run a lookup");
    expect(html).not.toContain("border-t");
  });

  it("adds a full-width footer band only when one is provided", () => {
    const html = renderToStaticMarkup(
      createElement(EmptyState, { ...base, footer: createElement("p", null, "Footer copy") }),
    );

    expect(html).toContain("Footer copy");
    expect(html).toContain("border-t");
  });
});
