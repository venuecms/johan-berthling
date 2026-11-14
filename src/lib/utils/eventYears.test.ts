import { describe, expect, it } from "vitest";

import { groupByYear } from "./eventYears";

const event = (id: string, startDate?: string, timeZone = "UTC") => ({
  id,
  startDate,
  timeZone,
});
const startOf = (e: ReturnType<typeof event>) => e;
const ids = (
  groups: ReturnType<typeof groupByYear<ReturnType<typeof event>>>,
) => groups.map(({ year, items }) => [year, items.map(({ id }) => id)]);

describe("groupByYear", () => {
  it("groups by start year, keeping the order given", () => {
    const events = [
      event("c", "2026-03-01T18:00:00Z"),
      event("b", "2025-11-01T18:00:00Z"),
      event("a", "2025-02-01T18:00:00Z"),
    ];

    expect(ids(groupByYear(events, startOf))).toEqual([
      ["2026", ["c"]],
      ["2025", ["b", "a"]],
    ]);
  });

  it("reads the year in the event's own time zone", () => {
    // 22:00 on New Year's Eve in New York: already 2026 in UTC, still 2025
    // where it was played.
    const late = event("nye", "2026-01-01T03:00:00Z", "America/New_York");

    expect(ids(groupByYear([late], startOf))).toEqual([["2025", ["nye"]]]);
  });

  it("leaves out undated events", () => {
    expect(groupByYear([event("x")], startOf)).toEqual([]);
  });
});
