import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

afterEach(() => {
  vi.unstubAllEnvs();
});

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

  it("rejects an oversized request body before JSON validation", async () => {
    const response = await POST(
      new Request("http://localhost/api/ping", {
        method: "POST",
        body: JSON.stringify({ target: "1.1.1.1", port: 80, padding: "x".repeat(20_000) }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(413);
    expect(body).toMatchObject({
      ok: false,
      error: { code: "request_too_large", message: "Request body is too large." },
    });
  });

  it("fails closed when the configured port allowlist has no valid ports", async () => {
    vi.stubEnv("PUBLIC_ALLOWED_PING_PORTS", "not-a-port");

    const response = await POST(
      new Request("http://localhost/api/ping", {
        method: "POST",
        body: JSON.stringify({ target: "1.1.1.1", port: 80 }),
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
