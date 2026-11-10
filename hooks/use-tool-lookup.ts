"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { readApiResponse } from "@/lib/api/client";
import { isRetryableLookupError } from "@/lib/api/error-message";
import { fetchWithRetry } from "@/lib/network/retry";
import { useToolQuery } from "@/hooks/use-tool-query";
import { preparePageTransition } from "@/components/page-transition";

interface ToolLookupOptions {
  /** Builds the API URL for a submitted query. */
  buildApiUrl: (query: string) => string;
  /** Builds the browser URL reflected via router.replace, or null to skip. */
  buildHref?: (query: string) => string | null;
  /**
   * Maps a thrown error to the user-facing message. Re-invoked on every
   * render, so displayed errors follow the active locale after a language
   * switch instead of freezing the translation from when they were thrown.
   */
  mapError: (error: unknown) => string;
  /** Runs the lookup automatically for this query on mount and when it changes. */
  initialQuery?: string;
  /**
   * Invalidates the current result when it changes. Only language-sensitive
   * tools pass a value (their locale): the API returns localized result fields
   * (e.g. ip-api country/region/city names), so a language switch has to re-run
   * the lookup instead of leaving rendered values in the previous language.
   * Locale-neutral tools omit it and never refetch on a language switch.
   */
  refreshKey?: string;
  /** Resets tool-specific state when a new lookup starts. */
  onStart?: () => void;
}

/**
 * Shared state machine for the single-input checker tools: loading/error/
 * result state, URL deep-link sync, auto-run for initial queries, and a
 * sequence guard so a slow earlier response can never overwrite the result
 * of a later lookup.
 *
 * Errors are stored raw (never as pre-rendered strings) and mapped through
 * `mapError` during render, so the message always reflects the current
 * `t`/locale of the owning checker.
 */
export function useToolLookup<T>(options: ToolLookupOptions) {
  const router = useRouter();
  const { refreshKey } = options;
  // A deep link fetches as soon as it mounts, so the server HTML and first
  // client render already show the pending state instead of a flash of the
  // empty state.
  const [loading, setLoading] = useState(() => Boolean(options.initialQuery?.trim()));
  // `query` is set for lookup failures (retryable), not for client-side errors.
  const [thrownError, setThrownError] = useState<{ value: unknown; query?: string } | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const requestSeq = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  // The query whose result/error/loading state is currently shown. It differs
  // from querySync.query after a local submission (whose URL echo is ignored),
  // so refreshes and retries must use this, not the deep link.
  const activeQuery = useRef<string | null>(null);
  const { querySync, markSubmitted } = useToolQuery(options.initialQuery);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  // Derived, not state: re-mapping on every render keeps the message in the
  // language currently shown on screen (a stored string would go stale when
  // router.refresh() swaps the locale while an error is visible).
  const error = thrownError ? options.mapError(thrownError.value) : null;

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

      const { buildApiUrl, buildHref, onStart } = optionsRef.current;
      const href = updateUrl ? buildHref?.(trimmed) : null;
      if (href && new URL(href, window.location.href).pathname !== window.location.pathname) {
        // A pathname change mounts a new checker (notably /asn → /asn/AS…).
        // Let that destination own the request instead of starting one here
        // that will immediately be aborted and repeated after navigation.
        // Snapshot the page as shown now, like the command palette does: the
        // transition's own snapshot dates from mount and would fade out an
        // empty form or an old result instead.
        preparePageTransition(href);
        router.replace(href, { scroll: false });
        return;
      }
      // Supersede the previous lookup: abort its fetch (saves egress) and
      // bump the sequence guard so a late response can never overwrite this one.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      activeQuery.current = trimmed;
      const seq = ++requestSeq.current;
      setLoading(true);
      setThrownError(null);
      setResult(null);
      onStart?.();

      try {
        if (href) {
          markSubmitted(trimmed);
          router.replace(href, { scroll: false });
        }
        const response = await fetchWithRetry(
          buildApiUrl(trimmed),
          { signal: controller.signal },
          {
            signal: controller.signal,
            // Loading stays visible during the backoff, so keep the budget
            // short: 1s and 2s between at most three attempts.
            maxAttempts: 3,
            maxRetryAfterMs: 5_000,
          },
        );
        const data = await readApiResponse<T>(response);
        if (!controller.signal.aborted && seq === requestSeq.current) setResult(data);
      } catch (lookupError) {
        // An abort is always superseded by a newer run (or unmount): never
        // surface it as an error state.
        if (controller.signal.aborted) return;
        if (seq === requestSeq.current) setThrownError({ value: lookupError, query: trimmed });
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    },
    [router, markSubmitted],
  );

  const cancel = useCallback(() => {
    activeQuery.current = null;
    requestSeq.current += 1;
    abortRef.current?.abort();
    setLoading(false);
    setThrownError(null);
    setResult(null);
  }, []);

  /**
   * Surfaces a raw error (e.g. client-side validation) without running a
   * lookup. The value is mapped through the current `mapError` on render, so
   * it too follows locale switches.
   */
  const showError = useCallback((value: unknown) => {
    activeQuery.current = null;
    abortRef.current?.abort();
    requestSeq.current += 1;
    setLoading(false);
    setResult(null);
    setThrownError({ value });
  }, []);

  useEffect(() => {
    if (querySync.query) {
      run(querySync.query, false);
    } else {
      // The deep-linked query was removed (e.g. the command palette navigating
      // to the bare tool route): abort any in-flight lookup, invalidate its
      // sequence guard, and clear the previously shown result/error so nothing
      // stale lingers.
      activeQuery.current = null;
      abortRef.current?.abort();
      requestSeq.current += 1;
      setLoading(false);
      setThrownError(null);
      setResult(null);
    }
  }, [querySync, run]);

  // refreshKey (a locale for language-sensitive tools) re-runs the query that
  // is on screen; router.refresh() alone keeps the client result mounted. It
  // must not fall back to the deep link: after a local submission that would
  // swap in the original URL's result, and without one it would clear the view.
  const lastRefreshKey = useRef(refreshKey);
  useEffect(() => {
    if (lastRefreshKey.current === refreshKey) return;
    lastRefreshKey.current = refreshKey;
    if (activeQuery.current) run(activeQuery.current, false);
  }, [refreshKey, run]);

  const failedQuery = thrownError?.query;
  /**
   * Repeats a failed lookup in place, or null when repeating cannot help
   * (validation errors, blocked targets) or nothing failed.
   */
  const retryQuery =
    failedQuery && isRetryableLookupError(thrownError?.value) ? failedQuery : null;
  const retry = useCallback(() => {
    if (retryQuery) run(retryQuery, false);
  }, [retryQuery, run]);

  return {
    loading,
    error,
    result,
    run,
    retry: retryQuery ? retry : undefined,
    showError,
    cancel,
    querySync,
  };
}
