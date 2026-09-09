/** Client-safe presets shared by the Ping form and socket implementation. */
export type PingMode = "tcp" | "udp" | "eb" | "database";
export type DatabaseType = "postgres" | "mysql" | "redis" | "mongodb" | "mssql" | "generic";

export const DB_DEFAULT_PORTS: Record<DatabaseType, number> = {
  postgres: 5432,
  mysql: 3306,
  redis: 6379,
  mongodb: 27017,
  mssql: 1433,
  generic: 0,
};

export const MODE_DEFAULT_PORTS: Record<Exclude<PingMode, "database">, number> = {
  tcp: 80,
  udp: 53,
  eb: 443,
};

export function defaultPingPort(mode: PingMode, databaseType: DatabaseType = "postgres"): string {
  const port = mode === "database" ? DB_DEFAULT_PORTS[databaseType] : MODE_DEFAULT_PORTS[mode];
  return port ? String(port) : "";
}

export function buildPingRequest(input: {
  mode: PingMode;
  target: string;
  port: string;
  timeoutMs: string;
  databaseType: DatabaseType;
  useAuth: boolean;
  username: string;
  password: string;
  database: string;
}) {
  return {
    mode: input.mode,
    target: input.target.trim(),
    port: Number(input.port),
    timeoutMs: Number(input.timeoutMs),
    databaseType: input.databaseType,
    ...(input.mode === "database" && input.useAuth ? {
      auth: {
        enabled: true,
        username: input.username,
        password: input.password,
        database: input.database,
      },
    } : {}),
  };
}
