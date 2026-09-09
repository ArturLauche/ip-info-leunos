import dns from "node:dns/promises";
import net from "node:net";
import { EventEmitter } from "node:events";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as targets from "@/lib/network/target";
import { GET } from "./route";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("GET /api/whois", () => {
  it("rejects missing target with a validation error", async () => {
    const response = await GET(new Request("http://localhost/api/whois"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("bad_request");
  });

  it("blocks localhost without opening a socket", async () => {
    const response = await GET(new Request("http://localhost/api/whois?target=localhost"));
    const body = await response.json();

    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("target_blocked");
  });

  it("blocks link-local metadata-style targets", async () => {
    const response = await GET(
      new Request("http://localhost/api/whois?target=169.254.169.254"),
    );
    const body = await response.json();

    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("target_blocked");
  });

  it("connects both IANA and referral sockets to their validated IPs", async () => {
    vi.spyOn(dns, "lookup")
      .mockResolvedValueOnce([{ address: "1.1.1.1", family: 4 }] as never)
      .mockResolvedValueOnce([{ address: "8.8.8.8", family: 4 }] as never);
    const replies = ["refer: whois.registry.example\r\n", "Registrar: Example Registry\r\n"];
    const connections: Array<{ port: number; host: string }> = [];
    vi.spyOn(net, "Socket").mockImplementation(function () {
      const socket = Object.assign(new EventEmitter(), {
        setTimeout: vi.fn(), destroy: vi.fn(), write: vi.fn(),
        connect(port: number, host: string, callback: () => void) {
          connections.push({ port, host });
          queueMicrotask(() => {
            callback();
            socket.emit("data", Buffer.from(replies.shift() ?? ""));
            socket.emit("close");
          });
          return socket;
        },
      });
      return socket as unknown as net.Socket;
    });

    const response = await GET(new Request("http://localhost/api/whois?target=example.com"));
    expect(connections).toEqual([{ port: 43, host: "1.1.1.1" }, { port: 43, host: "8.8.8.8" }]);
    expect(await response.json()).toMatchObject({ ok: true, data: { server: "whois.registry.example", summary: { registrar: "Example Registry" } } });
  });

  it("uses the approved public HTTP policy for RDAP fallback and returns a note code", async () => {
    vi.spyOn(dns, "lookup").mockRejectedValue(new Error("WHOIS unavailable"));
    const rdap = vi.spyOn(targets, "fetchPublicUrl").mockResolvedValue(Response.json({ status: ["active"] }));
    const response = await GET(new Request("http://localhost/api/whois?target=example.com"));
    expect(rdap).toHaveBeenCalledWith("https://rdap.org/domain/example.com", expect.objectContaining({
      cache: "no-store", timeoutMs: 6000, maxRedirects: 3, maxContentLengthBytes: 256000,
      signal: expect.any(AbortSignal),
    }));
    expect(await response.json()).toMatchObject({ ok: true, data: { noteCode: "rdap_fallback", summary: { status: ["active"] } } });
  });

  it("keeps the overall RDAP deadline active while consuming the body", async () => {
    vi.useFakeTimers();
    vi.spyOn(dns, "lookup").mockRejectedValue(new Error("WHOIS unavailable"));
    vi.spyOn(targets, "fetchPublicUrl").mockImplementation(async (_url, init) => new Response(new ReadableStream({
      start(controller) {
        init?.signal?.addEventListener("abort", () => controller.error(new DOMException("Aborted", "AbortError")), { once: true });
      },
    })));
    const pending = GET(new Request("http://localhost/api/whois?target=example.com"));
    await vi.advanceTimersByTimeAsync(6000);
    const response = await pending;
    expect(await response.json()).toMatchObject({ ok: false, error: { code: "network_error" } });
    expect(vi.getTimerCount()).toBe(0);
  });
});
