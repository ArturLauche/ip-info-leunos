// A replace may be superseded without ever echoing its query back to the
// component. Keep only a short, bounded history of possible echoes.
const PENDING_ECHO_MS = 5_000;
const MAX_PENDING_ECHOES = 32;

export function createToolQueryTracker(initialQuery: string) {
  let lastQuery = initialQuery.trim();
  let pending: { query: string; at: number }[] = [];

  function prune(now: number) {
    pending = pending.filter((entry) => now - entry.at <= PENDING_ECHO_MS);
  }

  return {
    submitted(value: string, now = Date.now()) {
      const query = value.trim();
      prune(now);
      if (query === lastQuery) {
        // No URL change will be observed; this also supersedes earlier work.
        pending = [];
        return;
      }
      pending = pending.filter((entry) => entry.query !== query);
      pending.push({ query, at: now });
      pending = pending.slice(-MAX_PENDING_ECHOES);
    },
    observed(value: string, now = Date.now()): "unchanged" | "local" | "external" {
      const query = value.trim();
      if (query === lastQuery) return "unchanged";
      lastQuery = query;
      prune(now);
      const index = pending.findIndex((entry) => entry.query === query);
      if (index !== -1) {
        // If a later submission arrived, earlier ones were superseded.
        pending.splice(0, index + 1);
        return "local";
      }
      pending = [];
      return "external";
    },
    clearPending() {
      pending = [];
    },
  };
}
