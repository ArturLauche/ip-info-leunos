"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Distinguishes external navigation from the URL echo of a local submission. */
export function useToolQuery(initialQuery = "") {
  const query = initialQuery.trim();
  const lastQuery = useRef(query);
  // Every pending local submission: a slow URL echo of an earlier submit must
  // still be recognized after a newer one was made.
  const selfSubmitted = useRef(new Set<string>());
  const [querySync, setQuerySync] = useState({ query, revision: 0 });

  useEffect(() => {
    if (lastQuery.current === query) return;
    lastQuery.current = query;
    if (selfSubmitted.current.delete(query)) return;
    selfSubmitted.current.clear();
    // A revision also resets a local draft when navigation returns to the same
    // value we last synchronized (e.g. clearing a self-submitted deep link).
    setQuerySync((previous) => ({ query, revision: previous.revision + 1 }));
  }, [query]);

  const markSubmitted = useCallback((value: string) => {
    const submitted = value.trim();
    // Submitting the value the URL already shows produces no echo; recording
    // it would make a later history navigation back to it look self-made.
    if (submitted === lastQuery.current) return;
    selfSubmitted.current.add(submitted);
  }, []);

  return { querySync, markSubmitted };
}
