"use client";

import Link, { useLinkStatus } from "next/link";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";
import {
  getGroupTitle,
  getNavLabel,
  navGroups,
  type NavItem,
  type ToolKey,
} from "./nav-config";
import { useNavHighlight } from "./use-nav-highlight";

interface NavLinksProps {
  active?: ToolKey;
  onNavigate?: () => void;
}

/** The grouped navigation list shared by the desktop sidebar and mobile sheet. */
export function NavLinks({ active, onNavigate }: NavLinksProps) {
  const i18n = useI18n();
  const toolsLabel = i18n.tool.navToolsLabel;

  return (
    <nav className="flex flex-col gap-6" aria-label={toolsLabel}>
      {navGroups.map((group) => (
        <div key={group.id} className="flex flex-col gap-1">
          <p className="px-3 pb-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {getGroupTitle(group.id, i18n)}
          </p>
          <NavGroupList
            items={group.items}
            active={active}
            onNavigate={onNavigate}
          />
        </div>
      ))}
    </nav>
  );
}

interface NavGroupListProps {
  items: NavItem[];
  active?: ToolKey;
  onNavigate?: () => void;
}

function NavGroupList({
  items,
  active,
  onNavigate,
}: NavGroupListProps) {
  const i18n = useI18n();
  const { listRef, setItemRef, view, canAnimate } = useNavHighlight(active);

  return (
    <div ref={listRef} className="relative isolate flex flex-col gap-1">
      <span
        className="tool-nav-highlight absolute inset-x-0 top-0 z-0"
        style={{
          transform: `translate3d(0, ${view.box.y}px, 0)`,
          height: view.box.height,
          opacity: view.visible ? 1 : 0,
        }}
        data-animate={canAnimate ? "true" : undefined}
        data-slide={view.slide ? "true" : undefined}
        aria-hidden
      />
      {items.map((item) => {
        const isActive = active === item.key;

        return (
          <Link
            key={item.key}
            href={item.href}
            ref={(node) => setItemRef(item.key, node)}
            onNavigate={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative z-10 flex min-h-11 items-center gap-2.5 rounded-lg py-1 pe-3 ps-3.5 text-sm font-medium outline-none active:bg-sidebar-accent transition-colors duration-(--motion-base) ease-[var(--ease-smooth)] focus-visible:ring-2 focus-visible:ring-ring/60",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/45 hover:text-foreground",
              isActive && !view.visible && "tool-nav-item-fallback",
            )}
          >
            <NavIcon icon={item.icon} active={isActive} />
            <span className="min-w-0 truncate">
              {getNavLabel(item.key, i18n)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/** Link owns pending state, including cancellation and superseding clicks. */
function NavIcon({ icon: Icon, active }: { icon: NavItem["icon"]; active: boolean }) {
  const { pending } = useLinkStatus();
  return (
    <span
      className={cn(
        "tool-nav-icon flex size-6 shrink-0 items-center justify-center rounded-md",
        active || pending
          ? "bg-foreground text-background shadow-sm"
          : "text-muted-foreground/80 group-hover:bg-foreground/5 group-hover:text-foreground",
      )}
    >
      <Icon className="size-3.5" aria-hidden />
    </span>
  );
}
