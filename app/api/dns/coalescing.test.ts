import { beforeEach, describe, expect, it, vi } from "vitest";

const dnsMock = vi.hoisted(() => ({
  lookup: vi.fn(),
  resolve: vi.fn(),
  reverse: vi.fn(),
}));

vi.mock("node:dns/promises", () => ({ default: dnsMock }));
vi.mock("@/lib/network/target", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/network/target")>()),
  assertPublicTarget: async (input: string) => ({
    input,
    hostname: input,
    addresses: ["93.184.216.34"],
  }),
}));

import { GET } from "./route";

let hostCounter = 0;
const uniqueHost = () => `coalesce-${++hostCounter}.example.com`;
const request = (host: string, client: string) =>
  new Request(`http://localhost/api/dns?target=${host}`, {
    headers: { "x-real-ip": client },
  });

function gate() {
  let open!: () => void;
  const opened = new Promise<void>((resolve) => {
    open = resolve;
  });
  return { opened, open };
}

beforeEach(() => {
  dnsMock.lookup.mockReset();
  dnsMock.resolve.mockReset();
  dnsMock.reverse.mockReset();
});

describe("GET /api/dns coalescing", () => {
  it("fans out resolver queries once for concurrent lookups of one host", async () => {
    const host = uniqueHost();
    const release = gate();
    dnsMock.lookup.mockImplementation(async () => {
      await release.opened;
      return [{ address: "93.184.216.34", family: 4 }];
    });
    dnsMock.resolve.mockImplementation(async (_name: string, type: string) => {
      await release.opened;
      if (type === "A") return ["93.184.216.34"];
      throw Object.assign(new Error("no data"), { code: "ENODATA" });
    });

    const pending = [1, 2, 3, 4].map((n) => GET(request(host, `203.0.113.${n}`)));
    release.open();
    const bodies = await Promise.all((await Promise.all(pending)).map((r) => r.json()));

    expect(dnsMock.lookup).toHaveBeenCalledTimes(1);
    expect(dnsMock.resolve.mock.calls.map(([, type]) => type).sort()).toEqual([
      "A",
      "AAAA",
      "CAA",
      "CNAME",
      "MX",
      "NS",
      "SOA",
      "SRV",
      "TXT",
    ]);
    for (const body of bodies) {
      expect(body.ok).toBe(true);
      expect(body.data).toEqual(bodies[0].data);
      expect(body.data.records).toEqual([{ type: "A", value: "93.184.216.34" }]);
    }
  });

  it("does not let a transient failure stick to the next request", async () => {
    const host = uniqueHost();
    dnsMock.lookup.mockRejectedValueOnce(Object.assign(new Error("try again"), { code: "EAI_AGAIN" }));
    dnsMock.lookup.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
    dnsMock.resolve.mockRejectedValue(Object.assign(new Error("no data"), { code: "ENODATA" }));

    const failed = await (await GET(request(host, "203.0.113.20"))).json();
    const recovered = await (await GET(request(host, "203.0.113.21"))).json();

    expect(failed.data.lookupErrorCode).toBe("temporary");
    expect(recovered.data.lookupError).toBeNull();
    expect(recovered.data.addresses).toEqual([{ address: "93.184.216.34", family: 4 }]);
    expect(dnsMock.lookup).toHaveBeenCalledTimes(2);
  });
});
