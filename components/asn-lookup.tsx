"use client";

import { type Locale } from "@/lib/i18n";
import { unwrapApiResponse } from "@/lib/api/client";
import { getToolTranslation } from "@/lib/tool-i18n";
import { normalizeAsn } from "@/lib/asn/input";
import type { AsnProfile, SourceStatus } from "@/lib/asn/profile";
import { ErrorPanel } from "@/components/error-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  ExternalLink,
  Fingerprint,
  Globe,
  Hash,
  Info,
  Link2,
  Network,
  Route,
  Server,
  ShieldCheck,
  Waypoints,
} from "lucide-react";

interface AsnLookupProps {
  locale: Locale;
  initialAsn?: string;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/50 py-2.5 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="break-words text-sm font-medium text-foreground sm:text-right">{value}</span>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Globe;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function RelationList({ items, emptyLabel }: { items: { asn: string; name?: string }[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.asn}
          href={`/asn/${encodeURIComponent(item.asn)}`}
          title={item.name}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 font-mono text-xs text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          {item.asn}
        </Link>
      ))}
    </div>
  );
}

function sourceStatusClass(status: SourceStatus) {
  if (status === "available") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  if (status === "error") return "bg-destructive/15 text-destructive border-destructive/40";
  return "bg-secondary text-muted-foreground border-border";
}

