export const MAX_ASN_NUMBER = 4_294_967_295;

const ASN_PATTERN = /^(?:AS)?([0-9]+)$/i;

export type SourceStatus = "available" | "unavailable" | "not_configured" | "error";
export type AsnSource = "ipinfo" | "peeringdb" | "ripestat";
export type SourceCacheStatus = "miss" | "fresh" | "stale" | "not_configured";

export interface SourceDiagnostic {
  source: AsnSource;
  status: SourceStatus;
  durationMs: number;
  cache: SourceCacheStatus;
  warnings: number;
}

export interface NormalizedAsn {
  asn: string;
  asnNumber: number;
}

export interface AsnPrefix {
  netblock: string;
  id: string;
  name: string;
  country: string;
  size: string;
  status: string;
  domain: string;
  rpkiStatus: string;
}

export interface AsnRelation {
  asn: string;
  asnNumber: number;
  source?: string;
  power?: number | null;
  v4Peers?: number | null;
  v6Peers?: number | null;
}

export interface IpinfoAsnData {
  name: string;
  country: string;
  registry: string;
  allocated: string;
  domain: string;
  type: string;
  numIps: number | null;
  prefixes4: AsnPrefix[];
  prefixes6: AsnPrefix[];
  prefixes4Total: number;
  prefixes6Total: number;
  peers: AsnRelation[];
  upstreams: AsnRelation[];
  downstreams: AsnRelation[];
  peersTotal: number;
  upstreamsTotal: number;
  downstreamsTotal: number;
}

export interface PeeringDbIxLan {
  id: number | null;
  ixId: number | null;
  ixlanId: number | null;
  name: string;
  speed: number | null;
  ipaddr4: string;
  ipaddr6: string;
  isRsPeer: boolean | null;
  operational: boolean | null;
  status: string;
}

export interface PeeringDbFacility {
  id: number | null;
  facilityId: number | null;
  name: string;
  city: string;
  country: string;
  localAsn: number | null;
  status: string;
}

export interface PeeringDbProfile {
  netId: number | null;
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
  infoPrefixes4: number | null;
  infoPrefixes6: number | null;
  status: string;
  ixCount: number;
  facilityCount: number;
  ixlan: PeeringDbIxLan[];
  facilities: PeeringDbFacility[];
  ixlanTotal: number;
  facilitiesTotal: number;
}

export interface RipeStatAsnData {
  name: string;
  prefixes4: AsnPrefix[];
  prefixes6: AsnPrefix[];
  prefixes4Total: number;
  prefixes6Total: number;
  peers: AsnRelation[];
  upstreams: AsnRelation[];
  downstreams: AsnRelation[];
  peersTotal: number;
  upstreamsTotal: number;
  downstreamsTotal: number;
}

export interface AsnProfile {
  found: boolean;
  asn: string;
  asnNumber: number;
  name: string;
  country: string;
  registry: string;
  allocated: string;
  domain: string;
  type: string;
  numIps: number | null;
  prefixes4: AsnPrefix[];
  prefixes6: AsnPrefix[];
  prefixes4Total: number;
  prefixes6Total: number;
  peers: AsnRelation[];
  upstreams: AsnRelation[];
  downstreams: AsnRelation[];
  peersTotal: number;
  upstreamsTotal: number;
  downstreamsTotal: number;
  peeringdb: PeeringDbProfile | null;
  sources: {
    ipinfo: SourceStatus;
    peeringdb: Exclude<SourceStatus, "not_configured">;
    ripestat: Exclude<SourceStatus, "not_configured">;
  };
  warnings: string[];
  sourceDiagnostics?: SourceDiagnostic[];
}

export class AsnValidationError extends Error {
  constructor(message = "Please provide a valid ASN.") {
    super(message);
    this.name = "AsnValidationError";
  }
}

