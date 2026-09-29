import net from "node:net";
import type { DatabaseType } from "@/lib/ping";
export { DB_DEFAULT_PORTS, type DatabaseType } from "@/lib/ping";

export interface DatabaseAuth {
  enabled?: boolean;
  username?: string;
  password?: string;
  database?: string;
}

export type PingMessageKey =
  | "tcp_ok"
  | "tcp_timeout"
  | "tcp_failed"
  | "udp_sent"
  | "udp_response"
  | "udp_failed"
  | "eb_http_ok"
  | "eb_no_http"
  | "eb_tcp_failed"
  | "db_connect_failed"
  | "db_protocol_ok"
  | "db_protocol_failed"
  | "db_tcp_ok"
  | "db_auth_unsupported"
  | "db_auth_ok"
  | "db_auth_failed";

export type PingMessageParams = Record<string, string | number>;

export type DatabaseProbeResult = {
  ok: boolean;
  latencyMs: number;
  message: string;
  messageKey?: PingMessageKey;
  messageParams?: PingMessageParams;
  details?: Record<string, unknown>;
};

const DB_DISPLAY_NAMES: Record<DatabaseType, string> = {
  postgres: "PostgreSQL",
  mysql: "MySQL",
  redis: "Redis",
  mongodb: "MongoDB",
  mssql: "MS SQL Server",
  generic: "Generic",
};

export function databaseDisplayName(databaseType: DatabaseType): string {
  return DB_DISPLAY_NAMES[databaseType] ?? databaseType;
}

type SocketValidation = {
  ok: boolean;
  message: string;
  details?: Record<string, unknown>;
};
type SocketValidationResult = SocketValidation | null;

type ProbeIo = {
  write: (payload: Buffer | string) => void;
};

type SocketExchange = {
  /** Prefix for the timeout, transport-error and size-limit messages. */
  label: string;
  /** Runs once connected; a result settles the probe immediately. */
  onConnect?: (io: ProbeIo) => SocketValidationResult;
  /** Runs on every chunk with all bytes received so far; null means "need more data". */
  onData: (data: Buffer, io: ProbeIo) => SocketValidationResult;
};

// Real pre-auth replies are small; the largest is a MongoDB hello from a big replica set (a few KiB).
const MAX_SOCKET_PROBE_RESPONSE_BYTES = 64_000;
const REPLY_PREVIEW_CHARS = 80;
const REPLY_MESSAGE_CHARS = 200;
const REDIS_PING_COMMAND = Buffer.from("*1\r\n$4\r\nPING\r\n");
const MYSQL_HANDSHAKE_PROTOCOL_VERSION = 0x0a;
const MYSQL_ERROR_PACKET_MARKER = 0xff;

