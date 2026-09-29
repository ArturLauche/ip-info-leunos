import { describe, expect, it, vi } from "vitest";
import { createSingleFlight } from "./single-flight";

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
