import { describe, expect, it } from "vitest";
import { aggregateRisk } from "./score";
import type { ProviderResult } from "./types";

describe("aggregateRisk", () => {
  it("returns unknown when every provider is unknown/not_configured/error", () => {
    const results: ProviderResult[] = [
      { status: "unknown" },
      { status: "not_configured" },
      { status: "error", reason: "timeout" },
    ];
    expect(aggregateRisk(results)).toEqual({ risk: "unknown", score: null });
  });

  it("returns low when all clean", () => {
    const results: ProviderResult[] = [
      { status: "clean" },
      { status: "clean" },
    ];
    expect(aggregateRisk(results)).toEqual({ risk: "low", score: 0 });
  });

  it("returns listed/high when any provider reports listed", () => {
    const results: ProviderResult[] = [
      { status: "clean" },
      { status: "listed", reason: "spam" },
    ];
    expect(aggregateRisk(results)).toEqual({ risk: "high", score: 80 });
  });

  it("returns suspicious/medium when mixed clean + suspicious", () => {
    const results: ProviderResult[] = [
      { status: "clean" },
      { status: "suspicious", reason: "hosting" },
    ];
    expect(aggregateRisk(results)).toEqual({ risk: "medium", score: 40 });
  });

  it("prefers listed (80) over suspicious (40)", () => {
    const results: ProviderResult[] = [
      { status: "suspicious" },
      { status: "listed" },
    ];
    expect(aggregateRisk(results)).toEqual({ risk: "high", score: 80 });
  });

  it("ignores unknown/not_configured/error when a concrete signal exists", () => {
    const results: ProviderResult[] = [
      { status: "error" },
      { status: "not_configured" },
      { status: "unknown" },
      { status: "clean" },
    ];
    expect(aggregateRisk(results)).toEqual({ risk: "low", score: 0 });
  });

  it("returns low on score 24", () => {
    const results: ProviderResult[] = [{ status: "suspicious" }];
    const { score, risk } = aggregateRisk(results);
    expect(score).toBe(40);
    expect(risk).toBe("medium");
  });

  it("returns medium on score 25..59", () => {
    // suspicious = 40 → medium
    expect(aggregateRisk([{ status: "suspicious" }])).toEqual({
      risk: "medium",
      score: 40,
    });
  });

  it("returns high on score >= 60", () => {
    // listed = 80 → high
    expect(aggregateRisk([{ status: "listed" }])).toEqual({
      risk: "high",
      score: 80,
    });
  });

  it("returns score 0 for clean", () => {
    expect(aggregateRisk([{ status: "clean" }])).toEqual({
      risk: "low",
      score: 0,
    });
  });
});
