import dgram from "node:dgram";
import net from "node:net";
import { z } from "zod";
import { apiError, apiOk, apiValidationError } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import {
  assertPublicTarget,
  fetchPublicUrl,
  isIPv6Address,
  TargetValidationError,
} from "@/lib/network/target";

export const runtime = "nodejs";

type PingMode = "tcp" | "udp" | "eb" | "database";
type DatabaseType = "postgres" | "mysql" | "redis" | "mongodb" | "mssql" | "generic";

interface DatabaseAuth {
  enabled?: boolean;
  username?: string;
  password?: string;
  database?: string;
}

interface PingRequest {
  mode?: PingMode;
  target?: string;
  port?: number;
  timeoutMs?: number;
  databaseType?: DatabaseType;
  auth?: DatabaseAuth;
}

const pingRequestSchema = z.object({
  mode: z.enum(["tcp", "udp", "eb", "database"]).default("tcp"),
  target: z.string().trim().min(1).max(253),
  port: z.coerce.number().int().min(1).max(65535).optional(),
  timeoutMs: z.coerce.number().int().min(500).max(10_000).default(3000),
  databaseType: z.enum(["postgres", "mysql", "redis", "mongodb", "mssql", "generic"]).default("generic"),
  auth: z
    .object({
      enabled: z.boolean().optional(),
      username: z.string().max(256).optional(),
      password: z.string().max(1024).optional(),
      database: z.string().max(256).optional(),
    })
    .optional(),
});

interface PingResult {
  ok: boolean;
  mode: PingMode;
  target: string;
  port: number;
  latencyMs: number;
  message: string;
  details?: Record<string, unknown>;
}

const DEFAULT_TIMEOUT_MS = 3000;
const DB_DEFAULT_PORTS: Record<DatabaseType, number> = {
  postgres: 5432,
  mysql: 3306,
  redis: 6379,
  mongodb: 27017,
  mssql: 1433,
  generic: 0,
};

function sanitizeHost(target: string) {
  return target.trim().replace(/^\[|\]$/g, "");
}

function formatHostForUrl(hostname: string) {
  return isIPv6Address(hostname) ? `[${hostname}]` : hostname;
}

function normalizePort(value: number | undefined, fallback = 0): number {
  if (typeof value !== "number" || !Number.isInteger(value)) return fallback;
  if (value < 1 || value > 65535) return fallback;
  return value;
}

function validatePublicPort(port: number) {
  const allowList = process.env.PUBLIC_ALLOWED_PING_PORTS?.split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 65535);

  if (allowList?.length && !allowList.includes(port)) {
    throw new TargetValidationError(
      "target_blocked",
      "This port is not enabled for public checks on this deployment.",
      403,
      { port, allowedPorts: allowList },
    );
  }
}

