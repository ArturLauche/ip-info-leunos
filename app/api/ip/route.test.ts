import { beforeEach, describe, expect, it, vi } from "vitest";
import { assessRequestProxyHints } from "@/lib/request-proxy-hints";

const { lookupIpApiMock } = vi.hoisted(() => ({
  lookupIpApiMock: vi.fn(),
}));

vi.mock("@/lib/providers/ip-api", () => ({
  lookupIpApi: lookupIpApiMock,
}));

import { GET } from "./route";

const ipApiResult = {
  status: "success" as const,
  country: "United States",
  countryCode: "US",
  region: "",
  regionName: "",
  city: "",
  zip: "",
  lat: 0,
  lon: 0,
  timezone: "America/New_York",
  isp: "Example ISP",
  org: "Example Network",
  as: "AS15169 Google LLC",
  asname: "GOOGLE",
  reverse: "dns.google",
  mobile: false,
  proxy: false,
  hosting: false,
  query: "8.8.8.8",
};

describe("request proxy hint detection", () => {
  it("treats normal Vercel forwarding headers as neutral", () => {
    const result = assessRequestProxyHints(
      new Headers({
        host: "ip-info.leunos.com",
        "x-forwarded-host": "ip-info.leunos.com",
        "x-forwarded-for": "8.8.8.8",
        "x-vercel-forwarded-for": "8.8.8.8",
        "x-real-ip": "8.8.8.8",
        "x-vercel-id": "fra1::iad1::example",
      }),
    );

    expect(result).toMatchObject({ detected: false, confidence: "none", category: "unknown" });
    expect(result.reasons).toEqual([]);
  });

  it("does not show a single forwarding header or forwarding anomaly alone", () => {
    const single = assessRequestProxyHints(new Headers({ "x-forwarded-for": "8.8.8.8" }));
    const chain = assessRequestProxyHints(
      new Headers({ "x-forwarded-for": "8.8.8.8, 1.1.1.1" }),
    );

    expect(single.reasons).toEqual([]);
    expect(chain).toMatchObject({ detected: false, confidence: "none" });
    expect(chain.reasons).toContain("forwarded-chain-anomaly");
  });

  it("scores Via alone as low and a product-bearing Via header as high", () => {
    const via = assessRequestProxyHints(new Headers({ via: "1.1 school-gateway" }));
    const zscaler = assessRequestProxyHints(new Headers({ via: "1.1 zscaler" }));
    const bluecoat = assessRequestProxyHints(new Headers({ "x-bluecoat-via": "proxy-01" }));

    expect(via).toMatchObject({ detected: true, confidence: "low" });
    expect(zscaler).toMatchObject({
      detected: true,
      confidence: "high",
      category: "security-gateway",
    });
    expect(bluecoat).toMatchObject({ detected: true, confidence: "high" });
  });

  it("combines a forwarding anomaly with Via into medium confidence", () => {
    const result = assessRequestProxyHints(
      new Headers({
        via: "1.1 intermediary",
        "x-forwarded-for": "8.8.8.8, 1.1.1.1",
      }),
    );

    expect(result).toMatchObject({ detected: true, confidence: "medium" });
  });

  it("returns only stable codes instead of raw header values", () => {
    const rawHeaderValue = "internal-secret-zscaler-proxy-17";
    const result = assessRequestProxyHints(new Headers({ via: rawHeaderValue }));

    expect(JSON.stringify(result)).not.toContain(rawHeaderValue);
    expect(result.labels).toContain("product-header:zscaler");
  });
});

describe("IP route proxy hints", () => {
  beforeEach(() => {
    lookupIpApiMock.mockReset();
    lookupIpApiMock.mockResolvedValue(ipApiResult);
  });

  it("omits requester proxy hints for explicit target lookups", async () => {
    const response = await GET(
      new Request("http://localhost/api/ip?ip=8.8.8.8", {
        headers: { via: "1.1 zscaler" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data).not.toHaveProperty("proxyHints");
  });

  it("returns request hints for automatic lookup even when metadata is unavailable", async () => {
    lookupIpApiMock.mockResolvedValueOnce(null);

    const response = await GET(
      new Request("http://localhost/api/ip", {
        headers: {
          via: "1.1 zscaler",
          "x-vercel-forwarded-for": "8.8.8.8",
          "x-forwarded-for": "8.8.8.8",
          "x-real-ip": "8.8.8.8",
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      data: {
        ipv4: "8.8.8.8",
        proxyHints: {
          detected: true,
          confidence: "high",
          category: "security-gateway",
        },
      },
    });
  });
});
