"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  Check,
  Copy,
  ExternalLink,
  Search,
  Server,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  AsnPrefix,
  AsnProfile,
  AsnRelation,
  PeeringDbProfile,
  SourceStatus,
} from "@/lib/asn";
import { formatNumber, formatTemplate, valueOrDash } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { ToolTranslation } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";
import { ShowMoreButton } from "./show-more-button";
import {
  formatCacheStatus,
  formatSpeed,
  formatStatus,
  sourceBadgeVariant,
} from "./helpers";

/* ---------- shared bits ---------- */

function FilterInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 bg-card pl-9"
      />
    </div>
  );
}

function SectionHead({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function EmptyBox({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed px-4 py-8 text-center">
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}

function CopyTextButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="size-7 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 hover:text-foreground"
      aria-label={label}
      title={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // ignore clipboard failures
        }
      }}
    >
      {copied ? (
        <Check className="size-3.5 text-success" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
    </Button>
  );
}

/* ---------- routing ---------- */

function RelationRow({
  relation,
  maxPower,
  locale,
}: {
  relation: AsnRelation;
  maxPower: number;
  locale: Locale;
}) {
  const powerPct =
    maxPower > 0 && relation.power
      ? Math.min(100, Math.max(4, ((relation.power || 0) / maxPower) * 100))
      : 0;
  const ioParts: string[] = [];
  if (relation.v4Peers) ioParts.push(`v4 ${formatNumber(relation.v4Peers, locale)}`);
  if (relation.v6Peers) ioParts.push(`v6 ${formatNumber(relation.v6Peers, locale)}`);

  return (
    <li className="group border-b py-2.5 last:border-b-0">
      <div className="flex items-baseline justify-between gap-2">
        <Link
          href={`/asn/${relation.asn}`}
          className="inline-flex min-w-0 items-center gap-1 rounded-md font-mono text-sm font-semibold text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          <span className="truncate">{relation.asn}</span>
          <ArrowUpRight
            className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
            aria-hidden="true"
          />
        </Link>
        {relation.power ? (
          <span className="shrink-0 font-mono text-xs font-semibold tabular-nums text-foreground/80">
            {formatNumber(relation.power, locale)}
          </span>
        ) : null}
      </div>
      {relation.power ? (
        <div
          className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary"
          role="presentation"
        >
          <div className="h-full rounded-full bg-foreground/70" style={{ width: `${powerPct}%` }} />
        </div>
      ) : null}
      {ioParts.length > 0 ? (
        <p className="mt-1 font-mono text-[11px] tabular-nums text-muted-foreground">
          {ioParts.join(" · ")}
        </p>
      ) : null}
    </li>
  );
}

function RelationColumn({
  title,
  relations,
  total,
  filter,
  locale,
  t,
}: {
  title: string;
  relations: AsnRelation[];
  total: number;
  filter: string;
  locale: Locale;
  t: ToolTranslation;
}) {
  const [expanded, setExpanded] = useState(false);
  const limit = 8;
  const needle = filter.trim().toLowerCase();
  const filtered = needle
    ? relations.filter((r) => r.asn.toLowerCase().includes(needle))
    : relations;
  const visible = expanded ? filtered : filtered.slice(0, limit);
  const maxPower = useMemo(
    () => Math.max(...relations.map((r) => r.power || 0), 0),
    [relations],
  );

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <Badge variant="secondary" className="tabular-nums">
          {formatNumber(total, locale)}
        </Badge>
      </div>
      <div className="px-4 py-2">
        {visible.length > 0 ? (
          <ul className="flex flex-col">
            {visible.map((relation) => (
              <RelationRow
                key={relation.asn}
                relation={relation}
                maxPower={maxPower}
                locale={locale}
              />
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-xs text-muted-foreground">
            {needle ? t.asnNoFilterResults : t.asnNoRelations}
          </p>
        )}
      </div>
      {filtered.length > limit ? (
        <div className="border-t px-4 py-3">
          <ShowMoreButton
            expanded={expanded}
            onToggle={() => setExpanded(!expanded)}
            count={filtered.length}
            t={t}
          />
        </div>
      ) : null}
    </Card>
  );
}

function RoutingPanel({
  result,
  t,
  locale,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  const [filter, setFilter] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHead title={t.asnRouting} description={t.asnRoutingDescription} />
        <FilterInput value={filter} onChange={setFilter} placeholder={t.asnFilterPlaceholder} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RelationColumn
          title={t.asnRelationPeers}
          relations={result.peers}
          total={result.peersTotal}
          filter={filter}
          locale={locale}
          t={t}
        />
        <RelationColumn
          title={t.asnRelationUpstreams}
          relations={result.upstreams}
          total={result.upstreamsTotal}
          filter={filter}
          locale={locale}
          t={t}
        />
        <RelationColumn
          title={t.asnRelationDownstreams}
          relations={result.downstreams}
          total={result.downstreamsTotal}
          filter={filter}
          locale={locale}
          t={t}
        />
      </div>
    </div>
  );
}

/* ---------- prefixes ---------- */

function PrefixRow({ prefix, t }: { prefix: AsnPrefix; t: ToolTranslation }) {
  const rpki = prefix.rpkiStatus?.toLowerCase().trim();
  const meta = [
    prefix.name,
    prefix.country,
    prefix.status && prefix.status.toLowerCase() !== "announced" ? prefix.status : "",
    prefix.size ? `${prefix.size} ${t.asnPrefixIpCount}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="group flex flex-col gap-1 border-b py-2.5 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm font-semibold text-foreground/95 select-all">
          {prefix.netblock}
        </span>
        <CopyTextButton text={prefix.netblock} label={t.copyValue} />
        {rpki === "valid" ? (
          <Badge variant="success">{t.asnRpkiValid}</Badge>
        ) : rpki === "invalid" ? (
          <Badge variant="destructive">{t.asnRpkiInvalid}</Badge>
        ) : prefix.rpkiStatus ? (
          <Badge variant="secondary">
            {formatTemplate(t.asnRpkiStatus, { status: prefix.rpkiStatus })}
          </Badge>
        ) : null}
      </div>
      {meta ? <p className="text-[11px] text-muted-foreground">{meta}</p> : null}
    </li>
  );
}

function PrefixesPanel({
  result,
  t,
  locale,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  const [filter, setFilter] = useState("");
  const [family, setFamily] = useState<"all" | "v4" | "v6">("all");
  const [expanded, setExpanded] = useState(false);
  const limit = 12;

  const needle = filter.trim().toLowerCase();
  const pool =
    family === "v4" ? result.prefixes4 : family === "v6" ? result.prefixes6 : [...result.prefixes4, ...result.prefixes6];
  const total = family === "v4" ? result.prefixes4Total : family === "v6" ? result.prefixes6Total : result.prefixes4Total + result.prefixes6Total;
  const filtered = needle
    ? pool.filter(
        (p) =>
          p.netblock.toLowerCase().includes(needle) ||
          (p.name || "").toLowerCase().includes(needle),
      )
    : pool;
  const visible = expanded ? filtered : filtered.slice(0, limit);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHead title={t.asnPrefixes} description={t.asnPrefixesDescription} />
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-md border" role="group" aria-label="IP version">
            {(["all", "v4", "v6"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setFamily(option);
                  setExpanded(false);
                }}
                aria-pressed={family === option}
                className={cn(
                  "h-9 px-3 font-mono text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  family === option
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {option === "all"
                  ? `${t.reputationFilterAll} · ${formatNumber(total, locale)}`
                  : option === "v4"
                    ? `v4 ${formatNumber(result.prefixes4Total, locale)}`
                    : `v6 ${formatNumber(result.prefixes6Total, locale)}`}
              </button>
            ))}
          </div>
          <FilterInput value={filter} onChange={setFilter} placeholder={t.asnFilterPlaceholder} />
        </div>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-4 py-3">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {family === "all" ? t.asnTotalPrefixes : family === "v4" ? t.asnLabelIpv4 : t.asnLabelIpv6}
          </p>
          <Badge variant="secondary" className="tabular-nums">
            {formatNumber(total, locale)}
          </Badge>
        </div>
        <div className="px-4 py-2">
          {visible.length > 0 ? (
            <ul className="flex flex-col">
              {visible.map((prefix, idx) => (
                <PrefixRow key={`${prefix.netblock}-${idx}`} prefix={prefix} t={t} />
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground">
              {needle ? t.asnNoFilterResults : t.asnNoPrefixes}
            </p>
          )}
        </div>
        {filtered.length > limit ? (
          <div className="border-t px-4 py-3">
            <ShowMoreButton
              expanded={expanded}
              onToggle={() => setExpanded(!expanded)}
              count={filtered.length}
              t={t}
            />
          </div>
        ) : null}
      </Card>
    </div>
  );
}

/* ---------- interconnection ---------- */

function SpeedCell({
  speed,
  t,
  locale,
  maxSpeed,
}: {
  speed: number | null;
  t: ToolTranslation;
  locale: Locale;
  maxSpeed: number;
}) {
  const pct = speed && maxSpeed > 0 ? Math.min(100, Math.max(4, (speed / maxSpeed) * 100)) : 0;
  return (
    <div className="flex min-w-[110px] flex-col gap-1.5">
      <span className="font-mono text-xs font-semibold text-foreground/90">
        {formatSpeed(speed, t, locale)}
      </span>
      {speed ? (
        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary" role="presentation">
          <div className="h-full rounded-full bg-foreground/70" style={{ width: `${pct}%` }} />
        </div>
      ) : null}
    </div>
  );
}

function InterconnectionPanel({
  result,
  t,
  locale,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  const ixlan = useMemo(() => result.peeringdb?.ixlan || [], [result.peeringdb]);
  const ixTotal = result.peeringdb?.ixlanTotal || 0;
  const facilities = useMemo(
    () => result.peeringdb?.facilities || [],
    [result.peeringdb],
  );
  const facTotal = result.peeringdb?.facilitiesTotal || 0;
  const [ixExpanded, setIxExpanded] = useState(false);
  const [facExpanded, setFacExpanded] = useState(false);
  const limit = 8;
  const visibleIx = ixExpanded ? ixlan : ixlan.slice(0, limit);
  const visibleFac = facExpanded ? facilities : facilities.slice(0, limit);
  const maxSpeed = useMemo(
    () => Math.max(...ixlan.map((x) => x.speed || 0), 1),
    [ixlan],
  );

  return (
    <div className="flex flex-col gap-4">
      <SectionHead title={t.asnInterconnection} description={t.asnInterconnectionDescription} />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Server className="size-4 text-muted-foreground" aria-hidden="true" />
            {t.asnIxPresence}
          </p>
          <Badge variant="secondary" className="tabular-nums">
            {formatNumber(ixTotal, locale)}
          </Badge>
        </div>
        {ixlan.length === 0 ? (
          <div className="px-4 py-4">
            <EmptyBox message={t.asnNoIxLanRecords} />
          </div>
        ) : (
          <>
            <div className="hidden px-2 md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>{t.asnLabelExchange}</TableHead>
                    <TableHead>{t.asnLabelSpeed}</TableHead>
                    <TableHead>{t.asnLabelIpv4}</TableHead>
                    <TableHead>{t.asnLabelIpv6}</TableHead>
                    <TableHead className="text-center">{t.asnLabelRsPeer}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleIx.map((entry, idx) => (
                    <TableRow key={`${entry.id}-${idx}`}>
                      <TableCell className="max-w-56 truncate font-medium text-foreground" title={entry.name}>
                        {entry.name || "-"}
                      </TableCell>
                      <TableCell>
                        <SpeedCell speed={entry.speed} t={t} locale={locale} maxSpeed={maxSpeed} />
                      </TableCell>
                      <TableCell className="font-mono text-xs break-all whitespace-normal text-muted-foreground">
                        {valueOrDash(entry.ipaddr4)}
                      </TableCell>
                      <TableCell className="font-mono text-xs break-all whitespace-normal text-muted-foreground">
                        {valueOrDash(entry.ipaddr6)}
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.isRsPeer === true ? (
                          <Badge variant="success">{t.asnBooleanYes}</Badge>
                        ) : entry.isRsPeer === false ? (
                          <Badge variant="secondary">{t.asnBooleanNo}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col gap-2.5 p-4 md:hidden">
              {visibleIx.map((entry, idx) => (
                <div key={`${entry.id}-${idx}`} className="flex flex-col gap-2.5 rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0 text-sm font-semibold break-words text-foreground">
                      {entry.name || "-"}
                    </span>
                    {entry.isRsPeer === true ? (
                      <Badge variant="success" className="shrink-0">
                        {t.asnLabelRsPeer}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t.asnLabelSpeed}
                      </p>
                      <div className="mt-1">
                        <SpeedCell speed={entry.speed} t={t} locale={locale} maxSpeed={maxSpeed} />
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t.asnLabelRsPeer}
                      </p>
                      <p className="mt-1 text-xs font-medium text-foreground/80">
                        {entry.isRsPeer === true
                          ? t.asnBooleanYes
                          : entry.isRsPeer === false
                            ? t.asnBooleanNo
                            : "-"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t.asnLabelIpv4}
                      </p>
                      <p className="mt-1 font-mono text-xs break-all text-foreground/90">
                        {valueOrDash(entry.ipaddr4)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t.asnLabelIpv6}
                      </p>
                      <p className="mt-1 font-mono text-xs break-all text-foreground/90">
                        {valueOrDash(entry.ipaddr6)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {ixlan.length > limit ? (
              <div className="border-t px-4 py-3">
                <ShowMoreButton
                  expanded={ixExpanded}
                  onToggle={() => setIxExpanded(!ixExpanded)}
                  count={ixlan.length}
                  t={t}
                />
              </div>
            ) : null}
          </>
        )}
      </Card>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Building2 className="size-4 text-muted-foreground" aria-hidden="true" />
            {t.asnFacilities}
          </p>
          <Badge variant="secondary" className="tabular-nums">
            {formatNumber(facTotal, locale)}
          </Badge>
        </div>
        {facilities.length === 0 ? (
          <div className="px-4 py-4">
            <EmptyBox message={t.asnNoFacilityRecords} />
          </div>
        ) : (
          <>
            <div className="hidden px-2 md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>{t.asnLabelFacility}</TableHead>
                    <TableHead>{t.asnLabelCity}</TableHead>
                    <TableHead>{t.asnLabelCountry}</TableHead>
                    <TableHead>{t.asnLabelLocalAsn}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleFac.map((entry, idx) => (
                    <TableRow key={`${entry.id}-${idx}`}>
                      <TableCell className="max-w-64 truncate font-medium text-foreground" title={entry.name}>
                        {entry.name || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{valueOrDash(entry.city)}</TableCell>
                      <TableCell className="text-xs font-semibold uppercase text-muted-foreground">
                        {valueOrDash(entry.country)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-foreground/80">
                        {valueOrDash(entry.localAsn)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col gap-2.5 p-4 md:hidden">
              {visibleFac.map((entry, idx) => (
                <div key={`${entry.id}-${idx}`} className="flex flex-col gap-2 rounded-lg border p-4">
                  <span className="text-sm font-semibold break-words text-foreground">
                    {entry.name || "-"}
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t.asnLabelCity}
                      </span>
                      <span className="mt-0.5 block font-medium text-foreground/90">
                        {valueOrDash(entry.city)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t.asnLabelCountry}
                      </span>
                      <span className="mt-0.5 block font-medium uppercase text-foreground/90">
                        {valueOrDash(entry.country)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {facilities.length > limit ? (
              <div className="border-t px-4 py-3">
                <ShowMoreButton
                  expanded={facExpanded}
                  onToggle={() => setFacExpanded(!facExpanded)}
                  count={facilities.length}
                  t={t}
                />
              </div>
            ) : null}
          </>
        )}
      </Card>
    </div>
  );
}

/* ---------- profile & sources ---------- */

function ProfileField({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value);
  const isUrl = text.startsWith("http://") || text.startsWith("https://");

  return (
    <div className="border-b border-border/60 py-2.5 last:border-b-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium break-words text-foreground">
        {isUrl ? (
          <a
            href={text}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 break-all hover:underline"
          >
            {text.replace(/^https?:\/\/(www\.)?/, "")}
            <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
          </a>
        ) : (
          <span className="break-words">{text}</span>
        )}
      </dd>
    </div>
  );
}

function ProfilePanel({
  result,
  t,
  locale,
}: {
  result: AsnProfile;
  t: ToolTranslation;
  locale: Locale;
}) {
  const profile: PeeringDbProfile | null = result.peeringdb;
  const groups = profile
    ? [
        {
          heading: t.asnProfileIdentityHeading,
          fields: [
            { label: t.asnLabelNetworkId, value: profile.netId },
            { label: t.asnLabelName, value: profile.name },
            { label: t.asnLabelAlsoKnownAs, value: profile.aka },
            { label: t.asnLabelStatus, value: profile.status },
          ],
        },
        {
          heading: t.asnProfileInterconnectionHeading,
          fields: [
            { label: t.asnLabelTraffic, value: profile.traffic },
            { label: t.asnLabelWebsite, value: profile.website },
            { label: t.asnLabelLookingGlass, value: profile.lookingGlass },
            { label: t.asnLabelRouteServer, value: profile.routeServer },
          ],
        },
        {
          heading: t.asnProfilePolicyHeading,
          fields: [
            { label: t.asnLabelPolicyGeneral, value: profile.policyGeneral },
            { label: t.asnLabelPolicyLocations, value: profile.policyLocations },
            { label: t.asnLabelPolicyRatio, value: profile.policyRatio },
            { label: t.asnLabelPolicyContracts, value: profile.policyContracts },
          ],
        },
      ]
        .map((group) => ({
          ...group,
          fields: group.fields.filter((f) => f.value !== null && f.value !== undefined && f.value !== ""),
        }))
        .filter((group) => group.fields.length > 0)
    : [];

  return (
    <div className="flex flex-col gap-4">
      <SectionHead
        title={t.asnProfileAndSources}
        description={t.asnProfileAndSourcesDescription}
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-b bg-muted/30 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">{t.asnPeeringDb}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t.asnPeeringDbDescription}</p>
        </div>
        {!profile ? (
          <div className="px-4 py-4">
            <EmptyBox message={t.asnWarningNoPeeringDbProfile} />
          </div>
        ) : groups.length === 0 ? (
          <div className="px-4 py-4">
            <EmptyBox message={t.asnWarningNoPeeringDbProfile} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 px-4 py-2 md:grid-cols-3">
            {groups.map((group) => (
              <div key={group.heading} className="flex flex-col py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.heading}
                </p>
                <dl className="mt-1 flex flex-col">
                  {group.fields.map((field) => (
                    <ProfileField key={field.label} label={field.label} value={field.value} />
                  ))}
                </dl>
              </div>
            ))}
          </div>
        )}
        {profile &&
        (profile.infoPrefixes4 !== null ||
          profile.infoPrefixes6 !== null ||
          profile.ixCount ||
          profile.facilityCount) ? (
          <div className="flex flex-wrap gap-x-8 gap-y-2 border-t bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            {profile.infoPrefixes4 !== null ? (
              <span>
                {t.asnLabelIpv4}:{" "}
                <span className="font-mono font-semibold text-foreground tabular-nums">
                  {formatNumber(profile.infoPrefixes4, locale)}
                </span>
              </span>
            ) : null}
            {profile.infoPrefixes6 !== null ? (
              <span>
                {t.asnLabelIpv6}:{" "}
                <span className="font-mono font-semibold text-foreground tabular-nums">
                  {formatNumber(profile.infoPrefixes6, locale)}
                </span>
              </span>
            ) : null}
          </div>
        ) : null}
      </Card>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-b bg-muted/30 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">{t.asnSourceDiagnostics}</p>
        </div>
        <div className="flex flex-wrap gap-2 px-4 py-4">
          {(Object.entries(result.sources) as Array<[string, SourceStatus]>).map(
            ([source, status]) => (
              <Badge key={source} variant={sourceBadgeVariant(status)} className="font-mono normal-case">
                {source} · {formatStatus(status, t)}
              </Badge>
            ),
          )}
        </div>
        {result.sourceDiagnostics && result.sourceDiagnostics.length > 0 ? (
          <div className="flex flex-col gap-3 border-t px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t.asnDetailedDiagnostics}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {result.sourceDiagnostics.map((diagnostic) => (
                <div key={diagnostic.source} className="flex flex-col gap-1.5 rounded-lg border p-4 text-xs">
                  <p className="font-mono font-semibold uppercase tracking-wider text-foreground">
                    {diagnostic.source}
                  </p>
                  <p className="text-muted-foreground">
                    {t.asnDiagnosticDuration}:{" "}
                    <span className="font-semibold text-foreground tabular-nums">
                      {formatNumber(diagnostic.durationMs, locale)} ms
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    {t.asnDiagnosticCache}:{" "}
                    <span className="font-semibold text-foreground">
                      {formatCacheStatus(diagnostic.cache, t)}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

/* ---------- tabs root ---------- */

export function AsnDetailTabs({
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
  const ixTotal = result.peeringdb?.ixlanTotal ?? 0;
  const facTotal = result.peeringdb?.facilitiesTotal ?? 0;
  const interconnectionTotal = ixTotal + facTotal;

  return (
    <Tabs defaultValue="routing" className="w-full">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <TabsList className="w-full justify-start sm:w-fit">
          <TabsTrigger value="routing" className="gap-2">
            {t.asnRouting}
            <Badge variant="secondary" className="px-1.5 font-mono text-[11px] tabular-nums">
              {formatNumber(totalNeighbours, locale)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="prefixes" className="gap-2">
            {t.asnPrefixes}
            <Badge variant="secondary" className="px-1.5 font-mono text-[11px] tabular-nums">
              {formatNumber(totalPrefixes, locale)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="interconnection" className="gap-2">
            {t.asnInterconnection}
            <Badge variant="secondary" className="px-1.5 font-mono text-[11px] tabular-nums">
              {formatNumber(interconnectionTotal, locale)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="profile">{t.asnProfileAndSources}</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="routing" className="pt-2">
        <RoutingPanel result={result} t={t} locale={locale} />
      </TabsContent>
      <TabsContent value="prefixes" className="pt-2">
        <PrefixesPanel result={result} t={t} locale={locale} />
      </TabsContent>
      <TabsContent value="interconnection" className="pt-2">
        <InterconnectionPanel result={result} t={t} locale={locale} />
      </TabsContent>
      <TabsContent value="profile" className="pt-2">
        <ProfilePanel result={result} t={t} locale={locale} />
      </TabsContent>
    </Tabs>
  );
}
