"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { unwrapApiResponse } from "@/lib/api/client";

interface ToolLookupOptions {
  /** Builds the API URL for a submitted query. */
  buildApiUrl: (query: string) => string;
  /** Builds the browser URL reflected via router.replace, or null to skip. */
  buildHref?: (query: string) => string | null;
  /** Maps a thrown error to the user-facing message. */
  mapError: (error: unknown) => string;
  /** Runs the lookup automatically for this query on mount and when it changes. */
  initialQuery?: string;
  /** Resets tool-specific state when a new lookup starts. */
  onStart?: () => void;
}

/**
 * Shared state machine for the single-input checker tools: loading/error/
 * result state, URL deep-link sync, auto-run for initial queries, and a
 * sequence guard so a slow earlier response can never overwrite the result
 * of a later lookup.
 */
export function useToolLookup<T>(options: ToolLookupOptions) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const requestSeq = useRef(0);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const run = useCallback(
    async (query: string, updateUrl = true) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      const { buildApiUrl, buildHref, mapError, onStart } = optionsRef.current;
      const seq = ++requestSeq.current;
      setLoading(true);
      setError(null);
      setResult(null);
      onStart?.();

      if (updateUrl && buildHref) {
        const href = buildHref(trimmed);
        if (href) router.replace(href, { scroll: false });
      }

      try {
        const response = await fetch(buildApiUrl(trimmed));
        const data = unwrapApiResponse<T>(await response.json());
        if (seq === requestSeq.current) setResult(data);
      } catch (lookupError) {
        if (seq === requestSeq.current) setError(mapError(lookupError));
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    },
    [router],
  );

  /** Shows a message (e.g. client-side validation) without running a lookup. */
  const showError = useCallback((message: string) => {
    requestSeq.current += 1;
    setLoading(false);
    setResult(null);
    setError(message);
  }, []);

  const initialQuery = options.initialQuery ?? "";
  useEffect(() => {
    if (initialQuery.trim()) {
      run(initialQuery, false);
    } else {
      // The deep-linked query was removed (e.g. the command palette navigating
      // to the bare tool route): invalidate any in-flight lookup and clear the
      // previously shown result/error so nothing stale lingers.
      requestSeq.current += 1;
      setLoading(false);
      setError(null);
      setResult(null);
    }
  }, [initialQuery, run]);

  return { loading, error, result, run, showError };
}
