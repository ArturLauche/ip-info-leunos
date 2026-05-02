"use client";

import { type Locale } from "@/lib/i18n";
import { unwrapApiResponse } from "@/lib/api/client";
import { getToolTranslation } from "@/lib/tool-i18n";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Check,
  ChevronDown,
  CircleCheck,
  Gauge,
  Info,
  LockKeyhole,
  ServerCrash,
  ShieldCheck,
  Timer,
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

const DB_DEFAULT_PORT_SET = new Set(Object.values(DB_DEFAULT_PORTS).filter((value) => value > 0));

const MODE_DEFAULT_PORTS: Record<Exclude<PingMode, "database">, number> = {
  tcp: 80,
  udp: 53,
  eb: 443,
};

const DATABASE_OPTIONS: Array<{ value: DatabaseType; label: string }> = [
  { value: "postgres", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "redis", label: "Redis" },
  { value: "mongodb", label: "MongoDB" },
  { value: "mssql", label: "MS SQL Server" },
  { value: "generic", label: "Generic TCP DB" },
];

const getDatabaseOptionDetail = (value: DatabaseType, locale: Locale) => {
  const defaultPort = DB_DEFAULT_PORTS[value];
  if (defaultPort) return `${defaultPort} / TCP`;
  return locale === "de" ? "Manueller Port" : "Custom port";
};

const inputClass =
  "h-11 rounded-lg border border-border bg-secondary/70 px-3 text-sm font-sans text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

interface PingCheckerProps {
  locale: Locale;
  initialTarget?: string;
  initialPort?: string;
  initialMode?: PingMode;
}

export function PingChecker({
  locale,
  initialTarget = "example.com",
  initialPort = "80",
  initialMode = "tcp",
}: PingCheckerProps) {
  const router = useRouter();
  const [mode, setMode] = useState<PingMode>(initialMode);
  const [databaseType, setDatabaseType] = useState<DatabaseType>("postgres");
  const [target, setTarget] = useState(initialTarget);
  const [port, setPort] = useState(initialPort);
  const [timeoutMs, setTimeoutMs] = useState("3000");
  const [useAuth, setUseAuth] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [database, setDatabase] = useState("");
  const [databaseMenuOpen, setDatabaseMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PingResult | null>(null);
  const databaseMenuRef = useRef<HTMLDivElement>(null);
  const t = getToolTranslation(locale);

  useEffect(() => {
    if (!databaseMenuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!databaseMenuRef.current?.contains(event.target as Node)) {
        setDatabaseMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDatabaseMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [databaseMenuOpen]);

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

  const selectedDatabase =
    DATABASE_OPTIONS.find((option) => option.value === databaseType) ?? DATABASE_OPTIONS[0];
  const selectedDatabaseDetail = getDatabaseOptionDetail(selectedDatabase.value, locale);

  const onModeChange = (nextMode: PingMode) => {
    setMode(nextMode);
    setDatabaseMenuOpen(false);

    if (nextMode === "database") {
      setPort(String(DB_DEFAULT_PORTS[databaseType]));
      return;
    }

    setUseAuth(false);
    if (DB_DEFAULT_PORT_SET.has(Number(port))) {
      setPort(String(MODE_DEFAULT_PORTS[nextMode]));
    }
  };

  const onDatabaseTypeChange = (nextType: DatabaseType) => {
    setDatabaseType(nextType);
    setDatabaseMenuOpen(false);
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
      ? `${selectedDatabase.label} ${t.pingCurrentPlanDbAuth} ${target}:${port}`
      : `${selectedDatabase.label} ${t.pingCurrentPlanDbProtocol} ${target}:${port}`;
  }, [mode, port, selectedDatabase.label, target, t, useAuth]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setResult(null);

    router.replace(
      `/ping?mode=${encodeURIComponent(mode)}&target=${encodeURIComponent(target)}&port=${encodeURIComponent(port)}`,
      { scroll: false },
    );

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

      const data = unwrapApiResponse<PingResult>(await response.json());
      setResult(data);
    } catch (checkError) {
      setError((checkError as Error).message || t.pingNetworkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 font-sans">
      <div className="rounded-xl border border-border/80 bg-card/70 p-4 text-sm text-muted-foreground">
        <p className="flex items-center gap-2 text-foreground">
          <Info className="h-4 w-4 text-primary" />
          {t.pingPlan}
        </p>
        <p className="mt-2 text-sm">{effectiveSummary}</p>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <fieldset className="md:col-span-2">
          <legend className="mb-2 text-sm font-medium text-foreground">{t.pingTestMode}</legend>
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
                      ? "border-primary bg-primary/15 text-foreground"
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

        {mode === "database" && (
          <div ref={databaseMenuRef} className="relative flex flex-col gap-2 text-sm text-foreground md:col-span-2">
            <span>{t.pingDatabaseType}</span>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={databaseMenuOpen}
              onClick={() => setDatabaseMenuOpen((open) => !open)}
              className="flex h-12 items-center justify-between gap-3 rounded-lg border border-border bg-secondary/70 px-3 text-left text-sm font-medium text-foreground transition hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{selectedDatabase.label}</span>
                <span className="text-xs font-normal text-muted-foreground">{selectedDatabaseDetail}</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                  databaseMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {databaseMenuOpen && (
              <div
                role="listbox"
                className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-[0_20px_50px_-20px_rgb(0_0_0_/_0.7)]"
              >
                {DATABASE_OPTIONS.map((option) => {
                  const active = option.value === databaseType;
                  const optionDetail = getDatabaseOptionDetail(option.value, locale);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => onDatabaseTypeChange(option.value)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition ${
                        active
                          ? "bg-primary/15 text-foreground"
                          : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                      }`}
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">{option.label}</span>
                        <span className="text-xs">{optionDetail}</span>
                      </span>
                      {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

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
          <input
            value={port}
            onChange={(event) => setPort(event.target.value)}
            placeholder="443"
            className={inputClass}
          />
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
          <button
            type="button"
            role="switch"
            aria-checked={useAuth}
            onClick={() => setUseAuth((enabled) => !enabled)}
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition md:col-span-2 ${
              useAuth
                ? "border-primary/80 bg-primary/15 text-foreground"
                : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <span
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition ${
                  useAuth ? "border-primary bg-primary" : "border-border bg-muted"
                }`}
              >
                <span
                  className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-foreground shadow transition-transform ${
                    useAuth ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </span>
              <span className="font-medium">{t.pingUseAuth}</span>
            </span>
            <LockKeyhole className={`h-4 w-4 shrink-0 ${useAuth ? "text-primary" : "text-muted-foreground"}`} />
          </button>
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
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4 rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
          <p className="flex items-center gap-2 text-lg font-semibold">
            {result.ok ? (
              <CircleCheck className="h-5 w-5 text-emerald-400" />
            ) : (
              <ServerCrash className="h-5 w-5 text-destructive" />
            )}
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
