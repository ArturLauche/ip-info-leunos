import { z } from "zod";
import { apiOk, apiValidationError } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { asnDisplay, asnQuerySchema, type NormalizedAsn } from "@/lib/asn";
import { createCache } from "@/lib/api/cache";

const FETCH_TIMEOUT_MS = 5_000;
const FETCH_MAX_RETRIES = 1;
const asnCache = createCache<AsnResponse>({ ttlMs: 5 * 60 * 1000, maxEntries: 500 });

type SourceStatus = "available" | "unavailable" | "error" | "not_configured";

type AsnNeighbor = {
  asn: number;
  power: number;
  v4Peers: number;
  v6Peers: number;
};

type IxlanEntry = {
  id: number;
  name: string;
  speed: number;
  ipaddr4: string;
  ipaddr6: string;
  isRsPeer: boolean;
  operational: boolean;
};

type FacilityEntry = {
  id: number;
  name: string;
  city: string;
  country: string;
};

type AsnResponse = {
  asn: string;
  asnNumber: number;
  name: string;
  country: string;
  registry: string;
  allocated: string;
  domain: string;
  type: string;
  announced: boolean;
  numIps: number;
  prefixes4: string[];
  prefixes6: string[];
  prefixes4Count: number;
  prefixes6Count: number;
  peers: AsnNeighbor[];
  upstreams: AsnNeighbor[];
  downstreams: AsnNeighbor[];
  rpki: {
    status: string;
    validator: string;
    roas: Array<{ origin: string; prefix: string; validity: string; maxLength: number }>;
  } | null;
  visibility: {
    v4: { risPeersSeeing: number; totalRisPeers: number };
    v6: { risPeersSeeing: number; totalRisPeers: number };
  };
  peeringdb: {
    netId: number;
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
    infoPrefixes4: number;
    infoPrefixes6: number;
    ixCount: number;
    facilityCount: number;
    ixlan: IxlanEntry[];
    facilities: FacilityEntry[];
  } | null;
  sources: {
    ripestat: SourceStatus;
    peeringdb: SourceStatus;
    ipinfo: SourceStatus;
  };
  warnings: string[];
};

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  retries = FETCH_MAX_RETRIES,
): Promise<unknown> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { cache: "no-store", signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      const isAbort = error instanceof DOMException && error.name === "AbortError";
      const isHttp5xx = error instanceof Error && /HTTP 5\d{2}/.test(error.message);
      if (attempt < retries && (isAbort || isHttp5xx)) continue;
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError;
}

const ripestatOverviewSchema = z.object({
  data: z.object({
    holder: z.string().optional(),
    announced: z.boolean().optional(),
    block: z
      .object({
        desc: z.string().optional(),
        name: z.string().optional(),
      })
      .optional(),
  }),
});

const ripestatRoutingStatusSchema = z.object({
  data: z.object({
    announced_space: z
      .object({
        v4: z
          .object({
            prefixes: z.number().optional(),
            ips: z.number().optional(),
          })
          .optional(),
        v6: z
          .object({
            prefixes: z.number().optional(),
            "48s": z.number().optional(),
          })
          .optional(),
      })
      .optional(),
    visibility: z
      .object({
        v4: z
          .object({
            ris_peers_seeing: z.number().optional(),
            total_ris_peers: z.number().optional(),
          })
          .optional(),
        v6: z
          .object({
            ris_peers_seeing: z.number().optional(),
            total_ris_peers: z.number().optional(),
          })
          .optional(),
      })
      .optional(),
  }),
});

const ripestatNeighbourSchema = z.object({
  asn: z.number(),
  type: z.enum(["left", "right", "uncertain"]),
  power: z.number().optional(),
  v4_peers: z.number().optional(),
  v6_peers: z.number().optional(),
});

const ripestatNeighboursSchema = z.object({
  data: z.object({
    neighbours: z.array(ripestatNeighbourSchema).optional(),
    neighbour_counts: z
      .object({
        left: z.number().optional(),
        right: z.number().optional(),
        unique: z.number().optional(),
        uncertain: z.number().optional(),
      })
      .optional(),
  }),
});

const ripestatPrefixSchema = z.object({
  prefix: z.string(),
  origin: z.number().optional(),
  path: z.array(z.number()).optional(),
});

const ripestatAnnouncedPrefixesSchema = z.object({
  data: z.object({
    prefixes: z.array(ripestatPrefixSchema).optional(),
  }),
});

