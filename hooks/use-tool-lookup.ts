"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { readApiResponse } from "@/lib/api/client";

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
  const abortRef = useRef<AbortController | null>(null);
  const selfSubmitted = useRef<string | null>(null);

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
          selfSubmitted.current = trimmed;
          router.replace(href, { scroll: false });
        }
        const response = await fetch(buildApiUrl(trimmed), {
          signal: controller.signal,
        });
        const data = await readApiResponse<T>(response);
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
    [router],
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

  const initialQuery = options.initialQuery?.trim() ?? "";
  useEffect(() => {
    if (selfSubmitted.current === initialQuery) {
      selfSubmitted.current = null;
      return;
    }
    selfSubmitted.current = null;
    if (initialQuery) {
      run(initialQuery, false);
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
  }, [initialQuery, run]);

  return { loading, error, result, run, showError, cancel };
}
