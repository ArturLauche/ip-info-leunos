"use client";

import { ErrorPanel } from "@/components/error-panel";
import { InfoCard } from "@/components/info-card";
import { ToolSearchForm } from "@/components/tool-search-form";
import { unwrapApiResponse } from "@/lib/api/client";
import { asnDisplay, normalizeAsnInput } from "@/lib/asn";
import { type Locale, getTranslation } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Globe,
  Building2,
  Network,
  Hash,
  Shield,
  ArrowUpDown,
  ExternalLink,
  Server,
  Wifi,
  Route,
  MapPin,
  Clock,
  CircleCheck,
  TriangleAlert,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Shuffle,
} from "lucide-react";

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

type NeighborSort = "power" | "asn" | "name";

function sortNeighbors(neighbors: AsnNeighbor[], sort: NeighborSort): AsnNeighbor[] {
  const sorted = [...neighbors];
  switch (sort) {
    case "power":
      return sorted.sort((a, b) => b.power - a.power);
    case "asn":
      return sorted.sort((a, b) => a.asn - b.asn);
    case "name":
      return sorted;
  }
}

function formatSpeed(speed: number): string {
  if (speed >= 1_000_000) return `${speed / 1_000_000} Tbps`;
  if (speed >= 1_000) return `${speed / 1_000} Gbps`;
  return `${speed} Mbps`;
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

function NeighborSection({
  title,
  icon: Icon,
  neighbors,
  emptyMessage,
  t,
}: {
  title: string;
  icon: typeof ArrowUpRight;
  neighbors: AsnNeighbor[];
  emptyMessage: string;
  t: ReturnType<typeof getToolTranslation>;
}) {
  const [sort, setSort] = useState<NeighborSort>("power");
  const [visibleCount, setVisibleCount] = useState(30);

  const sorted = useMemo(() => sortNeighbors(neighbors, sort), [neighbors, sort]);
  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  return (
    <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="h-4 w-4 text-primary" />
          {title}
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {neighbors.length}
          </span>
        </p>
        <div className="flex gap-1">
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
      </div>

      {neighbors.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            {visible.map((n) => (
              <Link
                key={n.asn}
                href={`/asn?asn=${encodeURIComponent(asnDisplay(n.asn))}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-mono text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {asnDisplay(n.asn)}
                <span className="text-muted-foreground">
                  {n.power > 0 && `(${n.power})`}
                </span>
              </Link>
            ))}
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + 30)}
              className="mt-3 text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              {t.asnLoadMore} ({sorted.length - visibleCount})
            </button>
          )}
        </>
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
          <div className="h-40 animate-pulse rounded-xl bg-secondary" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-secondary" />
            ))}
          </div>
        </div>
      )}

      {error && <ErrorPanel message={error} />}

      {result && (
        <div className="flex flex-col gap-6">
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

          <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Network className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{result.asn}</h2>
                <p className="text-sm text-muted-foreground">{result.name}</p>
              </div>
              <span
                className={`ml-auto rounded-full border px-3 py-1 text-xs font-medium ${
                  result.announced
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : "border-border bg-secondary text-muted-foreground"
                }`}
              >
                {result.announced ? t.asnAnnounced : t.asnNotAnnounced}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {result.country && (
              <InfoCard icon={Globe} label={mainT.country} value={result.country} />
            )}
            {result.registry && (
              <InfoCard icon={Building2} label={t.asnRegistry} value={result.registry} />
            )}
            {result.allocated && (
              <InfoCard icon={Clock} label={t.asnAllocated} value={result.allocated} />
            )}
            {result.domain && (
              <InfoCard
                icon={Globe}
                label={t.asnDomain}
                value={result.domain}
                detail={result.type || undefined}
              />
            )}
            {result.type && !result.domain && (
              <InfoCard icon={Shield} label={t.asnType} value={result.type} />
            )}
            {result.numIps > 0 && (
              <InfoCard icon={Hash} label={t.asnNumIps} value={result.numIps.toLocaleString()} />
            )}
          </div>

          <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Network className="h-4 w-4 text-primary" />
              {t.asnPrefixes}
            </p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-secondary/40 p-3">
                <p className="text-xs text-muted-foreground">{t.asnPrefixes4Count}</p>
                <p className="mt-1 text-lg font-bold text-foreground">{result.prefixes4Count}</p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/40 p-3">
                <p className="text-xs text-muted-foreground">{t.asnPrefixes6Count}</p>
                <p className="mt-1 text-lg font-bold text-foreground">{result.prefixes6Count}</p>
              </div>
            </div>

            {(result.prefixes4.length > 0 || result.prefixes6.length > 0) && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setPrefixesExpanded(!prefixesExpanded)}
                  className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                >
                  {prefixesExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {prefixesExpanded ? t.asnShowAll : `${t.asnShowAll} (${result.prefixes4.length + result.prefixes6.length})`}
                </button>
                {prefixesExpanded && (
                  <div className="mt-2 max-h-60 overflow-auto rounded-lg border border-border bg-secondary/40 p-3">
                    {result.prefixes4.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-muted-foreground">IPv4</p>
                        <ul className="mt-1 space-y-0.5 font-mono text-xs text-foreground">
                          {result.prefixes4.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.prefixes6.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">IPv6</p>
                        <ul className="mt-1 space-y-0.5 font-mono text-xs text-foreground">
                          {result.prefixes6.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {result.visibility.v4.totalRisPeers > 0 && (
            <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Wifi className="h-4 w-4 text-primary" />
                {t.asnVisibility}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-secondary/40 p-3">
                  <p className="text-xs text-muted-foreground">IPv4 — {t.asnRisPeers}</p>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {result.visibility.v4.risPeersSeeing} / {result.visibility.v4.totalRisPeers}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/40 p-3">
                  <p className="text-xs text-muted-foreground">IPv6 — {t.asnRisPeers}</p>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {result.visibility.v6.risPeersSeeing} / {result.visibility.v6.totalRisPeers}
                  </p>
                </div>
              </div>
            </div>
          )}

          {result.rpki && (
            <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Shield className="h-4 w-4 text-primary" />
                {t.asnRpkiStatus}
              </p>
              <div className="mt-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    result.rpki.status === "valid"
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                      : result.rpki.status === "invalid"
                        ? "border-red-500/40 bg-red-500/15 text-red-300"
                        : "border-border bg-secondary text-muted-foreground"
                  }`}
                >
                  {result.rpki.status === "valid"
                    ? t.asnRpkiValid
                    : result.rpki.status === "invalid"
                      ? t.asnRpkiInvalid
                      : t.asnRpkiNotFound}
                </span>
                {result.rpki.validator && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Validator: {result.rpki.validator}
                  </p>
                )}
                {result.rpki.roas.length > 0 && (
                  <div className="mt-2 overflow-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="py-1 pr-3 text-left font-medium">Prefix</th>
                          <th className="py-1 pr-3 text-left font-medium">Origin</th>
                          <th className="py-1 pr-3 text-left font-medium">Validity</th>
                          <th className="py-1 text-left font-medium">Max Length</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.rpki.roas.map((roa, i) => (
                          <tr key={`${roa.prefix}-${i}`} className="border-b border-border/50">
                            <td className="py-1 pr-3 font-mono text-foreground">{roa.prefix}</td>
                            <td className="py-1 pr-3 font-mono text-foreground">{asnDisplay(Number(roa.origin))}</td>
                            <td className="py-1 pr-3 text-foreground">{roa.validity}</td>
                            <td className="py-1 text-foreground">{roa.maxLength}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Route className="h-4 w-4 text-primary" />
              {t.asnRouting}
            </p>
            <NeighborSection
              title={t.asnUpstreams}
              icon={ArrowUpRight}
              neighbors={result.upstreams}
              emptyMessage={t.asnNoUpstreams}
              t={t}
            />
            <NeighborSection
              title={t.asnPeers}
              icon={Shuffle}
              neighbors={result.peers}
              emptyMessage={t.asnNoPeers}
              t={t}
            />
            <NeighborSection
              title={t.asnDownstreams}
              icon={ArrowDownRight}
              neighbors={result.downstreams}
              emptyMessage={t.asnNoDownstreams}
              t={t}
            />
          </div>

          {result.peeringdb && (
            <>
              <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Globe className="h-4 w-4 text-primary" />
                  {t.asnPeering}
                </p>
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {result.peeringdb.traffic && (
                    <InfoCard icon={Wifi} label={t.asnTraffic} value={result.peeringdb.traffic} />
                  )}
                  {result.peeringdb.policyGeneral && (
                    <InfoCard icon={Shield} label={t.asnPolicyGeneral} value={result.peeringdb.policyGeneral} />
                  )}
                  {result.peeringdb.policyLocations && (
                    <InfoCard icon={MapPin} label={t.asnPolicyLocations} value={result.peeringdb.policyLocations} />
                  )}
                  {result.peeringdb.policyRatio && (
                    <InfoCard icon={ArrowUpDown} label={t.asnPolicyRatio} value={result.peeringdb.policyRatio} />
                  )}
                  {result.peeringdb.policyContracts && (
                    <InfoCard icon={Building2} label={t.asnPolicyContracts} value={result.peeringdb.policyContracts} />
                  )}
                  {result.peeringdb.infoPrefixes4 > 0 && (
                    <InfoCard
                      icon={Hash}
                      label={t.asnPrefixes4}
                      value={result.peeringdb.infoPrefixes4.toLocaleString()}
                    />
                  )}
                  {result.peeringdb.infoPrefixes6 > 0 && (
                    <InfoCard
                      icon={Hash}
                      label={t.asnPrefixes6}
                      value={result.peeringdb.infoPrefixes6.toLocaleString()}
                    />
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {result.peeringdb.website && (
                    <a
                      href={result.peeringdb.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {t.asnWebsite}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {result.peeringdb.lookingGlass && (
                    <a
                      href={result.peeringdb.lookingGlass}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <Server className="h-3.5 w-3.5" />
                      {t.asnLookingGlass}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {result.peeringdb.routeServer && (
                    <a
                      href={result.peeringdb.routeServer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <Route className="h-3.5 w-3.5" />
                      {t.asnRouteServer}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Network className="h-4 w-4 text-primary" />
                  {t.asnIxPresence}
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {result.peeringdb.ixlan.length}
                  </span>
                </p>
                {result.peeringdb.ixlan.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">{t.asnNoIx}</p>
                ) : (
                  <div className="mt-3 overflow-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="py-1.5 pr-3 text-left font-medium">Exchange</th>
                          <th className="py-1.5 pr-3 text-left font-medium">{t.asnSpeed}</th>
                          <th className="py-1.5 pr-3 text-left font-medium">IPv4</th>
                          <th className="py-1.5 pr-3 text-left font-medium">IPv6</th>
                          <th className="py-1.5 text-left font-medium">{t.asnRouteServerPeer}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.peeringdb.ixlan.map((ix) => (
                          <tr key={ix.id} className="border-b border-border/50">
                            <td className="py-1.5 pr-3 font-medium text-foreground">{ix.name}</td>
                            <td className="py-1.5 pr-3 text-muted-foreground">{formatSpeed(ix.speed)}</td>
                            <td className="py-1.5 pr-3 font-mono text-foreground">{ix.ipaddr4}</td>
                            <td className="py-1.5 pr-3 font-mono text-foreground">{ix.ipaddr6}</td>
                            <td className="py-1.5 text-foreground">{ix.isRsPeer ? "Yes" : "No"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Building2 className="h-4 w-4 text-primary" />
                  {t.asnFacilityPresence}
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {result.peeringdb.facilities.length}
                  </span>
                </p>
                {result.peeringdb.facilities.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">{t.asnNoFacilities}</p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.peeringdb.facilities.map((fac) => (
                      <div
                        key={fac.id}
                        className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs"
                      >
                        <p className="font-medium text-foreground">{fac.name}</p>
                        <p className="text-muted-foreground">
                          {fac.city}
                          {fac.country ? `, ${fac.country}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CircleCheck className="h-4 w-4 text-primary" />
              {t.asnSources}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {([["ripestat", t.asnSourceRipestat], ["peeringdb", t.asnSourcePeeringdb], ["ipinfo", t.asnSourceIpinfo]] as const).map(
                ([key, label]) => (
                  <span
                    key={key}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${sourceBadge(result.sources[key])}`}
                  >
                    {label}:{" "}
                    {sourceLabel(
                      result.sources[key],
                      t.asnSourceAvailable,
                      t.asnSourceUnavailable,
                      t.asnSourceNotConfigured,
                      t.asnSourceError,
                    )}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
