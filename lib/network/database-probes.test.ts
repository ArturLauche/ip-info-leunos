import net from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";
import { probeDatabase, type DatabaseAuth, type DatabaseType } from "./database-probes";

const servers: net.Server[] = [];
const sockets = new Set<net.Socket>();

const REDIS_PING = "*1\r\n$4\r\nPING\r\n";

afterEach(async () => {
  for (const socket of sockets) socket.destroy();
  sockets.clear();

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
});

describe("Redis unauthenticated probe", () => {
  it("reports a +PONG reply as a healthy Redis", async () => {
    const { port, received } = await listenScripted(["+PONG\r\n"]);

    const result = await probeLocal("redis", port);

    expect(received).toEqual([REDIS_PING]);
    expect(result).toMatchObject({
      ok: true,
      messageKey: "db_protocol_ok",
      messageParams: { database: "Redis" },
      details: { databaseType: "redis", stage: "protocol", protocolSignal: "pong" },
    });
  });

  it("buffers a split reply until the terminating CRLF arrives", async () => {
    const server = await listen((socket) => {
      socket.once("data", () => writeSplitResponse(socket, Buffer.from("+PONG\r\n"), 3));
    });

    const result = await probeLocal("redis", server.port);

    expect(result).toMatchObject({ ok: true, details: { protocolSignal: "pong" } });
  });

  it("does not classify a reply that never receives its CRLF", async () => {
    const { port } = await listenScripted(["+PONG"]);

    const result = await probeLocal("redis", port, { timeoutMs: 300 });

    expect(result).toMatchObject({ ok: false, messageKey: "db_protocol_failed" });
    expect(result.message).toContain("timeout after 300ms");
  });

  it("reports -NOAUTH as reachable but requiring authentication", async () => {
    const { port } = await listenScripted(["-NOAUTH Authentication required.\r\n"]);

    const result = await probeLocal("redis", port);

    expect(result).toMatchObject({
      ok: true,
      messageKey: "db_protocol_ok",
      messageParams: { database: "Redis" },
      details: { databaseType: "redis", stage: "protocol", protocolSignal: "auth-required" },
    });
    expect(result.message).toMatch(/requires authentication/i);
  });

  it("treats the legacy -ERR operation not permitted reply as authentication required", async () => {
    const { port } = await listenScripted(["-ERR operation not permitted\r\n"]);

    const result = await probeLocal("redis", port);

    expect(result).toMatchObject({ ok: true, details: { protocolSignal: "auth-required" } });
  });

  it("reports any other error reply as reachable but failed", async () => {
    const { port } = await listenScripted(["-ERR max number of clients reached\r\n"]);

    const result = await probeLocal("redis", port);

    expect(result).toMatchObject({
      ok: false,
      messageKey: "db_protocol_failed",
      messageParams: { database: "Redis" },
      details: { databaseType: "redis", stage: "protocol", protocolSignal: "error-reply" },
    });
    expect(result.message).toContain("max number of clients reached");
  });

  it("keeps long error text bounded and free of control characters", async () => {
    const { port } = await listenScripted([`-ERR bad\u001b[31m ${"x".repeat(1_000)}\r\n`]);

    const result = await probeLocal("redis", port);

    expect(result.ok).toBe(false);
    expect(result.message).toContain("bad?[31m");
    expect(result.message).not.toContain("\u001b");
    expect(result.message.length).toBeLessThan(300);
  });

  it("rejects a reply that is not RESP", async () => {
    const { port } = await listenScripted(["HTTP/1.1 400 Bad Request\r\n"]);

    const result = await probeLocal("redis", port);

    expect(result).toMatchObject({ ok: false, messageKey: "db_protocol_failed" });
    expect(result.message).toContain("Unexpected Redis response");
  });
});

