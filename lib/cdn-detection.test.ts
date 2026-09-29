import { describe, expect, it } from "vitest";
import { detectCdn, type CdnConfidence } from "./cdn-detection";

function detect(headers: Record<string, string> = {}, cnames: string[] = [], hostname = "example.com") {
  return detectCdn(new Headers(headers), cnames, hostname);
}

describe("CDN detection", () => {
  it("detects Cloudflare from headers", () => {
    const detection = detectCdn(
      new Headers({
        "cf-ray": "abc",
        "cf-cache-status": "HIT",
      }),
      [],
      "example.com",
    );

    expect(detection).toMatchObject({
      provider: "Cloudflare",
      confidence: "high",
    });
  });

  it("detects CloudFront from CNAME and headers", () => {
    const detection = detectCdn(
      new Headers({
        "x-amz-cf-id": "abc",
      }),
      ["example.cloudfront.net"],
      "example.com",
    );

    expect(detection).toMatchObject({
      provider: "Amazon CloudFront",
      confidence: "high",
    });
  });

  it("returns null when no CDN signals are present", () => {
    const detection = detectCdn(new Headers({ server: "nginx" }), [], "example.com");

    expect(detection).toBeNull();
  });
});

interface SignatureCase {
  name: string;
  headers?: Record<string, string>;
  cnames?: string[];
  provider: string;
  confidence: CdnConfidence;
  signals: string[];
}

