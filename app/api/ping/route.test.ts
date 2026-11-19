import dns from "node:dns/promises";
import net from "node:net";
import { EventEmitter } from "node:events";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as targets from "@/lib/network/target";
import { POST } from "./route";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

function ping(body: unknown) {
  return POST(
    new Request("http://localhost/api/ping", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("ping route hardening", () => {
  it("rejects localhost before opening sockets", async () => {
    const response = await ping({ mode: "tcp", target: "127.0.0.1", port: 80 });
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toMatchObject({
      ok: false,
      error: { code: "target_blocked" },
    });
  });

  it("rejects invalid JSON", async () => {
    const response = await ping("{");
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      ok: false,
      error: { code: "bad_request" },
    });
  });

  it("rejects an oversized body before parsing", async () => {
    const response = await ping(`{"target":"${"a".repeat(20_000)}"`);
    const body = await response.json();

    expect(response.status).toBe(413);
    expect(body).toMatchObject({
      ok: false,
      error: { code: "bad_request" },
    });
  });

  it("reports the blocked redirect port if neither scheme completes the HTTP check", async () => {
    vi.stubEnv("PUBLIC_ALLOWED_PING_PORTS", "443");
    vi.spyOn(net, "Socket").mockImplementation(function () {
      const socket = Object.assign(new EventEmitter(), {
        destroy: vi.fn(),
        setTimeout: vi.fn(),
        connect: () => queueMicrotask(() => socket.emit("connect")),
      });
      return socket as unknown as net.Socket;
    });
    const fetch = vi.spyOn(targets, "fetchPublicUrl")
      .mockImplementationOnce(async (_url, options) => {
        options?.validatePort?.(80);
        return new Response();
      })
      .mockRejectedValueOnce(new Error("HTTP unavailable"));
    const response = await ping({ mode: "eb", target: "1.1.1.1", port: 443 });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ ok: false, error: { code: "target_blocked", details: { port: 80 } } });
  });

  it("races every validated address of a dual-stack host through a pinned lookup", async () => {
    vi.spyOn(dns, "lookup").mockResolvedValue([
      { address: "2606:4700::6810:84e5", family: 6 },
      { address: "104.16.132.229", family: 4 },
    ] as never);
    const connects: net.TcpNetConnectOpts[] = [];
    vi.spyOn(net, "Socket").mockImplementation(function () {
      const socket = Object.assign(new EventEmitter(), {
        remoteAddress: "104.16.132.229",
        destroy: vi.fn(),
        setTimeout: vi.fn(),
        connect(options: net.TcpNetConnectOpts) {
          connects.push(options);
          queueMicrotask(() => socket.emit("connect"));
        },
      });
      return socket as unknown as net.Socket;
    });

    const response = await ping({ mode: "tcp", target: "dual.example", port: 443 });
    const body = await response.json();

    expect(body).toMatchObject({
      ok: true,
      data: { ok: true, target: "dual.example", details: { remoteAddress: "104.16.132.229" } },
    });
    expect(connects).toHaveLength(1);
    expect(connects[0]).toMatchObject({ port: 443, host: "dual.example", autoSelectFamily: true });
    const resolved = vi.fn();
    connects[0].lookup!("dual.example", { all: true }, resolved);
    expect(resolved).toHaveBeenCalledWith(null, [
      { address: "2606:4700::6810:84e5", family: 6 },
      { address: "104.16.132.229", family: 4 },
    ]);
  });
});