export async function probeDatabase({
  target,
  databaseType,
  port,
  timeoutMs,
  auth,
}: {
  target: string;
  databaseType: DatabaseType;
  port: number;
  timeoutMs: number;
  auth: DatabaseAuth;
}): Promise<DatabaseProbeResult> {
  if (auth.enabled) {
    return databaseAuthProbe(target, databaseType, port, timeoutMs, auth);
  }

  const started = Date.now();
  const base = await tcpConnectivityProbe(target, port, timeoutMs);

  if (!base.ok) {
    return {
      ...base,
      latencyMs: Date.now() - started,
      message: `${databaseDisplayName(databaseType)} connectivity failed: ${base.message}`,
      messageKey: "db_connect_failed",
      messageParams: { database: databaseDisplayName(databaseType), error: base.message },
      details: { databaseType, stage: "tcp", ...(base.details || {}) },
    };
  }

  if (databaseType === "postgres") {
    const probe = await postgresProbe(target, port, timeoutMs);
    const database = databaseDisplayName(databaseType);
    return {
      ok: probe.ok,
      latencyMs: Date.now() - started,
      message: probe.ok
        ? "PostgreSQL server responded to a pre-auth handshake probe."
        : `PostgreSQL probe failed: ${probe.message}`,
      messageKey: probe.ok ? "db_protocol_ok" : "db_protocol_failed",
      messageParams: probe.ok ? { database } : { database, error: probe.message },
      details: { databaseType, stage: "protocol", ...(probe.details || {}) },
    };
  }

  if (databaseType === "mysql") {
    const probe = await mysqlProbe(target, port, timeoutMs);
    const database = databaseDisplayName(databaseType);
    return {
      ok: probe.ok,
      latencyMs: Date.now() - started,
      message: probe.ok
        ? "MySQL server sent a pre-auth handshake packet."
        : `MySQL probe failed: ${probe.message}`,
      messageKey: probe.ok ? "db_protocol_ok" : "db_protocol_failed",
      messageParams: probe.ok ? { database } : { database, error: probe.message },
      details: { databaseType, stage: "protocol", ...(probe.details || {}) },
    };
  }

  if (databaseType === "redis") {
    const probe = await redisProbe(target, port, timeoutMs);
    const database = databaseDisplayName(databaseType);
    const authRequired = probe.details?.protocolSignal === "auth-required";
    const okMessage = authRequired
      ? "Redis is reachable but requires authentication (no authentication credentials used)."
      : "Redis responded to a PING probe (no authentication credentials used).";
    return {
      ok: probe.ok,
      latencyMs: Date.now() - started,
      message: probe.ok ? okMessage : `Redis probe failed: ${probe.message}`,
      messageKey: probe.ok ? "db_protocol_ok" : "db_protocol_failed",
      messageParams: probe.ok ? { database } : { database, error: probe.message },
      details: { databaseType, stage: "protocol", ...(probe.details || {}) },
    };
  }

  if (databaseType === "mongodb") {
    const probe = await mongodbProbe(target, port, timeoutMs);
    const database = databaseDisplayName(databaseType);
    return {
      ok: probe.ok,
      latencyMs: Date.now() - started,
      message: probe.ok
        ? "MongoDB server responded to a hello probe."
        : `MongoDB probe failed: ${probe.message}`,
      messageKey: probe.ok ? "db_protocol_ok" : "db_protocol_failed",
      messageParams: probe.ok ? { database } : { database, error: probe.message },
      details: { databaseType, stage: "protocol", ...(probe.details || {}) },
    };
  }

  if (databaseType === "mssql") {
    const probe = await mssqlProbe(target, port, timeoutMs);
    const database = databaseDisplayName(databaseType);
    return {
      ok: probe.ok,
      latencyMs: Date.now() - started,
      message: probe.ok
        ? "MS SQL Server responded to a TDS pre-login probe."
        : `MS SQL Server probe failed: ${probe.message}`,
      messageKey: probe.ok ? "db_protocol_ok" : "db_protocol_failed",
      messageParams: probe.ok ? { database } : { database, error: probe.message },
      details: { databaseType, stage: "protocol", ...(probe.details || {}) },
    };
  }

  return {
    ...base,
    latencyMs: Date.now() - started,
    message: `${databaseDisplayName(databaseType)} TCP port is reachable. Protocol-level pre-auth probe is not implemented for this type.`,
    messageKey: "db_tcp_ok",
    messageParams: { database: databaseDisplayName(databaseType) },
    details: {
      databaseType,
      stage: "tcp",
      note: "This confirms network reachability to the port, not authentication or full DB readiness.",
    },
  };
}

function tcpConnectivityProbe(target: string, port: number, timeoutMs: number): Promise<DatabaseProbeResult> {
  return new Promise((resolve) => {
    const started = Date.now();
    const socket = new net.Socket();
    let settled = false;

    const finish = (ok: boolean, message: string, details?: Record<string, unknown>) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ ok, latencyMs: Date.now() - started, message, details });
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true, "TCP connection established."));
    socket.once("timeout", () => finish(false, `TCP timeout after ${timeoutMs}ms.`));
    socket.once("error", (error) => {
      finish(false, `TCP connection failed: ${error.message}`, {
        code: (error as NodeJS.ErrnoException).code || "UNKNOWN",
      });
    });

    socket.connect(port, target);
  });
}

