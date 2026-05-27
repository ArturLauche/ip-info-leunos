import net from "node:net";

export type DatabaseType = "postgres" | "mysql" | "redis" | "mongodb" | "mssql" | "generic";

export interface DatabaseAuth {
  enabled?: boolean;
  username?: string;
  password?: string;
  database?: string;
}

export type DatabaseProbeResult = {
  ok: boolean;
  latencyMs: number;
  message: string;
  details?: Record<string, unknown>;
};

export const DB_DEFAULT_PORTS: Record<DatabaseType, number> = {
  postgres: 5432,
  mysql: 3306,
  redis: 6379,
  mongodb: 27017,
  mssql: 1433,
  generic: 0,
};

type SocketValidation = {
  ok: boolean;
  message: string;
  details?: Record<string, unknown>;
};

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
      message: `${databaseType} connectivity failed: ${base.message}`,
      details: { databaseType, stage: "tcp", ...(base.details || {}) },
    };
  }

  if (databaseType === "postgres") {
    const probe = await postgresProbe(target, port, timeoutMs);
    return {
      ok: probe.ok,
      latencyMs: Date.now() - started,
      message: probe.ok
        ? "PostgreSQL server responded to a pre-auth handshake probe."
        : `PostgreSQL probe failed: ${probe.message}`,
      details: { databaseType, stage: "protocol", ...(probe.details || {}) },
    };
  }

  if (databaseType === "mysql") {
    const probe = await mysqlProbe(target, port, timeoutMs);
    return {
      ok: probe.ok,
      latencyMs: Date.now() - started,
      message: probe.ok
        ? "MySQL server sent a pre-auth handshake packet."
        : `MySQL probe failed: ${probe.message}`,
      details: { databaseType, stage: "protocol", ...(probe.details || {}) },
    };
  }

  if (databaseType === "redis") {
    const probe = await redisProbe(target, port, timeoutMs);
    return {
      ok: probe.ok,
      latencyMs: Date.now() - started,
      message: probe.ok
        ? "Redis responded to a PING probe (no authentication credentials used)."
        : `Redis probe failed: ${probe.message}`,
      details: { databaseType, stage: "protocol", ...(probe.details || {}) },
    };
  }

  if (databaseType === "mongodb") {
    const probe = await mongodbProbe(target, port, timeoutMs);
    return {
      ok: probe.ok,
      latencyMs: Date.now() - started,
      message: probe.ok
        ? "MongoDB server responded to a hello probe."
        : `MongoDB probe failed: ${probe.message}`,
      details: { databaseType, stage: "protocol", ...(probe.details || {}) },
    };
  }

  if (databaseType === "mssql") {
    const probe = await mssqlProbe(target, port, timeoutMs);
    return {
      ok: probe.ok,
      latencyMs: Date.now() - started,
      message: probe.ok
        ? "MS SQL Server responded to a TDS pre-login probe."
        : `MS SQL Server probe failed: ${probe.message}`,
      details: { databaseType, stage: "protocol", ...(probe.details || {}) },
    };
  }

  return {
    ...base,
    latencyMs: Date.now() - started,
    message: `${databaseType} TCP port is reachable. Protocol-level pre-auth probe is not implemented for this type.`,
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
  validate: (data: Buffer) => SocketValidation,
): Promise<DatabaseProbeResult> {
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
    socket.once("timeout", () => finish(false, `Probe timeout after ${timeoutMs}ms.`));
    socket.once("error", (error) => {
      finish(false, `Probe failed: ${error.message}`, {
        code: (error as NodeJS.ErrnoException).code || "UNKNOWN",
      });
    });
    socket.once("close", () => finish(false, "Probe connection closed before a response was received."));
    socket.once("data", (chunk) => {
      const validated = validate(chunk);
      finish(validated.ok, validated.message, validated.details);
    });

    socket.connect(port, target, () => {
      if (payload) socket.write(payload);
    });
  });
}

