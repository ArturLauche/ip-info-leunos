"use client";

import { ErrorPanel } from "@/components/error-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
import { unwrapApiResponse } from "@/lib/api/client";
import { asnDisplay, normalizeAsnInput } from "@/lib/asn";
import { type Locale, getTranslation } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Globe,
  Building2,
  Network,
  Shield,
  ExternalLink,
  Server,
  Wifi,
  Route,
  MapPin,
  CircleCheck,
  TriangleAlert,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Shuffle,
  Zap,
  Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AsnNeighbor {
  asn: number;
  power: number;
  v4Peers: number;
  v6Peers: number;
}

interface IxlanEntry {
  id: number;
  name: string;
  speed: number;
  ipaddr4: string;
  ipaddr6: string;
  isRsPeer: boolean;
  operational: boolean;
}

interface FacilityEntry {
  id: number;
  name: string;
  city: string;
  country: string;
}

interface AsnResult {
  asn: string;
  asnNumber: number;
  name: string;
  country: string;
  registry: string;
  allocated: string;
  domain: string;
  type: string;
  announced: boolean;
  numIps: number;
  prefixes4: string[];
  prefixes6: string[];
  prefixes4Count: number;
  prefixes6Count: number;
  peers: AsnNeighbor[];
  upstreams: AsnNeighbor[];
  downstreams: AsnNeighbor[];
  rpki: {
    status: string;
    validator: string;
    roas: Array<{ origin: string; prefix: string; validity: string; maxLength: number }>;
  } | null;
  visibility: {
    v4: { risPeersSeeing: number; totalRisPeers: number };
    v6: { risPeersSeeing: number; totalRisPeers: number };
  };
  peeringdb: {
    netId: number;
    name: string;
    aka: string;
    website: string;
    lookingGlass: string;
    routeServer: string;
    traffic: string;
    policyGeneral: string;
    policyLocations: string;
    policyRatio: string;
    policyContracts: string;
    infoPrefixes4: number;
    infoPrefixes6: number;
    ixCount: number;
    facilityCount: number;
    ixlan: IxlanEntry[];
    facilities: FacilityEntry[];
  } | null;
  sources: {
    ripestat: string;
    peeringdb: string;
    ipinfo: string;
  };
  warnings: string[];
}

type NeighborSort = "power" | "asn";

function sortNeighbors(neighbors: AsnNeighbor[], sort: NeighborSort): AsnNeighbor[] {
  const sorted = [...neighbors];
  switch (sort) {
    case "power":
      return sorted.sort((a, b) => b.power - a.power);
    case "asn":
      return sorted.sort((a, b) => a.asn - b.asn);
  }
}

function formatSpeed(speed: number): string {
  if (speed >= 1_000_000) return `${speed / 1_000_000} Tbps`;
  if (speed >= 1_000) return `${speed / 1_000} Gbps`;
  return `${speed} Mbps`;
}

function speedColor(speed: number): string {
  if (speed >= 100_000) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  if (speed >= 10_000) return "bg-sky-500/20 text-sky-300 border-sky-500/40";
  if (speed >= 1_000) return "bg-violet-500/20 text-violet-300 border-violet-500/40";
  return "bg-muted text-muted-foreground border-border";
}

