import { describe, expect, it, vi } from "vitest";
import { createAbortableSingleFlight, createSingleFlight } from "./single-flight";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("createSingleFlight", () => {
  it("runs the work once for concurrent callers with the same key", async () => {
    const flights = createSingleFlight<string>();
    const gate = deferred<string>();
    const work = vi.fn(() => gate.promise);

    const results = [flights.run("a", work), flights.run("a", work), flights.run("a", work)];
    expect(flights.size).toBe(1);
    gate.resolve("done");

    await expect(Promise.all(results)).resolves.toEqual(["done", "done", "done"]);
    expect(work).toHaveBeenCalledTimes(1);
    expect(flights.size).toBe(0);
  });

  it("keeps different keys independent", async () => {
    const flights = createSingleFlight<string>();
    const work = vi.fn(async () => "x");

    await Promise.all([flights.run("a", work), flights.run("b", work)]);

    expect(work).toHaveBeenCalledTimes(2);
  });

  it("starts fresh work once the previous flight has settled", async () => {
    const flights = createSingleFlight<number>();
    let calls = 0;
    const work = async () => ++calls;

    expect(await flights.run("k", work)).toBe(1);
    expect(await flights.run("k", work)).toBe(2);
  });

  it("shares a rejection with every waiter and does not poison later calls", async () => {
    const flights = createSingleFlight<string>();
    const gate = deferred<string>();
    const first = flights.run("k", () => gate.promise);
    const second = flights.run("k", () => gate.promise);
    gate.reject(new Error("upstream down"));

    await expect(first).rejects.toThrow("upstream down");
    await expect(second).rejects.toThrow("upstream down");
    expect(flights.size).toBe(0);
    await expect(flights.run("k", async () => "recovered")).resolves.toBe("recovered");
  });

  it("turns a synchronous throw into a rejection and still clears the flight", async () => {
    const flights = createSingleFlight<string>();

    await expect(
      flights.run("k", () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    expect(flights.size).toBe(0);
  });
});

describe("createAbortableSingleFlight", () => {
  it("keeps shared work alive until the last caller releases it", async () => {
    const flights = createAbortableSingleFlight<string>();
    const gate = deferred<string>();
    let signal!: AbortSignal;
    const work = vi.fn((sharedSignal: AbortSignal) => {
      signal = sharedSignal;
      return gate.promise;
    });
    const first = flights.acquire("a", work);
    const second = flights.acquire("a", work);
    await Promise.resolve();

    first.release();
    first.release(); // Releasing twice must not cancel the second caller.
    expect(signal.aborted).toBe(false);
    gate.resolve("done");
    await expect(second.promise).resolves.toBe("done");
    second.release();
    expect(work).toHaveBeenCalledTimes(1);
    expect(signal.aborted).toBe(false);
  });

  it("aborts abandoned work and lets a new caller start immediately", async () => {
    const flights = createAbortableSingleFlight<string>();
    const oldGate = deferred<string>();
    let oldSignal!: AbortSignal;
    const first = flights.acquire("a", (signal) => {
      oldSignal = signal;
      return oldGate.promise;
    });
    await Promise.resolve();
    first.release();
    expect(oldSignal.aborted).toBe(true);

    const nextGate = deferred<string>();
    const next = flights.acquire("a", () => nextGate.promise);
    oldGate.resolve("old");
    await first.promise;
    const joined = flights.acquire("a", () => Promise.resolve("wrong"));
    nextGate.resolve("new");
    await expect(Promise.all([next.promise, joined.promise])).resolves.toEqual(["new", "new"]);
    next.release();
    joined.release();
  });
});