export function normalizeAsnInput(input: string): NormalizedAsn {
  const trimmed = input.trim();
  const match = trimmed.match(ASN_PATTERN);

  if (!match) {
    throw new AsnValidationError("Use an AS-prefixed or numeric ASN, for example AS8881 or 8881.");
  }

  const digits = match[1].replace(/^0+/, "") || "0";
  const asnNumber = Number(digits);

  if (!Number.isSafeInteger(asnNumber) || asnNumber < 1 || asnNumber > MAX_ASN_NUMBER) {
    throw new AsnValidationError(`ASN must be between 1 and ${MAX_ASN_NUMBER}.`);
  }

  return {
    asn: `AS${asnNumber}`,
    asnNumber,
  };
}

export function createEmptyAsnProfile(
  normalized: NormalizedAsn,
  sources: AsnProfile["sources"],
  warnings: string[],
): AsnProfile {
  return {
    found: false,
    asn: normalized.asn,
    asnNumber: normalized.asnNumber,
    name: "",
    country: "",
    registry: "",
    allocated: "",
    domain: "",
    type: "",
    numIps: null,
    prefixes4: [],
    prefixes6: [],
    prefixes4Total: 0,
    prefixes6Total: 0,
    peers: [],
    upstreams: [],
    downstreams: [],
    peersTotal: 0,
    upstreamsTotal: 0,
    downstreamsTotal: 0,
    peeringdb: null,
    sources,
    warnings: dedupeStrings(warnings),
  };
}

export function mergeAsnProfile({
  normalized,
  ipinfo,
  peeringdb,
  ripestat,
  sources,
  warnings,
}: {
  normalized: NormalizedAsn;
  ipinfo: IpinfoAsnData | null;
  peeringdb: PeeringDbProfile | null;
  ripestat: RipeStatAsnData | null;
  sources: AsnProfile["sources"];
  warnings: string[];
}): AsnProfile {
  const profile = createEmptyAsnProfile(normalized, sources, warnings);
  const prefixes4 = mergePrefixes(ipinfo?.prefixes4 || [], ripestat?.prefixes4 || []);
  const prefixes6 = mergePrefixes(ipinfo?.prefixes6 || [], ripestat?.prefixes6 || []);
  const peers = mergeRelations(ipinfo?.peers || [], ripestat?.peers || []);
  const upstreams = mergeRelations(ipinfo?.upstreams || [], ripestat?.upstreams || []);
  const downstreams = mergeRelations(ipinfo?.downstreams || [], ripestat?.downstreams || []);

  return {
    ...profile,
    found: Boolean(ipinfo || peeringdb || ripestat),
    name: ipinfo?.name || ripestat?.name || peeringdb?.name || "",
    country: ipinfo?.country || "",
    registry: ipinfo?.registry || "",
    allocated: ipinfo?.allocated || "",
    domain: ipinfo?.domain || "",
    type: ipinfo?.type || "",
    numIps: ipinfo?.numIps ?? null,
    prefixes4,
    prefixes6,
    prefixes4Total: prefixes4.length ? Math.max(ipinfo?.prefixes4Total || 0, ripestat?.prefixes4Total || 0, prefixes4.length) : 0,
    prefixes6Total: prefixes6.length ? Math.max(ipinfo?.prefixes6Total || 0, ripestat?.prefixes6Total || 0, prefixes6.length) : 0,
    peers,
    upstreams,
    downstreams,
    peersTotal: Math.max(ipinfo?.peersTotal || 0, ripestat?.peersTotal || 0, peers.length),
    upstreamsTotal: Math.max(ipinfo?.upstreamsTotal || 0, ripestat?.upstreamsTotal || 0, upstreams.length),
    downstreamsTotal: Math.max(ipinfo?.downstreamsTotal || 0, ripestat?.downstreamsTotal || 0, downstreams.length),
    peeringdb,
  };
}

