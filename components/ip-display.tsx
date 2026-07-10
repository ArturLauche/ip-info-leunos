"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTranslation, type Locale, type Translation } from "@/lib/i18n";
import { CountryFlag } from "@/components/country-flag";
import { unwrapApiResponse } from "@/lib/api/client";
import { normalizeAsnInput } from "@/lib/asn";
import { formatTemplate } from "@/lib/format";
import {
  discoverClientIp,
  resolveDisplayIps,
  type ClientIpDiscoveryResult,
  type LocalIpCheck,
} from "@/lib/client-ip-discovery";
import {
  assessLocalProxyHints,
  isProxyHintProduct,
  mergeProxyHintAssessments,
  PROXY_HINT_PRODUCT_NAMES,
  type BrowserDeviceHints,
  type ConnectionType,
  type ProxyHintAssessment,
  type ProxyHintConfidence,
  type ProxyHintFixedLabel,
  type ProxyHintLabel,
} from "@/lib/connection-type";
import {
  MapPin,
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
  proxyHints?: ProxyHintAssessment;
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

/** Titled container for a group of label/value rows (Location, Network). */
function DetailCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center gap-2.5 border-b bg-muted/30 px-5 py-3.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <dl className="px-5">{children}</dl>
    </Card>
  );
}

/** One label/value row inside a DetailCard, hairline-separated. */
function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-3 last:border-b-0">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium break-words text-foreground">
        {children}
      </dd>
    </div>
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

const PROXY_HINT_BADGE_VARIANTS: Record<
  ProxyHintConfidence,
  "secondary" | "info" | "warning"
> = {
  none: "secondary",
  low: "secondary",
  medium: "info",
  high: "warning",
};

function getProxyHintLabelPriority(label: ProxyHintLabel) {
  if (label.startsWith("product-header:")) return 100;
  if (["via-header", "proxy-header", "cache-header"].includes(label)) return 90;
  if (label.startsWith("product-signature:")) return 80;
  if (["gateway-signature", "socks-signature", "proxy-signature"].includes(label)) return 70;
  if (label === "forwarded-chain") return 60;
  if (["school-network", "enterprise-network"].includes(label)) return 50;
  return 40;
}

function formatProxyHintLabel(label: ProxyHintLabel, t: Translation) {
  const [kind, productId] = label.split(":", 2);
  if (
    (kind === "product-header" || kind === "product-signature") &&
    productId &&
    isProxyHintProduct(productId)
  ) {
    return formatTemplate(
      kind === "product-header" ? t.proxyHintProductHeader : t.proxyHintProductSignature,
      { product: PROXY_HINT_PRODUCT_NAMES[productId] },
    );
  }

  return t.proxyHintSignals[label as ProxyHintFixedLabel] || t.proxyHintSignals["proxy-signature"];
}

