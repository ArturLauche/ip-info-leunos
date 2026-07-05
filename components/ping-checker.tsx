"use client";

import { type Locale } from "@/lib/i18n";
import { unwrapApiResponse } from "@/lib/api/client";
import { getToolTranslation } from "@/lib/tool-i18n";
import { EmptyState } from "@/components/empty-state";
import { ErrorPanel } from "@/components/error-panel";
import { Badge } from "@/components/ui/badge";
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
  CircleCheck,
  Loader2,
  LockKeyhole,
  Radar,
  ServerCrash,
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

const MODE_DEFAULT_PORTS: Record<Exclude<PingMode, "database">, number> = {
  tcp: 80,
  udp: 53,
  eb: 443,
};

// Any port that a mode/database preset could have filled in automatically.
// If the current port is one of these, we assume the user has not customised
// it and it is safe to swap when the mode or database type changes.
const AUTO_FILLED_PORTS = new Set<number>([
  ...Object.values(MODE_DEFAULT_PORTS),
  ...Object.values(DB_DEFAULT_PORTS).filter((value) => value > 0),
]);

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
  const [showDetails, setShowDetails] = useState(false);
  const requestSeq = useRef(0);
  // Values we last pushed into the URL ourselves via router.replace on submit.
  // Lets the sync effect distinguish our own URL update (which must not cancel
  // the in-flight request) from external navigation (command palette, links).
  const selfSubmitted = useRef<{ target: string; port: string; mode: PingMode } | null>(null);
  const t = getToolTranslation(locale);

  // Sync the URL-backed fields when they change on the same route (e.g. the
  // command palette navigating /ping → /ping?target=…); the component stays
  // mounted, so prop changes would otherwise be ignored. Also invalidate any
  // in-flight request and clear stale output so an old result can't linger or
  // land after the target changed.
  useEffect(() => {
    const self = selfSubmitted.current;
    if (
      self &&
      self.target === initialTarget &&
      self.port === initialPort &&
      self.mode === initialMode
    ) {
      // This prop change is the echo of our own submit — keep the request alive.
      selfSubmitted.current = null;
      return;
    }

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

    const portIsAutoFilled = AUTO_FILLED_PORTS.has(Number(port)) || port.trim() === "";

    if (nextMode === "database") {
      if (portIsAutoFilled) setPort(String(DB_DEFAULT_PORTS[databaseType]));
      return;
    }

    setUseAuth(false);
    if (portIsAutoFilled) {
      setPort(String(MODE_DEFAULT_PORTS[nextMode]));
    }
  };

  const onDatabaseTypeChange = (nextType: DatabaseType) => {
    setDatabaseType(nextType);
    if (mode === "database" && (AUTO_FILLED_PORTS.has(Number(port)) || port.trim() === "")) {
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
    setShowDetails(false);

    selfSubmitted.current = { target, port, mode };
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
      <form onSubmit={onSubmit}>
        <Card className="gap-0 overflow-hidden py-0">
          <div className="flex flex-col gap-5 p-5">
            <div className="flex flex-col gap-2.5">
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
              <div className="flex flex-col gap-2">
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

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ping-target">{t.pingTargetHost}</Label>
                <Input
                  id="ping-target"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  placeholder="example.com"
                  autoComplete="off"
                  spellCheck={false}
                  className="font-mono"
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
                  className="font-mono"
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
                  className="font-mono"
                />
              </div>
            </div>

            {mode === "database" && (
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
            )}

            {mode === "database" && useAuth && (
              <div className="grid gap-4 sm:grid-cols-2">
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
          </div>

          <div className="flex flex-col gap-3 border-t bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{t.pingPlan}:</span>{" "}
              <span className="break-all">{effectiveSummary}</span>
            </p>
            <Button
              type="submit"
              disabled={loading}
              className="w-full shrink-0 sm:w-auto sm:min-w-44"
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
          </div>
        </Card>
      </form>

      {!loading && !error && !result && (
        <EmptyState
          icon={Radar}
          title={t.pingEmptyTitle}
          description={t.pingEmptyDescription}
        />
      )}

      {error && <ErrorPanel message={error} />}

      {result && (
        <Card className="tool-reveal gap-0 overflow-hidden py-0">
          <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-5 py-3.5">
            {result.ok ? (
              <CircleCheck className="size-4 shrink-0 text-success" />
            ) : (
              <ServerCrash className="size-4 shrink-0 text-destructive" />
            )}
            <p className="text-sm font-semibold text-foreground">
              {result.ok ? t.pingStatusSuccess : t.pingStatusFailed}
            </p>
            <Badge
              variant={result.ok ? "success" : "destructive"}
              className="ml-auto font-mono tabular-nums"
            >
              <Timer className="size-3" aria-hidden="true" />
              {result.latencyMs} ms
            </Badge>
          </div>

          <div className="flex flex-col gap-4 p-5">
            <p className="text-sm leading-relaxed text-foreground">{result.message}</p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.pingModeLabel}
                </p>
                <p className="mt-1 font-mono text-sm text-foreground uppercase">
                  {result.mode === "database" ? t.pingModeDatabase : result.mode}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.pingLatencyLabel}
                </p>
                <p className="mt-1 font-mono text-sm text-foreground tabular-nums">
                  {result.latencyMs} ms
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.pingTargetLabel}
                </p>
                <p className="mt-1 font-mono text-sm break-all text-foreground">
                  {result.target}:{result.port}
                </p>
              </div>
            </div>

            {result.details && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => setShowDetails((value) => !value)}
                >
                  {showDetails ? t.pingHideDetails : t.pingShowDetails}
                </Button>
                {showDetails && (
                  <pre className="max-h-96 overflow-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs text-foreground">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