const ripestatRpkiSchema = z.object({
  data: z.object({
    status: z.string().optional(),
    validator: z.string().optional(),
    validating_roas: z
      .array(
        z.object({
          origin: z.string().optional(),
          prefix: z.string().optional(),
          validity: z.string().optional(),
          max_length: z.number().optional(),
        }),
      )
      .optional(),
  }),
});

const peeringdbIxlanEntrySchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  speed: z.number().optional(),
  ipaddr4: z.string().optional(),
  ipaddr6: z.string().optional(),
  is_rs_peer: z.boolean().optional(),
  operational: z.boolean().optional(),
});

const peeringdbFacilityEntrySchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

const peeringdbNetSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  aka: z.string().optional(),
  website: z.string().optional(),
  looking_glass: z.string().optional(),
  route_server: z.string().optional(),
  info_type: z.string().optional(),
  info_traffic: z.string().optional(),
  info_prefixes4: z.number().optional(),
  info_prefixes6: z.number().optional(),
  policy_general: z.string().optional(),
  policy_locations: z.string().optional(),
  policy_ratio: z.boolean().nullable().optional(),
  policy_contracts: z.string().optional(),
  ix_count: z.number().optional(),
  fac_count: z.number().optional(),
  netixlan_set: z.array(peeringdbIxlanEntrySchema).optional(),
  netfac_set: z.array(peeringdbFacilityEntrySchema).optional(),
  country: z.string().optional(),
});

const peeringdbResponseSchema = z.object({
  data: z.array(peeringdbNetSchema),
});

const ipinfoSchema = z.object({
  asn: z.string().optional(),
  name: z.string().optional(),
  country: z.string().optional(),
  registry: z.string().optional(),
  allocated: z.string().optional(),
  domain: z.string().optional(),
  type: z.string().optional(),
  num_ips: z.number().optional(),
});

function emptyResponse(asn: NormalizedAsn): AsnResponse {
  return {
    asn: asn.display,
    asnNumber: asn.number,
    name: "",
    country: "",
    registry: "",
    allocated: "",
    domain: "",
    type: "",
    announced: false,
    numIps: 0,
    prefixes4: [],
    prefixes6: [],
    prefixes4Count: 0,
    prefixes6Count: 0,
    peers: [],
    upstreams: [],
    downstreams: [],
    rpki: null,
    visibility: {
      v4: { risPeersSeeing: 0, totalRisPeers: 0 },
      v6: { risPeersSeeing: 0, totalRisPeers: 0 },
    },
    peeringdb: null,
    sources: { ripestat: "unavailable", peeringdb: "unavailable", ipinfo: "unavailable" },
    warnings: [],
  };
}

async function fetchRipestatOverview(asn: number) {
  const url = `https://stat.ripe.net/data/as-overview/data.json?resource=AS${asn}`;
  const raw = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
  return ripestatOverviewSchema.parse(raw);
}

async function fetchRipestatRoutingStatus(asn: number) {
  const url = `https://stat.ripe.net/data/routing-status/data.json?resource=AS${asn}`;
  const raw = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
  return ripestatRoutingStatusSchema.parse(raw);
}

async function fetchRipestatNeighbours(asn: number) {
  const url = `https://stat.ripe.net/data/asn-neighbours/data.json?resource=AS${asn}`;
  const raw = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
  return ripestatNeighboursSchema.parse(raw);
}

async function fetchRipestatAnnouncedPrefixes(asn: number) {
  const url = `https://stat.ripe.net/data/announced-prefixes/data.json?resource=AS${asn}`;
  const raw = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
  return ripestatAnnouncedPrefixesSchema.parse(raw);
}

async function fetchRipestatRpki(asn: number, prefix: string) {
  const url = `https://stat.ripe.net/data/rpki-validation/data.json?resource=AS${asn}&prefix=${encodeURIComponent(prefix)}`;
  const raw = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
  return ripestatRpkiSchema.parse(raw);
}

async function fetchPeeringdb(asn: number) {
  const url = `https://www.peeringdb.com/api/net?asn=${asn}&depth=2`;
  const raw = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
  return peeringdbResponseSchema.parse(raw);
}

async function fetchIpinfo(asn: number, token: string) {
  const url = `https://ipinfo.io/AS${asn}/json?token=${encodeURIComponent(token)}`;
  const raw = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
  return ipinfoSchema.parse(raw);
}