// Expectations were captured from the implementation before the accuracy fixes:
// changing a row here is a behaviour change, not a refactor.
const HEADER_SIGNATURES: SignatureCase[] = [
  {
    name: "Cloudflare: cf-ray + cf-cache-status + server",
    headers: { "cf-ray": "8a1b2c3d4e5f6a7b-AMS", "cf-cache-status": "HIT", server: "cloudflare" },
    provider: "Cloudflare",
    confidence: "high",
    signals: ["header:cf-ray", "header:cf-cache-status", "header-value:cloudflare"],
  },
  {
    name: "Cloudflare: cf-ray only",
    headers: { "cf-ray": "8a1b2c3d4e5f6a7b-AMS" },
    provider: "Cloudflare",
    confidence: "medium",
    signals: ["header:cf-ray"],
  },
  {
    name: "Cloudflare: server only",
    headers: { server: "cloudflare" },
    provider: "Cloudflare",
    confidence: "low",
    signals: ["header-value:cloudflare"],
  },
  {
    name: "Vercel: x-vercel-id + x-vercel-cache + server",
    headers: { "x-vercel-id": "iad1::abcde-1700000000000-0123456789ab", "x-vercel-cache": "HIT", server: "Vercel" },
    provider: "Vercel Edge Network",
    confidence: "high",
    signals: ["header:x-vercel-id", "header:x-vercel-cache", "header-value:vercel"],
  },
  {
    name: "Akamai: akamai-grn + server",
    headers: { "akamai-grn": "0.1234abcd.1700000000.abcdef", server: "AkamaiGHost" },
    provider: "Akamai",
    confidence: "high",
    signals: ["header:akamai-grn", "header-value:akamai"],
  },
  {
    name: "Akamai: server only",
    headers: { server: "AkamaiGHost" },
    provider: "Akamai",
    confidence: "low",
    signals: ["header-value:akamai"],
  },
  {
    name: "Fastly: x-served-by + x-cache-hits + x-timer",
    headers: {
      "x-served-by": "cache-lga21935-LGA",
      "x-cache": "HIT",
      "x-cache-hits": "1",
      "x-timer": "S1700000000.123456,VS0,VE1",
      via: "1.1 varnish",
    },
    provider: "Fastly",
    confidence: "high",
    signals: ["header:x-served-by", "header:x-cache-hits", "header:x-timer"],
  },
  {
    name: "Fastly: x-served-by + x-cache",
    headers: { "x-served-by": "cache-lga21935-LGA", "x-cache": "HIT" },
    provider: "Fastly",
    confidence: "medium",
    signals: ["header:x-served-by"],
  },
  {
    name: "CloudFront: x-amz-cf-id + x-amz-cf-pop + x-cache + via",
    headers: {
      "x-amz-cf-id": "Zx9abc==",
      "x-amz-cf-pop": "FRA56-P1",
      "x-cache": "Hit from cloudfront",
      via: "1.1 0123456789abcdef.cloudfront.net (CloudFront)",
    },
    provider: "Amazon CloudFront",
    confidence: "high",
    signals: ["header:x-amz-cf-id", "header:x-amz-cf-pop", "header:x-cache", "header-value:cloudfront"],
  },
  {
    name: "CloudFront: x-amz-cf-pop only",
    headers: { "x-amz-cf-pop": "FRA56-P1" },
    provider: "Amazon CloudFront",
    confidence: "medium",
    signals: ["header:x-amz-cf-pop"],
  },
  {
    name: "CloudFront: x-amz-cf-id + x-cache",
    headers: { "x-amz-cf-id": "Zx9abc==", "x-cache": "Miss from cloudfront" },
    provider: "Amazon CloudFront",
    confidence: "high",
    signals: ["header:x-amz-cf-id", "header:x-cache", "header-value:cloudfront"],
  },
  {
    name: "CloudFront: x-cache value naming cloudfront",
    headers: { "x-cache": "Hit from cloudfront" },
    provider: "Amazon CloudFront",
    confidence: "high",
    signals: ["header:x-cache", "header-value:cloudfront"],
  },
  {
    name: "CloudFront: via + x-cache naming cloudfront",
    headers: { "x-cache": "Miss from cloudfront", via: "1.1 abc.cloudfront.net (CloudFront)" },
    provider: "Amazon CloudFront",
    confidence: "high",
    signals: ["header:x-cache", "header-value:cloudfront"],
  },
  {
    name: "CloudFront: via only",
    headers: { via: "1.1 0123456789abcdef.cloudfront.net (CloudFront)" },
    provider: "Amazon CloudFront",
    confidence: "low",
    signals: ["header-value:cloudfront"],
  },
  {
    name: "CloudFront: server only",
    headers: { server: "CloudFront" },
    provider: "Amazon CloudFront",
    confidence: "low",
    signals: ["header-value:cloudfront"],
  },
  {
    name: "CloudFront: x-cache next to a CloudFront CNAME",
    headers: { "x-cache": "Miss from cloudfront" },
    cnames: ["d111111abcdef8.cloudfront.net"],
    provider: "Amazon CloudFront",
    confidence: "high",
    signals: ["header:x-cache", "header-value:cloudfront", "dns:cloudfront.net"],
  },
  {
    name: "Bunny CDN: cdn-* headers + server",
    headers: { "cdn-pullzone": "12345", "cdn-cache": "HIT", "cdn-requestid": "abcdef", server: "BunnyCDN-DE1-1234" },
    provider: "Bunny CDN",
    confidence: "high",
    signals: [
      "header:cdn-pullzone",
      "header:cdn-cache",
      "header:cdn-requestid",
      "header-value:bunnycdn",
      "header-value:bunny",
    ],
  },
  {
    name: "KeyCDN: x-edge-location + x-cache + server",
    headers: { "x-edge-location": "defr", "x-cache": "HIT", server: "keycdn-engine" },
    provider: "KeyCDN",
    confidence: "high",
    signals: ["header:x-edge-location", "header:x-cache", "header-value:keycdn"],
  },
  {
    name: "KeyCDN: x-edge-location + x-cache",
    headers: { "x-edge-location": "defr", "x-cache": "HIT" },
    provider: "KeyCDN",
    confidence: "high",
    signals: ["header:x-edge-location", "header:x-cache"],
  },
  {
    name: "KeyCDN: server only",
    headers: { server: "keycdn-engine" },
    provider: "KeyCDN",
    confidence: "low",
    signals: ["header-value:keycdn"],
  },
  {
    name: "JSDelivr: x-jsd-version-type",
    headers: { "x-jsd-version-type": "version" },
    provider: "JSDelivr",
    confidence: "medium",
    signals: ["header:x-jsd-version-type"],
  },
  {
    name: "UNPKG: Cloudflare headers + unpkg.com CNAME",
    headers: { "cf-ray": "8a1b-AMS", "cf-cache-status": "HIT", server: "cloudflare" },
    cnames: ["unpkg.com"],
    provider: "UNPKG (Cloudflare-backed)",
    confidence: "high",
    signals: ["header:cf-ray", "header:cf-cache-status", "dns:unpkg.com"],
  },
  {
    name: "Edgio: x-ec-* headers",
    headers: { "x-ec-custom-error": "1", "x-ec-check-cacheable": "YES" },
    provider: "Edgio",
    confidence: "high",
    signals: ["header:x-ec-custom-error", "header:x-ec-check-cacheable"],
  },
  {
    name: "CacheFly: x-cf-tsc + x-cache",
    headers: { "x-cf-tsc": "1700000000", "x-cache": "HIT" },
    provider: "CacheFly",
    confidence: "high",
    signals: ["header:x-cf-tsc", "header:x-cache"],
  },
  {
    name: "CacheFly: x-cache next to a CacheFly CNAME",
    headers: { "x-cache": "HIT" },
    cnames: ["example.cachefly.net"],
    provider: "CacheFly",
    confidence: "high",
    signals: ["header:x-cache", "dns:cachefly.net"],
  },
  {
    name: "Google Cloud CDN: x-goog-* headers",
    headers: {
      "x-goog-generation": "1700000000000000",
      "x-goog-hash": "crc32c=abc==",
      "x-guploader-uploadid": "ABC",
      server: "UploadServer",
    },
    provider: "Google Cloud CDN",
    confidence: "high",
    signals: ["header:x-goog-generation", "header:x-goog-hash", "header:x-guploader-uploadid"],
  },
  {
    name: "Azure Front Door: x-azure-ref + x-cache",
    headers: { "x-azure-ref": "0AbCdEf1234567890", "x-cache": "TCP_HIT" },
    provider: "Microsoft Azure CDN",
    confidence: "high",
    signals: ["header:x-azure-ref", "header:x-cache"],
  },
  {
    name: "Azure Front Door: x-azure-ref only",
    headers: { "x-azure-ref": "0AbCdEf1234567890" },
    provider: "Microsoft Azure CDN",
    confidence: "medium",
    signals: ["header:x-azure-ref"],
  },
  {
    name: "Azure CDN: x-msedge-ref only",
    headers: { "x-msedge-ref": "Ref A: ABC" },
    provider: "Microsoft Azure CDN",
    confidence: "medium",
    signals: ["header:x-msedge-ref"],
  },
  {
    name: "Alibaba Cloud CDN: x-swift-* headers",
    headers: {
      "x-swift-cachetime": "3600",
      "x-swift-savetime": "Mon, 01 Jan 2024 00:00:00 GMT",
      "ali-swift-global-savetime": "1700000000",
      server: "Tengine",
    },
    provider: "Alibaba Cloud CDN",
    confidence: "high",
    signals: ["header:x-swift-cachetime", "header:x-swift-savetime", "header:ali-swift-global-savetime"],
  },
  {
    name: "Tencent EdgeOne: eo-cache-status + trace id + server",
    headers: { "eo-cache-status": "HIT", "x-tencent-trace-id": "abc", server: "TencentEdgeOne" },
    provider: "Tencent Cloud EdgeOne/CDN",
    confidence: "high",
    signals: ["header:eo-cache-status", "header:x-tencent-trace-id", "header-value:edgeone", "header-value:tencent"],
  },
  {
    name: "Oracle Cloud CDN: x-oracle-dms-* + server",
    headers: { "x-oracle-dms-ecid": "abc", "x-oracle-dms-rid": "0", server: "Oracle-HTTP-Server" },
    provider: "Oracle Cloud CDN",
    confidence: "high",
    signals: ["header:x-oracle-dms-ecid", "header:x-oracle-dms-rid", "header-value:oracle"],
  },
  {
    name: "Netlify: x-nf-request-id + server",
    headers: { "x-nf-request-id": "01ABCDEFGHJKMNPQRSTVWXYZ", server: "Netlify" },
    provider: "Netlify Edge",
    confidence: "high",
    signals: ["header:x-nf-request-id", "header-value:netlify"],
  },
  {
    name: "Imperva: x-iinfo + x-cdn",
    headers: { "x-iinfo": "1-2-3 NNNN CT(0 0 0) RT(1 2)", "x-cdn": "Imperva" },
    provider: "Imperva / Incapsula",
    confidence: "high",
    signals: ["header:x-iinfo", "header:x-cdn", "header-value:imperva"],
  },
  {
    name: "Imperva: x-cdn naming Incapsula",
    headers: { "x-cdn": "Incapsula" },
    provider: "Imperva / Incapsula",
    confidence: "high",
    signals: ["header:x-cdn", "header-value:incapsula"],
  },
  {
    name: "Sucuri: x-sucuri-* + server",
    headers: { "x-sucuri-id": "12345", "x-sucuri-cache": "HIT", server: "Sucuri/Cloudproxy" },
    provider: "Sucuri CDN",
    confidence: "high",
    signals: ["header:x-sucuri-id", "header:x-sucuri-cache", "header-value:sucuri"],
  },
  {
    name: "Gcore: x-gcdn-cache + x-gcore-request-id",
    headers: { "x-gcdn-cache": "HIT", "x-gcore-request-id": "abc" },
    provider: "Gcore CDN",
    confidence: "high",
    signals: ["header:x-gcdn-cache", "header:x-gcore-request-id"],
  },
  {
    name: "CDN77: x-cdn77-* + server",
    headers: { "x-cdn77-cache": "HIT", "x-cdn77": "1", server: "CDN77-Turbo" },
    provider: "CDN77",
    confidence: "high",
    signals: ["header:x-cdn77-cache", "header:x-cdn77", "header-value:cdn77"],
  },
  {
    name: "StackPath: x-sp-* headers",
    headers: { "x-sp-edge": "abc", "x-sp-cache": "HIT", server: "NetDNA-cache/2.2" },
    provider: "StackPath",
    confidence: "high",
    signals: ["header:x-sp-edge", "header:x-sp-cache"],
  },
];

