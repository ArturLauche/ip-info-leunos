"use client";

import { type Locale } from "@/lib/i18n";
import { unwrapApiResponse } from "@/lib/api/client";
import { getToolTranslation } from "@/lib/tool-i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  CircleCheck,
  Gauge,
  Info,
  Loader2,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PingResult | null>(null);
  const requestSeq = useRef(0);
  const t = getToolTranslation(locale);

  // Sync the URL-backed fields when they change on the same route (e.g. the
  // command palette navigating /ping → /ping?target=…); the component stays
  // mounted, so prop changes would otherwise be ignored. Also invalidate any
  // in-flight request and clear stale output so an old result can't linger or
  // land after the target changed.
  useEffect(() => {
    setTarget(initialTarget);
    setPort(initialPort);
    setMode(initialMode);
    requestSeq.current += 1;
    setLoading(false);
    setError(null);
    setResult(null);
  }, [initialTarget, initialPort, initialMode]);

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

  const onModeChange = (nextMode: PingMode) => {
    setMode(nextMode);

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

    const seq = ++requestSeq.current;
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
      if (seq === requestSeq.current) setResult(data);
    } catch (checkError) {
      if (seq === requestSeq.current) {
        setError((checkError as Error).message || t.pingNetworkError);
      }
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-start gap-2.5 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{t.pingPlan}:</span>{" "}
          {effectiveSummary}
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Card className="gap-5 py-5">
          <div className="flex flex-col gap-2.5 px-5">
            <Label>{t.pingTestMode}</Label>
            <Tabs value={mode} onValueChange={(value) => onModeChange(value as PingMode)}>
              <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-4">
                {(["tcp", "udp", "eb", "database"] as PingMode[]).map((value) => (
                  <TabsTrigger key={value} value={value} className="py-1.5">
                    {modeLabels[value]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground">{modeHelpers[mode]}</p>
          </div>

          {mode === "database" && (
            <div className="flex flex-col gap-2 px-5">
              <Label htmlFor="ping-db-type">{t.pingDatabaseType}</Label>
              <Select
                value={databaseType}
                onValueChange={(value) => onDatabaseTypeChange(value as DatabaseType)}
              >
                <SelectTrigger id="ping-db-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATABASE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="font-medium">{option.label}</span>
                      <span className="text-muted-foreground">
                        {getDatabaseOptionDetail(option.value, locale)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-4 px-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ping-target">{t.pingTargetHost}</Label>
              <Input
                id="ping-target"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                placeholder="example.com"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ping-port">{t.pingPort}</Label>
              <Input
                id="ping-port"
                value={port}
                onChange={(event) => setPort(event.target.value)}
                placeholder="443"
                inputMode="numeric"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ping-timeout">{t.pingTimeout}</Label>
              <Input
                id="ping-timeout"
                value={timeoutMs}
                onChange={(event) => setTimeoutMs(event.target.value)}
                placeholder="3000"
                inputMode="numeric"
              />
            </div>
          </div>

          {mode === "database" && (
            <div className="px-5">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                <span className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                  <LockKeyhole
                    className={
                      useAuth ? "size-4 text-primary" : "size-4 text-muted-foreground"
                    }
                  />
                  {t.pingUseAuth}
                </span>
                <Switch checked={useAuth} onCheckedChange={setUseAuth} />
              </label>
            </div>
          )}

          {mode === "database" && useAuth && (
            <div className="grid gap-4 px-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ping-username">{t.pingUsername}</Label>
                <Input
                  id="ping-username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ping-password">{t.pingPassword}</Label>
                <Input
                  id="ping-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="ping-database">{t.pingDatabaseOptional}</Label>
                <Input
                  id="ping-database"
                  value={database}
                  onChange={(event) => setDatabase(event.target.value)}
                  placeholder="postgres / admin / master"
                  autoComplete="off"
                />
              </div>
            </div>
          )}
        </Card>

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full sm:w-auto sm:self-start sm:min-w-48"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t.pingRunning}
            </>
          ) : (
            t.pingRunButton
          )}
        </Button>
      </form>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <Card className="gap-4 py-5">
          <p className="flex items-center gap-2 px-5 text-lg font-semibold text-foreground">
            {result.ok ? (
              <CircleCheck className="size-5 text-success" />
            ) : (
              <ServerCrash className="size-5 text-destructive" />
            )}
            {result.message}
          </p>

          <div className="grid grid-cols-1 gap-3 px-5 text-sm text-muted-foreground sm:grid-cols-3">
            <p className="flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              {t.pingModeLabel}:{" "}
              <span className="font-mono text-foreground">{result.mode}</span>
            </p>
            <p className="flex items-center gap-2">
              <Timer className="size-4 text-primary" />
              {t.pingLatencyLabel}:{" "}
              <span className="font-mono text-foreground">{result.latencyMs}ms</span>
            </p>
            <p className="flex items-center gap-2">
              <Gauge className="size-4 text-primary" />
              {t.pingTargetLabel}:{" "}
              <span className="font-mono break-all text-foreground">
                {result.target}:{result.port}
              </span>
            </p>
          </div>

          {result.details && (
            <div className="px-5">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <ShieldCheck className="size-4 text-primary" />
                {t.pingDetailsLabel}
              </p>
              <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