async function postgresProbe(target: string, port: number, timeoutMs: number) {
  const sslRequest = Buffer.alloc(8);
  sslRequest.writeInt32BE(8, 0);
  sslRequest.writeInt32BE(80877103, 4);

  return socketProbe(target, port, timeoutMs, sslRequest, (data) => {
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
    const protocolVersion = data[4];
    if (typeof protocolVersion === "number" && protocolVersion > 0) {
      return {
        ok: true,
        message: "MySQL handshake packet received.",
        details: { protocolVersion },
      };
    }

    return {
      ok: false,
      message: "Unexpected MySQL handshake payload.",
      details: { receivedBytes: data.length },
    };
  });
}

async function redisProbe(target: string, port: number, timeoutMs: number) {
  return socketProbe(target, port, timeoutMs, Buffer.from("*1\r\n$4\r\nPING\r\n"), (data) => {
    const text = data.toString("utf8").trim();
    if (text.startsWith("+PONG") || text.startsWith("-NOAUTH") || text.startsWith("-ERR")) {
      return {
        ok: true,
        message: "Redis command response received.",
        details: { preview: text.slice(0, 80) },
      };
    }

    return {
      ok: false,
      message: "Unexpected Redis response.",
      details: { preview: text.slice(0, 80) },
    };
  });
}

async function mongodbProbe(target: string, port: number, timeoutMs: number) {
  return socketProbe(target, port, timeoutMs, buildMongoHelloMessage(), (data) => {
    if (data.length < 16) {
      return {
        ok: false,
        message: "MongoDB response was shorter than a wire message header.",
        details: { receivedBytes: data.length },
      };
    }

    const messageLength = data.readInt32LE(0);
    const opCode = data.readInt32LE(12);

    if (messageLength >= 16 && [1, 2013].includes(opCode)) {
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
    if (data.length < 8) {
      return {
        ok: false,
        message: "TDS response was shorter than a packet header.",
        details: { receivedBytes: data.length },
      };
    }

    const packetType = data[0];
    const packetLength = data.readUInt16BE(2);

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
      details: { databaseType, ...(probe.details || {}) },
    }));
  }

  return {
    ok: false,
    latencyMs: Date.now() - started,
    message:
      "Authenticated checks are currently implemented for Redis only in this environment. Use unauthenticated protocol check for other database types.",
    details: { databaseType, stage: "auth" },
  };
}

function redisAuthProbe(target: string, port: number, timeoutMs: number, auth: DatabaseAuth) {
  return new Promise<SocketValidation>((resolve) => {
    const socket = new net.Socket();
    const username = auth.username || "";
    const password = auth.password || "";
    let settled = false;
    let buffer = "";

    const finish = (ok: boolean, message: string, details?: Record<string, unknown>) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ ok, message, details });
    };

    socket.setTimeout(timeoutMs);
    socket.once("timeout", () => finish(false, `Redis auth probe timeout after ${timeoutMs}ms.`));
    socket.once("error", (error) => finish(false, `Redis auth probe failed: ${error.message}`));
    socket.once("close", () => finish(false, "Redis auth probe connection closed before completion."));

    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8");

      if (buffer.includes("\r\n")) {
        if (buffer.startsWith("+OK")) {
          socket.write("*1\r\n$4\r\nPING\r\n");
          buffer = "";
          return;
        }

        if (buffer.startsWith("+PONG")) {
          finish(true, "Authenticated Redis connection succeeded.", { stage: "auth", preview: "+PONG" });
          return;
        }

        if (buffer.startsWith("-")) {
          finish(false, `Redis auth failed: ${buffer.trim()}`, { stage: "auth" });
        }
      }
    });

    socket.connect(port, target, () => {
      if (!password) {
        finish(false, "Password is required for Redis authenticated check.", { stage: "auth" });
        return;
      }
      socket.write(buildRedisAuthCommand(username, password));
    });
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
