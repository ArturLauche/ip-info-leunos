export type ReputationStatus =
  | "clean"
  | "suspicious"
  | "listed"
  | "unknown"
  | "not_configured"
  | "error";

export interface ProviderResult {
  status: ReputationStatus;
  score?: number;
  reason?: string;
  lastSeenAt?: string;
}

export interface ReputationProvider {
  name: string;
  isConfigured: () => boolean;
  check: (ip: string, signal: AbortSignal) => Promise<ProviderResult>;
}

export interface ReputationSourceEntry {
  name: string;
  status: ReputationStatus;
  score?: number;
  reason?: string;
  checkedAt: string;
}

export type AggregatedRisk = "low" | "medium" | "high" | "unknown";

export interface ReputationData {
  ip: string;
  risk: AggregatedRisk;
  score: number | null;
  sources: ReputationSourceEntry[];
  checkedAt: string;
}
