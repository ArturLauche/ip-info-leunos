import dns from "node:dns/promises";
import net from "node:net";
import { EventEmitter } from "node:events";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as targets from "@/lib/network/target";
import { clearWhoisCacheForTests } from "@/lib/whois-cache";
import { GET } from "./route";

afterEach(() => {
  clearWhoisCacheForTests();
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

  it("pins both IANA and referral sockets while enabling fallback across validated IPs", async () => {
    vi.spyOn(dns, "lookup")
      .mockResolvedValueOnce([{ address: "1.1.1.1", family: 4 }, { address: "1.0.0.1", family: 4 }] as never)
      .mockResolvedValueOnce([{ address: "8.8.8.8", family: 4 }] as never);
    const replies = ["refer: whois.registry.example\r\n", "Registrar: Example Registry\r\n"];
    const connections: Array<{ port: number; host?: string; addresses: unknown }> = [];
    vi.spyOn(net, "Socket").mockImplementation(function () {
      const socket = Object.assign(new EventEmitter(), {
        destroy: vi.fn(), write: vi.fn(),
        connect(options: net.TcpNetConnectOpts, callback: () => void) {
          expect(options.autoSelectFamily).toBe(true);
          const lookup = vi.fn();
          options.lookup!(options.host!, { all: true }, lookup);
          expect(lookup.mock.calls[0][0]).toBeNull();
          connections.push({ port: options.port, host: options.host, addresses: lookup.mock.calls[0][1] });
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
    expect(connections).toEqual([
      { port: 43, host: "whois.iana.org", addresses: [{ address: "1.1.1.1", family: 4 }, { address: "1.0.0.1", family: 4 }] },
      { port: 43, host: "whois.registry.example", addresses: [{ address: "8.8.8.8", family: 4 }] },
    ]);
    expect(dns.lookup).toHaveBeenCalledTimes(2);
    expect(await response.json()).toMatchObject({ ok: true, data: { server: "whois.registry.example", summary: { registrar: "Example Registry" } } });
  });

  it("bounds all WHOIS address attempts with one six-second deadline", async () => {
    vi.useFakeTimers();
    vi.spyOn(dns, "lookup").mockResolvedValue([
      { address: "1.1.1.1", family: 4 }, { address: "1.0.0.1", family: 4 },
    ] as never);
    const socket = Object.assign(new EventEmitter(), { destroy: vi.fn(), connect: vi.fn(), write: vi.fn() });
    vi.spyOn(net, "Socket").mockImplementation(function () { return socket as unknown as net.Socket; });
    const rdap = vi.spyOn(targets, "fetchPublicUrl").mockResolvedValue(Response.json({ status: ["active"] }));
    const pending = GET(new Request("http://localhost/api/whois?target=example.com"));
    await vi.advanceTimersByTimeAsync(5999);
    expect(rdap).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(await (await pending).json()).toMatchObject({ ok: true, data: { noteCode: "rdap_fallback" } });
    expect(socket.destroy).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
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

  it("memoizes answers and reuses the IANA referral for other names under the TLD", async () => {
    vi.spyOn(dns, "lookup").mockResolvedValue([{ address: "8.8.8.8", family: 4 }] as never);
    const hosts: string[] = [];
    vi.spyOn(net, "Socket").mockImplementation(function () {
      const socket = Object.assign(new EventEmitter(), {
        destroy: vi.fn(), write: vi.fn(),
        connect(options: net.TcpNetConnectOpts, callback: () => void) {
          hosts.push(options.host!);
          queueMicrotask(() => {
            callback();
            socket.emit("data", Buffer.from(options.host === "whois.iana.org"
              ? "refer: whois.registry.example\r\n"
              : "Registrar: Example Registry\r\n"));
            socket.emit("close");
          });
        },
      });
      return socket as unknown as net.Socket;
    });

    const first = await GET(new Request("http://localhost/api/whois?target=one.example"));
    const repeat = await GET(new Request("http://localhost/api/whois?target=one.example"));
    const sibling = await GET(new Request("http://localhost/api/whois?target=two.example"));

    expect(await repeat.json()).toEqual(await first.json());
    expect((await sibling.json()).data).toMatchObject({ target: "two.example", server: "whois.registry.example" });
    // IANA once (TLD referral cached), registry once per distinct name.
    expect(hosts).toEqual(["whois.iana.org", "whois.registry.example", "whois.registry.example"]);
  });

  it("forgets a cached referral when the referred server fails", async () => {
    vi.spyOn(dns, "lookup").mockResolvedValue([{ address: "8.8.8.8", family: 4 }] as never);
    let registryUp = true;
    const hosts: string[] = [];
    vi.spyOn(net, "Socket").mockImplementation(function () {
      const socket = Object.assign(new EventEmitter(), {
        destroy: vi.fn(), write: vi.fn(),
        connect(options: net.TcpNetConnectOpts, callback: () => void) {
          hosts.push(options.host!);
          queueMicrotask(() => {
            if (options.host !== "whois.iana.org" && !registryUp) {
              socket.emit("error", new Error("ECONNREFUSED"));
              return;
            }
            callback();
            socket.emit("data", Buffer.from(options.host === "whois.iana.org"
              ? "refer: whois.registry.example\r\n"
              : "Registrar: Example Registry\r\n"));
            socket.emit("close");
          });
        },
      });
      return socket as unknown as net.Socket;
    });
    vi.spyOn(targets, "fetchPublicUrl").mockRejectedValue(new Error("RDAP down"));

    await GET(new Request("http://localhost/api/whois?target=a.example"));
    registryUp = false;
    const failed = await GET(new Request("http://localhost/api/whois?target=b.example"));
    expect((await failed.json()).error.code).toBe("network_error");
    registryUp = true;
    await GET(new Request("http://localhost/api/whois?target=c.example"));

    expect(hosts).toEqual([
      "whois.iana.org", "whois.registry.example",
      "whois.registry.example", // b: cached referral, registry fails → evicted
      "whois.iana.org", "whois.registry.example", // c: asks IANA again
    ]);
  });
});