describe("Redis authenticated probe", () => {
  const auth: DatabaseAuth = { enabled: true, password: "secret" };

  it("sends AUTH then PING and reports success", async () => {
    const { port, received } = await listenScripted(["+OK\r\n", "+PONG\r\n"]);

    const result = await probeLocal("redis", port, { auth });

    expect(received).toEqual(["*2\r\n$4\r\nAUTH\r\n$6\r\nsecret\r\n", REDIS_PING]);
    expect(result).toMatchObject({
      ok: true,
      messageKey: "db_auth_ok",
      details: { databaseType: "redis", stage: "auth" },
    });
  });

  it("sends the username for ACL-style authentication", async () => {
    const { port, received } = await listenScripted(["+OK\r\n", "+PONG\r\n"]);

    const result = await probeLocal("redis", port, {
      auth: { enabled: true, username: "admin", password: "secret" },
    });

    expect(received[0]).toBe("*3\r\n$4\r\nAUTH\r\n$5\r\nadmin\r\n$6\r\nsecret\r\n");
    expect(result.ok).toBe(true);
  });

  it("reports a rejected password and never sends PING", async () => {
    const { port, received } = await listenScripted([
      "-WRONGPASS invalid username-password pair or user is disabled.\r\n",
    ]);

    const result = await probeLocal("redis", port, { auth });

    expect(received).toHaveLength(1);
    expect(result).toMatchObject({ ok: false, messageKey: "db_auth_failed" });
    expect(result.messageParams?.error).toContain("-WRONGPASS");
  });

  it("requires a password", async () => {
    const { port, received } = await listenScripted([]);

    const result = await probeLocal("redis", port, { auth: { enabled: true } });

    expect(received).toEqual([]);
    expect(result).toMatchObject({ ok: false, messageKey: "db_auth_failed" });
    expect(result.message).toBe("Password is required for Redis authenticated check.");
  });

  it("stops after AUTH and PING when the server keeps answering +OK", async () => {
    const received: string[] = [];
    const server = await listen((socket) => {
      socket.on("data", (data) => {
        received.push(data.toString("utf8"));
        socket.write("+OK\r\n");
      });
    });

    const started = Date.now();
    const result = await probeLocal("redis", server.port, { auth, timeoutMs: 300 });
    const elapsed = Date.now() - started;
    await delay(50);

    expect(elapsed).toBeLessThan(2_500);
    expect(received).toEqual(["*2\r\n$4\r\nAUTH\r\n$6\r\nsecret\r\n", REDIS_PING]);
    expect(result).toMatchObject({ ok: false, messageKey: "db_auth_failed" });
    expect(result.message).toContain("Unexpected Redis response");
  });

  it("fails fast on a reply that is neither +OK nor an error", async () => {
    const { port } = await listenScripted(["$5\r\nhello\r\n"]);

    const result = await probeLocal("redis", port, { auth, timeoutMs: 2_000 });

    expect(result).toMatchObject({ ok: false, messageKey: "db_auth_failed" });
    expect(result.message).toContain("Unexpected Redis response");
    expect(result.latencyMs).toBeLessThan(1_500);
  });

  it("accepts AUTH and PING replies delivered in a single segment", async () => {
    const { port } = await listenScripted(["+OK\r\n+PONG\r\n"]);

    const result = await probeLocal("redis", port, { auth });

    expect(result).toMatchObject({ ok: true, messageKey: "db_auth_ok" });
  });

  it("does not accept a +PONG that arrives before AUTH was acknowledged", async () => {
    const { port } = await listenScripted(["+PONG\r\n"]);

    const result = await probeLocal("redis", port, { auth });

    expect(result).toMatchObject({ ok: false, messageKey: "db_auth_failed" });
    expect(result.message).toContain("Unexpected Redis response");
  });

  it("bounds a reply stream that never terminates", async () => {
    const server = await listen((socket) => {
      socket.once("data", () => flood(socket));
    });

    const result = await probeLocal("redis", server.port, { auth, timeoutMs: 5_000 });

    expect(result).toMatchObject({ ok: false, messageKey: "db_auth_failed" });
    expect(result.message).toContain("size limit");
    expect(result.latencyMs).toBeLessThan(2_500);
  });

  it("enforces the absolute deadline against a peer that drips bytes during the auth exchange", async () => {
    const server = await listen((socket) => {
      socket.once("data", () => drip(socket, "+"));
    });

    const started = Date.now();
    const result = await probeLocal("redis", server.port, { auth, timeoutMs: 400 });
    const elapsed = Date.now() - started;

    expect(result).toMatchObject({ ok: false, messageKey: "db_auth_failed" });
    expect(result.message).toBe("Redis auth probe timeout after 400ms.");
    expect(elapsed).toBeLessThan(2_500);
  });
});