function socketProbe(
  target: string,
  port: number,
  timeoutMs: number,
  payload: Buffer | null,
  validate: (data: Buffer) => SocketValidationResult,
): Promise<DatabaseProbeResult> {
  return runSocketProbe(target, port, timeoutMs, {
    label: "Probe",
    onConnect: (io) => {
      if (payload) io.write(payload);
      return null;
    },
    onData: validate,
  });
}

/**
 * Single lifecycle for every protocol probe: one absolute deadline, one bounded response buffer
 * and one settle path, so no individual probe can be held open or grown without limit by the peer.
 */
function runSocketProbe(
  target: string,
  port: number,
  timeoutMs: number,
  { label, onConnect, onData }: SocketExchange,
): Promise<DatabaseProbeResult> {
  return new Promise((resolve) => {
    const started = Date.now();
    const socket = new net.Socket();
    // Fixed-size buffer: memory stays bounded and chunks are never re-concatenated per event.
    const received = Buffer.alloc(MAX_SOCKET_PROBE_RESPONSE_BYTES);
    let bufferedBytes = 0;
    let receivedBytes = 0;
    let settled = false;

    const finish = (ok: boolean, message: string, details?: Record<string, unknown>) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      socket.destroy();
      resolve({ ok, latencyMs: Date.now() - started, message, details });
    };

    // Handlers parse untrusted bytes; a bug there must fail the probe instead of crashing the process.
    const settleWith = (run: () => SocketValidationResult) => {
      try {
        const result = run();
        if (!result) return false;
        finish(result.ok, result.message, result.details);
      } catch (error) {
        finish(false, `${label} failed: ${error instanceof Error ? error.message : String(error)}`);
      }
      return true;
    };

    const io: ProbeIo = {
      write: (payload) => {
        if (!settled) socket.write(payload);
      },
    };
    const onTimeout = () => finish(false, `${label} timeout after ${timeoutMs}ms.`);

    // The socket timeout below is an idle timer that every received chunk resets, so a peer
    // that keeps sending could hold it open forever. This deadline never resets.
    const deadline = setTimeout(onTimeout, timeoutMs);

    socket.setTimeout(timeoutMs);
    socket.once("timeout", onTimeout);
    socket.on("error", (error) => {
      finish(false, `${label} failed: ${error.message}`, {
        code: (error as NodeJS.ErrnoException).code || "UNKNOWN",
      });
    });
    socket.once("close", () => {
      finish(false, `${label} connection closed before a complete response was received.`, {
        receivedBytes,
      });
    });
    socket.on("data", (chunk) => {
      if (settled) return;
      receivedBytes += chunk.length;
      const stored = Math.min(chunk.length, received.length - bufferedBytes);
      chunk.copy(received, bufferedBytes, 0, stored);
      bufferedBytes += stored;

      if (settleWith(() => onData(received.subarray(0, bufferedBytes), io))) return;

      // A full buffer with no verdict can never improve: more bytes cannot be stored.
      if (bufferedBytes === received.length) {
        finish(false, `${label} response exceeded the public response size limit.`, {
          maxBytes: received.length,
          receivedBytes,
        });
      }
    });

    socket.connect(port, target, () => {
      settleWith(() => onConnect?.(io) ?? null);
    });
  });
}

