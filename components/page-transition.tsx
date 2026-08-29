"use client";

import { useLayoutEffect, ViewTransition, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  getPageTransitionKey,
  markViewTransitionSupport,
} from "@/lib/page-transition";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Persistent wrapper around the changing route. Chrome (sidebar / mobile top
 * bar) lives outside this tree so it can keep sliding the selection frame.
 *
 * The inner ViewTransition remounts when the *tool* (or standalone route)
 * changes, not on every pathname: that lets the API crossfade the outgoing
 * page into the incoming one, while `/asn` → `/asn/AS8881` and lookup query
 * updates stay put. Browsers without View Transitions keep the staged CSS
 * enter. The host stays mounted so flex layout does not collapse around
 * React's ViewTransition node.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const pageKey = getPageTransitionKey(pathname);

  useLayoutEffect(() => {
    markViewTransitionSupport();
  }, []);

  return (
    <div
      className={cn(
        "tool-page-transition-host flex min-h-0 flex-1 flex-col overflow-x-clip",
        className,
      )}
    >
      <ViewTransition
        key={pageKey}
        enter="page-enter"
        exit="page-exit"
        default="none"
      >
        <div className="tool-page-transition flex min-h-0 flex-1 flex-col">
          {children}
        </div>
      </ViewTransition>
    </div>
  );
}
