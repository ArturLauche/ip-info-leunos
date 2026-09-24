"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { readApiResponse, type ApiDecoder } from "@/lib/api/client";
import { useToolQuery } from "@/hooks/use-tool-query";

interface ToolLookupOptions<T> {
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
  /** Validates the successful payload before it reaches tool components. */
  decode?: ApiDecoder<T>;
}

/**
 * Shared state machine for the single-input checker tools: loading/error/
 * result state, URL deep-link sync, auto-run for initial queries, and a
 * sequence guard so a slow earlier response can never overwrite the result
 * of a later lookup.
 */
export function useToolLookup<T>(options: ToolLookupOptions<T>) {
  const router = useRouter();
  const [loading, setLoading] = useState(() => Boolean(options.initialQuery?.trim()));
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const requestSeq = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const { querySync, markSubmitted } = useToolQuery(options.initialQuery);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  // Abort any in-flight lookup when the checker unmounts so superseded
  // navigations don't waste server egress after the UI is gone.
  useEffect(() => {
    return () => {
      requestSeq.current += 1;
      abortRef.current?.abort();
    };
  }, []);

  const run = useCallback(
    async (query: string, updateUrl = true) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      const { buildApiUrl, buildHref, mapError, onStart } = optionsRef.current;
      const href = updateUrl ? buildHref?.(trimmed) : null;
      if (href && new URL(href, window.location.href).pathname !== window.location.pathname) {
        // A pathname change mounts a new checker (notably /asn → /asn/AS…).
        // Let that destination own the request instead of starting one here
        // that will immediately be aborted and repeated after navigation.
        router.replace(href, { scroll: false });
        return;
      }
      // Supersede the previous lookup: abort its fetch (saves egress) and
      // bump the sequence guard so a late response can never overwrite this one.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const seq = ++requestSeq.current;
      setLoading(true);
      setError(null);
      setResult(null);
      onStart?.();

      try {
        if (href) {
          markSubmitted(trimmed);
          router.replace(href, { scroll: false });
        }
        const response = await fetch(buildApiUrl(trimmed), {
          signal: controller.signal,
        });
        const data = await readApiResponse<T>(response, optionsRef.current.decode);
        if (!controller.signal.aborted && seq === requestSeq.current) setResult(data);
      } catch (lookupError) {
        // An abort is always superseded by a newer run (or unmount): never
        // surface it as an error state.
        if (controller.signal.aborted) return;
        if (seq === requestSeq.current) setError(mapError(lookupError));
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    },
    [router, markSubmitted],
  );

  const cancel = useCallback(() => {
    requestSeq.current += 1;
    abortRef.current?.abort();
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  /** Shows a message (e.g. client-side validation) without running a lookup. */
  const showError = useCallback((message: string) => {
    abortRef.current?.abort();
    requestSeq.current += 1;
    setLoading(false);
    setResult(null);
    setError(message);
  }, []);

  useEffect(() => {
    if (querySync.query) {
      run(querySync.query, false);
    } else {
      // The deep-linked query was removed (e.g. the command palette navigating
      // to the bare tool route): abort any in-flight lookup, invalidate its
      // sequence guard, and clear the previously shown result/error so nothing
      // stale lingers.
      abortRef.current?.abort();
      requestSeq.current += 1;
      setLoading(false);
      setError(null);
      setResult(null);
    }
  }, [querySync, run]);

  return { loading, error, result, run, showError, cancel, querySync };
}
