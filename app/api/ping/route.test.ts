import dns from "node:dns/promises";
import net from "node:net";
import { EventEmitter } from "node:events";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

afterEach(() => vi.restoreAllMocks());

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