export function normalizeIpinfoAsnPayload(
  payload: unknown,
  warnings: string[] = [],
): IpinfoAsnData | null {
  const record = asRecord(payload);
  if (!record) return null;

  const prefixes4 = normalizePrefixList(record.prefixes);
  const prefixes6 = normalizePrefixList(record.prefixes6);
  const peers = normalizeRelationList(record.peers);
  const upstreams = normalizeRelationList(record.upstreams);
  const downstreams = normalizeRelationList(record.downstreams);
  const data = {
    name: stringValue(record.name),
    country: stringValue(record.country),
    registry: stringValue(record.registry),
    allocated: stringValue(record.allocated),
    domain: stringValue(record.domain),
    type: stringValue(record.type),
    numIps: numberValue(record.num_ips),
    prefixes4: withLimit(prefixes4, 100, warnings, "IPinfo IPv4 prefixes"),
    prefixes6: withLimit(prefixes6, 100, warnings, "IPinfo IPv6 prefixes"),
    prefixes4Total: prefixes4.length,
    prefixes6Total: prefixes6.length,
    peers: withLimit(peers, 100, warnings, "IPinfo peers"),
    upstreams: withLimit(upstreams, 100, warnings, "IPinfo upstreams"),
    downstreams: withLimit(downstreams, 100, warnings, "IPinfo downstreams"),
    peersTotal: peers.length,
    upstreamsTotal: upstreams.length,
    downstreamsTotal: downstreams.length,
  };

  if (!hasUsableIpinfoData(data)) return null;

  return data;
}

export function normalizePeeringDbPayload(payload: unknown, warnings: string[] = [], asnNumber?: number): PeeringDbProfile | null {
  const record = asRecord(payload);
  const data = Array.isArray(record?.data) ? record.data : null;
  const records = data?.map(asRecord).filter(isRecord) || [];
  const net =
    typeof asnNumber === "number"
      ? records.find((entry) => numberValue(entry.asn) === asnNumber) || records[0]
      : records[0];

  if (!net) return null;

  const ixlan = normalizeIxLanList(net.netixlan_set);
  const facilities = normalizeFacilityList(net.netfac_set);

  return {
    netId: numberValue(net.id),
    name: stringValue(net.name),
    aka: stringValue(net.aka),
    website: stringValue(net.website),
    lookingGlass: stringValue(net.looking_glass),
    routeServer: stringValue(net.route_server),
    traffic: stringValue(net.info_traffic),
    policyGeneral: stringValue(net.policy_general),
    policyLocations: stringValue(net.policy_locations),
    policyRatio: policyRatioValue(net.policy_ratio),
    policyContracts: stringValue(net.policy_contracts),
    infoPrefixes4: numberValue(net.info_prefixes4),
    infoPrefixes6: numberValue(net.info_prefixes6),
    status: stringValue(net.status),
    ixCount: numberValue(net.ix_count) ?? ixlan.length,
    facilityCount: numberValue(net.fac_count) ?? facilities.length,
    ixlan: withLimit(ixlan, 50, warnings, "PeeringDB IX LAN records"),
    facilities: withLimit(facilities, 50, warnings, "PeeringDB facilities"),
    ixlanTotal: ixlan.length,
    facilitiesTotal: facilities.length,
  };
}

