import dgram from "node:dgram";
import net from "node:net";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type PingMode = "tcp" | "udp" | "eb" | "database";
type DatabaseType = "postgres" | "mysql" | "redis" | "mongodb" | "mssql" | "generic";

interface PingRequest {
  mode?: PingMode;
  target?: string;
  port?: number;
  timeoutMs?: number;
  databaseType?: DatabaseType;
}

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

function normalizePort(value: number | undefined, fallback = 0): number {
  if (typeof value !== "number" || !Number.isInteger(value)) return fallback;
  if (value < 1 || value > 65535) return fallback;
  return value;
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
    const socket = dgram.createSocket("udp4");
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

async function ebPing(target: string, port: number, timeoutMs: number): Promise<PingResult> {
  const tcpResult = await tcpPing(target, port, timeoutMs);
  if (!tcpResult.ok) {
    return {
      ...tcpResult,
      mode: "eb",
      message: `EB check failed at TCP stage: ${tcpResult.message}`,
      details: { stage: "tcp", ...(tcpResult.details || {}) },
    };
  }

  const started = Date.now();
  const schemes = ["https", "http"];

  for (const scheme of schemes) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(`${scheme}://${target}:${port}/`, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timer);

      return {
        ok: true,
        mode: "eb",
        target,
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
    target,
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
      if (payload) {
        socket.write(payload);
      }
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

async function databasePing(
  target: string,
  databaseType: DatabaseType,
  port: number,
  timeoutMs: number,
): Promise<PingResult> {
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
  let payload: PingRequest;

  try {
    payload = (await request.json()) as PingRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const mode = payload.mode || "tcp";
  const target = sanitizeHost(payload.target || "");
  const timeoutMs = Math.min(Math.max(payload.timeoutMs || DEFAULT_TIMEOUT_MS, 500), 10000);

  if (!target) {
    return NextResponse.json({ error: "Please provide a target host or IP." }, { status: 400 });
  }

  if (!["tcp", "udp", "eb", "database"].includes(mode)) {
    return NextResponse.json({ error: "mode must be tcp, udp, eb, or database." }, { status: 400 });
  }

  const databaseType = payload.databaseType || "generic";
  const defaultPort = mode === "database" ? DB_DEFAULT_PORTS[databaseType] || 0 : 0;
  const port = normalizePort(payload.port, defaultPort);

  if (!port) {
    return NextResponse.json({ error: "Please provide a valid port (1-65535)." }, { status: 400 });
  }

  const result =
    mode === "tcp"
      ? await tcpPing(target, port, timeoutMs)
      : mode === "udp"
        ? await udpPing(target, port, timeoutMs)
        : mode === "eb"
          ? await ebPing(target, port, timeoutMs)
          : await databasePing(target, databaseType, port, timeoutMs);

  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
