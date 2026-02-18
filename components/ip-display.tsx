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
      className="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
      aria-label={label}
    >
      <span className="relative block h-4 w-4">
        <Copy
          className={`absolute inset-0 h-4 w-4 transition-all duration-200 ${copied ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
        />
        <Check
          className={`absolute inset-0 h-4 w-4 text-primary transition-all duration-200 ${copied ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
        />
      </span>
    </button>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-shimmer rounded-lg ${className}`} />;
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
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-10 w-72" />
          <SkeletonBlock className="h-4 w-48" />
        </div>
        <SkeletonBlock className="h-24 w-full max-w-4xl" />
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
          <SkeletonBlock className="h-20" />
          <SkeletonBlock className="h-20" />
        </div>
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="animate-fade-in flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-8 py-6 text-center">
        <p className="text-sm font-medium text-destructive">{t.ipInfoError}</p>
      </div>
    );
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
    <div className="animate-fade-in flex w-full flex-col items-center gap-10">
      {/* IP Address Header */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {targetIp ? t.queriedIpAddress : t.yourIpAddresses}
        </p>

        {displayIpv4 && (
          <div className="flex w-full max-w-full items-center justify-center gap-3">
            <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              IPv4
            </span>
            <h1 className="min-w-0 text-center font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {displayIpv4}
            </h1>
            <CopyButton text={displayIpv4} label={t.copyIpLabel} />
          </div>
        )}

        {displayIpv6 && (
          <div className="flex w-full max-w-full items-center justify-center gap-3">
            <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
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
            <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
              IPv6
            </span>
            <SkeletonBlock className="h-5 w-48" />
          </div>
        )}

        {!targetIp && !ipv6Loading && !displayIpv6 && displayIpv4 && (
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
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

      {/* Connection Type Banner */}
      <div className="animate-fade-in-up flex w-full max-w-4xl flex-col items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-6 py-5 text-center" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ConnectionIcon className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">
            {connectionTypeLabel}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{t.detectedConnectionType}</p>
        {flags.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            {flags.map((flag) => (
              <span
                key={flag}
                className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {flag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* IPv4/IPv6 Status Cards */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
        <div
          className="animate-fade-in-up flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          style={{ animationDelay: "160ms" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Network className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.ipv4Status}
            </p>
            <p className="mt-1 truncate text-lg font-semibold tracking-tight text-foreground">
              {displayIpv4 ? t.available : t.notDetected}
            </p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {displayIpv4 || "-"}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${displayIpv4 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}
          >
            {displayIpv4 ? t.active : t.inactive}
          </span>
        </div>

        <div
          className="animate-fade-in-up flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          style={{ animationDelay: "220ms" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Network className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.ipv6Status}
            </p>
            <p className="mt-1 truncate text-lg font-semibold tracking-tight text-foreground">
              {displayIpv6 ? t.available : t.notDetected}
            </p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {displayIpv6 || "-"}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${displayIpv6 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}
          >
            {displayIpv6 ? t.active : t.inactive}
          </span>
        </div>
      </div>

      {/* Detail Cards Grid */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard
          icon={MapPin}
          label={t.location}
          value={
            data.city !== t.unknown ? `${data.city}, ${data.regionName}` : t.unknown
          }
          detail={data.country}
          index={0}
        />
        <InfoCard icon={Globe} label={t.country} value={data.country} detail={data.countryCode} index={1} />
        <InfoCard icon={Clock} label={t.timezone} value={data.timezone} detail={t.timezoneDetail} index={2} />
        <InfoCard icon={Wifi} label={t.isp} value={data.isp} detail={t.ispDetail} index={3} />
        <InfoCard
          icon={Building2}
          label={t.organization}
          value={data.org}
          detail={t.organizationDetail}
          index={4}
        />
        <InfoCard
          icon={Hash}
          label={t.asNumber}
          value={data.as}
          detail={data.asname || t.asFallbackDetail}
          index={5}
        />
        <InfoCard
          icon={Map}
          label={t.coordinates}
          value={`${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`}
          detail={t.coordinatesDetail}
          index={6}
        />
        <InfoCard icon={MapPin} label={t.region} value={data.regionName} detail={data.region} index={7} />
        <InfoCard
          icon={Hash}
          label={t.postalCode}
          value={data.zip || "N/V"}
          detail={t.postalCodeDetail}
          index={8}
        />
      </div>
    </div>
  );
}