export function normalizeRipeStatPayload(
  payload: {
    overview?: unknown;
    prefixes?: unknown;
    neighbours?: unknown;
  },
  warnings: string[] = [],
): RipeStatAsnData | null {
  const overviewData = asRecord(asRecord(payload.overview)?.data);
  const prefixesData = asRecord(asRecord(payload.prefixes)?.data);
  const neighboursData = asRecord(asRecord(payload.neighbours)?.data);

  if (!overviewData && !prefixesData && !neighboursData) return null;

  const allPrefixes = normalizeRipeStatPrefixList(prefixesData?.prefixes);
  const prefixes4 = allPrefixes.filter((prefix) => !prefix.netblock.includes(":"));
  const prefixes6 = allPrefixes.filter((prefix) => prefix.netblock.includes(":"));
  const { peers, upstreams, downstreams } = normalizeRipeStatNeighbours(neighboursData?.neighbours);
  const name = stringValue(overviewData?.holder);

  if (!name && !prefixes4.length && !prefixes6.length && !peers.length && !upstreams.length && !downstreams.length) {
    return null;
  }

  return {
    name,
    prefixes4: withLimit(prefixes4, 100, warnings, "RIPEstat IPv4 prefixes"),
    prefixes6: withLimit(prefixes6, 100, warnings, "RIPEstat IPv6 prefixes"),
    prefixes4Total: prefixes4.length,
    prefixes6Total: prefixes6.length,
    peers: withLimit(peers, 100, warnings, "RIPEstat routing neighbours"),
    upstreams: withLimit(upstreams, 100, warnings, "RIPEstat upstream-side neighbours"),
    downstreams: withLimit(downstreams, 100, warnings, "RIPEstat downstream-side neighbours"),
    peersTotal: peers.length,
    upstreamsTotal: upstreams.length,
    downstreamsTotal: downstreams.length,
  };
}

function normalizePrefixList(value: unknown): AsnPrefix[] {
  if (!Array.isArray(value)) return [];

  return value
    .map(asRecord)
    .filter(isRecord)
    .map((prefix) => ({
      netblock: stringValue(prefix.netblock),
      id: stringValue(prefix.id),
      name: stringValue(prefix.name),
      country: stringValue(prefix.country),
      size: stringValue(prefix.size),
      status: stringValue(prefix.status),
      domain: stringValue(prefix.domain),
      rpkiStatus: stringValue(prefix.rpki_status),
    }))
    .filter((prefix) => prefix.netblock);
}

function normalizeRipeStatPrefixList(value: unknown): AsnPrefix[] {
  if (!Array.isArray(value)) return [];

  return value
    .map(asRecord)
    .filter(isRecord)
    .map((prefix) => ({
      netblock: stringValue(prefix.prefix),
      id: "",
      name: "",
      country: "",
      size: "",
      status: "announced",
      domain: "",
      rpkiStatus: "",
    }))
    .filter((prefix) => prefix.netblock);
}

function normalizeRelationList(value: unknown): AsnRelation[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<number>();
  const relations: AsnRelation[] = [];

  for (const entry of value) {
    try {
      const normalized = normalizeAsnInput(stringValue(entry));
      if (!seen.has(normalized.asnNumber)) {
        seen.add(normalized.asnNumber);
        relations.push(normalized);
      }
    } catch {
      // Ignore malformed upstream data.
    }
  }

  return relations;
}

function normalizeRipeStatNeighbours(value: unknown): {
  peers: AsnRelation[];
  upstreams: AsnRelation[];
  downstreams: AsnRelation[];
} {
  const upstreams: AsnRelation[] = [];
  const downstreams: AsnRelation[] = [];
  const peers: AsnRelation[] = [];

  if (!Array.isArray(value)) return { peers, upstreams, downstreams };

  for (const entry of value.map(asRecord).filter(isRecord)) {
    try {
      const normalized = normalizeAsnInput(stringValue(entry.asn));
      const relation: AsnRelation = {
        ...normalized,
        source: "RIPEstat RIS",
        power: numberValue(entry.power),
        v4Peers: numberValue(entry.v4_peers),
        v6Peers: numberValue(entry.v6_peers),
      };
      const type = stringValue(entry.type).toLowerCase();

      if (type === "left") {
        upstreams.push(relation);
      } else if (type === "right") {
        downstreams.push(relation);
      } else {
        peers.push(relation);
      }
    } catch {
      // Ignore malformed upstream data.
    }
  }

  return {
    peers: mergeRelations(peers),
    upstreams: sortRelations(mergeRelations(upstreams)),
    downstreams: sortRelations(mergeRelations(downstreams)),
  };
}