function sourceBadge(status: string) {
  switch (status) {
    case "available":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
    case "unavailable":
      return "bg-secondary text-muted-foreground border-border";
    case "not_configured":
      return "bg-amber-500/15 text-amber-300 border-amber-500/40";
    case "error":
      return "bg-red-500/15 text-red-300 border-red-500/40";
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
}

function sourceLabel(status: string, available: string, unavailable: string, notConfigured: string, error: string) {
  switch (status) {
    case "available":
      return available;
    case "unavailable":
      return unavailable;
    case "not_configured":
      return notConfigured;
    case "error":
      return error;
    default:
      return status;
  }
}

function SectionCard({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string;
  icon: LucideIcon;
  count?: number;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card/70 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {count}
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-border/60 bg-secondary/30 px-4 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}

function NeighborTable({
  neighbors,
  emptyMessage,
  t,
}: {
  neighbors: AsnNeighbor[];
  emptyMessage: string;
  t: ReturnType<typeof getToolTranslation>;
}) {
  const [sort, setSort] = useState<NeighborSort>("power");
  const [visibleCount, setVisibleCount] = useState(25);

  const sorted = useMemo(() => sortNeighbors(neighbors, sort), [neighbors, sort]);
  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  if (neighbors.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div>
      <div className="mb-3 flex gap-1">
        {([["power", t.asnSortByPower], ["asn", t.asnSortByAsn]] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSort(key)}
            className={`rounded-md px-2 py-1 text-xs transition-colors ${
              sort === key
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-2 pr-4 text-left font-medium">{t.asnNeighborTable}</th>
              <th className="py-2 pr-4 text-right font-medium">{t.asnNeighborPower}</th>
              <th className="py-2 pr-4 text-right font-medium">IPv4</th>
              <th className="py-2 text-right font-medium">IPv6</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((n) => (
              <tr key={n.asn} className="border-b border-border/40 transition-colors hover:bg-secondary/30">
                <td className="py-2 pr-4">
                  <Link
                    href={`/asn?asn=${encodeURIComponent(asnDisplay(n.asn))}`}
                    className="font-mono font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    {asnDisplay(n.asn)}
                  </Link>
                </td>
                <td className="py-2 pr-4 text-right">
                  <span className="inline-flex items-center gap-1">
                    <Activity className="h-3 w-3 text-muted-foreground" />
                    {n.power}
                  </span>
                </td>
                <td className="py-2 pr-4 text-right font-mono text-muted-foreground">{n.v4Peers.toLocaleString()}</td>
                <td className="py-2 text-right font-mono text-muted-foreground">{n.v6Peers.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((c) => c + 25)}
          className="mt-3 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          {t.asnLoadMore} ({sorted.length - visibleCount})
        </button>
      )}
    </div>
  );
}

interface AsnCheckerProps {
  locale: Locale;
  initialAsn?: string;
}

export function AsnChecker({ locale, initialAsn = "" }: AsnCheckerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AsnResult | null>(null);
  const [prefixesExpanded, setPrefixesExpanded] = useState(false);
  const t = getToolTranslation(locale);
  const mainT = getTranslation(locale);

  const runLookup = useCallback(async (value: string, updateUrl = true) => {
    const normalized = normalizeAsnInput(value);
    if (!normalized) return;

    setLoading(true);
    setError(null);
    setResult(null);

    if (updateUrl) {
      router.replace(`/asn?asn=${encodeURIComponent(normalized.display)}`, { scroll: false });
    }

    try {
      const response = await fetch(`/api/asn/${encodeURIComponent(normalized.display)}`);
      const data = unwrapApiResponse<AsnResult>(await response.json());
      setResult(data);
    } catch (lookupError) {
      setError((lookupError as Error).message || t.asnNetworkError);
    } finally {
      setLoading(false);
    }
  }, [router, t.asnNetworkError]);

  useEffect(() => {
    if (initialAsn.trim()) {
      runLookup(initialAsn, false);
    }
  }, [initialAsn, runLookup]);

  return (
    <div className="flex w-full flex-col gap-6">
      <ToolSearchForm
        initialValue={initialAsn ? normalizeAsnInput(initialAsn)?.display || initialAsn : ""}
        placeholder={t.asnSearchPlaceholder}
        submitLabel={t.asnLookupButton}
        loadingLabel={t.asnLookupInProgress}
        loading={loading}
        onSubmit={runLookup}
      />

      {loading && (
        <div className="flex flex-col gap-4">
          <div className="h-32 animate-pulse rounded-xl bg-secondary" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="h-64 animate-pulse rounded-xl bg-secondary lg:col-span-1" />
            <div className="h-64 animate-pulse rounded-xl bg-secondary lg:col-span-2" />
          </div>
        </div>
      )}

      {error && <ErrorPanel message={error} />}

      {result && (
        <div className="flex flex-col gap-5">
          {result.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              <div className="flex items-center gap-2 font-medium text-amber-100">
                <TriangleAlert className="h-4 w-4" />
                {t.asnPartialData}
              </div>
              <ul className="mt-2 space-y-1 text-xs">
                {result.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Hero Header ── */}
          <div className="rounded-xl border border-border/80 bg-card/70 p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                  <Network className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">{result.asn}</h2>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        result.announced
                          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                          : "border-border bg-secondary text-muted-foreground"
                      }`}
                    >
                      {result.announced ? t.asnAnnounced : t.asnNotAnnounced}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{result.name}</p>
                </div>
              </div>

              {/* Quick stats pills */}
              <div className="flex flex-wrap gap-2">
                {result.peeringdb && result.peeringdb.ixCount > 0 && (
                  <StatPill label={t.asnIxCount} value={result.peeringdb.ixCount} />
                )}
                {result.peeringdb && result.peeringdb.facilityCount > 0 && (
                  <StatPill label={t.asnFacCount} value={result.peeringdb.facilityCount} />
                )}
                {(result.prefixes4Count > 0 || result.prefixes6Count > 0) && (
                  <StatPill label={t.asnTotalPrefixes} value={result.prefixes4Count + result.prefixes6Count} />
                )}
                {result.numIps > 0 && (
                  <StatPill label={t.asnNumIps} value={result.numIps.toLocaleString()} />
                )}
              </div>
            </div>
          </div>

          {/* ── Main Two-Column Layout ── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Left sidebar */}
            <div className="flex flex-col gap-5 lg:col-span-1">
              {/* Network Info */}
              <SectionCard title={t.asnNetworkInfo} icon={Globe}>
                <dl className="space-y-3">
                  {result.country && (
                    <div className="flex items-center justify-between">
                      <dt className="text-xs text-muted-foreground">{mainT.country}</dt>
                      <dd className="text-sm font-medium text-foreground">{result.country}</dd>
                    </div>
                  )}
                  {result.registry && (
                    <div className="flex items-center justify-between">
                      <dt className="text-xs text-muted-foreground">{t.asnRegistry}</dt>
                      <dd className="text-sm font-medium text-foreground">{result.registry}</dd>
                    </div>
                  )}
                  {result.allocated && (
                    <div className="flex items-center justify-between">
                      <dt className="text-xs text-muted-foreground">{t.asnAllocated}</dt>
                      <dd className="text-sm font-medium text-foreground">{result.allocated}</dd>
                    </div>
                  )}
                  {result.type && (
                    <div className="flex items-center justify-between">
                      <dt className="text-xs text-muted-foreground">{t.asnType}</dt>
                      <dd className="text-sm font-medium text-foreground">{result.type}</dd>
                    </div>
                  )}
                  {result.domain && (
                    <div className="flex items-center justify-between">
                      <dt className="text-xs text-muted-foreground">{t.asnDomain}</dt>
                      <dd className="truncate text-sm font-medium text-foreground">{result.domain}</dd>
                    </div>
                  )}
                </dl>
              </SectionCard>

              {/* Peering Policy (PeeringDB) */}
              {result.peeringdb && (
                <SectionCard title={t.asnPeering} icon={Shield}>
                  <dl className="space-y-3">
                    {result.peeringdb.traffic && (
                      <div className="flex items-center justify-between">
                        <dt className="text-xs text-muted-foreground">{t.asnTraffic}</dt>
                        <dd className="text-sm font-medium text-foreground">{result.peeringdb.traffic}</dd>
                      </div>
                    )}
                    {result.peeringdb.policyGeneral && (
                      <div className="flex items-center justify-between">
                        <dt className="text-xs text-muted-foreground">{t.asnPolicyGeneral}</dt>
                        <dd className="text-sm font-medium text-foreground">{result.peeringdb.policyGeneral}</dd>
                      </div>
                    )}
                    {result.peeringdb.policyLocations && (
                      <div className="flex items-center justify-between">
                        <dt className="text-xs text-muted-foreground">{t.asnPolicyLocations}</dt>
                        <dd className="text-sm font-medium text-foreground">{result.peeringdb.policyLocations}</dd>
                      </div>
                    )}
                    {result.peeringdb.policyRatio && (
                      <div className="flex items-center justify-between">
                        <dt className="text-xs text-muted-foreground">{t.asnPolicyRatio}</dt>
                        <dd className="text-sm font-medium text-foreground">{result.peeringdb.policyRatio}</dd>
                      </div>
                    )}
                    {result.peeringdb.policyContracts && (
                      <div className="flex items-center justify-between">
                        <dt className="text-xs text-muted-foreground">{t.asnPolicyContracts}</dt>
                        <dd className="text-sm font-medium text-foreground">{result.peeringdb.policyContracts}</dd>
                      </div>
                    )}
                  </dl>

                  {/* External links */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {result.peeringdb.website && (
                      <a
                        href={result.peeringdb.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        <Globe className="h-3 w-3" />
                        {t.asnWebsite}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                    {result.peeringdb.lookingGlass && (
                      <a
                        href={result.peeringdb.lookingGlass}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        <Server className="h-3 w-3" />
                        {t.asnLookingGlass}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                    {result.peeringdb.routeServer && (
                      <a
                        href={result.peeringdb.routeServer}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        <Route className="h-3 w-3" />
                        {t.asnRouteServer}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* Visibility */}
              {result.visibility.v4.totalRisPeers > 0 && (
                <SectionCard title={t.asnVisibility} icon={Wifi}>
                  <div className="space-y-3">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>IPv4</span>
                        <span>{result.visibility.v4.risPeersSeeing} / {result.visibility.v4.totalRisPeers}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(100, (result.visibility.v4.risPeersSeeing / result.visibility.v4.totalRisPeers) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>IPv6</span>
                        <span>{result.visibility.v6.risPeersSeeing} / {result.visibility.v6.totalRisPeers}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(100, (result.visibility.v6.risPeersSeeing / result.visibility.v6.totalRisPeers) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* RPKI */}
              {result.rpki && (
                <SectionCard title={t.asnRpkiStatus} icon={Shield}>
                  <div className="mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                        result.rpki.status === "valid"
                          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                          : result.rpki.status === "invalid"
                            ? "border-red-500/40 bg-red-500/15 text-red-300"
                            : "border-border bg-secondary text-muted-foreground"
                      }`}
                    >
                      {result.rpki.status === "valid" && <CircleCheck className="h-3 w-3" />}
                      {result.rpki.status === "valid"
                        ? t.asnRpkiValid
                        : result.rpki.status === "invalid"
                          ? t.asnRpkiInvalid
                          : t.asnRpkiNotFound}
                    </span>
                  </div>
                  {result.rpki.roas.length > 0 && (
                    <div className="overflow-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground">
                            <th className="py-1.5 pr-3 text-left font-medium">Prefix</th>
                            <th className="py-1.5 pr-3 text-left font-medium">Origin</th>
                            <th className="py-1.5 text-left font-medium">Validity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.rpki.roas.map((roa, i) => (
                            <tr key={`${roa.prefix}-${i}`} className="border-b border-border/40">
                              <td className="py-1.5 pr-3 font-mono text-foreground">{roa.prefix}</td>
                              <td className="py-1.5 pr-3 font-mono text-foreground">{asnDisplay(Number(roa.origin))}</td>
                              <td className="py-1.5 text-foreground">{roa.validity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </SectionCard>
              )}

              {/* Data Sources */}
              <SectionCard title={t.asnSources} icon={CircleCheck}>
                <div className="space-y-2">
                  {([["ripestat", t.asnSourceRipestat], ["peeringdb", t.asnSourcePeeringdb], ["ipinfo", t.asnSourceIpinfo]] as const).map(
                    ([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${sourceBadge(result.sources[key])}`}
                        >
                          {sourceLabel(
                            result.sources[key],
                            t.asnSourceAvailable,
                            t.asnSourceUnavailable,
                            t.asnSourceNotConfigured,
                            t.asnSourceError,
                          )}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </SectionCard>
            </div>

            {/* Right main content */}
            <div className="flex flex-col gap-5 lg:col-span-2">
              {/* IX Presence - PeeringDB style table */}
              {result.peeringdb && (
                <SectionCard title={t.asnIxPresence} icon={Network} count={result.peeringdb.ixlan.length}>
                  {result.peeringdb.ixlan.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t.asnNoIx}</p>
                  ) : (
                    <div className="overflow-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground">
                            <th className="py-2 pr-4 text-left font-medium">Exchange</th>
                            <th className="py-2 pr-4 text-left font-medium">{t.asnSpeed}</th>
                            <th className="py-2 pr-4 text-left font-medium">IPv4</th>
                            <th className="py-2 pr-4 text-left font-medium">IPv6</th>
                            <th className="py-2 pr-3 text-center font-medium">{t.asnRouteServerPeer}</th>
                            <th className="py-2 text-center font-medium">{t.asnOperational}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.peeringdb.ixlan.map((ix) => (
                            <tr key={ix.id} className="border-b border-border/40 transition-colors hover:bg-secondary/20">
                              <td className="py-2.5 pr-4 font-medium text-foreground">{ix.name}</td>
                              <td className="py-2.5 pr-4">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${speedColor(ix.speed)}`}
                                >
                                  <Zap className="h-3 w-3" />
                                  {formatSpeed(ix.speed)}
                                </span>
                              </td>
                              <td className="py-2.5 pr-4 font-mono text-muted-foreground">{ix.ipaddr4 || "\u2014"}</td>
                              <td className="py-2.5 pr-4 font-mono text-muted-foreground">{ix.ipaddr6 || "\u2014"}</td>
                              <td className="py-2.5 pr-3 text-center">
                                {ix.isRsPeer ? (
                                  <CircleCheck className="mx-auto h-4 w-4 text-emerald-400" />
                                ) : (
                                  <span className="text-muted-foreground">\u2014</span>
                                )}
                              </td>
                              <td className="py-2.5 text-center">
                                <span
                                  className={`inline-block h-2 w-2 rounded-full ${
                                    ix.operational ? "bg-emerald-400" : "bg-muted-foreground/40"
                                  }`}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </SectionCard>
              )}

              {/* Prefixes */}
              <SectionCard title={t.asnPrefixes} icon={Network}>
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
                    <p className="text-xs text-muted-foreground">{t.asnPrefixes4Count}</p>
                    <p className="mt-1 text-xl font-bold text-foreground">{result.prefixes4Count}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
                    <p className="text-xs text-muted-foreground">{t.asnPrefixes6Count}</p>
                    <p className="mt-1 text-xl font-bold text-foreground">{result.prefixes6Count}</p>
                  </div>
                </div>

                {(result.prefixes4.length > 0 || result.prefixes6.length > 0) && (
                  <>
                    <button
                      type="button"
                      onClick={() => setPrefixesExpanded(!prefixesExpanded)}
                      className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      {prefixesExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {prefixesExpanded ? t.asnShowAll : `${t.asnShowAll} (${result.prefixes4.length + result.prefixes6.length})`}
                    </button>
                    {prefixesExpanded && (
                      <div className="mt-3 max-h-60 overflow-auto rounded-lg border border-border/60 bg-secondary/20">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="sticky top-0 border-b border-border bg-card/90 text-muted-foreground backdrop-blur">
                              <th className="py-2 px-3 text-left font-medium">Prefix</th>
                              <th className="py-2 px-3 text-left font-medium">Family</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.prefixes4.map((p) => (
                              <tr key={p} className="border-b border-border/30">
                                <td className="py-1.5 px-3 font-mono text-foreground">{p}</td>
                                <td className="py-1.5 px-3 text-muted-foreground">IPv4</td>
                              </tr>
                            ))}
                            {result.prefixes6.map((p) => (
                              <tr key={p} className="border-b border-border/30">
                                <td className="py-1.5 px-3 font-mono text-foreground">{p}</td>
                                <td className="py-1.5 px-3 text-muted-foreground">IPv6</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </SectionCard>

              {/* Routing: Upstreams */}
              <SectionCard title={t.asnUpstreams} icon={ArrowUpRight} count={result.upstreams.length}>
                <NeighborTable
                  neighbors={result.upstreams}
                  emptyMessage={t.asnNoUpstreams}
                  t={t}
                />
              </SectionCard>

              {/* Routing: Peers */}
              <SectionCard title={t.asnPeers} icon={Shuffle} count={result.peers.length}>
                <NeighborTable
                  neighbors={result.peers}
                  emptyMessage={t.asnNoPeers}
                  t={t}
                />
              </SectionCard>

              {/* Routing: Downstreams */}
              <SectionCard title={t.asnDownstreams} icon={ArrowDownRight} count={result.downstreams.length}>
                <NeighborTable
                  neighbors={result.downstreams}
                  emptyMessage={t.asnNoDownstreams}
                  t={t}
                />
              </SectionCard>

              {/* Facilities */}
              {result.peeringdb && (
                <SectionCard title={t.asnFacilityPresence} icon={Building2} count={result.peeringdb.facilities.length}>
                  {result.peeringdb.facilities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t.asnNoFacilities}</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {result.peeringdb.facilities.map((fac) => (
                        <div
                          key={fac.id}
                          className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-secondary/20 p-3 transition-colors hover:border-primary/30 hover:bg-secondary/40"
                        >
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{fac.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {fac.city}
                              {fac.country ? `, ${fac.country}` : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
