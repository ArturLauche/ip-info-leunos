"use client";

import { type Locale } from "@/lib/i18n";
import { unwrapApiResponse } from "@/lib/api/client";
import { getApiErrorMessage, getToolTranslation, type ToolTranslation } from "@/lib/tool-i18n";
import { formatTemplate } from "@/lib/format";
import type { PingMessageKey, PingMessageParams } from "@/lib/network/database-probes";
import { cn } from "@/lib/utils";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSegmentHighlight } from "@/hooks/use-segment-highlight";
import { useRouter } from "next/navigation";
import { FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
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
  messageKey?: PingMessageKey;
  messageParams?: PingMessageParams;
  details?: Record<string, unknown>;
}

function formatPingMessage(result: PingResult, t: ToolTranslation): string {
  const params = result.messageParams ?? {};
  switch (result.messageKey) {
    case "tcp_ok":
      return t.pingResultTcpOk;
    case "tcp_timeout":
      return formatTemplate(t.pingResultTcpTimeout, { timeoutMs: params.timeoutMs ?? "" });
    case "tcp_failed":
      return formatTemplate(t.pingResultTcpFailed, { error: params.error ?? "" });
    case "udp_sent":
      return formatTemplate(t.pingResultUdpSent, { timeoutMs: params.timeoutMs ?? "" });
    case "udp_response":
      return formatTemplate(t.pingResultUdpResponse, {
        from: params.from ?? "",
        bytes: params.bytes ?? "",
      });
    case "udp_failed":
      return formatTemplate(t.pingResultUdpFailed, { error: params.error ?? "" });
    case "eb_http_ok":
      return formatTemplate(t.pingResultEbHttpOk, {
        scheme: params.scheme ?? "",
        status: params.status ?? "",
      });
    case "eb_no_http":
      return t.pingResultEbNoHttp;
    case "eb_tcp_failed":
      return formatTemplate(t.pingResultEbTcpFailed, { error: params.error ?? "" });
    case "db_connect_failed":
      return formatTemplate(t.pingResultDbConnectFailed, {
        database: params.database ?? "",
        error: params.error ?? "",
      });
    case "db_protocol_ok":
      return formatTemplate(t.pingResultDbProtocolOk, { database: params.database ?? "" });
    case "db_protocol_failed":
      return formatTemplate(t.pingResultDbProtocolFailed, {
        database: params.database ?? "",
        error: params.error ?? "",
      });
    case "db_tcp_ok":
      return formatTemplate(t.pingResultDbTcpOk, { database: params.database ?? "" });
    case "db_auth_unsupported":
      return formatTemplate(t.pingResultDbAuthUnsupported, { database: params.database ?? "" });
    case "db_auth_ok":
      return t.pingResultDbAuthOk;
    case "db_auth_failed":
      return formatTemplate(t.pingResultDbAuthFailed, { error: params.error ?? "" });
    default:
      return result.message;
  }
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

const PING_MODES: PingMode[] = ["tcp", "udp", "eb", "database"];

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
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);
  // Values we last pushed into the URL ourselves via router.replace on submit.
  // Lets the sync effect distinguish our own URL update (which must not cancel
  // the in-flight request) from external navigation (command palette, links).
  const selfSubmitted = useRef<{ target: string; port: string; mode: PingMode } | null>(null);
  const t = getToolTranslation(locale);
  const isDatabase = mode === "database";

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

    // External navigation: abort the obsolete request before invalidating
    // its sequence guard so it stops consuming server time after discard.
    abortRef.current?.abort();
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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
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
        signal: controller.signal,
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
      if (checkError instanceof DOMException && checkError.name === "AbortError") {
        return;
      }
      if (seq === requestSeq.current) {
        // Map by error code like every other checker, so rate limits and
        // validation failures show translated messages instead of the raw
        // backend string.
        setError(getApiErrorMessage(checkError, t, t.pingNetworkError));
      }
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <form onSubmit={onSubmit} autoComplete="off">
        <Card className="gap-0 overflow-hidden py-0">
          <div className="flex flex-col p-5">
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex flex-col gap-2.5">
                  <Label>{t.pingTestMode}</Label>
                  <PingModeTabs
                    mode={mode}
                    labels={modeLabels}
                    helpers={modeHelpers}
                    onModeChange={onModeChange}
                  />
                </div>
                <ModeExpand open={isDatabase}>
                  <div className="flex flex-col gap-2 pt-5">
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
                </ModeExpand>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ping-target">{t.pingTargetHost}</Label>
                  <Input
                    id="ping-target"
                    name="target"
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
                    name="port"
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
                    name="timeoutMs"
                    value={timeoutMs}
                    onChange={(event) => setTimeoutMs(event.target.value)}
                    placeholder="3000"
                    inputMode="numeric"
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            <ModeExpand open={isDatabase}>
              <div className="pt-5">
                <div className="flex items-center justify-between gap-3 border-t pt-4">
                  <Label
                    htmlFor="ping-use-auth"
                    className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground"
                  >
                    <LockKeyhole
                      className={cn(
                        "size-4 transition-colors duration-200 ease-[var(--ease-smooth)]",
                        useAuth ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    {t.pingUseAuth}
                  </Label>
                  <Switch
                    id="ping-use-auth"
                    checked={useAuth}
                    onCheckedChange={setUseAuth}
                  />
                </div>
                <ModeExpand open={useAuth}>
                  <div className="grid gap-4 pt-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="ping-username">{t.pingUsername}</Label>
                      <Input
                        id="ping-username"
                        name="databaseUsername"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="ping-password">{t.pingPassword}</Label>
                      <Input
                        id="ping-password"
                        name="databasePassword"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        // MDN: off is ignored on password fields; new-password is for
                        // credentials that are not this origin's login.
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <Label htmlFor="ping-database">{t.pingDatabaseOptional}</Label>
                      <Input
                        id="ping-database"
                        name="database"
                        value={database}
                        onChange={(event) => setDatabase(event.target.value)}
                        placeholder="postgres / admin / master"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </ModeExpand>
              </div>
            </ModeExpand>
          </div>

          <div className="flex flex-col gap-3 border-t bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full shrink-0 sm:w-auto sm:min-w-36"
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

      {loading && !result && (
        <div role="status" aria-busy="true">
          <span className="sr-only">{t.pingRunning}</span>
          <Skeleton className="h-40 rounded-xl" aria-hidden="true" />
        </div>
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
            <p
              key={`${result.messageKey ?? "legacy"}-${result.message}`}
              className="text-sm leading-relaxed text-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
            >
              {formatPingMessage(result, t)}
            </p>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.pingModeLabel}
                </dt>
                <dd className="mt-1 font-mono text-sm text-foreground uppercase">
                  {result.mode === "database" ? t.pingModeDatabase : result.mode}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.pingLatencyLabel}
                </dt>
                <dd className="mt-1 font-mono text-sm text-foreground tabular-nums">
                  {result.latencyMs} ms
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.pingTargetLabel}
                </dt>
                <dd className="mt-1 font-mono text-sm break-all text-foreground">
                  {result.target}:{result.port}
                </dd>
              </div>
            </dl>

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

function ModeExpand({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="ping-mode-expand"
      data-open={open ? "true" : undefined}
      inert={open ? undefined : true}
      aria-hidden={!open}
    >
      <div className="ping-mode-expand-inner">{children}</div>
    </div>
  );
}

function PingModeTabs({
  mode,
  labels,
  helpers,
  onModeChange,
}: {
  mode: PingMode;
  labels: Record<PingMode, string>;
  helpers: Record<PingMode, string>;
  onModeChange: (mode: PingMode) => void;
}) {
  const { containerRef, view, canAnimate, radius } = useSegmentHighlight(mode);

  return (
    <Tabs
      value={mode}
      onValueChange={(value) => onModeChange(value as PingMode)}
      className="gap-2.5"
    >
      <div ref={containerRef} className="relative isolate">
        <span
          className="tool-segment-highlight"
          style={{
            transform: `translate3d(${view.box.x}px, ${view.box.y}px, 0)`,
            width: view.box.width,
            height: view.box.height,
            opacity: view.visible ? 1 : 0,
            borderRadius: radius || undefined,
          }}
          data-animate={canAnimate ? "true" : undefined}
          data-slide={view.slide ? "true" : undefined}
          aria-hidden
        />
        <TabsList className="grid h-auto w-full grid-cols-4">
          {PING_MODES.map((value) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                "relative z-10 min-h-9 truncate px-1 py-1.5 text-xs transition-[color,background-color,box-shadow,border-color] duration-200 ease-[var(--ease-smooth)] sm:text-sm",
                view.visible &&
                  "data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent",
              )}
            >
              {labels[value]}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <div className="grid min-h-8">
        {PING_MODES.map((value) => (
          <p
            key={value}
            className={cn(
              "col-start-1 row-start-1 text-xs text-muted-foreground transition-opacity duration-200 ease-[var(--ease-smooth)] motion-reduce:transition-none",
              mode === value
                ? "z-10 opacity-100"
                : "pointer-events-none z-0 opacity-0 select-none",
            )}
            aria-hidden={mode !== value}
          >
            {helpers[value]}
          </p>
        ))}
      </div>
    </Tabs>
  );
}
