import { describe, expect, it } from "vitest";
import type { PeeringDbFacility, PeeringDbIxLan } from "@/lib/asn";
import {
  defaultFacilitySortDirection,
  defaultIxSortDirection,
  nextHeaderSort,
  sortFacilities,
  sortIxlan,
} from "@/lib/asn-sort";

function ixlanEntry(entry: Partial<PeeringDbIxLan> & { name: string }): PeeringDbIxLan {
  return {
    id: null,
    ixId: null,
    ixlanId: null,
    speed: null,
    ipaddr4: "",
    ipaddr6: "",
    isRsPeer: null,
    operational: null,
    status: "",
    ...entry,
  };
}

function facilityEntry(entry: Partial<PeeringDbFacility> & { name: string }): PeeringDbFacility {
  return {
    id: null,
    facilityId: null,
    city: "",
    country: "",
    localAsn: null,
    status: "",
    ...entry,
  };
}

describe("PeeringDB table sorting", () => {
  it("header clicks cycle from the default direction back to unsorted", () => {
    expect(nextHeaderSort({ key: null, direction: null }, "name", "asc")).toEqual({
      key: "name",
      direction: "asc",
    });
    expect(nextHeaderSort({ key: "name", direction: "asc" }, "name", "asc")).toEqual({
      key: "name",
      direction: "desc",
    });
    expect(nextHeaderSort({ key: "name", direction: "desc" }, "name", "asc")).toEqual({
      key: null,
      direction: null,
    });
    expect(nextHeaderSort({ key: "name", direction: "desc" }, "speed", "desc")).toEqual({
      key: "speed",
      direction: "desc",
    });
  });

  it("defaults to speed first for IX and A-Z for facilities", () => {
    expect(defaultIxSortDirection("speed")).toBe("desc");
    expect(defaultIxSortDirection("name")).toBe("asc");
    expect(defaultFacilitySortDirection()).toBe("asc");
  });

  it("sorts IX by speed with ties keeping provider order", () => {
    const rows = [
      ixlanEntry({ name: "alpha", speed: 1000 }),
      ixlanEntry({ name: "beta", speed: null }),
      ixlanEntry({ name: "gamma", speed: 100000 }),
      ixlanEntry({ name: "delta", speed: 1000 }),
    ];

    const sorted = sortIxlan(rows, "speed", "desc", "en").map((row) => row.name);
    expect(sorted).toEqual(["gamma", "alpha", "delta", "beta"]);

    const names = sortIxlan(rows, "name", "asc", "en").map((row) => row.name);
    expect(names).toEqual(["alpha", "beta", "delta", "gamma"]);
  });

  it("keeps RS peers together and the input order when unsorted", () => {
    const rows = [
      ixlanEntry({ name: "alpha", isRsPeer: true }),
      ixlanEntry({ name: "beta", isRsPeer: null }),
      ixlanEntry({ name: "gamma", isRsPeer: false }),
    ];

    expect(sortIxlan(rows, "rsPeer", "asc", "en").map((row) => row.name)).toEqual([
      "gamma",
      "alpha",
      "beta",
    ]);
    expect(sortIxlan(rows, null, null, "en").map((row) => row.name)).toEqual([
      "alpha",
      "beta",
      "gamma",
    ]);
  });

  it("sorts facilities with missing values last in both directions", () => {
    const rows = [
      facilityEntry({ name: "beta", city: "", country: "US", localAsn: 2 }),
      facilityEntry({ name: "alpha", city: "Berlin", country: "DE", localAsn: null }),
      facilityEntry({ name: "gamma", city: "Paris", country: "FR", localAsn: 1 }),
    ];

    expect(sortFacilities(rows, "city", "asc", "en").map((row) => row.name)).toEqual([
      "alpha",
      "gamma",
      "beta",
    ]);
    expect(sortFacilities(rows, "localAsn", "desc", "en").map((row) => row.name)).toEqual([
      "beta",
      "gamma",
      "alpha",
    ]);
    expect(sortFacilities(rows, null, null, "en")).not.toBe(rows);
    expect(sortFacilities(rows, null, null, "en")).toEqual(rows);
  });
});
