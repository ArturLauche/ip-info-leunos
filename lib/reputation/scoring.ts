import {
  CONTEXT_CATEGORIES,
  DIRECT_CATEGORIES,
  getReputationSource,
  severityFromWeight,
  type EvidenceCategory,
  type EvidenceItem,
  type RawEvidence,
  type ReputationHeadline,
  type RiskLevel,
  type ScoreContribution,
} from "./model";

/**
 * Deterministic, explainable evidence scoring.
 *
 * Each evidence item contributes `weight x confidence x freshness` points,
 * plus a volume bonus for direct observations with report counts. Items from
 * correlated datasets (same provider family) are grouped and only partially
 * combined so they are not double counted. Independent corroboration raises
 * the score further. Policy and connection-context categories always
 * contribute zero points.
 */

const HIGH_RISK_THRESHOLD = 60;
const MEDIUM_RISK_THRESHOLD = 25;

const VOLUME_BONUS_CATEGORIES: ReadonlySet<EvidenceCategory> = new Set([
  "bruteforce",
  "abuse_reported",
  "spam_observed",
  "web_attack",
  "ddos",
  "scanner",
]);

export interface AggregatedReputation {
  score: number;
  level: RiskLevel;
  headline: ReputationHeadline;
  evidence: EvidenceItem[];
  contributions: ScoreContribution[];
  threatCategories: EvidenceCategory[];
  mailCategories: EvidenceCategory[];
  contextCategories: EvidenceCategory[];
}

export function aggregateReputation(items: RawEvidence[]): AggregatedReputation {
  const evidence: EvidenceItem[] = items.map((item) => {
    const points = evidencePoints(item);
    return {
      ...item,
      points,
      severity: severityFromWeight(item.weight),
    };
  });

  const contributions: ScoreContribution[] = evidence
    .filter((item) => item.points > 0)
    .map((item) => ({
      sourceId: item.sourceId,
      sourceName: getReputationSource(item.sourceId)?.name ?? item.sourceId,
      category: item.category,
      reason: item.reason,
      points: item.points,
    }));

  // Within one provider family the strongest signal counts fully, weaker
  // correlated signals only half, so e.g. ZEN SBL + DROP is not double counted.
  const adjustedGroupTotals = new Map<string, number>();
  const groupItems = new Map<string, EvidenceItem[]>();
  for (const item of evidence) {
    if (item.points <= 0) continue;
    const group = getReputationSource(item.sourceId)?.independenceGroup ?? item.sourceId;
    const list = groupItems.get(group) ?? [];
    list.push(item);
    groupItems.set(group, list);
  }

  for (const [group, items] of groupItems) {
    const sorted = [...items].sort((a, b) => b.points - a.points);
    const total = sorted[0].points + Math.round(sorted.slice(1).reduce((sum, item) => sum + item.points, 0) * 0.5);
    adjustedGroupTotals.set(group, total);
  }

  const directGroups = countGroups(adjustedGroupTotals, evidence, DIRECT_CATEGORIES);
  const mailGroups = countGroups(adjustedGroupTotals, evidence, new Set(["mail_reputation"]));

  const corroborationBonus = directGroups >= 4 ? 35 : directGroups === 3 ? 22 : directGroups === 2 ? 10 : 0;
  const mailCorroborationBonus = mailGroups >= 3 ? 15 : mailGroups === 2 ? 5 : 0;

  const rawScore =
    [...adjustedGroupTotals.values()].reduce((sum, value) => sum + value, 0) +
    corroborationBonus +
    mailCorroborationBonus;

  const score = Math.min(100, Math.max(0, Math.round(rawScore)));
  const level: RiskLevel = score >= HIGH_RISK_THRESHOLD ? "high" : score >= MEDIUM_RISK_THRESHOLD ? "medium" : "low";

  if (corroborationBonus > 0) {
    contributions.push({
      sourceId: "aggregation",
      sourceName: "aggregation",
      category: "abuse_reported",
      reason: "corroboration",
      points: corroborationBonus,
    });
  }
  if (mailCorroborationBonus > 0) {
    contributions.push({
      sourceId: "aggregation",
      sourceName: "aggregation",
      category: "mail_reputation",
      reason: "mail_corroboration",
      points: mailCorroborationBonus,
    });
  }

  contributions.sort((a, b) => b.points - a.points);

  const hasThreatEvidence = evidence.some((item) => item.weight > 0);
  const headline: ReputationHeadline =
    level === "high" ? "high_risk" : level === "medium" ? "medium_risk" : hasThreatEvidence ? "low_risk" : "no_malicious_activity";

  const threatCategories = uniqueCategories(evidence, (item) => !CONTEXT_CATEGORIES.has(item.category));
  const mailCategories = uniqueCategories(evidence, (item) => item.category === "mail_reputation" || item.category === "spam_observed" || item.category === "mail_policy");
  const contextCategories = uniqueCategories(evidence, (item) => CONTEXT_CATEGORIES.has(item.category));

  return {
    score,
    level,
    headline,
    evidence,
    contributions,
    threatCategories,
    mailCategories,
    contextCategories,
  };
}

function evidencePoints(item: RawEvidence): number {
  if (CONTEXT_CATEGORIES.has(item.category) || item.weight <= 0) return 0;

  const confidence = Math.min(100, Math.max(0, item.confidence));
  const confidenceFactor = 0.5 + 0.5 * (confidence / 100);
  const freshness = Math.min(1, Math.max(0, item.freshness));

  const base = item.weight * confidenceFactor * freshness;
  const bonus = VOLUME_BONUS_CATEGORIES.has(item.category) ? volumeBonus(item.reportCount ?? null) : 0;

  return Math.max(0, Math.round(base + bonus));
}

function volumeBonus(reportCount: number | null): number {
  if (reportCount === null || reportCount <= 1) return 0;
  if (reportCount >= 500) return 25;
  if (reportCount >= 100) return 20;
  if (reportCount >= 25) return 14;
  if (reportCount >= 5) return 8;
  return 4;
}

function countGroups(
  adjustedGroupTotals: Map<string, number>,
  evidence: EvidenceItem[],
  categories: ReadonlySet<EvidenceCategory>,
): number {
  const groups = new Set<string>();
  for (const item of evidence) {
    if (item.points <= 0 || !categories.has(item.category)) continue;
    const group = getReputationSource(item.sourceId)?.independenceGroup ?? item.sourceId;
    if ((adjustedGroupTotals.get(group) ?? 0) > 0) groups.add(group);
  }
  return groups.size;
}

function uniqueCategories(evidence: EvidenceItem[], filter: (item: EvidenceItem) => boolean): EvidenceCategory[] {
  return [...new Set(evidence.filter(filter).map((item) => item.category))];
}
