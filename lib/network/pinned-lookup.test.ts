import net from "node:net";
import { once } from "node:events";
import { describe, expect, it, vi } from "vitest";
import { createPinnedLookup } from "./pinned-lookup";

describe("pinned socket lookup", () => {
  it("restricts family-specific lookups to the validated pool", () => {
    const lookup = createPinnedLookup(["1.1.1.1", "2606:4700:4700::1111"]);
    const callback = vi.fn();
    lookup("ignored.example", { family: 6 }, callback);
    expect(callback).toHaveBeenLastCalledWith(null, "2606:4700:4700::1111", 6);
    createPinnedLookup(["1.1.1.1"])("ignored.example", { family: 6 }, callback);
    expect(callback).toHaveBeenLastCalledWith(expect.objectContaining({ code: "ENOTFOUND" }), "");
  });

  it("connects to a later pinned address when the first refuses the connection", async () => {
    // Loopback addresses isolate this transport test from public DNS/networking.
    // Only the second address has a listener; production callers validate first.
    const server = net.createServer((socket) => socket.end("WHOIS available\r\n"));
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const port = (server.address() as net.AddressInfo).port;
    const socket = net.createConnection({
      host: "whois.invalid", port, autoSelectFamily: true,
      lookup: createPinnedLookup(["127.0.0.2", "127.0.0.1"]),
    });
    socket.setTimeout(2000, () => socket.destroy(new Error("Test connection stalled")));
    let reply = "";
    socket.setEncoding("utf8");
    socket.on("data", (chunk) => { reply += chunk; });
    try {
      await once(socket, "end");
      expect(reply).toBe("WHOIS available\r\n");
      expect(socket.autoSelectFamilyAttemptedAddresses).toEqual([
        `127.0.0.2:${port}`, `127.0.0.1:${port}`,
      ]);
    } finally {
      socket.destroy();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
