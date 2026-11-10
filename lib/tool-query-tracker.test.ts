import { describe, expect, it } from "vitest";
import { createToolQueryTracker } from "./tool-query-tracker";

describe("tool query navigation tracking", () => {
  it("recognizes successive local echoes without re-running the lookup", () => {
    const tracker = createToolQueryTracker("initial");
    tracker.submitted("first", 0);
    tracker.submitted("second", 1);
    expect(tracker.observed("first", 2)).toBe("local");
    expect(tracker.observed("second", 3)).toBe("local");
  });

  it("discards superseded entries when a later submission is echoed", () => {
    const tracker = createToolQueryTracker("initial");
    tracker.submitted("first", 0);
    tracker.submitted("second", 1);
    expect(tracker.observed("second", 2)).toBe("local");
    expect(tracker.observed("first", 3)).toBe("external");
  });

  it("expires a submission whose URL echo never arrives", () => {
    const tracker = createToolQueryTracker("initial");
    tracker.submitted("first", 0);
    expect(tracker.observed("first", 5_001)).toBe("external");
  });

  it("clears superseded submissions when the current query is submitted again", () => {
    const tracker = createToolQueryTracker("initial");
    tracker.submitted("other", 0);
    tracker.submitted("initial", 1);
    expect(tracker.observed("other", 2)).toBe("external");
  });

  it("treats history navigation to a pending query as external", () => {
    const tracker = createToolQueryTracker("initial");
    tracker.submitted("other", 0);
    tracker.clearPending();
    expect(tracker.observed("other", 1)).toBe("external");
  });
});
