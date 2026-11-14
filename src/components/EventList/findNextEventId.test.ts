import { describe, expect, it } from "vitest";

import { findNextEventId } from ".";

const now = new Date("2025-12-10T12:00:00Z").getTime();

const event = (id: string, startDate?: string, endDate?: string) => ({
  id,
  startDate: startDate ?? "",
  endDate: endDate ?? "",
});

describe("findNextEventId", () => {
  it("picks the soonest event that hasn't happened yet", () => {
    expect(
      findNextEventId(
        [
          event("past", "2025-12-01T19:00:00Z"),
          event("later", "2025-12-20T19:00:00Z"),
          event("soonest", "2025-12-12T19:00:00Z"),
        ],
        now,
      ),
    ).toBe("soonest");
  });

  it("counts an event that has started but not ended", () => {
    expect(
      findNextEventId(
        [
          event("ongoing", "2025-12-09T10:00:00Z", "2025-12-11T22:00:00Z"),
          event("next", "2025-12-12T19:00:00Z"),
        ],
        now,
      ),
    ).toBe("ongoing");
  });

  it("finds nothing in a list of past events", () => {
    expect(
      findNextEventId(
        [
          event("a", "2025-12-01T19:00:00Z"),
          event("b", "2025-11-01T19:00:00Z"),
        ],
        now,
      ),
    ).toBeUndefined();
  });

  it("skips events without a date", () => {
    expect(findNextEventId([event("undated")], now)).toBeUndefined();
  });
});
