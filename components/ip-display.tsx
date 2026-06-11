"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { InfoCard } from "@/components/info-card";
import { getTranslation, type Locale } from "@/lib/i18n";
import { unwrapApiResponse } from "@/lib/api/client";
import { normalizeAsnInput } from "@/lib/asn";
import {
  discoverClientIp,
  resolveDisplayIps,
  type ClientIpDiscoveryResult,
  type LocalIpCheck,
} from "@/lib/client-ip-discovery";
import type { ConnectionType } from "@/lib/connection-type";
import {
  Globe,
  MapPin,
  Building2,
  Clock,
  Wifi,
  Hash,
  Map,
  Copy,
  Check,
  Cable,
  Smartphone,
  Shield,
  ShieldAlert,
  Server,
  Network,
  ExternalLink,
} from "lucide-react";

interface IpData {
  ipv4: string | null;
  ipv6: string | null;
  ipVersion: number;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  asname: string;
  reverse: string;
  mobile: boolean;
  proxy: boolean;
  proxyType?: "tor" | "vpn" | "hosting-proxy" | "unknown";
  proxyConfidence?: "none" | "low" | "medium" | "high";
  proxyReasons?: string[];
  hosting: boolean;
  connectionType: ConnectionType;
  ipSources?: {
    ipv4?: string;
    ipv6?: string;
  };
  localIpChecks?: LocalIpCheck[];
}

