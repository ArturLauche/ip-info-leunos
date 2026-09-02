import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/dns", () => {
  it("rejects missing target with a validation error", async () => {
    const response = await GET(new Request("http://localhost/api/dns"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("bad_request");
  });

  it("blocks localhost without performing DNS resolution", async () => {
    const response = await GET(new Request("http://localhost/api/dns?target=localhost"));
    const body = await response.json();

    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("target_blocked");
  });

  it("blocks private IPv4 PTR targets", async () => {
    const response = await GET(new Request("http://localhost/api/dns?target=10.0.0.1"));
    const body = await response.json();

    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("target_blocked");
  });

  it("blocks internal-looking hostnames", async () => {
    const response = await GET(new Request("http://localhost/api/dns?target=host.internal"));
    const body = await response.json();

    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("target_blocked");
  });
});
