import { describe, expect, it, vi } from "vitest";
import { createTtlCache } from "./ttl-cache";
import { withTimeout } from "./async";

describe("createTtlCache", () => {
  it("returns live values and drops expired ones", () => {
    const cache = createTtlCache<string>({ ttlMs: 1_000, maxEntries: 4 });
    cache.set("a", "one", 0);
    expect(cache.get("a", 999)).toBe("one");
    expect(cache.get("a", 1_000)).toBeUndefined();
    expect(cache.size).toBe(0);
  });

  it("evicts the least recently used entry beyond maxEntries", () => {
    const cache = createTtlCache<number>({ ttlMs: 10_000, maxEntries: 2 });
    cache.set("a", 1, 0);
    cache.set("b", 2, 0);
    expect(cache.get("a", 1)).toBe(1); // touch a → b is now oldest
    cache.set("c", 3, 2);
    expect(cache.get("b", 3)).toBeUndefined();
    expect(cache.get("a", 3)).toBe(1);
    expect(cache.get("c", 3)).toBe(3);
  });

  it("evicts by write order when touchOnGet is disabled", () => {
    const cache = createTtlCache<number>({ ttlMs: 10_000, maxEntries: 2, touchOnGet: false });
    cache.set("a", 1, 0);
    cache.set("b", 2, 0);
    cache.get("a", 1);
    cache.set("c", 3, 2);
    expect(cache.get("a", 3)).toBeUndefined();
    expect(cache.get("b", 3)).toBe(2);
  });

  it("moves a re-set key to the newest position and refreshes its age", () => {
    const cache = createTtlCache<number>({ ttlMs: 100, maxEntries: 2, touchOnGet: false });
    cache.set("a", 1, 0);
    cache.set("b", 2, 0);
    cache.set("a", 10, 50);
    cache.set("c", 3, 60);
    expect(cache.get("b", 61)).toBeUndefined();
    expect(cache.peek("a", 120)).toEqual({ value: 10, storedAt: 50 });
  });

  it("caches falsy values such as 0 and empty strings", () => {
    const cache = createTtlCache<number | string>({ ttlMs: 100, maxEntries: 4 });
    cache.set("zero", 0, 0);
    cache.set("empty", "", 0);
    expect(cache.get("zero", 1)).toBe(0);
    expect(cache.get("empty", 1)).toBe("");
  });

  it("supports delete and clear", () => {
    const cache = createTtlCache<number>({ ttlMs: 100, maxEntries: 4 });
    cache.set("a", 1);
    cache.set("b", 2);
    expect(cache.delete("a")).toBe(true);
    expect(cache.size).toBe(1);
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it("rejects invalid bounds", () => {
    expect(() => createTtlCache({ ttlMs: 0, maxEntries: 1 })).toThrow(RangeError);
    expect(() => createTtlCache({ ttlMs: 1, maxEntries: 0 })).toThrow(RangeError);
  });
});

describe("withTimeout", () => {
  it("resolves with the promise when it settles in time", async () => {
    await expect(withTimeout(Promise.resolve("ok"), 50, () => new Error("late"))).resolves.toBe("ok");
  });

  it("propagates the original rejection", async () => {
    await expect(
      withTimeout(Promise.reject(new Error("boom")), 50, () => new Error("late")),
    ).rejects.toThrow("boom");
  });

  it("rejects with the provided error after the timeout", async () => {
    vi.useFakeTimers();
    try {
      const pending = withTimeout(new Promise(() => {}), 100, () => new Error("late"));
      const assertion = expect(pending).rejects.toThrow("late");
      await vi.advanceTimersByTimeAsync(100);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });
});
