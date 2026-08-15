"use client";

import { ViewTransition, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Crossfades tool pages on navigation. Chrome (sidebar / mobile top bar) stays
 * put via named view-transition groups; the page itself eases out and in.
 * Browsers without View Transitions keep the CSS enter animation.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <ViewTransition
      key={pathname}
      enter="page-enter"
      exit="page-exit"
      default="none"
    >
      <div className={cn("tool-page-transition", className)}>{children}</div>
    </ViewTransition>
  );
}
