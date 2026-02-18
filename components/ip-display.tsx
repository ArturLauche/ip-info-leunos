"use client";

import { useEffect, useState } from "react";
import { InfoCard } from "@/components/info-card";
import { getTranslation, type Locale } from "@/lib/i18n";
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
  Server,
  Network,
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
  hosting: boolean;
  connectionType: string;
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
      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
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

export function IpDisplay({ targetIp, locale }: IpDisplayProps) {
  const [data, setData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [clientIpv6, setClientIpv6] = useState<string | null>(null);
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
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [targetIp]);

  useEffect(() => {
    if (targetIp) return;

    setIpv6Loading(true);
    fetch("https://api64.ipify.org?format=json")
      .then((res) => res.json())
      .then((json) => {
        if (json.ip && json.ip.includes(":")) {
          setClientIpv6(json.ip);
        }
        setIpv6Loading(false);
      })
      .catch(() => {
        setIpv6Loading(false);
      });
  }, [targetIp]);

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
  if (data.proxy) flags.push(t.proxyFlag);
  if (data.hosting) flags.push(t.hostingFlag);

  const displayIpv4 = data.ipv4;
  const displayIpv6 = data.ipv6 || clientIpv6;
  const connectionTypeLabel =
    data.connectionType === "Festnetz" ? t.connectionDsl : data.connectionType;

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

        {data.city !== t.unknown && (
          <p className="text-center text-base text-muted-foreground">
            {data.city}, {data.regionName}, {data.country}
          </p>
        )}
      </div>

      <div className="flex w-full max-w-4xl flex-col items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-6 py-5 text-center">
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
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/50">
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

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/50">
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
          value={
            data.city !== t.unknown ? `${data.city}, ${data.regionName}` : t.unknown
          }
          detail={data.country}
        />
        <InfoCard icon={Globe} label={t.country} value={data.country} detail={data.countryCode} />
        <InfoCard icon={Clock} label={t.timezone} value={data.timezone} detail={t.timezoneDetail} />
        <InfoCard icon={Wifi} label={t.isp} value={data.isp} detail={t.ispDetail} />
        <InfoCard
          icon={Building2}
          label={t.organization}
          value={data.org}
          detail={t.organizationDetail}
        />
        <InfoCard
          icon={Hash}
          label={t.asNumber}
          value={data.as}
          detail={data.asname || t.asFallbackDetail}
        />
        <InfoCard
          icon={Map}
          label={t.coordinates}
          value={`${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`}
          detail={t.coordinatesDetail}
        />
        <InfoCard icon={MapPin} label={t.region} value={data.regionName} detail={data.region} />
        <InfoCard
          icon={Hash}
          label={t.postalCode}
          value={data.zip || "N/V"}
          detail={t.postalCodeDetail}
        />
      </div>
    </div>
  );
}
