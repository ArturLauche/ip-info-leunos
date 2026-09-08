import { describe, expect, it, vi } from "vitest";
import { createTtlCache } from "./ttl-cache";

describe("TtlCache", () => {
  it("returns set values before expiry", () => {
    const cache = createTtlCache<string>({ ttlMs: 1_000, maxEntries: 8 });
    cache.set("a", "value-a");
    expect(cache.get("a")).toBe("value-a");
    expect(cache.size).toBe(1);
  });

  it("expires entries after the TTL and drops them", () => {
    vi.useFakeTimers();
    try {
      const cache = createTtlCache<string>({ ttlMs: 100, maxEntries: 8 });
      cache.set("a", "value-a");
      vi.advanceTimersByTime(99);
      expect(cache.get("a")).toBe("value-a");
      vi.advanceTimersByTime(1);
      expect(cache.get("a")).toBeNull();
      expect(cache.size).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("evicts the oldest entry while over capacity", () => {
    const cache = createTtlCache<number>({ ttlMs: 60_000, maxEntries: 2 });
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);
    expect(cache.size).toBe(2);
    expect(cache.get("a")).toBeNull();
    expect(cache.get("b")).toBe(2);
    expect(cache.get("c")).toBe(3);
  });

  it("supports delete and clear", () => {
    const cache = createTtlCache<string>({ ttlMs: 60_000, maxEntries: 8 });
    cache.set("a", "x");
    cache.delete("a");
    expect(cache.get("a")).toBeNull();
    cache.set("b", "y");
    cache.clear();
    expect(cache.size).toBe(0);
  });
});
