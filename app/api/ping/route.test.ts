import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("ping route hardening", () => {
  it("rejects localhost before opening sockets", async () => {
    const response = await POST(
      new Request("http://localhost/api/ping", {
        method: "POST",
        body: JSON.stringify({ mode: "tcp", target: "127.0.0.1", port: 80 }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toMatchObject({
      ok: false,
      error: { code: "target_blocked" },
    });
  });

  it("rejects invalid JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/ping", {
        method: "POST",
        body: "{",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      ok: false,
      error: { code: "bad_request" },
    });
  });
});