const CNAME_SIGNATURES: [cnames: string[], provider: string, confidence: CdnConfidence, signals: string[]][] = [
  [["example.com.cdn.cloudflare.net"], "Cloudflare", "medium", ["dns:cloudflare.net"]],
  [["cname.vercel-dns.com"], "Vercel Edge Network", "medium", ["dns:vercel-dns.com"]],
  [["my-app.vercel.app"], "Vercel Edge Network", "medium", ["dns:vercel.app"]],
  [["foo.edgekey.net"], "Akamai", "medium", ["dns:edgekey.net"]],
  [["www.example.com.edgekey.net", "e6858.dscx.akamaiedge.net"], "Akamai", "high", ["dns:edgekey.net", "dns:akamai"]],
  [["www.example.com.edgesuite.net", "a1234.dscb.akamai.net"], "Akamai", "high", ["dns:edgesuite.net", "dns:akamai"]],
  [["assets.example.com.akamaized.net"], "Akamai", "medium", ["dns:akamai"]],
  // The token sits mid-name here, so a strict end-of-string suffix check would lose it.
  [["www.example.com.edgekey.net.globalredir.akadns.net"], "Akamai", "medium", ["dns:edgekey.net"]],
  [["example.global.prod.fastly.net"], "Fastly", "medium", ["dns:fastly.net"]],
  [["example.map.fastly.net"], "Fastly", "high", ["dns:fastly.net", "dns:map.fastly.net"]],
  [["d111111abcdef8.cloudfront.net"], "Amazon CloudFront", "medium", ["dns:cloudfront.net"]],
  [["example.b-cdn.net"], "Bunny CDN", "medium", ["dns:b-cdn.net"]],
  [["example.bunnycdn.ru"], "Bunny CDN", "medium", ["dns:bunnycdn"]],
  [["example-1234.kxcdn.com"], "KeyCDN", "medium", ["dns:kxcdn.com"]],
  [["cdn.jsdelivr.net"], "JSDelivr", "medium", ["dns:cdn.jsdelivr.net"]],
  [["wpc.abcd.edgecastcdn.net"], "Edgio", "medium", ["dns:edgecastcdn.net"]],
  [["example.llnwd.net"], "Edgio", "medium", ["dns:llnwd.net"]],
  [["example.edgio.net"], "Edgio", "medium", ["dns:edgio"]],
  [["example.cachefly.net"], "CacheFly", "medium", ["dns:cachefly.net"]],
  [["ghs.googlehosted.com"], "Google Cloud CDN", "medium", ["dns:googlehosted.com"]],
  [["example.azureedge.net"], "Microsoft Azure CDN", "medium", ["dns:azureedge.net"]],
  [["example.trafficmanager.net"], "Microsoft Azure CDN", "medium", ["dns:trafficmanager.net"]],
  [["example.com.w.kunlunsl.com"], "Alibaba Cloud CDN", "medium", ["dns:kunlun"]],
  [["example.com.w.alikunlun.com"], "Alibaba Cloud CDN", "high", ["dns:kunlun", "dns:alikunlun", "dns:alikunlun.com"]],
  [["example.com.w.alikunlun.net"], "Alibaba Cloud CDN", "high", ["dns:kunlun", "dns:alikunlun"]],
  [["example.cdn.dnsv1.com"], "Tencent Cloud EdgeOne/CDN", "medium", ["dns:dnsv1.com"]],
  [["example.cdn.dnsv1.com.cn"], "Tencent Cloud EdgeOne/CDN", "medium", ["dns:dnsv1.com"]],
  [["example.edgeone-dns.com"], "Tencent Cloud EdgeOne/CDN", "medium", ["dns:edgeone-dns.com"]],
  [["example.oraclecloud.com"], "Oracle Cloud CDN", "medium", ["dns:oraclecloud"]],
  [["objectstorage.us-ashburn-1.oci.oraclecloud.com"], "Oracle Cloud CDN", "high", ["dns:oraclecloud", "dns:oci"]],
  [["abc.oci.customer-oci.com"], "Oracle Cloud CDN", "medium", ["dns:oci"]],
  [["example.netlify.app"], "Netlify Edge", "medium", ["dns:netlify.app"]],
  [["example.netlify.global"], "Netlify Edge", "medium", ["dns:netlify.global"]],
  [["abc.x.incapdns.net"], "Imperva / Incapsula", "medium", ["dns:incapdns.net"]],
  [["abc.impervadns.net"], "Imperva / Incapsula", "medium", ["dns:impervadns.net"]],
  [["example.cloudproxy.sucuri.net"], "Sucuri CDN", "medium", ["dns:sucuri.net"]],
  [["example.gcdn.co"], "Gcore CDN", "medium", ["dns:gcdn.co"]],
  [["example.gcorelabs.com"], "Gcore CDN", "medium", ["dns:gcorelabs.com"]],
  [["1234567890.rsc.cdn77.org"], "CDN77", "medium", ["dns:cdn77.org"]],
  [["example.stackpathdns.com"], "StackPath", "medium", ["dns:stackpathdns.com"]],
];