async function postgresProbe(target: string, port: number, timeoutMs: number) {
  const sslRequest = Buffer.alloc(8);
  sslRequest.writeInt32BE(8, 0);
  sslRequest.writeInt32BE(80877103, 4);

  return socketProbe(target, port, timeoutMs, sslRequest, (data) => {
    if (data.length < 1) return null;

    const responseCode = String.fromCharCode(data[0] || 0);
    if (responseCode === "S" || responseCode === "N") {
      return {
        ok: true,
        message: "PostgreSQL handshake response received.",
        details: { protocolSignal: responseCode === "S" ? "ssl-accepted" : "ssl-rejected" },
      };
    }

    return {
      ok: false,
      message: "Unexpected PostgreSQL handshake response.",
      details: { firstByte: data[0] ?? null },
    };
  });
}

async function mysqlProbe(target: string, port: number, timeoutMs: number) {
  return socketProbe(target, port, timeoutMs, null, (data) => {
    if (data.length < 5) return null;

    const protocolVersion = data[4];
    if (protocolVersion === MYSQL_HANDSHAKE_PROTOCOL_VERSION) {
      return {
        ok: true,
        message: "MySQL handshake packet received.",
        details: { protocolVersion },
      };
    }

    if (protocolVersion === MYSQL_ERROR_PACKET_MARKER) return parseMysqlErrorPacket(data);

    return {
      ok: false,
      message: "Unexpected MySQL handshake payload.",
      details: { receivedBytes: data.length },
    };
  });
}

/** A server that refuses the connection sends an error packet (blocked host, too many connections…) instead of the handshake. */
function parseMysqlErrorPacket(data: Buffer): SocketValidationResult {
  const packetLength = data.readUIntLE(0, 3);
  if (data.length < 4 + packetLength) return null;

  // Payload: 0xff, 2-byte error code, optional "#" + 5-char SQLSTATE, then the message text.
  const payload = data.subarray(4, 4 + packetLength);
  if (payload.length < 3) {
    return {
      ok: false,
      message: "MySQL server sent a malformed error packet instead of a handshake.",
      details: { protocolSignal: "error-packet" },
    };
  }

  const errorCode = payload.readUInt16LE(1);
  const textOffset = payload[3] === 0x23 ? 9 : 3;
  const text = previewText(payload.toString("utf8", textOffset), REPLY_MESSAGE_CHARS).trim();

  return {
    ok: false,
    message: `MySQL server sent error ${errorCode} instead of a handshake${text ? `: ${text}` : "."}`,
    details: { protocolSignal: "error-packet", errorCode },
  };
}

async function redisProbe(target: string, port: number, timeoutMs: number) {
  return socketProbe(target, port, timeoutMs, REDIS_PING_COMMAND, (data) => {
    const reply = readRespLine(data);
    return reply && classifyRedisPingReply(reply.line);
  });
}

/** Reads one CRLF-terminated RESP line starting at `from`; null while the terminator has not arrived. */
function readRespLine(data: Buffer, from = 0) {
  const end = data.indexOf("\r\n", from);
  if (end === -1) return null;

  return { line: data.toString("utf8", from, end), next: end + 2 };
}

/** Server-controlled text is bounded and stripped of control/format characters before it reaches results. */
function previewText(text: string, maxChars: number) {
  return text.slice(0, maxChars).replace(/\p{C}/gu, "?");
}

function classifyRedisPingReply(line: string): SocketValidation {
  const preview = previewText(line, REPLY_PREVIEW_CHARS);

  if (line.startsWith("+PONG")) {
    return {
      ok: true,
      message: "Redis command response received.",
      details: { protocolSignal: "pong", preview },
    };
  }

  // Reachable and speaking RESP, but a password is needed (older servers answer "-ERR operation not permitted").
  if (/^-(?:NOAUTH\b|ERR\b.*(?:operation not permitted|auth(?:entication)?\s+required))/i.test(line)) {
    return {
      ok: true,
      message: "Redis requires authentication.",
      details: { protocolSignal: "auth-required", preview },
    };
  }

  if (line.startsWith("-")) {
    return {
      ok: false,
      message: `Redis replied with an error: ${previewText(line, REPLY_MESSAGE_CHARS)}`,
      details: { protocolSignal: "error-reply", preview },
    };
  }

  return {
    ok: false,
    message: "Unexpected Redis response.",
    details: { preview },
  };
}

