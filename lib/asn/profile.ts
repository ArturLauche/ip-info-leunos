import type { NormalizedAsn } from "@/lib/asn/input";

export type SourceStatus = "available" | "unavailable" | "not_configured" | "error";

export type AsnPrefix = {
  prefix: string;
  name?: string;
  country?: string;
  status?: string;
};

export type AsnRelation = {
  asn: string;
  name?: string;
  country?: string;
};

export type PeeringDbIxLan = {
  name?: string;
  ixId?: number;
  speed?: number;
  ipaddr4?: string;
  ipaddr6?: string;
  operational?: boolean;
};

export type PeeringDbFacility = {
  name?: string;
  facId?: number;
  city?: string;
  country?: string;
};

export type PeeringDbProfile = {
  netId: number | null;
  name: string | null;
  aka: string | null;
  website: string | null;
  lookingGlass: string | null;
  routeServer: string | null;
  irrAsSet: string | null;
  traffic: string | null;
  scope: string | null;
  networkType: string | null;
  policyGeneral: string | null;
  policyUrl: string | null;
  policyLocations: string | null;
  policyRatio: boolean | null;
  policyContracts: string | null;
  infoPrefixes4: number | null;
  infoPrefixes6: number | null;
  ixCount: number;
  facilityCount: number;
  status: string | null;
  ixlan: PeeringDbIxLan[];
  facilities: PeeringDbFacility[];
};

export type AsnProfile = {
  asn: string;
  asnNumber: number;
  name: string | null;
  country: string | null;
  registry: string | null;
  allocated: string | null;
  domain: string | null;
  type: string | null;
  rir: string | null;
  rpki: string | null;
  numIps: number | null;
  prefixes4: AsnPrefix[];
  prefixes6: AsnPrefix[];
  peers: AsnRelation[];
  upstreams: AsnRelation[];
  downstreams: AsnRelation[];
  peeringdb: PeeringDbProfile | null;
  sources: {
    ipinfo: SourceStatus;
    peeringdb: SourceStatus;
  };
  warnings: string[];
};

/** Raw IPinfo ASN payload (loosely typed; fields vary by plan). */
export type IpinfoAsnPayload = {
  asn?: string;
  name?: string;
  country?: string;
  allocated?: string;
  registry?: string;
  domain?: string;
  num_ips?: number | string;
  type?: string;
  rir?: string;
  rpki?: string;
  prefixes?: Array<{ netblock?: string; name?: string; country?: string; status?: string }>;
  prefixes6?: Array<{ netblock?: string; name?: string; country?: string; status?: string }>;
  peers?: Array<{ asn?: string; name?: string; country?: string } | string>;
  upstreams?: Array<{ asn?: string; name?: string; country?: string } | string>;
  downstreams?: Array<{ asn?: string; name?: string; country?: string } | string>;
};

/** Raw PeeringDB network record (depth=2). */
export type PeeringDbNetRecord = {
  id?: number;
  name?: string;
  aka?: string;
  website?: string;
  asn?: number;
  looking_glass?: string;
  route_server?: string;
  irr_as_set?: string;
  info_type?: string;
  info_prefixes4?: number;
  info_prefixes6?: number;
  info_traffic?: string;
  info_ratio?: string;
  info_scope?: string;
  policy_general?: string;
  policy_url?: string;
  policy_locations?: string;
  policy_ratio?: boolean;
  policy_contracts?: string;
  status?: string;
  netixlan_set?: Array<{
    name?: string;
    ix_id?: number;
    speed?: number;
    ipaddr4?: string | null;
    ipaddr6?: string | null;
    operational?: boolean;
  }>;
  netfac_set?: Array<{
    name?: string;
    fac_id?: number;
    city?: string;
    country?: string;
  }>;
};

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeRelations(
  entries: IpinfoAsnPayload["peers"] | undefined,
): AsnRelation[] {
  if (!Array.isArray(entries)) return [];

  return entries
    .map((entry): AsnRelation | null => {
      if (typeof entry === "string") {
        const asn = cleanString(entry);
        return asn ? { asn } : null;
      }
      if (entry && typeof entry === "object") {
        const asn = cleanString(entry.asn);
        if (!asn) return null;
        return {
          asn,
          name: cleanString(entry.name) ?? undefined,
          country: cleanString(entry.country) ?? undefined,
        };
      }
      return null;
    })
    .filter((entry): entry is AsnRelation => entry !== null);
}

function normalizePrefixes(
  entries: IpinfoAsnPayload["prefixes"] | undefined,
): AsnPrefix[] {
  if (!Array.isArray(entries)) return [];

  return entries
    .map((entry): AsnPrefix | null => {
      const prefix = cleanString(entry?.netblock);
      if (!prefix) return null;
      return {
        prefix,
        name: cleanString(entry?.name) ?? undefined,
        country: cleanString(entry?.country) ?? undefined,
        status: cleanString(entry?.status) ?? undefined,
      };
    })
    .filter((entry): entry is AsnPrefix => entry !== null);
}