describe("CDN detection: canonical provider signatures", () => {
  it.each(HEADER_SIGNATURES.map((row) => [row.name, row] as const))(
    "%s",
    (_name, { headers, cnames, provider, confidence, signals }) => {
      expect(detect(headers, cnames)).toMatchObject({
        provider,
        confidence,
        reasonCode: "matched_signals",
        matchedSignals: signals,
      });
    },
  );

  it.each(CNAME_SIGNATURES)("CNAME chain %j is %s (%s)", (cnames, provider, confidence, signals) => {
    expect(detect({}, cnames)).toMatchObject({
      provider,
      confidence,
      reasonCode: "matched_signals",
      matchedSignals: signals,
    });
  });
});

describe("CDN detection: generic cache headers", () => {
  const GENERIC_PROXY = {
    provider: "Unknown CDN / Reverse Proxy",
    confidence: "low",
    reasonCode: "generic_proxy_headers",
    matchedSignals: ["header:x-cache/via/cache-status"],
  };

  interface FallbackCase {
    name: string;
    headers: Record<string, string>;
    cnames?: string[];
  }

  const FALLBACK_CASES: FallbackCase[] = [
    { name: "bare x-cache HIT behind nginx", headers: { "x-cache": "HIT", server: "nginx" } },
    { name: "x-cache MISS with a Varnish via", headers: { "x-cache": "MISS", via: "1.1 varnish (Varnish/6.0)" } },
    { name: "x-cache with an unrelated CNAME", headers: { "x-cache": "HIT" }, cnames: ["origin.example.net"] },
    { name: "via alone", headers: { via: "1.1 varnish" } },
    { name: "cache-status alone", headers: { "cache-status": "ExampleCache; hit" } },
  ];

  it.each(FALLBACK_CASES)("$name falls back to the generic proxy result", ({ headers, cnames }) => {
    expect(detect(headers, cnames)).toMatchObject(GENERIC_PROXY);
  });

  it("does not let x-cache promote a weak value match", () => {
    const detection = detect({ server: "Microsoft-IIS/10.0", "x-cache": "HIT" });

    expect(detection?.confidence).toBe("low");
    expect(detection?.matchedSignals).not.toContain("header:x-cache");
  });

  it("does not attribute x-cdn to Imperva when its value names another vendor", () => {
    expect(detect({ "x-cdn": "fastly" })).toMatchObject({
      provider: "Fastly",
      confidence: "low",
      matchedSignals: ["header-value:fastly"],
    });
  });
});