function normalizeIxLanList(value: unknown): PeeringDbIxLan[] {
  if (!Array.isArray(value)) return [];

  return value
    .map(asRecord)
    .filter(isRecord)
    .map((entry) => ({
      id: numberValue(entry.id),
      ixId: numberValue(entry.ix_id),
      ixlanId: numberValue(entry.ixlan_id),
      name: stringValue(entry.name),
      speed: numberValue(entry.speed),
      ipaddr4: stringValue(entry.ipaddr4),
      ipaddr6: stringValue(entry.ipaddr6),
      isRsPeer: booleanValue(entry.is_rs_peer),
      operational: booleanValue(entry.operational),
      status: stringValue(entry.status),
    }))
    .filter((entry) => entry.name || entry.ixId !== null);
}

function normalizeFacilityList(value: unknown): PeeringDbFacility[] {
  if (!Array.isArray(value)) return [];

  return value
    .map(asRecord)
    .filter(isRecord)
    .map((entry) => ({
      id: numberValue(entry.id),
      facilityId: numberValue(entry.fac_id),
      name: stringValue(entry.name),
      city: stringValue(entry.city),
      country: stringValue(entry.country),
      localAsn: numberValue(entry.local_asn),
      status: stringValue(entry.status),
    }))
    .filter((entry) => entry.name || entry.facilityId !== null);
}

function withLimit<T>(items: T[], limit: number, warnings: string[], label: string): T[] {
  if (items.length <= limit) return items;
  warnings.push(`${label} truncated to ${limit} of ${items.length} records.`);
  return items.slice(0, limit);
}

function mergePrefixes(primary: AsnPrefix[], fallback: AsnPrefix[]): AsnPrefix[] {
  const byNetblock = new Map<string, AsnPrefix>();

  for (const prefix of primary) {
    byNetblock.set(prefix.netblock, prefix);
  }

  for (const prefix of fallback) {
    const existing = byNetblock.get(prefix.netblock);
    byNetblock.set(prefix.netblock, existing ? mergePrefix(existing, prefix) : prefix);
  }

  return [...byNetblock.values()];
}

function mergePrefix(primary: AsnPrefix, fallback: AsnPrefix): AsnPrefix {
  return {
    netblock: primary.netblock,
    id: primary.id || fallback.id,
    name: primary.name || fallback.name,
    country: primary.country || fallback.country,
    size: primary.size || fallback.size,
    status: primary.status || fallback.status,
    domain: primary.domain || fallback.domain,
    rpkiStatus: primary.rpkiStatus || fallback.rpkiStatus,
  };
}

function mergeRelations(...groups: AsnRelation[][]): AsnRelation[] {
  const byAsn = new Map<number, AsnRelation>();

  for (const relation of groups.flat()) {
    const existing = byAsn.get(relation.asnNumber);
    byAsn.set(relation.asnNumber, {
      ...existing,
      ...relation,
      power: Math.max(existing?.power || 0, relation.power || 0) || relation.power || existing?.power || null,
      v4Peers: Math.max(existing?.v4Peers || 0, relation.v4Peers || 0) || relation.v4Peers || existing?.v4Peers || null,
      v6Peers: Math.max(existing?.v6Peers || 0, relation.v6Peers || 0) || relation.v6Peers || existing?.v6Peers || null,
    });
  }

  return sortRelations([...byAsn.values()]);
}

function hasUsableIpinfoData(data: IpinfoAsnData) {
  return Boolean(
    data.name ||
      data.country ||
      data.registry ||
      data.allocated ||
      data.domain ||
      data.type ||
      data.numIps !== null ||
      data.prefixes4.length ||
      data.prefixes6.length ||
      data.peers.length ||
      data.upstreams.length ||
      data.downstreams.length,
  );
}

function sortRelations(relations: AsnRelation[]) {
  return relations.sort((a, b) => (b.power || 0) - (a.power || 0) || a.asnNumber - b.asnNumber);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function isRecord(value: Record<string, unknown> | null): value is Record<string, unknown> {
  return value !== null;
}

function stringValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return "";
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function booleanValue(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }

  return null;
}

function policyRatioValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Required" : "Not required";
  return stringValue(value);
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