describe("probe lifetime and response bounds", () => {
  it("enforces the absolute deadline against a peer that drips bytes before any reply", async () => {
    const server = await listen((socket) => {
      socket.once("data", () => drip(socket, "x"));
    });

    const started = Date.now();
    const result = await probeLocal("redis", server.port, { timeoutMs: 400 });
    const elapsed = Date.now() - started;

    expect(result).toMatchObject({ ok: false, messageKey: "db_protocol_failed" });
    expect(result.message).toContain("Probe timeout after 400ms.");
    expect(elapsed).toBeLessThan(2_500);
  });

  it("fails fast and drops the connection when a peer floods bytes without a terminator", async () => {
    const server = await listen((socket) => {
      socket.once("data", () => flood(socket));
    });

    const started = Date.now();
    const result = await probeLocal("redis", server.port, { timeoutMs: 5_000 });
    const elapsed = Date.now() - started;

    expect(result).toMatchObject({ ok: false, messageKey: "db_protocol_failed" });
    expect(result.message).toContain("size limit");
    expect(result.details?.maxBytes).toBeLessThanOrEqual(65_536);
    expect(elapsed).toBeLessThan(2_500);
    await vi.waitFor(() => expect(sockets.size).toBe(0), { timeout: 2_000 });
  });

  it("validates a reply even when the peer sends far more than the response limit", async () => {
    const server = await listen((socket) => {
      socket.once("data", () => socket.write(`+PONG\r\n${"x".repeat(100_000)}`));
    });

    const result = await probeLocal("redis", server.port);

    expect(result).toMatchObject({ ok: true, details: { protocolSignal: "pong" } });
  });

  it("still buffers a MongoDB reply of several KiB within the limit", async () => {
    const server = await listen((socket) => {
      socket.once("data", () => socket.end(mongoReply(9_000)));
    });

    const result = await probeLocal("mongodb", server.port);

    expect(result).toMatchObject({ ok: true, details: { opCode: 2013, messageLength: 9_000 } });
  });

  it("gives up on a MongoDB reply whose declared length can never fit", async () => {
    const server = await listen((socket) => {
      socket.once("data", () => socket.write(mongoReply(5_000_000, 70_000)));
    });

    const result = await probeLocal("mongodb", server.port, { timeoutMs: 5_000 });

    expect(result).toMatchObject({ ok: false, messageKey: "db_protocol_failed" });
    expect(result.message).toContain("size limit");
    expect(result.latencyMs).toBeLessThan(2_500);
  });

  it("times out when the peer never answers", async () => {
    const server = await listen(() => undefined);

    const result = await probeLocal("redis", server.port, { timeoutMs: 300 });

    expect(result).toMatchObject({ ok: false, messageKey: "db_protocol_failed" });
    expect(result.message).toContain("Probe timeout after 300ms.");
  });

  it("reports a connection closed before any reply", async () => {
    const server = await listen((socket) => {
      socket.once("data", () => socket.end());
    });

    const result = await probeLocal("redis", server.port);

    expect(result).toMatchObject({
      ok: false,
      messageKey: "db_protocol_failed",
      details: { receivedBytes: 0 },
    });
    expect(result.message).toContain("closed before a complete response");
  });
});

