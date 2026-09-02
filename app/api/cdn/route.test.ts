import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/cdn", () => {
  it("rejects missing target with a validation error", async () => {
    const response = await GET(new Request("http://localhost/api/cdn"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("bad_request");
  });

  it("blocks localhost URLs without fetching", async () => {
    const response = await GET(
      new Request("http://localhost/api/cdn?target=http%3A%2F%2Flocalhost%2F"),
    );
    const body = await response.json();

    expect(body.ok).toBe(false);
    expect(["invalid_target", "target_blocked"]).toContain(body.error.code);
  });

  it("blocks private-IP URLs", async () => {
    const response = await GET(
      new Request("http://localhost/api/cdn?target=http%3A%2F%2F192.168.0.1%2F"),
    );
    const body = await response.json();

    expect(body.ok).toBe(false);
    expect(["invalid_target", "target_blocked"]).toContain(body.error.code);
  });
});