export function IpDisplay({ targetIp, locale }: IpDisplayProps) {
  const [data, setData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [clientIpv6, setClientIpv6] = useState<ClientIpDiscoveryResult | null>(null);
  const [clientIpv4, setClientIpv4] = useState<ClientIpDiscoveryResult | null>(null);
  const [ipv6Loading, setIpv6Loading] = useState(false);
  const [localProxyHints, setLocalProxyHints] = useState<ProxyHintAssessment | null>(null);
  const t = getTranslation(locale);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setData(null);

    const controller = new AbortController();
    const url = targetIp
      ? `/api/ip?ip=${encodeURIComponent(targetIp)}`
      : "/api/ip";

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        setData(unwrapApiResponse<IpData>(json));
        setLoading(false);
      })
      .catch(() => {
        // Ignore the abort triggered when targetIp changes mid-flight so a
        // stale response can never overwrite a newer lookup.
        if (controller.signal.aborted) return;
        setError(true);
        setLoading(false);
      });

    return () => controller.abort();
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

  useEffect(() => {
    setLocalProxyHints(null);
    if (targetIp || loading || error || !data) return;

    const now = new Date();
    const navigatorWithNetworkInfo = navigator as Navigator & {
      deviceMemory?: number;
      connection?: BrowserDeviceHints["connection"];
    };
    const connection = navigatorWithNetworkInfo.connection;
    const deviceHints: BrowserDeviceHints = {
      userAgent: navigator.userAgent || "",
      platform: navigator.platform || "",
      language: navigator.language || "",
      languages: [...(navigator.languages || [])],
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigatorWithNetworkInfo.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
      webdriver: navigator.webdriver,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      timezoneOffsetMinutes: -now.getTimezoneOffset(),
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
      },
      connection: connection
        ? {
            type: connection.type,
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData,
          }
        : undefined,
    };

    setLocalProxyHints(assessLocalProxyHints(data, deviceHints, now));
  }, [data, error, loading, targetIp]);

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-6">
        <Card className="gap-0 overflow-hidden p-0">
          <div className="h-1 bg-gradient-to-r from-primary/60 via-primary/20 to-info/40" />
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
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, card) => (
            <Card key={card} className="gap-0 overflow-hidden py-0">
              <div className="border-b bg-muted/30 px-5 py-3.5">
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="flex flex-col gap-3 p-5">
                {Array.from({ length: 5 }).map((_, row) => (
                  <div key={row} className="flex justify-between gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </Card>
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
  const displayedProxyHints = targetIp
    ? null
    : mergeProxyHintAssessments(data.proxyHints, localProxyHints);
  const displayedProxyHintLabels = displayedProxyHints?.detected
    ? [...displayedProxyHints.labels]
        .sort((left, right) => getProxyHintLabelPriority(right) - getProxyHintLabelPriority(left))
        .slice(0, 3)
        .map((label) => formatProxyHintLabel(label, t))
    : [];
  const orUnknown = (value: string) => value || t.unknown;
  const hasCoordinates = data.lat !== 0 || data.lon !== 0;
  const locationSummary = [data.city, data.country].filter(Boolean).join(", ");

  return (
    <div className="tool-reveal flex w-full flex-col gap-6">
      {/* Hero: addresses + connection summary */}
      <Card className="gap-0 overflow-hidden p-0">
        <div className="h-1 bg-gradient-to-r from-primary/60 via-primary/20 to-info/40" />
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

              <div className="flex items-start gap-3">
                <Badge
                  variant={displayIpv6 ? "outline" : "secondary"}
                  className="mt-0.5 font-mono"
                >
                  IPv6
                </Badge>
                {displayIpv6 ? (
                  <>
                    <span className="min-w-0 flex-1 font-mono text-sm font-semibold tracking-tight break-all text-foreground sm:text-lg">
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

            {locationSummary && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0 text-muted-foreground/70" />
                <CountryFlag countryCode={data.countryCode} />
                <span className="min-w-0 truncate">{locationSummary}</span>
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

            {displayedProxyHints?.detected && (
              <div className="rounded-lg border border-border/70 bg-background/60 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-warning/10 text-warning">
                    <ShieldAlert className="size-3.5" />
                  </span>
                  <p className="text-xs font-semibold text-foreground">
                    {t.additionalProxyHint}
                  </p>
                  <Badge variant={PROXY_HINT_BADGE_VARIANTS[displayedProxyHints.confidence]}>
                    {t.proxyHintConfidence}: {t.proxyHintConfidenceLevels[displayedProxyHints.confidence]}
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {t.possibleLocalProxy}
                </p>
                {displayedProxyHintLabels.length > 0 && (
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground/80">{t.proxyHintReasons}:</span>{" "}
                    {displayedProxyHintLabels.join(", ")}
                  </p>
                )}
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground/80">
                  {t.proxyHintDisclaimer}
                </p>
              </div>
            )}

            {reputationIp && (
              <Button asChild variant="outline" size="sm" className="w-fit">
                <Link href={`/reputation?ip=${encodeURIComponent(reputationIp)}`}>
                  <ShieldAlert className="size-4" />
                  {t.checkReputation}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Grouped details */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DetailCard icon={MapPin} title={t.location}>
          <DetailRow label={t.city}>{orUnknown(data.city)}</DetailRow>
          <DetailRow label={t.region}>{orUnknown(data.regionName)}</DetailRow>
          <DetailRow label={t.country}>
            <span className="inline-flex items-center gap-1.5">
              <CountryFlag countryCode={data.countryCode} />
              {orUnknown(data.country)}
            </span>
          </DetailRow>
          {data.zip && (
            <DetailRow label={t.postalCode}>
              <span className="font-mono">{data.zip}</span>
            </DetailRow>
          )}
          {hasCoordinates && (
            <DetailRow label={t.coordinates}>
              <span className="font-mono">
                {data.lat.toFixed(4)}, {data.lon.toFixed(4)}
              </span>
            </DetailRow>
          )}
          <DetailRow label={t.timezone}>{orUnknown(data.timezone)}</DetailRow>
        </DetailCard>

        <DetailCard icon={Network} title={t.networkSection}>
          <DetailRow label={t.isp}>{orUnknown(data.isp)}</DetailRow>
          <DetailRow label={t.organization}>{orUnknown(data.org)}</DetailRow>
          <DetailRow label={t.asNumber}>
            {asnHref ? (
              <Link
                href={asnHref}
                className="inline-flex items-center gap-1 font-mono text-foreground transition-colors hover:text-primary"
              >
                <span className="break-all">{data.as}</span>
                <ExternalLink className="size-3.5 shrink-0" />
              </Link>
            ) : (
              <span className="font-mono">{orUnknown(data.as)}</span>
            )}
          </DetailRow>
          {data.reverse && (
            <DetailRow label={t.reverseDns}>
              <span className="font-mono break-all">{data.reverse}</span>
            </DetailRow>
          )}
        </DetailCard>
      </div>
    </div>
  );
}
