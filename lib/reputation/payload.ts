export const MAX_REPUTATION_RESPONSE_BYTES = 3_000_000;

export function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
