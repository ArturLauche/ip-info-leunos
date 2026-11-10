"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createToolQueryTracker } from "@/lib/tool-query-tracker";

/** Distinguishes external navigation from the URL echo of a local submission. */
export function useToolQuery(initialQuery = "") {
  const query = initialQuery.trim();
  const tracker = useRef<ReturnType<typeof createToolQueryTracker> | null>(null);
  if (tracker.current === null) tracker.current = createToolQueryTracker(query);
  const [querySync, setQuerySync] = useState({ query, revision: 0 });

  useEffect(() => {
    if (tracker.current!.observed(query) !== "external") return;
    // A revision also resets a local draft when navigation returns to the same
    // value we last synchronized (e.g. clearing a self-submitted deep link).
    setQuerySync((previous) => ({ query, revision: previous.revision + 1 }));
  }, [query]);

  useEffect(() => {
    // Back/forward is external even when its query matches a pending replace.
    const onPopState = () => tracker.current?.clearPending();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const markSubmitted = useCallback((value: string) => {
    tracker.current!.submitted(value);
  }, []);

  return { querySync, markSubmitted };
}
