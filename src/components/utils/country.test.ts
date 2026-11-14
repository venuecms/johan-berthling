import { describe, expect, it } from "vitest";

import { toCountryCode } from "./country";

describe("toCountryCode", () => {
  it("passes codes through, uppercased", () => {
    expect(toCountryCode("SE")).toBe("SE");
    expect(toCountryCode("no")).toBe("NO");
  });

  it("turns English names into codes", () => {
    expect(toCountryCode("Sweden")).toBe("SE");
    expect(toCountryCode("united kingdom")).toBe("GB");
  });

  it("understands names in the site's language", () => {
    expect(toCountryCode("Sverige", "sv")).toBe("SE");
    expect(toCountryCode("Tyskland", "sv")).toBe("DE");
  });

  it("ignores accents and surrounding space", () => {
    expect(toCountryCode(" Österrike ", "sv")).toBe("AT");
  });

  it("returns anything it can't place as entered", () => {
    expect(toCountryCode("Atlantis")).toBe("Atlantis");
  });
});