interface IpDisplayProps {
  targetIp?: string;
  locale: Locale;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      aria-label={label}
    >
      {copied ? (
        <Check className="h-4 w-4 text-primary" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}

function getAsnHref(value: string) {
  const match = value.match(/\bAS\s*([0-9]+)\b/i);
  if (!match) return null;

  try {
    const normalized = normalizeAsnInput(`AS${match[1]}`);
    return `/asn/${normalized.asn}`;
  } catch {
    return null;
  }
}

export function IpDisplay({ targetIp, locale }: IpDisplayProps) {
  const [data, setData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [clientIpv6, setClientIpv6] = useState<ClientIpDiscoveryResult | null>(null);
  const [clientIpv4, setClientIpv4] = useState<ClientIpDiscoveryResult | null>(null);
  const [ipv6Loading, setIpv6Loading] = useState(false);
  const t = getTranslation(locale);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setData(null);

    const url = targetIp
      ? `/api/ip?ip=${encodeURIComponent(targetIp)}`
      : "/api/ip";

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        setData(unwrapApiResponse<IpData>(json));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [targetIp]);

  useEffect(() => {
    if (targetIp) return;

    let active = true;
    setIpv6Loading(true);
    setClientIpv6(null);

    discoverClientIp({ preferredVersion: 6 }).then((result) => {
      if (!active) return;
      setClientIpv6(result);
      setIpv6Loading(false);
    });

    return () => {
      active = false;
    };
  }, [targetIp]);

  useEffect(() => {
    if (targetIp || loading || error || !data) return;

    const displayIps = resolveDisplayIps(data);
    if (displayIps.ipv4) {
      setClientIpv4(null);
      return;
    }

    let active = true;
    discoverClientIp({ preferredVersion: 4 }).then((result) => {
      if (active) setClientIpv4(result);
    });

    return () => {
      active = false;
    };
  }, [data, error, loading, targetIp]);

  if (loading) {
    return (
      <div className="flex w-full flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-32 animate-pulse rounded-md bg-secondary" />
          <div className="h-12 w-72 animate-pulse rounded-lg bg-secondary" />
        </div>
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-secondary"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-center text-muted-foreground">{t.ipInfoError}</p>;
  }

  const ConnectionIcon = data.mobile
    ? Smartphone
    : data.proxy
      ? Shield
      : data.hosting
        ? Server
        : Cable;

  const flags: string[] = [];
  if (data.mobile) flags.push(t.mobileFlag);
  if (data.proxy) {
    const proxyLabel =
      data.proxyType === "tor"
        ? "Tor"
        : data.proxyType === "vpn"
          ? "VPN"
          : data.proxyType === "hosting-proxy"
            ? "Proxy"
            : t.proxyFlag;
    flags.push(proxyLabel);
  }
  if (data.hosting) flags.push(t.hostingFlag);

  const displayIps = resolveDisplayIps(data, clientIpv4, clientIpv6);
  const displayIpv4 = displayIps.ipv4?.ip || null;
  const displayIpv6 = displayIps.ipv6?.ip || null;
  const asnHref = getAsnHref(data.as);
  const connectionTypeLabel = t.connectionTypes[data.connectionType] ?? t.unknown;
  const reputationIp = displayIpv4 || displayIpv6;
  const orUnknown = (value: string) => value || t.unknown;

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {targetIp ? t.queriedIpAddress : t.yourIpAddresses}
        </p>

        {displayIpv4 && (
          <div className="flex w-full max-w-full items-center justify-center gap-3">
            <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              IPv4
            </span>
            <h1 className="min-w-0 text-center font-mono text-xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {displayIpv4}
            </h1>
            <CopyButton text={displayIpv4} label={t.copyIpLabel} />
          </div>
        )}

        {displayIpv6 && (
          <div className="flex w-full max-w-full items-center justify-center gap-3">
            <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              IPv6
            </span>
            <h2 className="min-w-0 break-all text-center font-mono text-sm font-bold tracking-tight text-foreground sm:text-lg md:text-xl">
              {displayIpv6}
            </h2>
            <CopyButton text={displayIpv6} label={t.copyIpLabel} />
          </div>
        )}

        {!targetIp && ipv6Loading && !displayIpv6 && (
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              IPv6
            </span>
            <div className="h-5 w-48 animate-pulse rounded-md bg-secondary" />
          </div>
        )}

        {!targetIp && !ipv6Loading && !displayIpv6 && displayIpv4 && (
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              IPv6
            </span>
            <span className="text-sm text-muted-foreground">{t.notAvailable}</span>
          </div>
        )}

        {data.city && (
          <p className="text-center text-base text-muted-foreground">
            {data.city}, {data.regionName}, {data.country}
          </p>
        )}

        {reputationIp && (
          <Link
            href={`/reputation?ip=${encodeURIComponent(reputationIp)}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            {t.checkReputation}
          </Link>
        )}
      </div>

      <div className="flex w-full max-w-4xl flex-col items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-6 py-5 text-center shadow-sm">
        <div className="flex items-center gap-3">
          <ConnectionIcon className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold text-foreground">
            {connectionTypeLabel}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{t.detectedConnectionType}</p>
        {flags.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            {flags.map((flag) => (
              <span
                key={flag}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {flag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Network className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t.ipv4Status}
            </p>
            <p className="mt-1 truncate text-lg font-semibold text-foreground">
              {displayIpv4 ? t.available : t.notDetected}
            </p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {displayIpv4 || "-"}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${displayIpv4 ? "bg-emerald-500/10 text-emerald-400" : "bg-secondary text-muted-foreground"}`}
          >
            {displayIpv4 ? t.active : t.inactive}
          </span>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Network className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t.ipv6Status}
            </p>
            <p className="mt-1 truncate text-lg font-semibold text-foreground">
              {displayIpv6 ? t.available : t.notDetected}
            </p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {displayIpv6 || "-"}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${displayIpv6 ? "bg-emerald-500/10 text-emerald-400" : "bg-secondary text-muted-foreground"}`}
          >
            {displayIpv6 ? t.active : t.inactive}
          </span>
        </div>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard
          icon={MapPin}
          label={t.location}
          value={data.city ? `${data.city}, ${data.regionName}` : t.unknown}
          detail={data.country}
        />
        <InfoCard icon={Globe} label={t.country} value={orUnknown(data.country)} detail={data.countryCode} />
        <InfoCard icon={Clock} label={t.timezone} value={orUnknown(data.timezone)} detail={t.timezoneDetail} />
        <InfoCard icon={Wifi} label={t.isp} value={orUnknown(data.isp)} detail={t.ispDetail} />
        <InfoCard
          icon={Building2}
          label={t.organization}
          value={orUnknown(data.org)}
          detail={t.organizationDetail}
        />
        {data.reverse && (
          <InfoCard icon={Network} label={t.reverseDns} value={data.reverse} detail={t.reverseDnsDetail} />
        )}
        <div className="group flex flex-col gap-2.5 rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
              <Hash className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t.asNumber}
            </span>
          </div>
          {asnHref ? (
            <Link
              href={asnHref}
              className="inline-flex max-w-full items-center gap-1 text-lg font-semibold text-foreground transition-colors hover:text-primary"
            >
              <span className="truncate">{data.as}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </Link>
          ) : (
            <p className="truncate text-lg font-semibold text-foreground">{orUnknown(data.as)}</p>
          )}
          <p className="truncate text-xs text-muted-foreground">
            {data.asname || t.asFallbackDetail}
          </p>
        </div>
        <InfoCard
          icon={Map}
          label={t.coordinates}
          value={`${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`}
          detail={t.coordinatesDetail}
        />
        <InfoCard icon={MapPin} label={t.region} value={orUnknown(data.regionName)} detail={data.region} />
        <InfoCard
          icon={Hash}
          label={t.postalCode}
          value={orUnknown(data.zip)}
          detail={t.postalCodeDetail}
        />
      </div>
    </div>
  );
}
