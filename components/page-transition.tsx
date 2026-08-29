"use client";

import { ViewTransition, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getPageTransitionKey } from "@/lib/page-transition";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Persistent wrapper around the changing route. Chrome (sidebar / mobile top
 * bar) lives outside this tree so it can keep sliding the selection frame.
 *
 * The wrapper remounts when the *tool* (or standalone route) changes, not on
 * every pathname: that lets View Transitions crossfade the outgoing page into
 * the incoming one, while `/asn` → `/asn/AS8881` and lookup query updates
 * stay put. Browsers without View Transitions keep the staged CSS enter.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const pageKey = getPageTransitionKey(pathname);

  return (
    <ViewTransition
      key={pageKey}
      enter="page-enter"
      exit="page-exit"
      default="none"
    >
      <div
        className={cn(
          "tool-page-transition flex min-h-0 flex-1 flex-col",
          className,
        )}
      >
        {children}
      </div>
    </ViewTransition>
  );
}
