import { NextResponse } from "next/server";

export const runtime = "edge";

type PingMode = "tcp" | "udp" | "eb" | "database";
type DatabaseType = "postgres" | "mysql" | "redis" | "mongodb" | "mssql" | "generic";

interface DatabaseAuth {
  enabled?: boolean;
}

interface PingRequest {
  mode?: PingMode;
  target?: string;
  port?: number;
  timeoutMs?: number;
  databaseType?: DatabaseType;
  auth?: DatabaseAuth;
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

async function endpointCheck(target: string, port: number, timeoutMs: number, mode: PingMode, databaseType?: DatabaseType) {
  const started = Date.now();
  const protocols = ["https", "http"] as const;

  for (const scheme of protocols) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(`${scheme}://${target}:${port}/`, {
        method: "HEAD",
        redirect: "manual",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timer);

      return {
        ok: true,
        mode,
        target,
        port,
        latencyMs: Date.now() - started,
        message: `Endpoint reachable via ${scheme.toUpperCase()} (status ${response.status}).`,
        details: { scheme, status: response.status, databaseType: databaseType || null },
      };
    } catch {
      // try next protocol
    }
  }

  return {
    ok: false,
    mode,
    target,
    port,
    latencyMs: Date.now() - started,
    message:
      mode === "database"
        ? "Database deep probes are not supported on Cloudflare Pages runtime; only HTTP(S)-reachable endpoints can be checked."
        : "No HTTP(S) response received from endpoint.",
    details: { databaseType: databaseType || null },
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

  if (!(["tcp", "udp", "eb", "database"] as const).includes(mode)) {
    return NextResponse.json({ error: "mode must be tcp, udp, eb, or database." }, { status: 400 });
  }

  if (mode === "udp") {
    return NextResponse.json(
      {
        ok: false,
        mode,
        target,
        port: payload.port || 0,
        latencyMs: 0,
        message: "UDP probes are not available on Cloudflare Pages runtime.",
      },
      { status: 501 },
    );
  }

  const databaseType = payload.databaseType || "generic";
  const defaultPort = mode === "database" ? DB_DEFAULT_PORTS[databaseType] || 0 : 0;
  const port = normalizePort(payload.port, defaultPort);

  if (!port) {
    return NextResponse.json({ error: "Please provide a valid port (1-65535)." }, { status: 400 });
  }

  if (mode === "database" && payload.auth?.enabled) {
    return NextResponse.json(
      {
        ok: false,
        mode,
        target,
        port,
        latencyMs: 0,
        message: "Authenticated database checks are not supported on Cloudflare Pages runtime.",
      },
      { status: 501 },
    );
  }

  const result = await endpointCheck(target, port, timeoutMs, mode, mode === "database" ? databaseType : undefined);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
