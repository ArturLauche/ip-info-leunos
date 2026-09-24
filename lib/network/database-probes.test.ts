import net from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { probeDatabase } from "./database-probes";

const servers: net.Server[] = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        }),
    ),
  );
});

describe("database protocol probes", () => {
  it("runs a MongoDB hello probe instead of stopping at TCP reachability", async () => {
    const server = await listen((socket) => {
      socket.once("data", (data) => {
        expect(data.readInt32LE(12)).toBe(2013);

        const response = Buffer.alloc(21);
        response.writeInt32LE(response.length, 0);
        response.writeInt32LE(2, 4);
        response.writeInt32LE(data.readInt32LE(4), 8);
        response.writeInt32LE(2013, 12);
        socket.end(response);
      });
    });

    const result = await probeDatabase({
      target: "127.0.0.1",
      databaseType: "mongodb",
      port: server.port,
      timeoutMs: 1_000,
      auth: {},
    });

    expect(result).toMatchObject({
      ok: true,
      details: {
        databaseType: "mongodb",
        stage: "protocol",
        opCode: 2013,
      },
    });
  });

  it("buffers split MongoDB wire protocol responses before validation", async () => {
    const server = await listen((socket) => {
      socket.once("data", (data) => {
        expect(data.readInt32LE(12)).toBe(2013);

        const response = Buffer.alloc(21);
        response.writeInt32LE(response.length, 0);
        response.writeInt32LE(2, 4);
        response.writeInt32LE(data.readInt32LE(4), 8);
        response.writeInt32LE(2013, 12);
        writeSplitResponse(socket, response, 5);
      });
    });

    const result = await probeDatabase({
      target: "127.0.0.1",
      databaseType: "mongodb",
      port: server.port,
      timeoutMs: 1_000,
      auth: {},
    });

    expect(result).toMatchObject({
      ok: true,
      details: {
        databaseType: "mongodb",
        stage: "protocol",
        opCode: 2013,
        messageLength: 21,
      },
    });
  });

  it("runs an MS SQL Server TDS pre-login probe instead of stopping at TCP reachability", async () => {
    const server = await listen((socket) => {
      socket.once("data", (data) => {
        expect(data[0]).toBe(0x12);

        const response = Buffer.alloc(8);
        response.writeUInt8(0x04, 0);
        response.writeUInt8(0x01, 1);
        response.writeUInt16BE(response.length, 2);
        socket.end(response);
      });
    });

    const result = await probeDatabase({
      target: "127.0.0.1",
      databaseType: "mssql",
      port: server.port,
      timeoutMs: 1_000,
      auth: {},
    });

    expect(result).toMatchObject({
      ok: true,
      details: {
        databaseType: "mssql",
        stage: "protocol",
        packetType: "0x04",
      },
    });
  });

  it("buffers split MS SQL Server TDS pre-login responses before validation", async () => {
    const server = await listen((socket) => {
      socket.once("data", (data) => {
        expect(data[0]).toBe(0x12);

        const response = Buffer.alloc(12);
        response.writeUInt8(0x04, 0);
        response.writeUInt8(0x01, 1);
        response.writeUInt16BE(response.length, 2);
        writeSplitResponse(socket, response, 3);
      });
    });

    const result = await probeDatabase({
      target: "127.0.0.1",
      databaseType: "mssql",
      port: server.port,
      timeoutMs: 1_000,
      auth: {},
    });

    expect(result).toMatchObject({
      ok: true,
      details: {
        databaseType: "mssql",
        stage: "protocol",
        packetType: "0x04",
        packetLength: 12,
      },
    });
  });

  it("keeps authenticated Redis probing functional", async () => {
    const server = await listen((socket) => {
      socket.on("data", (data) => {
        const text = data.toString("utf8");
        if (text.includes("AUTH")) {
          socket.write("+OK\r\n");
          return;
        }
        if (text.includes("PING")) {
          socket.end("+PONG\r\n");
        }
      });
    });

    const result = await probeDatabase({
      target: "127.0.0.1",
      databaseType: "redis",
      port: server.port,
      timeoutMs: 1_000,
      auth: { enabled: true, password: "secret" },
    });

    expect(result).toMatchObject({
      ok: true,
      messageKey: "db_auth_ok",
      details: { databaseType: "redis", stage: "auth", preview: "+PONG" },
    });
  });

  it("bounds authenticated Redis responses without returning response text", async () => {
    const server = await listen((socket) => {
      socket.on("error", () => {});
      socket.once("data", () => {
        socket.end(Buffer.concat([
          Buffer.from("-ERR "),
          Buffer.alloc(70_000, 120),
          Buffer.from("\r\n"),
        ]));
      });
    });

    const result = await probeDatabase({
      target: "127.0.0.1",
      databaseType: "redis",
      port: server.port,
      timeoutMs: 1_000,
      auth: { enabled: true, password: "secret" },
    });

    expect(result).toMatchObject({
      ok: false,
      message: "Redis auth probe response exceeded the public response size limit.",
      details: { databaseType: "redis", stage: "auth", maxBytes: 64_000 },
    });
    expect(result.details?.receivedBytes).toBeGreaterThan(64_000);
    expect(result.message).not.toContain("x".repeat(1_000));
  });
});

function writeSplitResponse(socket: net.Socket, response: Buffer, splitAt: number) {
  socket.write(response.subarray(0, splitAt));
  setTimeout(() => {
    socket.end(response.subarray(splitAt));
  }, 5);
}

function listen(onConnection: (socket: net.Socket) => void) {
  const server = net.createServer(onConnection);
  servers.push(server);

  return new Promise<{ port: number }>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Test server did not bind to a TCP port."));
        return;
      }

      resolve({ port: address.port });
    });
  });
}