async function mongodbProbe(target: string, port: number, timeoutMs: number) {
  return socketProbe(target, port, timeoutMs, buildMongoHelloMessage(), (data) => {
    if (data.length < 16) return null;

    const messageLength = data.readInt32LE(0);
    if (messageLength < 16) {
      return {
        ok: false,
        message: "MongoDB response declared an invalid wire message length.",
        details: { messageLength },
      };
    }

    if (data.length < messageLength) return null;

    const opCode = data.readInt32LE(12);

    if ([1, 2013].includes(opCode)) {
      return {
        ok: true,
        message: "MongoDB wire protocol response received.",
        details: { opCode, messageLength },
      };
    }

    return {
      ok: false,
      message: "Unexpected MongoDB wire protocol response.",
      details: { opCode, messageLength },
    };
  });
}

async function mssqlProbe(target: string, port: number, timeoutMs: number) {
  return socketProbe(target, port, timeoutMs, buildMssqlPreloginPacket(), (data) => {
    if (data.length < 8) return null;

    const packetType = data[0];
    const packetLength = data.readUInt16BE(2);
    if (packetLength < 8) {
      return {
        ok: false,
        message: "TDS response declared an invalid packet length.",
        details: { packetLength },
      };
    }

    if (data.length < packetLength) return null;

    if ((packetType === 0x04 || packetType === 0x12) && packetLength >= 8) {
      return {
        ok: true,
        message: "TDS pre-login response received.",
        details: { packetType: `0x${packetType.toString(16).padStart(2, "0")}`, packetLength },
      };
    }

    return {
      ok: false,
      message: "Unexpected TDS pre-login response.",
      details: { packetType: `0x${packetType.toString(16).padStart(2, "0")}`, packetLength },
    };
  });
}

function databaseAuthProbe(
  target: string,
  databaseType: DatabaseType,
  port: number,
  timeoutMs: number,
  auth: DatabaseAuth,
): Promise<DatabaseProbeResult> | DatabaseProbeResult {
  const started = Date.now();

  if (databaseType === "redis") {
    return redisAuthProbe(target, port, timeoutMs, auth).then((probe) => ({
      ok: probe.ok,
      latencyMs: Date.now() - started,
      message: probe.message,
      messageKey: probe.ok ? ("db_auth_ok" as const) : ("db_auth_failed" as const),
      messageParams: probe.ok ? undefined : { error: probe.message },
      details: { databaseType, ...(probe.details || {}) },
    }));
  }

  return {
    ok: false,
    latencyMs: Date.now() - started,
    message:
      "Authenticated checks are currently implemented for Redis only in this environment. Use unauthenticated protocol check for other database types.",
    messageKey: "db_auth_unsupported",
    messageParams: { database: databaseDisplayName(databaseType) },
    details: { databaseType, stage: "auth" },
  };
}

function redisAuthProbe(target: string, port: number, timeoutMs: number, auth: DatabaseAuth) {
  const username = auth.username || "";
  const password = auth.password || "";
  let awaitingPing = false;
  let consumed = 0;

  return runSocketProbe(target, port, timeoutMs, {
    label: "Redis auth probe",
    onConnect: (io) => {
      if (!password) {
        return {
          ok: false,
          message: "Password is required for Redis authenticated check.",
          details: { stage: "auth" },
        };
      }

      io.write(buildRedisAuthCommand(username, password));
      return null;
    },
    // Exactly two replies are ever consumed (AUTH, then PING), so a peer cannot keep the exchange going.
    onData: (data, io) => {
      for (;;) {
        const reply = readRespLine(data, consumed);
        if (!reply) return null;
        consumed = reply.next;

        if (!awaitingPing && reply.line.startsWith("+OK")) {
          awaitingPing = true;
          io.write(REDIS_PING_COMMAND);
          continue;
        }

        if (awaitingPing && reply.line.startsWith("+PONG")) {
          return {
            ok: true,
            message: "Authenticated Redis connection succeeded.",
            details: { stage: "auth", preview: "+PONG" },
          };
        }

        if (reply.line.startsWith("-")) {
          return {
            ok: false,
            message: `Redis auth failed: ${previewText(reply.line, REPLY_MESSAGE_CHARS)}`,
            details: { stage: "auth" },
          };
        }

        return {
          ok: false,
          message: "Unexpected Redis response.",
          details: { stage: "auth", preview: previewText(reply.line, REPLY_PREVIEW_CHARS) },
        };
      }
    },
  });
}

