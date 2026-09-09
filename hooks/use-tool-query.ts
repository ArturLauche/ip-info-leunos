"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Distinguishes external navigation from the URL echo of a local submission. */
export function useToolQuery(initialQuery = "") {
  const query = initialQuery.trim();
  const lastQuery = useRef(query);
  const selfSubmitted = useRef<string | null>(null);
  const [querySync, setQuerySync] = useState({ query, revision: 0 });

  useEffect(() => {
    if (lastQuery.current === query) return;
    lastQuery.current = query;
    if (selfSubmitted.current === query) {
      selfSubmitted.current = null;
      return;
    }
    selfSubmitted.current = null;
    // A revision also resets a local draft when navigation returns to the same
    // value we last synchronized (e.g. clearing a self-submitted deep link).
    setQuerySync((previous) => ({ query, revision: previous.revision + 1 }));
  }, [query]);

  const markSubmitted = useCallback((value: string) => {
    selfSubmitted.current = value.trim();
  }, []);

  return { querySync, markSubmitted };
}
