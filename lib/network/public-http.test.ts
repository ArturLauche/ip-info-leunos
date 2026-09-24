import dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { gzipSync } from "node:zlib";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPublicUrl } from "./target";

function reply(status = 200, headers: Record<string, string> = {}) {
  return Object.assign(new PassThrough(), {
    statusCode: status,
    rawHeaders: Object.entries(headers).flat(),
  });
}

function mockTransport(responses: ReturnType<typeof reply>[], secure = false) {
  const requests: Array<EventEmitter & { end: ReturnType<typeof vi.fn>; destroy: ReturnType<typeof vi.fn> }> = [];
  const spy = vi.spyOn(secure ? https : http, "request").mockImplementation((() => {
    const message = responses[requests.length];
    const request = Object.assign(new EventEmitter(), {
      end: vi.fn(() => queueMicrotask(() => request.emit("response", message))),
      destroy: vi.fn(),
    });
    requests.push(request);
    return request;
  }) as unknown as typeof http.request);
  return { spy, requests };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("public HTTP transport", () => {
  it("pins the socket lookup to the validated DNS set and preserves the TLS hostname", async () => {
    const lookup = vi.spyOn(dns, "lookup").mockResolvedValueOnce([
      { address: "1.1.1.1", family: 4 }, { address: "2606:4700:4700::1111", family: 6 },
    ] as never).mockResolvedValue([{ address: "127.0.0.1", family: 4 }] as never);
    const message = reply();
    const { spy } = mockTransport([message], true);
    const response = await fetchPublicUrl("https://public.example/test", { headers: { host: "localhost" } });
    const [url, options] = spy.mock.calls[0] as unknown as [URL, https.RequestOptions];
    expect(url.hostname).toBe("public.example");
    expect(options.agent).toBe(false);
    expect(options.rejectUnauthorized).not.toBe(false);
    expect(options.headers).not.toHaveProperty("host");
    const callback = vi.fn();
    options.lookup!("public.example", { all: true }, callback);
    expect(callback).toHaveBeenCalledWith(null, [
      { address: "1.1.1.1", family: 4 }, { address: "2606:4700:4700::1111", family: 6 },
    ]);
    expect(lookup).toHaveBeenCalledTimes(1);
    message.end("hello");
    await expect(response.text()).resolves.toBe("hello");
  });

  it("rejects mixed public/private DNS before creating a connection", async () => {
    vi.spyOn(dns, "lookup").mockResolvedValue([{ address: "1.1.1.1", family: 4 }, { address: "10.0.0.1", family: 4 }] as never);
    const { spy } = mockTransport([]);
    await expect(fetchPublicUrl("http://mixed.example")).rejects.toMatchObject({ code: "target_blocked" });
    expect(spy).not.toHaveBeenCalled();
  });

  it("revalidates redirects and closes the discarded response before blocking an internal target", async () => {
    const first = reply(302, { location: "http://127.0.0.1/secret" });
    const { spy, requests } = mockTransport([first]);
    await expect(fetchPublicUrl("http://1.1.1.1")).rejects.toMatchObject({ code: "target_blocked" });
    expect(first.destroyed).toBe(true);
    expect(requests[0].destroy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("follows a relative public redirect and enforces the existing redirect count", async () => {
    const first = reply(301, { location: "/next" });
    const second = reply(308, { location: "/again" });
    const { spy } = mockTransport([first, second]);
    await expect(fetchPublicUrl("http://1.1.1.1", { maxRedirects: 1 })).rejects.toMatchObject({ code: "target_blocked", details: { maxRedirects: 1 } });
    expect(spy).toHaveBeenCalledTimes(2);
    expect(first.destroyed).toBe(true);
    expect(second.destroyed).toBe(true);
  });

  it("does not consume a redirect without a Location header", async () => {
    const message = reply(302);
    mockTransport([message]);
    const response = await fetchPublicUrl("http://1.1.1.1");
    message.end("moved");
    await expect(response.text()).resolves.toBe("moved");
  });

  it("rejects oversized declared bodies before returning a response", async () => {
    const message = reply(200, { "content-length": "101" });
    mockTransport([message]);
    await expect(fetchPublicUrl("http://1.1.1.1", { maxContentLengthBytes: 100 })).rejects.toMatchObject({ code: "response_too_large", status: 413 });
    expect(message.destroyed).toBe(true);
  });

  it.each<Record<string, string>>([{}, { "content-length": "1" }])("counts actual body bytes regardless of declared length: %j", async (headers) => {
    const message = reply(200, headers);
    mockTransport([message]);
    const response = await fetchPublicUrl("http://1.1.1.1", { maxContentLengthBytes: 4 });
    const body = response.text();
    const rejected = expect(body).rejects.toMatchObject({ code: "response_too_large", status: 413 });
    message.end("12345");
    await rejected;
    expect(message.destroyed).toBe(true);
  });

  it("keeps the deadline active after headers for a stalled body", async () => {
    vi.useFakeTimers();
    const message = reply();
    const { requests } = mockTransport([message]);
    const response = await fetchPublicUrl("http://1.1.1.1", { timeoutMs: 50 });
    const rejected = expect(response.text()).rejects.toMatchObject({ code: "timeout", status: 408 });
    await vi.advanceTimersByTimeAsync(50);
    await rejected;
    expect(requests[0].destroy).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("releases the connection and deadline when the caller only needs headers", async () => {
    vi.useFakeTimers();
    const message = reply();
    const { requests } = mockTransport([message]);
    const response = await fetchPublicUrl("http://1.1.1.1");
    await response.body?.cancel();
    expect(requests[0].destroy).toHaveBeenCalled();
    expect(message.destroyed).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("decodes compressed content while enforcing the limit on expanded bytes", async () => {
    const first = reply(200, { "content-encoding": "gzip" });
    const second = reply(200, { "content-encoding": "gzip" });
    mockTransport([first, second]);
    const response = await fetchPublicUrl("http://1.1.1.1", { maxContentLengthBytes: 100 });
    first.end(gzipSync("hello"));
    await expect(response.text()).resolves.toBe("hello");
    const oversized = await fetchPublicUrl("http://1.1.1.1", { maxContentLengthBytes: 100 });
    const rejected = expect(oversized.text()).rejects.toMatchObject({ code: "response_too_large", status: 413 });
    second.end(gzipSync("x".repeat(200)));
    await rejected;
  });

  it("drops sensitive headers when following a redirect to another origin", async () => {
    const first = reply(302, { location: "http://8.8.8.8/result" });
    const second = reply();
    const { spy } = mockTransport([first, second]);
    const response = await fetchPublicUrl("http://1.1.1.1", { headers: { authorization: "test-credential", cookie: "test-session", accept: "application/json" } });
    const [, options] = spy.mock.calls[1] as unknown as [URL, http.RequestOptions];
    expect(options.headers).not.toHaveProperty("authorization");
    expect(options.headers).not.toHaveProperty("cookie");
    expect(options.headers).toHaveProperty("accept", "application/json");
    await response.body?.cancel();
  });

  it("propagates cancellation after headers to the body", async () => {
    const message = reply();
    mockTransport([message]);
    const controller = new AbortController();
    const response = await fetchPublicUrl("http://1.1.1.1", { signal: controller.signal });
    const rejected = expect(response.text()).rejects.toMatchObject({ name: "AbortError" });
    controller.abort();
    await rejected;
    expect(message.destroyed).toBe(true);
  });

  it("never opens a connection for a pre-aborted request", async () => {
    const { spy } = mockTransport([]);
    const controller = new AbortController();
    controller.abort();
    await expect(fetchPublicUrl("http://1.1.1.1", { signal: controller.signal })).rejects.toMatchObject({ name: "AbortError" });
    expect(spy).not.toHaveBeenCalled();
  });

  it("honors the caller deadline during DNS validation without waiting for the resolver", async () => {
    vi.useFakeTimers();
    vi.spyOn(dns, "lookup").mockImplementation(() => new Promise(() => {}));
    const { spy } = mockTransport([]);
    const controller = new AbortController();
    const rejected = expect(fetchPublicUrl("http://slow.example", { signal: controller.signal })).rejects.toMatchObject({ name: "AbortError" });
    controller.abort();
    await rejected;
    expect(spy).not.toHaveBeenCalled();
    // Node's lookup itself cannot be cancelled, but its existing three-second
    // timeout still cleans up after the caller has stopped waiting.
    await vi.advanceTimersByTimeAsync(3000);
  });

  it.each([204, 205, 304])("handles bodyless HTTP status %s", async (status) => {
    mockTransport([reply(status)]);
    const response = await fetchPublicUrl("http://1.1.1.1");
    expect(response.status).toBe(status);
    expect(response.body).toBeNull();
  });

  it("rejects an invalid status without throwing from the response event handler", async () => {
    const message = reply(700);
    mockTransport([message]);
    await expect(fetchPublicUrl("http://1.1.1.1")).rejects.toMatchObject({ code: "network_error", status: 502 });
    expect(message.destroyed).toBe(true);
  });
});