function classifyNeighbours(
  neighbours: z.infer<typeof ripestatNeighbourSchema>[],
): { upstreams: AsnNeighbor[]; peers: AsnNeighbor[]; downstreams: AsnNeighbor[] } {
  const upstreams: AsnNeighbor[] = [];
  const peers: AsnNeighbor[] = [];
  const downstreams: AsnNeighbor[] = [];

  for (const n of neighbours) {
    const entry: AsnNeighbor = {
      asn: n.asn,
      power: n.power ?? 0,
      v4Peers: n.v4_peers ?? 0,
      v6Peers: n.v6_peers ?? 0,
    };

    switch (n.type) {
      case "left":
        upstreams.push(entry);
        break;
      case "right":
        downstreams.push(entry);
        break;
      case "uncertain":
        peers.push(entry);
        break;
    }
  }

  const sortByPower = (a: AsnNeighbor, b: AsnNeighbor) => b.power - a.power;
  upstreams.sort(sortByPower);
  peers.sort(sortByPower);
  downstreams.sort(sortByPower);

  return { upstreams, peers, downstreams };
}

export async function GET(request: Request, { params }: { params: Promise<{ asn: string }> }) {
  const limited = enforceRateLimit(request, "asn", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const { asn: rawAsn } = await params;
  const parsed = asnQuerySchema.safeParse(rawAsn);

  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const asnNumber = parsed.data;
  const cacheKey = `AS${asnNumber}`;

  const result = await asnCache.getOrFetch(cacheKey, () => fetchAsnData(asnNumber));
  return apiOk(result);
}

async function fetchAsnData(asnNumber: number): Promise<AsnResponse> {
  const asn = { display: asnDisplay(asnNumber), number: asnNumber };
  const result = emptyResponse(asn);
  const ipinfoToken = process.env.IPINFO_TOKEN;

  const [
    ripestatOverview,
    ripestatRouting,
    ripestatNeighbours,
    ripestatPrefixes,
    peeringdb,
    ipinfo,
  ] = await Promise.allSettled([
    fetchRipestatOverview(asnNumber),
    fetchRipestatRoutingStatus(asnNumber),
    fetchRipestatNeighbours(asnNumber),
    fetchRipestatAnnouncedPrefixes(asnNumber),
    fetchPeeringdb(asnNumber),
    ipinfoToken ? fetchIpinfo(asnNumber, ipinfoToken) : Promise.reject(new Error("not_configured")),
  ]);

  if (ripestatOverview.status === "fulfilled") {
    const data = ripestatOverview.value.data;
    result.name = data.holder || result.name;
    result.announced = data.announced ?? result.announced;
    result.registry = data.block?.name || result.registry;
    result.sources.ripestat = "available";
  } else {
    result.sources.ripestat = "error";
    result.warnings.push("RIPEstat overview unavailable.");
  }

  if (ripestatRouting.status === "fulfilled") {
    const data = ripestatRouting.value.data;
    const v4 = data.announced_space?.v4;
    const v6 = data.announced_space?.v6;
    result.prefixes4Count = v4?.prefixes ?? result.prefixes4Count;
    result.prefixes6Count = v6?.prefixes ?? result.prefixes6Count;
    result.numIps = v4?.ips ?? result.numIps;

    const vis = data.visibility;
    if (vis?.v4) {
      result.visibility.v4 = {
        risPeersSeeing: vis.v4.ris_peers_seeing ?? 0,
        totalRisPeers: vis.v4.total_ris_peers ?? 0,
      };
    }
    if (vis?.v6) {
      result.visibility.v6 = {
        risPeersSeeing: vis.v6.ris_peers_seeing ?? 0,
        totalRisPeers: vis.v6.total_ris_peers ?? 0,
      };
    }

    if (result.sources.ripestat !== "error") {
      result.sources.ripestat = "available";
    }
  } else {
    if (result.sources.ripestat !== "error") result.sources.ripestat = "error";
    result.warnings.push("RIPEstat routing status unavailable.");
  }

  if (ripestatNeighbours.status === "fulfilled") {
    const neighbours = ripestatNeighbours.value.data.neighbours ?? [];
    const classified = classifyNeighbours(neighbours);
    result.upstreams = classified.upstreams;
    result.peers = classified.peers;
    result.downstreams = classified.downstreams;

    if (result.sources.ripestat !== "error") {
      result.sources.ripestat = "available";
    }
  } else {
    if (result.sources.ripestat !== "error") result.sources.ripestat = "error";
    result.warnings.push("RIPEstat neighbor data unavailable.");
  }

  if (ripestatPrefixes.status === "fulfilled") {
    const prefixes = ripestatPrefixes.value.data.prefixes ?? [];
    for (const p of prefixes) {
      if (p.prefix.includes(":")) {
        result.prefixes6.push(p.prefix);
      } else {
        result.prefixes4.push(p.prefix);
      }
    }

    if (result.sources.ripestat !== "error") {
      result.sources.ripestat = "available";
    }
  } else {
    if (result.sources.ripestat !== "error") result.sources.ripestat = "error";
    result.warnings.push("RIPEstat announced prefixes unavailable.");
  }

  let firstV4Prefix: string | null = null;
  if (result.prefixes4.length > 0) {
    firstV4Prefix = result.prefixes4[0];
  }

  if (firstV4Prefix) {
    try {
      const rpki = await fetchRipestatRpki(asnNumber, firstV4Prefix);
      const data = rpki.data;
      result.rpki = {
        status: data.status || "unknown",
        validator: data.validator || "",
        roas: (data.validating_roas ?? []).map((roa) => ({
          origin: roa.origin || "",
          prefix: roa.prefix || "",
          validity: roa.validity || "",
          maxLength: roa.max_length ?? 0,
        })),
      };
    } catch {
      result.warnings.push("RPKI validation unavailable.");
    }
  }

  if (peeringdb.status === "fulfilled") {
    const entries = peeringdb.value.data;
    if (entries.length > 0) {
      const net = entries[0];
      result.sources.peeringdb = "available";

      if (!result.name && net.name) result.name = net.name;
      if (!result.country && net.country) result.country = net.country;
      if (!result.type && net.info_type) result.type = net.info_type;

      result.peeringdb = {
        netId: net.id,
        name: net.name || "",
        aka: net.aka || "",
        website: net.website || "",
        lookingGlass: net.looking_glass || "",
        routeServer: net.route_server || "",
        traffic: net.info_traffic || "",
        policyGeneral: net.policy_general || "",
        policyLocations: net.policy_locations || "",
        policyRatio: net.policy_ratio === true ? "Yes" : net.policy_ratio === false ? "No" : "",
        policyContracts: net.policy_contracts || "",
        infoPrefixes4: net.info_prefixes4 ?? 0,
        infoPrefixes6: net.info_prefixes6 ?? 0,
        ixCount: net.ix_count ?? 0,
        facilityCount: net.fac_count ?? 0,
        ixlan: (net.netixlan_set ?? []).map((ix) => ({
          id: ix.id,
          name: ix.name || "",
          speed: ix.speed ?? 0,
          ipaddr4: ix.ipaddr4 || "",
          ipaddr6: ix.ipaddr6 || "",
          isRsPeer: ix.is_rs_peer ?? false,
          operational: ix.operational ?? false,
        })),
        facilities: (net.netfac_set ?? []).map((fac) => ({
          id: fac.id,
          name: fac.name || "",
          city: fac.city || "",
          country: fac.country || "",
        })),
      };
    } else {
      result.sources.peeringdb = "unavailable";
    }
  } else {
    result.sources.peeringdb = "error";
    result.warnings.push("PeeringDB data unavailable.");
  }

  if (ipinfo.status === "fulfilled") {
    const data = ipinfo.value;
    result.sources.ipinfo = "available";

    if (!result.name && data.name) result.name = data.name;
    if (!result.country && data.country) result.country = data.country;
    if (!result.registry && data.registry) result.registry = data.registry;
    if (!result.allocated && data.allocated) result.allocated = data.allocated;
    if (!result.domain && data.domain) result.domain = data.domain;
    if (!result.type && data.type) result.type = data.type;
    if (!result.numIps && data.num_ips) result.numIps = data.num_ips;
  } else {
    const reason = ipinfo.status === "rejected" ? (ipinfo.reason as Error).message : "";
    if (reason === "not_configured") {
      result.sources.ipinfo = "not_configured";
    } else {
      result.sources.ipinfo = "error";
      result.warnings.push("IPinfo data unavailable.");
    }
  }

  if (!result.name) result.name = asn.display;

  return result;
}
