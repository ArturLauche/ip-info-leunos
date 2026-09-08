"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  CircleCheck,
  Copy,
  ExternalLink,
  Globe,
  Waypoints,
} from "lucide-react";
import { CountryFlag } from "@/components/country-flag";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AsnProfile, SourceStatus } from "@/lib/asn";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { formatStatus, formatWarning, sourceBadgeVariant } from "./helpers";

function CopyAsnButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="shrink-0 text-muted-foreground hover:text-foreground"
      aria-label={label}
      title={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 1800);
        } catch {
          // Clipboard unavailable — keep the copy icon, no dead toast path.
        }
      }}
    >
      {copied ? (
        <Check className="size-4 text-success" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
        {value}
      </p>
      <p className="truncate text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

export function AsnOverview({
  result,
  t,
  locale,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  const totalPrefixes = (result.prefixes4Total || 0) + (result.prefixes6Total || 0);
  const totalNeighbours =
    result.peersTotal + result.upstreamsTotal + result.downstreamsTotal;
  const ixCount = result.peeringdb?.ixCount ?? result.peeringdb?.ixlanTotal ?? 0;
  const facilityCount =
    result.peeringdb?.facilityCount ?? result.peeringdb?.facilitiesTotal ?? 0;

  const isPartial =
    result.sources.ipinfo !== "available" ||
    result.sources.peeringdb !== "available" ||
    result.sources.ripestat !== "available" ||
    result.warnings.length > 0;

  const v4Share = totalPrefixes > 0 ? (result.prefixes4Total || 0) / totalPrefixes : 0;

  const ripestatUrl = `https://stat.ripe.net/app/launchpad/${encodeURIComponent(result.asn)}`;
  const peeringDbUrl = result.peeringdb?.netId
    ? `https://www.peeringdb.com/net/${result.peeringdb.netId}`
    : `https://www.peeringdb.com/search?q=${encodeURIComponent(result.asn)}`;

  const sources = Object.entries(result.sources) as Array<[string, SourceStatus]>;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
              <Waypoints className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {result.asn}
                {result.peeringdb?.netId ? ` · ID ${result.peeringdb.netId}` : ""}
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight break-words text-foreground sm:text-2xl">
                {result.name || t.asnUnnamed}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {result.domain ? (
                  <a
                    href={`https://${result.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                  >
                    <Globe className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{result.domain}</span>
                  </a>
                ) : null}
                {result.allocated ? (
                  <span className="text-xs text-muted-foreground">
                    {t.asnLabelAllocated}:{" "}
                    <span className="font-medium text-foreground/80">{result.allocated}</span>
                  </span>
                ) : null}
              </div>
              {result.country || result.type || result.registry ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {result.country ? (
                    <Badge variant="secondary">
                      <CountryFlag countryCode={result.country} />
                      {result.country}
                    </Badge>
                  ) : null}
                  {result.type ? (
                    <Badge variant="secondary" className="capitalize">
                      {result.type}
                    </Badge>
                  ) : null}
                  {result.registry ? (
                    <Badge variant="secondary">{result.registry}</Badge>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            {isPartial ? (
              <Badge variant="warning">
                <AlertTriangle className="size-3.5" aria-hidden="true" />
                {t.asnPartialData}
              </Badge>
            ) : (
              <Badge variant="success">
                <CircleCheck className="size-3.5" aria-hidden="true" />
                {t.asnCompleteData}
              </Badge>
            )}
            <div className="flex items-center gap-1">
              <CopyAsnButton text={result.asn} label={t.copyValue} />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                asChild
              >
                <a
                  href={ripestatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t.asnOpenInRipestat}
                  title={t.asnOpenInRipestat}
                >
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="font-mono text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                asChild
              >
                <a
                  href={peeringDbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t.asnOpenInPeeringDb}
                  title={t.asnOpenInPeeringDb}
                >
                  PDB
                </a>
              </Button>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border/60 pt-5 sm:grid-cols-4">
          <Stat
            label={t.asnTotalPrefixes}
            value={formatNumber(totalPrefixes, locale)}
            sub={`${formatNumber(result.prefixes4Total, locale)} v4 · ${formatNumber(result.prefixes6Total, locale)} v6`}
          />
          <Stat
            label={t.asnTotalNeighbours}
            value={formatNumber(totalNeighbours, locale)}
            sub={`${formatNumber(result.peersTotal, locale)} ${t.asnRelationPeers} · ${formatNumber(result.upstreamsTotal, locale)} ${t.asnRelationUpstreams} · ${formatNumber(result.downstreamsTotal, locale)} ${t.asnRelationDownstreams}`}
          />
          <Stat
            label={t.asnIxPresence}
            value={formatNumber(ixCount, locale)}
            sub={t.asnMetricPeeringDbProfileDetail}
          />
          {result.numIps !== null ? (
            <Stat
              label={t.asnMetricIpv4Addresses}
              value={formatNumber(result.numIps, locale)}
              sub={t.asnMetricIpinfoDetail}
            />
          ) : (
            <Stat
              label={t.asnFacilities}
              value={formatNumber(facilityCount, locale)}
              sub={t.asnFacilitiesDescription}
            />
          )}
        </dl>

        {totalPrefixes > 0 ? (
          <div className="flex flex-col gap-2">
            <div
              className="flex h-1.5 w-full overflow-hidden rounded-full bg-secondary"
              role="img"
              aria-label={`${t.asnLabelIpv4} ${formatNumber(result.prefixes4Total, locale)}, ${t.asnLabelIpv6} ${formatNumber(result.prefixes6Total, locale)}`}
            >
              <div
                className="h-full rounded-full bg-foreground"
                style={{ width: `${Math.round(v4Share * 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-foreground" aria-hidden="true" />
                <span className="font-mono">v4</span> {formatNumber(result.prefixes4Total, locale)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full bg-muted-foreground/40 ring-1 ring-inset ring-foreground/20"
                  aria-hidden="true"
                />
                <span className="font-mono">v6</span> {formatNumber(result.prefixes6Total, locale)}
              </span>
              {result.numIps !== null ? (
                <span className="ml-auto hidden tabular-nums sm:inline">
                  {formatNumber(result.numIps, locale)} {t.asnPrefixIpCount}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t bg-muted/30 px-5 py-3 sm:px-6">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t.asnSourcesLabel}
        </span>
        {sources.map(([source, status]) => (
          <Badge key={source} variant={sourceBadgeVariant(status)} className="font-mono normal-case">
            {source} · {formatStatus(status, t)}
          </Badge>
        ))}
      </div>

      {result.warnings.length > 0 ? (
        <div className="border-t px-5 py-4 sm:px-6">
          <Alert variant="warning">
            <AlertTriangle aria-hidden="true" />
            <AlertTitle>{t.asnWarnings}</AlertTitle>
            <AlertDescription>
              <ul className="list-disc space-y-1 pl-4">
                {result.warnings.map((warning) => (
                  <li key={warning}>{formatWarning(warning, t, locale)}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
    </Card>
  );
}
