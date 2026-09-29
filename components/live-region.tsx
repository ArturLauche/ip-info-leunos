import type { ReactNode } from "react";

/**
 * Persistent polite announcer. It must stay mounted while its text changes:
 * screen readers skip live regions that are inserted together with their
 * content, so results that replace a loading skeleton would otherwise be silent.
 */
export function LiveRegion({ children }: { children?: ReactNode }) {
  return (
    <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {children}
    </p>
  );
}
