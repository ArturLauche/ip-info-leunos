"use client";

import { type Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { FormEvent, useMemo, useState } from "react";
import {
  Activity,
  CircleCheck,
  ServerCrash,
  Timer,
  Info,
  Gauge,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

type PingMode = "tcp" | "udp" | "eb" | "database";
type DatabaseType = "postgres" | "mysql" | "redis" | "mongodb" | "mssql" | "generic";

interface PingResult {
  ok: boolean;
  mode: PingMode;
  target: string;
  port: number;
  latencyMs: number;
  message: string;
  details?: Record<string, unknown>;
}

const DB_DEFAULT_PORTS: Record<DatabaseType, number> = {
  postgres: 5432,
  mysql: 3306,
  redis: 6379,
  mongodb: 27017,
  mssql: 1433,
  generic: 0,
};

const inputClass =
  "h-11 rounded-lg border border-border bg-secondary/70 px-3 text-sm font-sans text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

interface PingCheckerProps {
  locale: Locale;
}

export function PingChecker({ locale }: PingCheckerProps) {
  const [mode, setMode] = useState<PingMode>("tcp");
  const [databaseType, setDatabaseType] = useState<DatabaseType>("postgres");
  const [target, setTarget] = useState("127.0.0.1");
  const [port, setPort] = useState("80");
  const [timeoutMs, setTimeoutMs] = useState("3000");
  const [useAuth, setUseAuth] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [database, setDatabase] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PingResult | null>(null);
  const t = getToolTranslation(locale);

  const modeLabels: Record<PingMode, string> = {
    tcp: "TCP",
    udp: "UDP",
    eb: "EB",
    database: t.pingModeDatabase,
  };

  const modeHelpers: Record<PingMode, string> = {
    tcp: t.pingModeHelperTcp,
    udp: t.pingModeHelperUdp,
    eb: t.pingModeHelperEb,
    database: t.pingModeHelperDatabase,
  };

  const onModeChange = (nextMode: PingMode) => {
    setMode(nextMode);
    if (nextMode === "database") setPort(String(DB_DEFAULT_PORTS[databaseType]));
    if (nextMode !== "database") setUseAuth(false);
  };

  const onDatabaseTypeChange = (nextType: DatabaseType) => {
    setDatabaseType(nextType);
    if (mode === "database") {
      const nextPort = DB_DEFAULT_PORTS[nextType];
      if (nextPort) setPort(String(nextPort));
    }
  };

  const effectiveSummary = useMemo(() => {
    if (mode === "tcp") return `${t.pingCurrentPlanTcp} ${target}:${port}`;
    if (mode === "udp") return `${t.pingCurrentPlanUdp} ${target}:${port}`;
    if (mode === "eb") return `${t.pingCurrentPlanEb} ${target}:${port}`;
    return useAuth
      ? `${databaseType} ${t.pingCurrentPlanDbAuth} ${target}:${port}`
      : `${databaseType} ${t.pingCurrentPlanDbProtocol} ${target}:${port}`;
  }, [databaseType, mode, port, target, t, useAuth]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ping", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode,
          target,
          port: Number(port),
          timeoutMs: Number(timeoutMs),
          databaseType,
          auth: {
            enabled: mode === "database" && useAuth,
            username,
            password,
            database,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || data.message || t.pingCheckFailed);
      } else {
        setResult(data as PingResult);
      }
    } catch {
      setError(t.pingNetworkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 font-sans">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-border/80 bg-card/70 p-4 text-sm text-muted-foreground md:col-span-2">
          <p className="flex items-center gap-2 text-foreground">
            <Info className="h-4 w-4 text-primary" />
            {t.pingPlan}
          </p>
          <p className="mt-2 text-sm">{effectiveSummary}</p>
        </div>

        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm text-muted-foreground">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Quick tip
          </p>
          <p className="mt-2 text-xs leading-relaxed">
            Start with TCP and a 3000ms timeout for stable baseline checks, then switch to UDP or EB for service-specific
            verification.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 rounded-2xl border border-border/80 bg-card/60 p-4 md:grid-cols-2 md:p-5">
        <fieldset className="md:col-span-2">
          <legend className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <WandSparkles className="h-4 w-4 text-primary" />
            {t.pingTestMode}
          </legend>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {(["tcp", "udp", "eb", "database"] as PingMode[]).map((value) => {
              const active = mode === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onModeChange(value)}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    active
                      ? "border-primary bg-primary/15 text-foreground shadow-sm"
                      : "border-border bg-secondary/60 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {modeLabels[value]}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{modeHelpers[mode]}</p>
        </fieldset>

        <label className="flex flex-col gap-2 text-sm text-foreground">
          {t.pingDatabaseType}
          <select
            value={databaseType}
            disabled={mode !== "database"}
            onChange={(event) => onDatabaseTypeChange(event.target.value as DatabaseType)}
            className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <option value="postgres">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="redis">Redis</option>
            <option value="mongodb">MongoDB</option>
            <option value="mssql">MS SQL Server</option>
            <option value="generic">Generic TCP DB</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-foreground">
          {t.pingTargetHost}
          <input
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder="example.com"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-foreground">
          {t.pingPort}
          <input value={port} onChange={(event) => setPort(event.target.value)} placeholder="443" className={inputClass} />
        </label>

        <label className="flex flex-col gap-2 text-sm text-foreground">
          {t.pingTimeout}
          <input
            value={timeoutMs}
            onChange={(event) => setTimeoutMs(event.target.value)}
            placeholder="3000"
            className={inputClass}
          />
        </label>

        {mode === "database" && (
          <label className="md:col-span-2 flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground">
            <input type="checkbox" checked={useAuth} onChange={(event) => setUseAuth(event.target.checked)} />
            {t.pingUseAuth}
          </label>
        )}

        {mode === "database" && useAuth && (
          <>
            <label className="flex flex-col gap-2 text-sm text-foreground">
              {t.pingUsername}
              <input value={username} onChange={(event) => setUsername(event.target.value)} className={inputClass} />
            </label>
            <label className="flex flex-col gap-2 text-sm text-foreground">
              {t.pingPassword}
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-foreground md:col-span-2">
              {t.pingDatabaseOptional}
              <input
                value={database}
                onChange={(event) => setDatabase(event.target.value)}
                placeholder="postgres / admin / master"
                className={inputClass}
              />
            </label>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t.pingRunning : t.pingRunButton}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      {result && (
        <div className="space-y-4 rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
          <p className="flex items-center gap-2 text-lg font-semibold">
            {result.ok ? <CircleCheck className="h-5 w-5 text-emerald-400" /> : <ServerCrash className="h-5 w-5 text-destructive" />}
            {result.message}
          </p>

          <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground md:grid-cols-3">
            <p className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              {t.pingModeLabel}: <span className="font-mono text-foreground">{result.mode}</span>
            </p>
            <p className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" />
              {t.pingLatencyLabel}: <span className="font-mono text-foreground">{result.latencyMs}ms</span>
            </p>
            <p className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" />
              {t.pingTargetLabel}: <span className="font-mono text-foreground">{result.target}:{result.port}</span>
            </p>
          </div>

          {result.details && (
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                {t.pingDetailsLabel}
              </p>
              <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/70 p-3 text-xs text-muted-foreground">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