describe("MySQL handshake probe", () => {
  it("accepts a protocol version 10 handshake", async () => {
    const server = await listen((socket) => socket.end(mysqlHandshakePacket()));

    const result = await probeLocal("mysql", server.port);

    expect(result).toMatchObject({
      ok: true,
      messageKey: "db_protocol_ok",
      details: { databaseType: "mysql", stage: "protocol", protocolVersion: 10 },
    });
  });

  it("does not report an error packet as a healthy handshake", async () => {
    const packet = mysqlErrorPacket(
      1129,
      "Host '203.0.113.9' is blocked because of many connection errors; unblock with 'mysqladmin flush-hosts'",
    );
    const server = await listen((socket) => socket.end(packet));

    const result = await probeLocal("mysql", server.port);

    expect(result).toMatchObject({
      ok: false,
      messageKey: "db_protocol_failed",
      messageParams: { database: "MySQL" },
      details: { databaseType: "mysql", stage: "protocol", protocolSignal: "error-packet", errorCode: 1129 },
    });
    expect(result.message).toContain("1129");
    expect(result.message).toContain("is blocked because of many connection errors");
  });

  it("strips the SQLSTATE marker from an error packet and buffers it when split", async () => {
    const packet = mysqlErrorPacket(1040, "Too many connections", "08004");
    const server = await listen((socket) => writeSplitResponse(socket, packet, 6));

    const result = await probeLocal("mysql", server.port);

    expect(result).toMatchObject({ ok: false, details: { protocolSignal: "error-packet", errorCode: 1040 } });
    expect(result.message).toContain("error 1040 instead of a handshake: Too many connections");
  });

  it("keeps text that only looks like a SQLSTATE marker", async () => {
    // A pre-4.1 server has no SQLSTATE, and its message may itself start with "#".
    const legacy = mysqlErrorPacket(1045, "#legacy servers print this verbatim");
    const short = mysqlErrorPacket(1040, "#AB");
    const legacyServer = await listen((socket) => socket.end(legacy));
    const shortServer = await listen((socket) => socket.end(short));

    const legacyResult = await probeLocal("mysql", legacyServer.port);
    const shortResult = await probeLocal("mysql", shortServer.port);

    expect(legacyResult.message).toContain("instead of a handshake: #legacy servers print this verbatim");
    expect(shortResult.message).toContain("instead of a handshake: #AB");
  });

  it.each([
    ["an unsupported protocol version", mysqlPacket(Buffer.from([0x09, 0x00, 0x00, 0x00, 0x00, 0x00]))],
    ["an SSH banner", Buffer.from("SSH-2.0-OpenSSH_9.6\r\n")],
  ])("rejects %s", async (_label, payload) => {
    const server = await listen((socket) => socket.end(payload));

    const result = await probeLocal("mysql", server.port);

    expect(result).toMatchObject({ ok: false, messageKey: "db_protocol_failed" });
    expect(result.message).toContain("Unexpected MySQL handshake payload");
  });
});

describe("PostgreSQL and generic probes", () => {
  it.each([
    ["S", "ssl-accepted"],
    ["N", "ssl-rejected"],
  ])("accepts an SSLRequest answered with %s", async (reply, protocolSignal) => {
    const received: Buffer[] = [];
    const server = await listen((socket) => {
      socket.once("data", (data) => {
        received.push(data);
        socket.end(reply);
      });
    });

    const result = await probeLocal("postgres", server.port);

    expect(received.map((data) => [data.readInt32BE(0), data.readInt32BE(4)])).toEqual([[8, 80877103]]);
    expect(result).toMatchObject({
      ok: true,
      messageKey: "db_protocol_ok",
      details: { databaseType: "postgres", stage: "protocol", protocolSignal },
    });
  });

  it("rejects a reply that is not a PostgreSQL SSL answer", async () => {
    const server = await listen((socket) => {
      socket.once("data", () => socket.end("HTTP/1.1 400 Bad Request\r\n"));
    });

    const result = await probeLocal("postgres", server.port);

    expect(result).toMatchObject({ ok: false, messageKey: "db_protocol_failed" });
    expect(result.message).toContain("Unexpected PostgreSQL handshake response");
  });

  it("reports plain TCP reachability for the generic type", async () => {
    const server = await listen(() => undefined);

    const result = await probeLocal("generic", server.port);

    expect(result).toMatchObject({
      ok: true,
      messageKey: "db_tcp_ok",
      messageParams: { database: "Generic" },
      details: { databaseType: "generic", stage: "tcp" },
    });
  });

  it("reports a closed port as a connectivity failure", async () => {
    const result = await probeLocal("generic", await closedPort());

    expect(result).toMatchObject({
      ok: false,
      messageKey: "db_connect_failed",
      details: { databaseType: "generic", stage: "tcp", code: "ECONNREFUSED" },
    });
  });

  it("does not run authenticated checks for databases other than Redis", async () => {
    const result = await probeLocal("mysql", 3306, { auth: { enabled: true, password: "secret" } });

    expect(result).toMatchObject({
      ok: false,
      messageKey: "db_auth_unsupported",
      details: { databaseType: "mysql", stage: "auth" },
    });
  });
});

