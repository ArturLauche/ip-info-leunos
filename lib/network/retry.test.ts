import { afterEach, describe, expect, it, vi } from "vitest";
import {
  backoffDelayMs,
  fetchWithRetry,
  isRetryableHttpStatus,
  isTransientNetworkError,
  parseRetryAfterMs,
  RetryableHttpError,
  withRetry,
} from "./retry";

afterEach(() => {
  vi.useRealTimers();
});

describe("retry classification", () => {
  it.each([408, 429, 500, 502, 503, 504])("retries transient HTTP %s", (status) => {
    expect(isRetryableHttpStatus(status)).toBe(true);
  });

  it.each([400, 401, 403, 404, 409, 422])("does not retry permanent HTTP %s", (status) => {
    expect(isRetryableHttpStatus(status)).toBe(false);
  });

  it("recognizes connection-level failures and ignores abort signals", () => {
    const reset = Object.assign(new Error("reset"), { code: "ECONNRESET" });
    const wrapped = new TypeError("fetch failed", { cause: reset });

    expect(isTransientNetworkError(new TypeError("fetch failed"))).toBe(true);
    expect(isTransientNetworkError(wrapped)).toBe(true);
    expect(isTransientNetworkError(reset)).toBe(true);
    expect(isTransientNetworkError(new AggregateError([reset], "aggregate"))).toBe(true);
    expect(isTransientNetworkError(new DOMException("aborted", "AbortError"))).toBe(false);
    expect(isTransientNetworkError(new Error("invalid JSON"))).toBe(false);
  });
});

describe("Retry-After parsing", () => {
  it("parses delta-seconds", () => {
    expect(parseRetryAfterMs("3")).toBe(3_000);
    expect(parseRetryAfterMs(" 0 ")).toBe(0);
  });

  it("parses an HTTP date relative to now", () => {
    const now = Date.parse("2026-01-01T00:00:00.000Z");
    expect(parseRetryAfterMs("Thu, 01 Jan 2026 00:00:05 GMT", now)).toBe(5_000);
    expect(parseRetryAfterMs("Thu, 01 Jan 2020 00:00:00 GMT", now)).toBe(0);
  });

  it("rejects missing and malformed values", () => {
    expect(parseRetryAfterMs(null)).toBeNull();
    expect(parseRetryAfterMs("")).toBeNull();
    expect(parseRetryAfterMs("soon")).toBeNull();
  });
});

describe("backoff timing", () => {
  it("uses 1s, 2s, 4s with symmetric jitter around the midpoint", () => {
    const midpoint = () => 0.5;
    expect([1, 2, 3].map((attempt) => backoffDelayMs(attempt, { random: midpoint }))).toEqual([
      1_000, 2_000, 4_000,
    ]);
  });

  it("bounds jitter and caps the delay", () => {
    const lowest = () => 0;
    const highest = () => 1;
    expect(backoffDelayMs(1, { random: lowest })).toBe(800);
    expect(backoffDelayMs(1, { random: highest })).toBe(1_200);
    expect(backoffDelayMs(10, { random: highest, maxDelayMs: 8_000 })).toBe(8_000);
  });
});