export function AsnLookup({ locale, initialAsn = "" }: AsnLookupProps) {
  const router = useRouter();
  const t = getToolTranslation(locale);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<AsnProfile | null>(null);

  const runLookup = useCallback(
    async (raw: string) => {
      const normalized = normalizeAsn(raw);
      if (!normalized.ok) {
        setError(t.asnInvalidInput);
        setProfile(null);
        return;
      }

      setLoading(true);
      setError(null);
      setProfile(null);

      try {
        const response = await fetch(`/api/asn/${encodeURIComponent(normalized.value.asn)}`);
        const data = unwrapApiResponse<AsnProfile>(await response.json());
        setProfile(data);
      } catch (lookupError) {
        setError((lookupError as Error).message || t.asnNetworkError);
      } finally {
        setLoading(false);
      }
    },
    [t.asnInvalidInput, t.asnNetworkError],
  );

  const handleSubmit = useCallback(
    (raw: string) => {
      const normalized = normalizeAsn(raw);
      if (!normalized.ok) {
        setError(t.asnInvalidInput);
        setProfile(null);
        return;
      }
      router.push(`/asn/${encodeURIComponent(normalized.value.asn)}`);
    },
    [router, t.asnInvalidInput],
  );

  useEffect(() => {
    if (initialAsn.trim()) {
      runLookup(initialAsn);
    }
  }, [initialAsn, runLookup]);

  const sourceLabel = (status: SourceStatus) => {
    if (status === "available") return t.asnSourceAvailable;
    if (status === "unavailable") return t.asnSourceUnavailable;
    if (status === "not_configured") return t.asnSourceNotConfigured;
    return t.asnSourceError;
  };

  const na = t.asnNotAvailable;
  const hasNoData =
    profile &&
    profile.sources.ipinfo !== "available" &&
    profile.sources.peeringdb !== "available";

  return (
    <div className="flex w-full flex-col gap-8">
      <ToolSearchForm
        initialValue={initialAsn}
        placeholder={t.asnPlaceholder}
        submitLabel={t.asnLookupButton}
        loadingLabel={t.asnLoading}
        loading={loading}
        onSubmit={handleSubmit}
      />

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      )}

      {error && <ErrorPanel message={error} />}

      {profile && !loading && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/25">
                <Hash className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-mono text-xl font-bold tracking-tight text-foreground">{profile.asn}</p>
                <p className="text-sm text-muted-foreground">{profile.name || na}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://ipinfo.io/${profile.asn}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {t.asnViewOnIpinfo}
                <ExternalLink className="h-3 w-3" />
              </a>
              {profile.peeringdb?.netId != null && (
                <a
                  href={`https://www.peeringdb.com/net/${profile.peeringdb.netId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {t.asnViewOnPeeringdb}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {hasNoData && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
              {t.asnNotFound}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionCard icon={Fingerprint} title={t.asnIdentityTitle}>
              <div className="flex flex-col">
                <InfoRow label={t.asnNameLabel} value={profile.name || na} />
                <InfoRow label={t.asnCountryLabel} value={profile.country || na} />
                <InfoRow label={t.asnRegistryLabel} value={profile.registry || na} />
                <InfoRow label={t.asnAllocatedLabel} value={profile.allocated || na} />
                <InfoRow
                  label={t.asnDomainLabel}
                  value={
                    profile.domain ? (
                      <a
                        href={`https://${profile.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.domain}
                      </a>
                    ) : (
                      na
                    )
                  }
                />
                <InfoRow label={t.asnTypeLabel} value={profile.type || na} />
                <InfoRow
                  label={t.asnNumIpsLabel}
                  value={profile.numIps != null ? profile.numIps.toLocaleString() : na}
                />
                <InfoRow label={t.asnRpkiLabel} value={profile.rpki || na} />
              </div>
            </SectionCard>

            <SectionCard icon={Network} title={t.asnPrefixesTitle}>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t.asnPrefixes4Label} ({profile.prefixes4.length})
                  </p>
                  {profile.prefixes4.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.prefixes4.map((prefix) => (
                        <span
                          key={prefix.prefix}
                          className="rounded-md border border-border bg-secondary px-2 py-1 font-mono text-xs text-muted-foreground"
                        >
                          {prefix.prefix}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.asnNoPrefixes}</p>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t.asnPrefixes6Label} ({profile.prefixes6.length})
                  </p>
                  {profile.prefixes6.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.prefixes6.map((prefix) => (
                        <span
                          key={prefix.prefix}
                          className="rounded-md border border-border bg-secondary px-2 py-1 font-mono text-xs text-muted-foreground"
                        >
                          {prefix.prefix}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.asnNoPrefixes}</p>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={Route} title={t.asnRelationsTitle}>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t.asnUpstreamsLabel} ({profile.upstreams.length})
                  </p>
                  <RelationList items={profile.upstreams} emptyLabel={t.asnNoRelations} />
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t.asnPeersLabel} ({profile.peers.length})
                  </p>
                  <RelationList items={profile.peers} emptyLabel={t.asnNoRelations} />
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t.asnDownstreamsLabel} ({profile.downstreams.length})
                  </p>
                  <RelationList items={profile.downstreams} emptyLabel={t.asnNoRelations} />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={Waypoints} title={t.asnPeeringTitle}>
              {profile.peeringdb ? (
                <div className="flex flex-col">
                  <InfoRow label={t.asnAkaLabel} value={profile.peeringdb.aka || na} />
                  <InfoRow
                    label={t.asnWebsiteLabel}
                    value={
                      profile.peeringdb.website ? (
                        <a
                          href={profile.peeringdb.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <Link2 className="h-3 w-3" />
                          {t.asnWebsiteLabel}
                        </a>
                      ) : (
                        na
                      )
                    }
                  />
                  <InfoRow
                    label={t.asnLookingGlassLabel}
                    value={
                      profile.peeringdb.lookingGlass ? (
                        <a
                          href={profile.peeringdb.lookingGlass}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {t.asnLookingGlassLabel}
                        </a>
                      ) : (
                        na
                      )
                    }
                  />
                  <InfoRow
                    label={t.asnRouteServerLabel}
                    value={
                      profile.peeringdb.routeServer ? (
                        <a
                          href={profile.peeringdb.routeServer}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {t.asnRouteServerLabel}
                        </a>
                      ) : (
                        na
                      )
                    }
                  />
                  <InfoRow label={t.asnTrafficLabel} value={profile.peeringdb.traffic || na} />
                  <InfoRow label={t.asnPolicyGeneralLabel} value={profile.peeringdb.policyGeneral || na} />
                  <InfoRow label={t.asnPolicyLocationsLabel} value={profile.peeringdb.policyLocations || na} />
                  <InfoRow
                    label={t.asnPolicyRatioLabel}
                    value={
                      profile.peeringdb.policyRatio == null
                        ? na
                        : profile.peeringdb.policyRatio
                          ? t.asnYes
                          : t.asnNo
                    }
                  />
                  <InfoRow label={t.asnPolicyContractsLabel} value={profile.peeringdb.policyContracts || na} />
                  <InfoRow
                    label={t.asnInfoPrefixes4Label}
                    value={profile.peeringdb.infoPrefixes4 != null ? profile.peeringdb.infoPrefixes4.toLocaleString() : na}
                  />
                  <InfoRow
                    label={t.asnInfoPrefixes6Label}
                    value={profile.peeringdb.infoPrefixes6 != null ? profile.peeringdb.infoPrefixes6.toLocaleString() : na}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t.asnNoPeeringDb}</p>
              )}
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionCard icon={Server} title={`${t.asnIxTitle} (${profile.peeringdb?.ixCount ?? 0})`}>
              {profile.peeringdb && profile.peeringdb.ixlan.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {profile.peeringdb.ixlan.map((ix, index) => (
                    <li
                      key={`${ix.name ?? "ix"}-${index}`}
                      className="flex flex-col gap-1 rounded-lg border border-border/60 bg-secondary/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="text-sm font-medium text-foreground">{ix.name || na}</span>
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
                        {ix.speed ? <span>{(ix.speed / 1000).toLocaleString()} Gbps</span> : null}
                        {ix.ipaddr4 ? <span>{ix.ipaddr4}</span> : null}
                        {ix.ipaddr6 ? <span>{ix.ipaddr6}</span> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{t.asnNoIx}</p>
              )}
            </SectionCard>

            <SectionCard icon={Building2} title={`${t.asnFacilitiesTitle} (${profile.peeringdb?.facilityCount ?? 0})`}>
              {profile.peeringdb && profile.peeringdb.facilities.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {profile.peeringdb.facilities.map((facility, index) => (
                    <li
                      key={`${facility.name ?? "fac"}-${index}`}
                      className="flex flex-col gap-1 rounded-lg border border-border/60 bg-secondary/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="text-sm font-medium text-foreground">{facility.name || na}</span>
                      <span className="text-xs text-muted-foreground">
                        {[facility.city, facility.country].filter(Boolean).join(", ") || na}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{t.asnNoFacilities}</p>
              )}
            </SectionCard>
          </div>

          <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {t.asnSourcesTitle}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${sourceStatusClass(profile.sources.ipinfo)}`}
              >
                {t.asnSourceIpinfo}: {sourceLabel(profile.sources.ipinfo)}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${sourceStatusClass(profile.sources.peeringdb)}`}
              >
                {t.asnSourcePeeringdb}: {sourceLabel(profile.sources.peeringdb)}
              </span>
            </div>

            {profile.warnings.length > 0 && (
              <div className="mt-4">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Info className="h-3.5 w-3.5" />
                  {t.asnWarningsTitle}
                </p>
                <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                  {profile.warnings.map((warning) => (
                    <li key={warning} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