function buildRedisAuthCommand(username: string, password: string) {
  const parts = username ? ["AUTH", username, password] : ["AUTH", password];
  return encodeRespArray(parts);
}

function encodeRespArray(parts: string[]) {
  return parts
    .map((part, index) => {
      const prefix = index === 0 ? `*${parts.length}\r\n` : "";
      return `${prefix}$${Buffer.byteLength(part)}\r\n${part}\r\n`;
    })
    .join("");
}

function buildMongoHelloMessage() {
  const body = encodeBsonDocument({
    hello: 1,
    "$db": "admin",
  });
  const messageLength = 16 + 4 + 1 + body.length;
  const message = Buffer.alloc(messageLength);

  message.writeInt32LE(messageLength, 0);
  message.writeInt32LE(1, 4);
  message.writeInt32LE(0, 8);
  message.writeInt32LE(2013, 12);
  message.writeInt32LE(0, 16);
  message.writeUInt8(0, 20);
  body.copy(message, 21);

  return message;
}

function encodeBsonDocument(fields: Record<string, string | number>) {
  const elements: Buffer[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === "number") {
      const element = Buffer.alloc(1 + Buffer.byteLength(key) + 1 + 4);
      element.writeUInt8(0x10, 0);
      element.write(key, 1, "utf8");
      element.writeUInt8(0, 1 + Buffer.byteLength(key));
      element.writeInt32LE(value, 1 + Buffer.byteLength(key) + 1);
      elements.push(element);
      continue;
    }

    const valueBytes = Buffer.from(value, "utf8");
    const keyBytes = Buffer.from(key, "utf8");
    const element = Buffer.alloc(1 + keyBytes.length + 1 + 4 + valueBytes.length + 1);
    let offset = 0;
    element.writeUInt8(0x02, offset);
    offset += 1;
    keyBytes.copy(element, offset);
    offset += keyBytes.length;
    element.writeUInt8(0, offset);
    offset += 1;
    element.writeInt32LE(valueBytes.length + 1, offset);
    offset += 4;
    valueBytes.copy(element, offset);
    offset += valueBytes.length;
    element.writeUInt8(0, offset);
    elements.push(element);
  }

  const length = 4 + elements.reduce((sum, element) => sum + element.length, 0) + 1;
  const document = Buffer.alloc(length);
  document.writeInt32LE(length, 0);
  let offset = 4;

  for (const element of elements) {
    element.copy(document, offset);
    offset += element.length;
  }

  document.writeUInt8(0, offset);
  return document;
}

function buildMssqlPreloginPacket() {
  const payload = Buffer.from([
    0x01, 0x00, 0x06, 0x00, 0x01,
    0xff,
    0x02,
  ]);
  const packet = Buffer.alloc(8 + payload.length);

  packet.writeUInt8(0x12, 0);
  packet.writeUInt8(0x01, 1);
  packet.writeUInt16BE(packet.length, 2);
  packet.writeUInt16BE(0, 4);
  packet.writeUInt8(1, 6);
  packet.writeUInt8(0, 7);
  payload.copy(packet, 8);

  return packet;
}
