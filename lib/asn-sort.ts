import type { PeeringDbFacility, PeeringDbIxLan } from "@/lib/asn";
import type { Locale } from "@/lib/i18n";

export type SortDirection = "asc" | "desc";
export type IxSortKey = "name" | "speed" | "ipv4" | "ipv6" | "rsPeer";
export type FacilitySortKey = "name" | "city" | "country" | "localAsn";

export interface SortState<K extends string> {
  key: K | null;
  direction: SortDirection | null;
}

export function defaultIxSortDirection(key: IxSortKey): SortDirection {
  // Speed reads best largest-first; names and addresses read best A-Z.
  return key === "speed" ? "desc" : "asc";
}

export function defaultFacilitySortDirection(): SortDirection {
  return "asc";
}

// Header click cycles asc -> desc -> unsorted so the provider order is recoverable.
export function nextHeaderSort<K extends string>(
  prev: SortState<K>,
  key: K,
  defaultDirection: SortDirection,
): SortState<K> {
  if (prev.key !== key || !prev.direction) return { key, direction: defaultDirection };
  if (prev.direction === "asc") return { key, direction: "desc" };
  return { key: null, direction: null };
}

function compareText(a: string, b: string, locale: Locale): number {
  // numeric:true keeps embedded numbers (IPs, facility names) in natural order.
  return a.localeCompare(b, locale, { numeric: true, sensitivity: "base" });
}

function isIxMissing(entry: PeeringDbIxLan, key: IxSortKey): boolean {
  switch (key) {
    case "name":
      return !entry.name;
    case "speed":
      return entry.speed == null;
    case "ipv4":
      return !entry.ipaddr4;
    case "ipv6":
      return !entry.ipaddr6;
    case "rsPeer":
      return entry.isRsPeer == null;
  }
}

function naturalIxCompare(a: PeeringDbIxLan, b: PeeringDbIxLan, key: IxSortKey, locale: Locale): number {
  switch (key) {
    case "name":
      return compareText(a.name, b.name, locale);
    case "speed":
      return (a.speed as number) - (b.speed as number);
    case "ipv4":
      return compareText(a.ipaddr4, b.ipaddr4, locale);
    case "ipv6":
      return compareText(a.ipaddr6, b.ipaddr6, locale);
    case "rsPeer":
      return Number(a.isRsPeer) - Number(b.isRsPeer);
  }
}

function isFacilityMissing(entry: PeeringDbFacility, key: FacilitySortKey): boolean {
  switch (key) {
    case "name":
      return !entry.name;
    case "city":
      return !entry.city;
    case "country":
      return !entry.country;
    case "localAsn":
      return entry.localAsn == null;
  }
}

function naturalFacilityCompare(
  a: PeeringDbFacility,
  b: PeeringDbFacility,
  key: FacilitySortKey,
  locale: Locale,
): number {
  switch (key) {
    case "name":
      return compareText(a.name, b.name, locale);
    case "city":
      return compareText(a.city, b.city, locale);
    case "country":
      return compareText(a.country, b.country, locale);
    case "localAsn":
      return (a.localAsn as number) - (b.localAsn as number);
  }
}

// Missing values sort last in both directions; ties keep provider order.
function stableSort<T>(
  list: T[],
  isMissing: (item: T) => boolean,
  compare: (a: T, b: T) => number,
  direction: SortDirection,
): T[] {
  const dir = direction === "asc" ? 1 : -1;
  return list
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const missingA = isMissing(a.item);
      const missingB = isMissing(b.item);
      if (missingA && missingB) return a.index - b.index;
      if (missingA) return 1;
      if (missingB) return -1;
      const primary = compare(a.item, b.item);
      if (primary > 0) return dir;
      if (primary < 0) return -dir;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}

export function sortIxlan(
  list: PeeringDbIxLan[],
  key: IxSortKey | null,
  direction: SortDirection | null,
  locale: Locale,
): PeeringDbIxLan[] {
  if (!key || !direction) return [...list];
  return stableSort(
    list,
    (item) => isIxMissing(item, key),
    (a, b) => naturalIxCompare(a, b, key, locale),
    direction,
  );
}

export function sortFacilities(
  list: PeeringDbFacility[],
  key: FacilitySortKey | null,
  direction: SortDirection | null,
  locale: Locale,
): PeeringDbFacility[] {
  if (!key || !direction) return [...list];
  return stableSort(
    list,
    (item) => isFacilityMissing(item, key),
    (a, b) => naturalFacilityCompare(a, b, key, locale),
    direction,
  );
}
