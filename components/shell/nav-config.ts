import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Globe,
  Network,
  Radar,
  Search,
  ShieldAlert,
  ShieldCheck,
  Waypoints,
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { getTranslation } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";

export type ToolKey =
  | "home"
  | "check"
  | "asn"
  | "ping"
  | "dns"
  | "whois"
  | "cdn"
  | "reputation";

export interface NavItem {
  key: ToolKey;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  id: "overview" | "diagnostics";
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    id: "overview",
    items: [
      { key: "home", href: "/", icon: Globe },
      { key: "check", href: "/check", icon: Search },
    ],
  },
  {
    id: "diagnostics",
    items: [
      { key: "asn", href: "/asn", icon: Waypoints },
      { key: "ping", href: "/ping", icon: Radar },
      { key: "dns", href: "/dns", icon: Network },
      { key: "whois", href: "/whois", icon: Activity },
      { key: "cdn", href: "/cdn", icon: ShieldCheck },
      { key: "reputation", href: "/reputation", icon: ShieldAlert },
    ],
  },
];

/** Resolves the short navigation label for a tool key. */
export function getNavLabel(key: ToolKey, locale: Locale): string {
  const t = getTranslation(locale);
  const toolT = getToolTranslation(locale);

  const labels: Record<ToolKey, string> = {
    home: toolT.navMyIp,
    check: t.checkTitle,
    asn: toolT.asnTabLabel,
    ping: toolT.pingTabLabel,
    dns: toolT.dnsTabLabel,
    whois: toolT.whoisTabLabel,
    cdn: toolT.cdnTabLabel,
    reputation: toolT.reputationTabLabel,
  };

  return labels[key];
}

/** A one-line description shown under each nav item / in the command surface. */
export function getNavDescription(key: ToolKey, locale: Locale): string {
  const toolT = getToolTranslation(locale);

  const descriptions: Record<ToolKey, string> = {
    home: getTranslation(locale).homeSubtitle,
    check: getTranslation(locale).checkSubtitle,
    asn: toolT.asnSubtitle,
    ping: toolT.pingSubtitle,
    dns: toolT.dnsSubtitle,
    whois: toolT.whoisSubtitle,
    cdn: toolT.cdnSubtitle,
    reputation: toolT.reputationSubtitle,
  };

  return descriptions[key];
}

export function getGroupTitle(id: NavGroup["id"], locale: Locale): string {
  const toolT = getToolTranslation(locale);
  return id === "overview" ? toolT.navOverview : toolT.navDiagnostics;
}

export interface ResolvedNavItem extends NavItem {
  label: string;
  description: string;
  group: NavGroup["id"];
}

/** Flattens the nav config into fully-resolved items for search/command surfaces. */
export function getNavItems(locale: Locale): ResolvedNavItem[] {
  return navGroups.flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      label: getNavLabel(item.key, locale),
      description: getNavDescription(item.key, locale),
      group: group.id,
    })),
  );
}
