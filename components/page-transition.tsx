"use client";

import { usePathname } from "next/navigation";
import { Component, createRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface RouteProps {
  children: ReactNode;
  className?: string;
}

type Snapshot = HTMLElement | null;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// Backstop for user styles that pause animations after they have started.
const CLEANUP_DEADLINE_MS = 320;

/** The before-mutation lifecycle sees the actual outgoing header, even on a
 * history traversal. No click interception or speculative capture is needed. */
class RouteBoundary extends Component<RouteProps & { pathname: string }> {
  private current = createRef<HTMLDivElement>();
  private layer = createRef<HTMLDivElement>();
  private deadline?: number;

  getSnapshotBeforeUpdate(previous: Readonly<typeof this.props>): Snapshot {
    if (previous.pathname === this.props.pathname || reducedMotion()) return null;

    // Only ToolPageShell's presentation-only title band opts in. Its size is
    // independent of result count and it contains no controls or live regions.
    const header = this.current.current?.querySelector<HTMLElement>(":scope > .app-page-header");
    if (!header) return null;
    const rect = header.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight || !rect.width) return null;

    const copy = header.cloneNode(true) as HTMLElement;
    copy.removeAttribute("id");
    copy.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    Object.assign(copy.style, {
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    });
    return copy;
  }

  private clear = () => {
    window.clearTimeout(this.deadline);
    this.layer.current?.replaceChildren();
    this.current.current?.removeAttribute("data-arriving");
  };

  componentDidUpdate(previous: Readonly<typeof this.props>, _: unknown, copy: Snapshot) {
    if (previous.pathname === this.props.pathname) return;
    this.clear();
    if (reducedMotion()) return;
    this.deadline = window.setTimeout(this.clear, CLEANUP_DEADLINE_MS);
    this.current.current?.setAttribute("data-arriving", "");
    const layer = this.layer.current;
    if (!copy || !layer) return;
    layer.append(copy);
    // A user stylesheet may suppress or pause the exit. Never leave a frozen
    // band covering the live heading, including when no end event is sent.
    const exit = copy.getAnimations?.().find((animation) => animation.playState === "running");
    if (!exit) {
      copy.remove();
      return;
    }
    // A superseded promise only owns its own copy.
    const remove = () => copy.remove();
    exit.finished.then(remove, remove);
  }

  componentWillUnmount() {
    this.clear();
  }

  render() {
    return (
      <div className={cn("relative isolate min-w-0 overflow-x-clip", this.props.className)}>
        <div ref={this.layer} className="tool-route-exit" aria-hidden inert />
        <div key={this.props.pathname} ref={this.current} className="tool-page-current flex min-w-0 flex-1 flex-col">
          {this.props.children}
        </div>
      </div>
    );
  }
}

export function PageTransition(props: RouteProps) {
  return <RouteBoundary {...props} pathname={usePathname()} />;
}
