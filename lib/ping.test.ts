import { describe, expect, it } from "vitest";
import { buildPingRequest, defaultPingPort } from "./ping";

const input = {
  mode: "database" as const, target: " example.com ", port: "5432", timeoutMs: "3000",
  databaseType: "postgres" as const, useAuth: true, username: "alice", password: "test-password", database: "app",
};

describe("Ping requests", () => {
  it("never serializes credentials when authentication is disabled or the mode is not database", () => {
    expect(buildPingRequest({ ...input, useAuth: false })).not.toHaveProperty("auth");
    for (const mode of ["tcp", "udp", "eb"] as const) {
      expect(JSON.stringify(buildPingRequest({ ...input, mode }))).not.toContain("test-password");
    }
  });

  it("keeps explicit credentials and trims only the host for an authenticated database check", () => {
    expect(buildPingRequest(input)).toMatchObject({
      target: "example.com", port: 5432, timeoutMs: 3000,
      auth: { enabled: true, username: "alice", password: "test-password", database: "app" },
    });
  });

  it("provides the correct initial port for deep-linked modes, including a manual generic database", () => {
    expect(defaultPingPort("udp")).toBe("53");
    expect(defaultPingPort("eb")).toBe("443");
    expect(defaultPingPort("database")).toBe("5432");
    expect(defaultPingPort("database", "generic")).toBe("");
  });
});
