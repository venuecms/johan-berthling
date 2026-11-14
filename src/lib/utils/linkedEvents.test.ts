import { afterEach, describe, expect, it, vi } from "vitest";

import { getLinkedEvents, parseLinkedSiteKeys } from "./linkedEvents";

describe("parseLinkedSiteKeys", () => {
  it("splits on commas and whitespace, dropping blanks and repeats", () => {
    expect(parseLinkedSiteKeys(" one, two  three,,one ")).toEqual([
      "one",
      "two",
      "three",
    ]);
  });

  it("falls back to the default sites while the field was never saved", () => {
    expect(parseLinkedSiteKeys(undefined)).toEqual(["fire"]);
  });

  it("treats a saved empty field, or anything but text, as no keys", () => {
    expect(parseLinkedSiteKeys("")).toEqual([]);
    expect(parseLinkedSiteKeys(null)).toEqual([]);
    expect(parseLinkedSiteKeys(["one"])).toEqual([]);
  });
});

describe("getLinkedEvents", () => {
  const site = { id: "site-b", timeZone: "Europe/Oslo" };
  const event = { id: "e1", slug: "gig" };

  const respond = (body: unknown, ok = true) =>
    Promise.resolve({
      ok,
      status: ok ? 200 : 500,
      json: () => Promise.resolve(body),
    } as Response);

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("reads each site with its own key and pairs events with their site", async () => {
    vi.stubEnv("VENUE_LINKED_API_KEYS", JSON.stringify({ b: "key-b" }));
    const fetch = vi.fn((url: URL, _init?: RequestInit) =>
      url.pathname.endsWith("/site")
        ? respond(site)
        : respond({ records: [event] }),
    );
    vi.stubGlobal("fetch", fetch);

    const result = await getLinkedEvents(["b"], { upcoming: true, limit: 6 });

    expect(result).toEqual([{ event, site }]);

    const eventsUrl = fetch.mock.calls
      .map(([url]) => url)
      .find((url) => url.pathname.endsWith("/events"))!;
    expect(eventsUrl.href).toBe(
      "https://app.venuecms.com/api/v2/b/public/events?upcoming=true&limit=6",
    );
    expect(fetch.mock.calls[0][1]).toMatchObject({
      headers: { Authorization: "Bearer key-b" },
    });
  });

  it("skips a site without an API key, without fetching", async () => {
    vi.stubEnv("VENUE_LINKED_API_KEYS", "{}");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);

    expect(await getLinkedEvents(["b"], {})).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("drops a site whose request fails, keeping the others", async () => {
    vi.stubEnv(
      "VENUE_LINKED_API_KEYS",
      JSON.stringify({ bad: "k1", good: "k2" }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn((url: URL) =>
        url.pathname.includes("/bad/")
          ? respond({}, false)
          : url.pathname.endsWith("/site")
            ? respond(site)
            : respond({ records: [event] }),
      ),
    );

    expect(await getLinkedEvents(["bad", "good"], {})).toEqual([
      { event, site },
    ]);
  });

  it("ignores an unreadable key map", async () => {
    vi.stubEnv("VENUE_LINKED_API_KEYS", "not json");
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(await getLinkedEvents(["b"], {})).toEqual([]);
  });
});