describe("CDN detection: header value scope", () => {
  it.each([
    {
      name: "a CSP naming cdnjs.cloudflare.com",
      header: "content-security-policy",
      value: "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; img-src 'self' data:",
    },
    {
      name: "a Link header preloading from jsDelivr",
      header: "link",
      value: "<https://cdn.jsdelivr.net/npm/foo@1/dist/foo.js>; rel=preload; as=script",
    },
    {
      name: "a Link header preloading from cdnjs",
      header: "link",
      value: "<https://cdnjs.cloudflare.com/ajax/libs/foo/1.0.0/foo.min.js>; rel=preload; as=script",
    },
    {
      name: "a CSP listing several CDN hosts",
      header: "content-security-policy",
      value: [
        "script-src https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
        "https://*.azureedge.net https://vercel.live https://*.netlify.app https://*.fastly.net;",
        "connect-src https://bunny.net",
      ].join(" "),
    },
    { name: "cookie values", header: "set-cookie", value: "theme=bunny; Path=/, promo=cloudfront; Path=/" },
    { name: "a CORS origin", header: "access-control-allow-origin", value: "https://app.netlify.app" },
  ])("ignores provider names in $name", ({ header, value }) => {
    expect(detect({ [header]: value, server: "nginx" })).toBeNull();
  });

  it("does not let a CSP mention outrank the real serving stack", () => {
    const detection = detect({
      server: "AkamaiGHost",
      "content-security-policy": "script-src https://cdnjs.cloudflare.com",
    });

    expect(detection).toMatchObject({ provider: "Akamai", matchedSignals: ["header-value:akamai"] });
  });

  // x-served-by is left out: its name alone is already a Fastly signal, so it cannot be a value-only probe.
  it.each(["server", "via", "x-powered-by", "x-cache", "x-cdn", "cache-status"])(
    "still reads provider names from %s",
    (header) => {
      expect(detect({ [header]: "cloudflare" })).toMatchObject({
        provider: "Cloudflare",
        confidence: "low",
        matchedSignals: ["header-value:cloudflare"],
      });
    },
  );
});

