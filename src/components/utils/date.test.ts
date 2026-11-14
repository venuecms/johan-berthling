import { describe, expect, it } from "vitest";

import { formatDateRange } from "./date";

const timeZone = "Europe/Stockholm";

// The format EventList uses.
const short = { template: "d MMM yyyy" } as const;

describe("formatDateRange", () => {
  it("formats a single day with a short month and no weekday", () => {
    expect(
      formatDateRange({
        start: "2025-12-13T19:00:00Z",
        end: "2025-12-13T21:00:00Z",
        timeZone,
        withTime: false,
        ...short,
      }),
    ).toBe("13 Dec 2025");
  });

  it("appends the time when asked", () => {
    expect(
      formatDateRange({
        start: "2025-12-13T19:30:00Z",
        end: "2025-12-13T21:00:00Z",
        timeZone,
        withTime: true,
        ...short,
      }),
    ).toBe("13 Dec 2025 • 8.30pm");
  });

  it("shortens the month in a range within one month", () => {
    expect(
      formatDateRange({
        start: "2025-12-13T19:00:00Z",
        end: "2025-12-15T19:00:00Z",
        timeZone,
        ...short,
      }),
    ).toBe("13—15 Dec 2025");
  });

  it("treats a range ending on the same weekday as multi-day", () => {
    // 1 and 8 Dec 2025 are both Mondays.
    expect(
      formatDateRange({
        start: "2025-12-01T19:00:00Z",
        end: "2025-12-08T19:00:00Z",
        timeZone,
        ...short,
      }),
    ).toBe("1—8 Dec 2025");
  });

  it("shortens both months in a range across months", () => {
    expect(
      formatDateRange({
        start: "2025-11-30T19:00:00Z",
        end: "2025-12-02T19:00:00Z",
        timeZone,
        ...short,
      }),
    ).toBe("30 Nov — 2 Dec 2025");
  });

  it("uses short months for ranges by default", () => {
    expect(
      formatDateRange({
        start: "2025-12-03T19:00:00Z",
        end: "2025-12-05T19:00:00Z",
        timeZone,
      }),
    ).toBe("3—5 Dec 2025");
    expect(
      formatDateRange({
        start: "2025-10-03T19:00:00Z",
        end: "2025-11-05T19:00:00Z",
        timeZone,
      }),
    ).toBe("3 Oct — 5 Nov 2025");
  });

  it("can still spell months out in full", () => {
    expect(
      formatDateRange({
        start: "2025-11-30T19:00:00Z",
        end: "2025-12-02T19:00:00Z",
        timeZone,
        monthFormat: "MMMM",
      }),
    ).toBe("30 November — 2 December 2025");
  });
});
