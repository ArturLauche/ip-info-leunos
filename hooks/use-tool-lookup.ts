"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiClientError, unwrapApiResponse } from "@/lib/api/client";

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

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  // Abort any in-flight lookup when the checker unmounts so superseded
  // navigations don't waste server egress after the UI is gone.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const run = useCallback(
    async (query: string, updateUrl = true) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      const { buildApiUrl, buildHref, mapError, onStart } = optionsRef.current;
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

      if (updateUrl && buildHref) {
        const href = buildHref(trimmed);
        if (href) router.replace(href, { scroll: false });
      }

      try {
        const response = await fetch(buildApiUrl(trimmed), {
          signal: controller.signal,
        });
        const contentType = response.headers.get("content-type") || "";
        if (!response.ok || !contentType.includes("application/json")) {
          // Non-JSON or error status: still try to surface a structured API
          // error (with its machine-readable code) before falling back.
          try {
            const payload = await response.json();
            const unwrapped = unwrapApiResponse<T>(payload);
            if (seq === requestSeq.current) setResult(unwrapped);
            return;
          } catch (parseError) {
            // Preserve structured API errors so mapError can match on code.
            if (parseError instanceof ApiClientError) throw parseError;
            if (parseError instanceof DOMException && parseError.name === "AbortError") {
              throw parseError;
            }
            throw new ApiClientError(
              "unknown",
              `Request failed with status ${response.status}.`,
            );
          }
        }
        const data = unwrapApiResponse<T>(await response.json());
        if (seq === requestSeq.current) setResult(data);
      } catch (lookupError) {
        // An abort is always superseded by a newer run (or unmount): never
        // surface it as an error state.
        if (
          lookupError instanceof DOMException &&
          lookupError.name === "AbortError"
        ) {
          return;
        }
        if (seq === requestSeq.current) setError(mapError(lookupError));
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    },
    [router],
  );

  /** Shows a message (e.g. client-side validation) without running a lookup. */
  const showError = useCallback((message: string) => {
    abortRef.current?.abort();
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

  return { loading, error, result, run, showError };
}
