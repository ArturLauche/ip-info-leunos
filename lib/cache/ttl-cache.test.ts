import { describe, expect, it, vi } from "vitest";
import { SingleFlight, TtlCache } from "./ttl-cache";

describe("TtlCache", () => {
  it("expires entries and evicts the oldest value at capacity", () => {
    vi.useFakeTimers();
    const cache = new TtlCache<string>({ ttlMs: 100, maxEntries: 2 });
    cache.set("a", "A");
    vi.advanceTimersByTime(50);
    cache.set("b", "B");
    expect(cache.get("a")).toBe("A");
    cache.set("c", "C");
    expect(cache.get("b")).toBe("B");
    expect(cache.get("a")).toBeNull();
    vi.advanceTimersByTime(100);
    expect(cache.get("c")).toBeNull();
    vi.useRealTimers();
  });
});

describe("SingleFlight", () => {
  it("shares concurrent work and releases the key after settlement", async () => {
    const flight = new SingleFlight<number>();
    let resolveWork!: (value: number) => void;
    const work = vi.fn(() => new Promise<number>((resolve) => { resolveWork = resolve; }));

    const first = flight.run("same", work);
    const second = flight.run("same", work);
    expect(work).toHaveBeenCalledTimes(1);
    expect(flight.size).toBe(1);
    resolveWork(42);
    await expect(Promise.all([first, second])).resolves.toEqual([42, 42]);
    expect(flight.size).toBe(0);
  });

  it("does not cache rejected work", async () => {
    const flight = new SingleFlight<string>();
    await expect(flight.run("bad", async () => { throw new Error("upstream"); })).rejects.toThrow("upstream");
    await expect(flight.run("bad", async () => "recovered")).resolves.toBe("recovered");
  });
});
