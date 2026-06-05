import type { AggregatedRisk, ProviderResult, ReputationStatus } from "./types";

/**
 * Transparent scoring logic:
 *
 * Each provider returns a status with an implicit numeric weight:
 * - "listed"    = 80 (known bad / spam / abuse source)
 * - "suspicious" = 40 (flags such as hosting / proxy / some reports)
 * - "clean"      =  0 (no negative signals)
 * - "unknown"    = skipped (no data, doesn't affect score)
 * - "not_configured" = skipped
 * - "error"      = skipped
 *
 * Final score = max(weight across all concrete provider statuses).
 * If no provider produced a concrete signal (clean/suspicious/listed),
 * the aggregated risk is "unknown" and score is null.
 *
 * Risk thresholds:
 * - 0 .. 24  → "low"
 * - 25 .. 59 → "medium"
 * - 60 .. 100 → "high"
 */

function weightOf(status: ReputationStatus): number {
  switch (status) {
    case "listed":
      return 80;
    case "suspicious":
      return 40;
    case "clean":
      return 0;
    default:
      return -1;
  }
}

export function aggregateRisk(
  results: ProviderResult[],
): { risk: AggregatedRisk; score: number | null } {
  let maxWeight = -1;
  let hasConcrete = false;

  for (const result of results) {
    const w = weightOf(result.status);
    if (w >= 0) {
      hasConcrete = true;
      if (w > maxWeight) maxWeight = w;
    }
  }

  if (!hasConcrete) {
    return { risk: "unknown", score: null };
  }

  const score = Math.min(100, Math.max(0, maxWeight));

  let risk: AggregatedRisk;
  if (score >= 60) {
    risk = "high";
  } else if (score >= 25) {
    risk = "medium";
  } else {
    risk = "low";
  }

  return { risk, score };
}
