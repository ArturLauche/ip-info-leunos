"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { InfoCard } from "@/components/info-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

function CopyButton({
  text,
  label,
  copiedLabel,
}: {
  text: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(copiedLabel);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable in some browsers/contexts.
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleCopy}
      aria-label={label}
      className="shrink-0 text-muted-foreground hover:text-foreground"
    >
      {copied ? (
        <Check className="size-4 text-success" />
      ) : (
        <Copy className="size-4" />
      )}
    </Button>
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
      <div className="flex w-full flex-col gap-6">
        <Card className="gap-0 overflow-hidden p-0">
          <div className="grid lg:grid-cols-[1.5fr_1fr]">
            <div className="flex flex-col gap-4 p-6 lg:p-7">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-6 w-80 max-w-full" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex flex-col gap-3 border-t bg-muted/30 p-6 lg:border-t-0 lg:border-l lg:p-7">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="items-center gap-3 p-10 text-center">
        <ShieldAlert className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t.ipInfoError}</p>
      </Card>
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
    <div className="flex w-full flex-col gap-6">
      <Card className="gap-0 overflow-hidden p-0">
        <div className="grid lg:grid-cols-[1.5fr_1fr]">
          {/* Addresses */}
          <div className="flex flex-col gap-5 p-6 lg:p-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {targetIp ? t.queriedIpAddress : t.yourIpAddresses}
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant={displayIpv4 ? "outline" : "secondary"}
                  className="font-mono"
                >
                  IPv4
                </Badge>
                {displayIpv4 ? (
                  <>
                    <span className="min-w-0 truncate font-mono text-xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      {displayIpv4}
                    </span>
                    <CopyButton
                      text={displayIpv4}
                      label={t.copyIpLabel}
                      copiedLabel={t.copiedToClipboard}
                    />
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {t.notAvailable}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={displayIpv6 ? "outline" : "secondary"}
                  className="font-mono"
                >
                  IPv6
                </Badge>
                {displayIpv6 ? (
                  <>
                    <span className="min-w-0 truncate font-mono text-sm font-semibold tracking-tight text-foreground sm:text-lg">
                      {displayIpv6}
                    </span>
                    <CopyButton
                      text={displayIpv6}
                      label={t.copyIpLabel}
                      copiedLabel={t.copiedToClipboard}
                    />
                  </>
                ) : !targetIp && ipv6Loading ? (
                  <Skeleton className="h-5 w-48" />
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {t.notAvailable}
                  </span>
                )}
              </div>
            </div>

            {data.city && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0 text-muted-foreground/70" />
                {[data.city, data.regionName, data.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>

          {/* Connection summary */}
          <div className="flex flex-col justify-center gap-4 border-t bg-muted/30 p-6 lg:border-t-0 lg:border-l lg:p-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.detectedConnectionType}
            </p>
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                <ConnectionIcon className="size-5" />
              </span>
              <span className="text-lg font-semibold text-foreground">
                {connectionTypeLabel}
              </span>
            </div>

            {flags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {flags.map((flag) => (
                  <Badge key={flag} variant="secondary">
                    {flag}
                  </Badge>
                ))}
              </div>
            )}

            {reputationIp && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-fit"
              >
                <Link href={`/reputation?ip=${encodeURIComponent(reputationIp)}`}>
                  <ShieldAlert className="size-4" />
                  {t.checkReputation}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard
          icon={MapPin}
          label={t.location}
          value={data.city ? `${data.city}, ${data.regionName}` : t.unknown}
          detail={data.country}
        />
        <InfoCard
          icon={Globe}
          label={t.country}
          value={orUnknown(data.country)}
          detail={data.countryCode}
        />
        <InfoCard
          icon={Clock}
          label={t.timezone}
          value={orUnknown(data.timezone)}
          detail={t.timezoneDetail}
        />
        <InfoCard
          icon={Wifi}
          label={t.isp}
          value={orUnknown(data.isp)}
          detail={t.ispDetail}
        />
        <InfoCard
          icon={Building2}
          label={t.organization}
          value={orUnknown(data.org)}
          detail={t.organizationDetail}
        />
        {data.reverse && (
          <InfoCard
            icon={Network}
            label={t.reverseDns}
            value={data.reverse}
            detail={t.reverseDnsDetail}
          />
        )}
        <Card className="gap-0 py-0 transition-colors hover:border-primary/40">
          <div className="flex flex-col gap-2.5 p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Hash className="size-4" />
              </span>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t.asNumber}
              </span>
            </div>
            {asnHref ? (
              <Link
                href={asnHref}
                className="inline-flex max-w-full items-center gap-1 text-base font-semibold text-foreground transition-colors hover:text-primary"
              >
                <span className="truncate">{data.as}</span>
                <ExternalLink className="size-3.5 shrink-0" />
              </Link>
            ) : (
              <p className="truncate text-base font-semibold text-foreground">
                {orUnknown(data.as)}
              </p>
            )}
            <p className="truncate text-xs text-muted-foreground">
              {data.asname || t.asFallbackDetail}
            </p>
          </div>
        </Card>
        <InfoCard
          icon={Map}
          label={t.coordinates}
          value={`${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`}
          detail={t.coordinatesDetail}
        />
        <InfoCard
          icon={MapPin}
          label={t.region}
          value={orUnknown(data.regionName)}
          detail={data.region}
        />
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
