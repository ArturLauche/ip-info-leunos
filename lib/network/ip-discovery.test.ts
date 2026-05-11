
import { describe, it, expect, vi, beforeEach } from "vitest";
import { discoverExternalIp, getIpVersion, findIpInObject } from "./ip-discovery";

describe("getIpVersion", () => {
  it("should detect valid IPv4", () => {
    expect(getIpVersion("1.1.1.1")).toBe(4);
    expect(getIpVersion("127.0.0.1")).toBe(4);
    expect(getIpVersion("192.168.1.1")).toBe(4);
  });

  it("should return null for invalid IPv4", () => {
    expect(getIpVersion("256.256.256.256")).toBe(null);
    expect(getIpVersion("1.1.1")).toBe(null);
    expect(getIpVersion("a.b.c.d")).toBe(null);
  });

  it("should detect valid IPv6", () => {
    expect(getIpVersion("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(6);
    expect(getIpVersion("::1")).toBe(6);
    expect(getIpVersion("2001:db8::1")).toBe(6);
  });

  it("should return null for invalid strings", () => {
    expect(getIpVersion("not-an-ip")).toBe(null);
    expect(getIpVersion("")).toBe(null);
  });
});

describe("discoverExternalIp", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("should return ipify result if it succeeds", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ip: "1.2.3.4" }),
    });

    const result = await discoverExternalIp();
    expect(result).toEqual({ ip: "1.2.3.4", version: 4, source: "ipify" });
    expect(fetch).toHaveBeenCalledWith("https://api64.ipify.org?format=json", expect.anything());
  });

  it("should fallback to AWS if ipify fails", async () => {
    (fetch as any)
      .mockRejectedValueOnce(new Error("ipify failed"))
      .mockResolvedValueOnce({
        ok: true,
        text: async () => "2001:db8::1\n",
      });

    const result = await discoverExternalIp();
    expect(result).toEqual({ ip: "2001:db8::1", version: 6, source: "aws" });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("should return null if all providers fail", async () => {
    (fetch as any).mockRejectedValue(new Error("failed"));

    const result = await discoverExternalIp();
    expect(result).toBeNull();
  });
});

describe("findIpInObject", () => {
  it("should find IPv4 in a flat object", () => {
    const obj = { foo: "bar", ip: "1.2.3.4" };
    expect(findIpInObject(obj, 4)).toBe("1.2.3.4");
  });

  it("should find IPv6 in a nested object", () => {
    const obj = {
      metadata: {
        last_ip: "2001:db8::1"
      },
      other: "stuff"
    };
    expect(findIpInObject(obj, 6)).toBe("2001:db8::1");
  });

  it("should return null if no IP is found", () => {
    const obj = { foo: "bar", baz: 123 };
    expect(findIpInObject(obj, 4)).toBeNull();
  });

  it("should ignore invalid IPs", () => {
    const obj = { ip: "999.999.999.999" };
    expect(findIpInObject(obj, 4)).toBeNull();
  });
});