function normalizePeeringDb(record: PeeringDbNetRecord | null | undefined): PeeringDbProfile | null {
  if (!record) return null;

  const ixlan: PeeringDbIxLan[] = Array.isArray(record.netixlan_set)
    ? record.netixlan_set.map((entry) => ({
        name: cleanString(entry?.name) ?? undefined,
        ixId: toNumberOrNull(entry?.ix_id) ?? undefined,
        speed: toNumberOrNull(entry?.speed) ?? undefined,
        ipaddr4: cleanString(entry?.ipaddr4) ?? undefined,
        ipaddr6: cleanString(entry?.ipaddr6) ?? undefined,
        operational: typeof entry?.operational === "boolean" ? entry.operational : undefined,
      }))
    : [];

  const facilities: PeeringDbFacility[] = Array.isArray(record.netfac_set)
    ? record.netfac_set.map((entry) => ({
        name: cleanString(entry?.name) ?? undefined,
        facId: toNumberOrNull(entry?.fac_id) ?? undefined,
        city: cleanString(entry?.city) ?? undefined,
        country: cleanString(entry?.country) ?? undefined,
      }))
    : [];

  return {
    netId: toNumberOrNull(record.id),
    name: cleanString(record.name),
    aka: cleanString(record.aka),
    website: cleanString(record.website),
    lookingGlass: cleanString(record.looking_glass),
    routeServer: cleanString(record.route_server),
    irrAsSet: cleanString(record.irr_as_set),
    traffic: cleanString(record.info_traffic),
    scope: cleanString(record.info_scope),
    networkType: cleanString(record.info_type),
    policyGeneral: cleanString(record.policy_general),
    policyUrl: cleanString(record.policy_url),
    policyLocations: cleanString(record.policy_locations),
    policyRatio: typeof record.policy_ratio === "boolean" ? record.policy_ratio : null,
    policyContracts: cleanString(record.policy_contracts),
    infoPrefixes4: toNumberOrNull(record.info_prefixes4),
    infoPrefixes6: toNumberOrNull(record.info_prefixes6),
    ixCount: ixlan.length,
    facilityCount: facilities.length,
    status: cleanString(record.status),
    ixlan,
    facilities,
  };
}

export type BuildAsnProfileInput = {
  normalized: NormalizedAsn;
  ipinfo: { status: SourceStatus; payload?: IpinfoAsnPayload | null };
  peeringdb: { status: SourceStatus; record?: PeeringDbNetRecord | null };
};

/**
 * Combines IPinfo style ASN data with PeeringDB style peering data into a single
 * normalized response object. Missing or failed providers degrade gracefully.
 */
export function buildAsnProfile(input: BuildAsnProfileInput): AsnProfile {
  const { normalized, ipinfo, peeringdb } = input;
  const warnings: string[] = [];

  const ipinfoData = ipinfo.status === "available" ? ipinfo.payload ?? null : null;
  const peeringDbRecord = peeringdb.status === "available" ? peeringdb.record ?? null : null;

  if (ipinfo.status === "not_configured") {
    warnings.push("IPinfo token is not configured; ASN identity and routing data are limited.");
  } else if (ipinfo.status === "unavailable") {
    warnings.push("IPinfo did not return data for this ASN (it may require a paid plan).");
  } else if (ipinfo.status === "error") {
    warnings.push("IPinfo lookup failed; showing other available data.");
  }

  if (peeringdb.status === "unavailable") {
    warnings.push("No PeeringDB profile was found for this ASN.");
  } else if (peeringdb.status === "error") {
    warnings.push("PeeringDB lookup failed; showing other available data.");
  }

  const peeringdbProfile = normalizePeeringDb(peeringDbRecord);

  return {
    asn: normalized.asn,
    asnNumber: normalized.asnNumber,
    name: cleanString(ipinfoData?.name) ?? peeringdbProfile?.name ?? null,
    country: cleanString(ipinfoData?.country),
    registry: cleanString(ipinfoData?.registry) ?? cleanString(ipinfoData?.rir),
    allocated: cleanString(ipinfoData?.allocated),
    domain: cleanString(ipinfoData?.domain),
    type: cleanString(ipinfoData?.type) ?? peeringdbProfile?.networkType ?? null,
    rir: cleanString(ipinfoData?.rir),
    rpki: cleanString(ipinfoData?.rpki),
    numIps: toNumberOrNull(ipinfoData?.num_ips),
    prefixes4: normalizePrefixes(ipinfoData?.prefixes),
    prefixes6: normalizePrefixes(ipinfoData?.prefixes6),
    peers: normalizeRelations(ipinfoData?.peers),
    upstreams: normalizeRelations(ipinfoData?.upstreams),
    downstreams: normalizeRelations(ipinfoData?.downstreams),
    peeringdb: peeringdbProfile,
    sources: {
      ipinfo: ipinfo.status,
      peeringdb: peeringdb.status,
    },
    warnings,
  };
}