function tcpPing(target: string, port: number, timeoutMs: number): Promise<PingResult> {
  return new Promise((resolve) => {
    const started = Date.now();
    const socket = new net.Socket();
    let settled = false;

    const finish = (ok: boolean, message: string, details?: Record<string, unknown>) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ ok, mode: "tcp", target, port, latencyMs: Date.now() - started, message, details });
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

function udpPing(target: string, port: number, timeoutMs: number): Promise<PingResult> {
  return new Promise((resolve) => {
    const started = Date.now();
    const socket = dgram.createSocket(isIPv6Address(target) ? "udp6" : "udp4");
    let settled = false;

    const finish = (ok: boolean, message: string, details?: Record<string, unknown>) => {
      if (settled) return;
      settled = true;
      socket.close();
      resolve({ ok, mode: "udp", target, port, latencyMs: Date.now() - started, message, details });
    };

    const timer = setTimeout(() => {
      finish(true, "UDP packet sent. No ICMP error observed within timeout.", {
        note: "UDP is connectionless; success means packet dispatch without immediate error.",
      });
    }, timeoutMs);

    socket.once("error", (error) => {
      clearTimeout(timer);
      finish(false, `UDP probe failed: ${error.message}`, {
        code: (error as NodeJS.ErrnoException).code || "UNKNOWN",
      });
    });

    socket.once("message", (message, remote) => {
      clearTimeout(timer);
      finish(true, "UDP response received.", {
        bytes: message.length,
        from: `${remote.address}:${remote.port}`,
      });
    });

    socket.send(Buffer.from("ping"), port, target, (error) => {
      if (error) {
        clearTimeout(timer);
        finish(false, `UDP send failed: ${error.message}`);
      }
    });
  });
}

async function ebPing(displayTarget: string, connectionTarget: string, port: number, timeoutMs: number): Promise<PingResult> {
  const tcpResult = await tcpPing(connectionTarget, port, timeoutMs);
  if (!tcpResult.ok) {
    return {
      ...tcpResult,
      mode: "eb",
      target: displayTarget,
      message: `EB check failed at TCP stage: ${tcpResult.message}`,
      details: { stage: "tcp", ...(tcpResult.details || {}) },
    };
  }

  const started = Date.now();
  const schemes = ["https", "http"];

  for (const scheme of schemes) {
    try {
      const response = await fetchPublicUrl(`${scheme}://${formatHostForUrl(displayTarget)}:${port}/`, {
        method: "GET",
        cache: "no-store",
        timeoutMs,
        maxRedirects: 2,
        maxContentLengthBytes: 512_000,
      });

      return {
        ok: true,
        mode: "eb",
        target: displayTarget,
        port,
        latencyMs: Date.now() - started,
        message: `Endpoint reachable via ${scheme.toUpperCase()} (status ${response.status}).`,
        details: { stage: "http", scheme, status: response.status },
      };
    } catch {
      // try next scheme
    }
  }

  return {
    ok: true,
    mode: "eb",
    target: displayTarget,
    port,
    latencyMs: Date.now() - started,
    message: "TCP open, but no HTTP(S) response detected on this endpoint.",
    details: { stage: "http", status: "no-response" },
  };
}

function socketProbe(
  target: string,
  port: number,
  timeoutMs: number,
  payload: Buffer | null,
  validate: (data: Buffer) => { ok: boolean; message: string; details?: Record<string, unknown> },
): Promise<{ ok: boolean; latencyMs: number; message: string; details?: Record<string, unknown> }> {
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

function buildRedisAuthCommand(username: string, password: string) {
  if (username) {
    return `*3\r\n$4\r\nAUTH\r\n$${username.length}\r\n${username}\r\n$${password.length}\r\n${password}\r\n`;
  }

  return `*2\r\n$4\r\nAUTH\r\n$${password.length}\r\n${password}\r\n`;
}

async function redisAuthProbe(target: string, port: number, timeoutMs: number, auth: DatabaseAuth) {
  return new Promise<{ ok: boolean; message: string; details?: Record<string, unknown> }>((resolve) => {
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

async function databaseAuthPing(
  target: string,
  databaseType: DatabaseType,
  port: number,
  timeoutMs: number,
  auth: DatabaseAuth,
): Promise<PingResult> {
  const started = Date.now();

  if (databaseType === "redis") {
    const probe = await redisAuthProbe(target, port, timeoutMs, auth);
    return {
      ok: probe.ok,
      mode: "database",
      target,
      port,
      latencyMs: Date.now() - started,
      message: probe.message,
      details: { databaseType, ...(probe.details || {}) },
    };
  }

  return {
    ok: false,
    mode: "database",
    target,
    port,
    latencyMs: Date.now() - started,
    message:
      "Authenticated checks are currently implemented for Redis only in this environment. Use unauthenticated protocol check for other database types.",
    details: { databaseType, stage: "auth" },
  };
}

async function databasePing(
  target: string,
  databaseType: DatabaseType,
  port: number,
  timeoutMs: number,
  auth: DatabaseAuth,
): Promise<PingResult> {
  if (auth.enabled) {
    return databaseAuthPing(target, databaseType, port, timeoutMs, auth);
  }

  const started = Date.now();
  const base = await tcpPing(target, port, timeoutMs);

  if (!base.ok) {
    return {
      ...base,
      mode: "database",
      message: `${databaseType} connectivity failed: ${base.message}`,
      details: { databaseType, stage: "tcp", ...(base.details || {}) },
    };
  }

  if (databaseType === "postgres") {
    const probe = await postgresProbe(target, port, timeoutMs);
    return {
      ok: probe.ok,
      mode: "database",
      target,
      port,
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
      mode: "database",
      target,
      port,
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
      mode: "database",
      target,
      port,
      latencyMs: Date.now() - started,
      message: probe.ok
        ? "Redis responded to a PING probe (no authentication credentials used)."
        : `Redis probe failed: ${probe.message}`,
      details: { databaseType, stage: "protocol", ...(probe.details || {}) },
    };
  }

  return {
    ...base,
    mode: "database",
    message: `${databaseType} TCP port is reachable. Protocol-level pre-auth probe is not implemented for this type.`,
    details: {
      databaseType,
      stage: "tcp",
      note: "This confirms network reachability to the port, not authentication or full DB readiness.",
    },
  };
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "ping", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  let rawPayload: unknown;

  try {
    rawPayload = await request.json();
  } catch {
    return apiError("bad_request", "Invalid JSON body.", 400);
  }

  const parsedPayload = pingRequestSchema.safeParse(rawPayload);

  if (!parsedPayload.success) {
    return apiValidationError(parsedPayload.error);
  }

  const payload = parsedPayload.data satisfies PingRequest;
  const mode = payload.mode || "tcp";
  const timeoutMs = Math.min(Math.max(payload.timeoutMs || DEFAULT_TIMEOUT_MS, 500), 10000);

  const databaseType = payload.databaseType || "generic";
  const defaultPort = mode === "database" ? DB_DEFAULT_PORTS[databaseType] || 0 : 0;
  const port = normalizePort(payload.port, defaultPort);

  if (!port) {
    return apiError("bad_request", "Please provide a valid port (1-65535).", 400);
  }

  let target: string;
  let connectionTarget: string;

  try {
    validatePublicPort(port);
    const publicTarget = await assertPublicTarget(sanitizeHost(payload.target || ""));
    target = publicTarget.hostname;
    connectionTarget = publicTarget.addresses[0] || publicTarget.hostname;
  } catch (error) {
    if (error instanceof TargetValidationError) {
      return apiError(error.code, error.message, error.status, error.details);
    }

    return apiError("invalid_target", "Please provide a valid public target host or IP.", 400);
  }

  const result =
    mode === "tcp"
      ? { ...(await tcpPing(connectionTarget, port, timeoutMs)), target }
      : mode === "udp"
        ? { ...(await udpPing(connectionTarget, port, timeoutMs)), target }
        : mode === "eb"
          ? await ebPing(target, connectionTarget, port, timeoutMs)
          : { ...(await databasePing(connectionTarget, databaseType, port, timeoutMs, payload.auth || {})), target };

  return apiOk(result);
}