describe("withRetry", () => {
  it("recovers after transient failures", async () => {
    const sleeps: number[] = [];
    const events: number[] = [];
    let calls = 0;

    const result = await withRetry(
      async () => {
        calls += 1;
        if (calls < 3) throw new RetryableHttpError(503);
        return "ok";
      },
      {
        random: () => 0.5,
        sleep: async (delayMs) => {
          sleeps.push(delayMs);
        },
        onRetry: (event) => events.push(event.delayMs),
      },
    );

    expect(result).toBe("ok");
    expect(calls).toBe(3);
    expect(sleeps).toEqual([1_000, 2_000]);
    expect(events).toEqual([1_000, 2_000]);
  });

  it("rejects after the retry budget is exhausted", async () => {
    const sleeps: number[] = [];
    let calls = 0;

    await expect(
      withRetry(
        async () => {
          calls += 1;
          throw new RetryableHttpError(502);
        },
        {
          maxAttempts: 3,
          random: () => 0.5,
          sleep: async (delayMs) => {
            sleeps.push(delayMs);
          },
        },
      ),
    ).rejects.toMatchObject({ name: "RetryableHttpError", status: 502 });

    expect(calls).toBe(3);
    expect(sleeps).toEqual([1_000, 2_000]);
  });

  it("does not retry permanent errors", async () => {
    let calls = 0;
    const sleep = vi.fn(async () => {});

    await expect(
      withRetry(
        async () => {
          calls += 1;
          throw new RetryableHttpError(404);
        },
        { sleep },
      ),
    ).rejects.toMatchObject({ status: 404 });

    expect(calls).toBe(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("honors Retry-After instead of exponential backoff", async () => {
    const sleeps: number[] = [];
    let calls = 0;

    const result = await withRetry(
      async () => {
        calls += 1;
        if (calls === 1) throw new RetryableHttpError(429, 3_000);
        return "ok";
      },
      {
        sleep: async (delayMs) => {
          sleeps.push(delayMs);
        },
      },
    );

    expect(result).toBe("ok");
    expect(sleeps).toEqual([3_000]);
  });

  it("fails instead of waiting when Retry-After exceeds the cap", async () => {
    let calls = 0;
    const sleep = vi.fn(async () => {});

    await expect(
      withRetry(
        async () => {
          calls += 1;
          throw new RetryableHttpError(429, 20_000);
        },
        { maxRetryAfterMs: 5_000, sleep },
      ),
    ).rejects.toMatchObject({ status: 429 });

    expect(calls).toBe(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("cancels promptly while waiting between attempts", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    let calls = 0;

    const pending = withRetry(
      async () => {
        calls += 1;
        throw new RetryableHttpError(503);
      },
      { signal: controller.signal, random: () => 0.5 },
    );
    const rejected = expect(pending).rejects.toMatchObject({ name: "AbortError" });

    await vi.advanceTimersByTimeAsync(0);
    controller.abort();
    await rejected;

    expect(calls).toBe(1);
  });

  it("never starts an operation for an already-aborted signal", async () => {
    const controller = new AbortController();
    controller.abort();
    const operation = vi.fn(async () => "ok");

    await expect(withRetry(operation, { signal: controller.signal })).rejects.toMatchObject({
      name: "AbortError",
    });
    expect(operation).not.toHaveBeenCalled();
  });
});

describe("fetchWithRetry", () => {
  it("recovers from a transient status and releases the discarded body", async () => {
    const unavailable = new Response("down", { status: 503 });
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(unavailable)
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    const sleep = vi.fn(async () => {});

    const response = await fetchWithRetry("https://provider.example/data", {}, {
      fetchImpl,
      sleep,
      random: () => 0.5,
    });

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("ok");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(unavailable.bodyUsed).toBe(true);
    expect(sleep).toHaveBeenCalledWith(1_000, null);
  });

  it("returns the final response with its body when retries are exhausted", async () => {
    const fetchImpl = vi.fn(async () => new Response("still down", { status: 503 }));
    const sleep = vi.fn(async () => {});

    const response = await fetchWithRetry("https://provider.example/data", {}, {
      fetchImpl,
      sleep,
      maxAttempts: 2,
      random: () => 0.5,
    });

    expect(response.status).toBe(503);
    await expect(response.text()).resolves.toBe("still down");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
  });

  it("does not retry a non-idempotent request by default", async () => {
    const fetchImpl = vi.fn(async () => new Response("busy", { status: 503 }));
    const sleep = vi.fn(async () => {});

    const response = await fetchWithRetry(
      "https://provider.example/search",
      { method: "POST", body: "query" },
      { fetchImpl, sleep },
    );

    expect(response.status).toBe(503);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("can retry an explicitly idempotent POST", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response("busy", { status: 503 }))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    const sleep = vi.fn(async () => {});

    const response = await fetchWithRetry(
      "https://provider.example/search",
      { method: "POST", body: "query" },
      { fetchImpl, sleep, idempotent: true },
    );

    expect(response.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("retries a network interruption", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    const sleep = vi.fn(async () => {});

    const response = await fetchWithRetry("https://provider.example/data", {}, {
      fetchImpl,
      sleep,
    });

    expect(response.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not retry permanent statuses", async () => {
    const fetchImpl = vi.fn(async () => new Response("missing", { status: 404 }));
    const sleep = vi.fn(async () => {});

    const response = await fetchWithRetry("https://provider.example/data", {}, {
      fetchImpl,
      sleep,
    });

    expect(response.status).toBe(404);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("returns the response when Retry-After asks for too long a wait", async () => {
    const fetchImpl = vi.fn(
      async () => new Response("slow down", { status: 429, headers: { "retry-after": "60" } }),
    );
    const sleep = vi.fn(async () => {});

    const response = await fetchWithRetry("https://provider.example/data", {}, {
      fetchImpl,
      sleep,
      maxRetryAfterMs: 5_000,
    });

    expect(response.status).toBe(429);
    await expect(response.text()).resolves.toBe("slow down");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("stops retrying when the caller aborts", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const fetchImpl = vi.fn(async () => new Response("down", { status: 503 }));

    const pending = fetchWithRetry(
      "https://provider.example/data",
      { signal: controller.signal },
      { fetchImpl, random: () => 0.5 },
    );
    const rejected = expect(pending).rejects.toMatchObject({ name: "AbortError" });

    await vi.advanceTimersByTimeAsync(0);
    controller.abort();
    await rejected;

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