function writeSplitResponse(socket: net.Socket, response: Buffer, splitAt: number) {
  socket.write(response.subarray(0, splitAt));
  setTimeout(() => {
    socket.end(response.subarray(splitAt));
  }, 5);
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function probeLocal(
  databaseType: DatabaseType,
  port: number,
  options: { timeoutMs?: number; auth?: DatabaseAuth } = {},
) {
  return probeDatabase({
    target: "127.0.0.1",
    databaseType,
    port,
    timeoutMs: options.timeoutMs ?? 1_000,
    auth: options.auth ?? {},
  });
}

/** Answers the nth received write with replies[n] and records everything the probe sends. */
async function listenScripted(replies: string[]) {
  const received: string[] = [];
  const { port } = await listen((socket) => {
    socket.on("data", (data) => {
      const reply = replies[received.length];
      received.push(data.toString("utf8"));
      if (reply !== undefined) socket.write(reply);
    });
  });

  return { port, received };
}

function drip(socket: net.Socket, byte: string) {
  const timer = setInterval(() => socket.write(byte), 100);
  socket.once("close", () => clearInterval(timer));
}

function flood(socket: net.Socket) {
  const chunk = Buffer.alloc(8_192, 0x41);
  const timer = setInterval(() => socket.write(chunk), 1);
  socket.once("close", () => clearInterval(timer));
}

function mongoReply(declaredLength: number, sentBytes = declaredLength) {
  const reply = Buffer.alloc(sentBytes);
  reply.writeInt32LE(declaredLength, 0);
  reply.writeInt32LE(1, 4);
  reply.writeInt32LE(1, 8);
  reply.writeInt32LE(2013, 12);
  return reply;
}

function mysqlPacket(payload: Buffer, sequenceId = 0) {
  const header = Buffer.alloc(4);
  header.writeUIntLE(payload.length, 0, 3);
  header.writeUInt8(sequenceId, 3);
  return Buffer.concat([header, payload]);
}

function mysqlHandshakePacket() {
  return mysqlPacket(
    Buffer.concat([
      Buffer.from([0x0a]),
      Buffer.from("8.0.36\0", "latin1"),
      // Connection id, auth data, capabilities, charset, status and reserved bytes.
      Buffer.alloc(4 + 8 + 1 + 2 + 1 + 2 + 2 + 1 + 10 + 13),
      Buffer.from("mysql_native_password\0", "latin1"),
    ]),
  );
}

function mysqlErrorPacket(code: number, text: string, sqlState?: string) {
  return mysqlPacket(
    Buffer.concat([
      Buffer.from([0xff, code & 0xff, code >> 8]),
      Buffer.from(sqlState ? `#${sqlState}` : "", "latin1"),
      Buffer.from(text, "utf8"),
    ]),
  );
}

async function closedPort() {
  const server = net.createServer();
  const port = await new Promise<number>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Test server did not bind to a TCP port."));
        return;
      }

      resolve(address.port);
    });
  });
  await new Promise<void>((resolve) => server.close(() => resolve()));

  return port;
}

function listen(onConnection: (socket: net.Socket) => void) {
  const server = net.createServer((socket) => {
    sockets.add(socket);
    socket.on("error", () => undefined);
    socket.once("close", () => sockets.delete(socket));
    onConnection(socket);
  });
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
