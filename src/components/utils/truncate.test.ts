import { describe, expect, it } from "vitest";

import { truncate } from "./truncate";

describe("truncate", () => {
  it("leaves text at or under the limit alone", () => {
    expect(truncate("Fasching", 30)).toBe("Fasching");
    expect(truncate("a".repeat(30), 30)).toBe("a".repeat(30));
  });

  it("cuts longer text to the limit and appends ...", () => {
    expect(truncate("a".repeat(31), 30)).toBe(`${"a".repeat(30)}...`);
  });

  it("drops trailing space before the dots", () => {
    expect(truncate("Konserthuset Stora salen", 13)).toBe("Konserthuset...");
  });

  it("counts characters, not code units", () => {
    expect(truncate("😀😀😀", 2)).toBe("😀😀...");
  });
});
