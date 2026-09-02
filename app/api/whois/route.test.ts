import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/whois", () => {
  it("rejects missing target with a validation error", async () => {
    const response = await GET(new Request("http://localhost/api/whois"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("bad_request");
  });

  it("blocks localhost without opening a socket", async () => {
    const response = await GET(new Request("http://localhost/api/whois?target=localhost"));
    const body = await response.json();

    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("target_blocked");
  });

  it("blocks link-local metadata-style targets", async () => {
    const response = await GET(
      new Request("http://localhost/api/whois?target=169.254.169.254"),
    );
    const body = await response.json();

    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("target_blocked");
  });
});