describe("CDN detection: CNAME label boundaries", () => {
  it.each([
    "social-cdn.example.net",
    "associates.example.com",
    "mobile.example.org",
    "notcloudfront.net",
    "foo.cloudfront.network",
    "assets.web-cdn.net",
    "app.notvercel.app",
    "foo.dnsv1.community",
    "foo.fastly.network",
  ])("does not match the lookalike CNAME %s", (host) => {
    expect(detect({}, [host])).toBeNull();
  });

  it("does not let a lookalike label outrank a real provider CNAME", () => {
    const detection = detect({}, ["social-cdn.example.net", "example.netlify.app"]);

    expect(detection).toMatchObject({ provider: "Netlify Edge", matchedSignals: ["dns:netlify.app"] });
  });

  it("matches short tokens only as a whole label", () => {
    expect(detect({}, ["oci-1.example.com"])).toBeNull();
    expect(detect({}, ["abc.oci.example.com"])).toMatchObject({
      provider: "Oracle Cloud CDN",
      matchedSignals: ["dns:oci"],
    });
  });

  it("matches case-insensitively and ignores a trailing dot", () => {
    expect(detect({}, ["D111111ABCDEF8.CloudFront.net."])).toMatchObject({
      provider: "Amazon CloudFront",
      confidence: "medium",
      matchedSignals: ["dns:cloudfront.net"],
    });
  });
});
