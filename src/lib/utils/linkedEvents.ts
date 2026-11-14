import type { Event, Site } from "@venuecms/sdk-next";

/**
 * Events from other Venue sites ("linked sites"), for showing alongside this
 * site's own.
 *
 * Which sites to read is template config (`linkedSiteKeys`, editable in the
 * CMS); the API key for each is server-only, in VENUE_LINKED_API_KEYS. Keys
 * must not go in the template config: the site record that holds it is also
 * fetched in the browser, so anything there is public.
 *
 * Fetched directly rather than through the SDK, whose site key and API key are
 * process-wide globals: pointing them at another site mid-request would leak
 * into any request being served concurrently. Same host, endpoints, auth
 * header and 60s revalidation the SDK uses.
 */

const API_BASE = "https://app.venuecms.com";
const REVALIDATE_SECONDS = 60;

export type LinkedEvent = {
  event: Event;
  /** The site the event belongs to, for its time zone. */
  site: Site;
};

export type LinkedEventsQuery = {
  limit?: number;
  upcoming?: boolean;
  lt?: number;
  dir?: "asc" | "desc";
};

/**
 * Used while `linkedSiteKeys` has never been saved in the CMS: the schema's
 * `default` only pre-fills the CMS form, it never reaches the site's config.
 * Keep in step with that default in public/_venue/config.schema.json.
 */
export const DEFAULT_LINKED_SITE_KEYS = "fire";

/**
 * The template config's `linkedSiteKeys`: free text in the CMS, so commas
 * and/or whitespace between keys, duplicates and stray spacing all tolerated.
 * Never saved (absent) falls back to DEFAULT_LINKED_SITE_KEYS; saved empty
 * means no linked sites.
 */
export const parseLinkedSiteKeys = (value: unknown): Array<string> => {
  const text = value === undefined ? DEFAULT_LINKED_SITE_KEYS : value;

  return typeof text === "string"
    ? [...new Set(text.split(/[\s,]+/).filter(Boolean))]
    : [];
};

/**
 * VENUE_LINKED_API_KEYS: a JSON object from site key to that site's API key,
 * e.g. {"other-venue":"vk_..."}. Anything unreadable counts as no keys.
 */
const readApiKeys = (): Record<string, string> => {
  const raw = process.env.VENUE_LINKED_API_KEYS;

  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, string>)
      : {};
  } catch {
    console.error("VENUE_LINKED_API_KEYS is not valid JSON; ignoring it");
    return {};
  }
};

const getJson = async <T>(
  siteKey: string,
  apiKey: string,
  path: string,
  query: LinkedEventsQuery = {},
): Promise<T> => {
  const url = new URL(
    `/api/v2/${encodeURIComponent(siteKey)}/public/${path}`,
    API_BASE,
  );

  for (const [name, value] of Object.entries(query)) {
    if (value !== undefined) {
      url.searchParams.set(name, String(value));
    }
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`${response.status} for ${url.pathname}`);
  }

  return response.json() as Promise<T>;
};

/**
 * Events from each linked site matching `query` (the same filters getEvents
 * takes), each with its site. Per-site and fail-soft: a site with no API key
 * configured, or whose request fails, contributes nothing and is logged; it
 * never takes the page down with it.
 */
export const getLinkedEvents = async (
  siteKeys: ReadonlyArray<string>,
  query: LinkedEventsQuery,
): Promise<Array<LinkedEvent>> => {
  if (!siteKeys.length) {
    return [];
  }

  const apiKeys = readApiKeys();

  const perSite = await Promise.all(
    siteKeys.map(async (siteKey) => {
      const apiKey = apiKeys[siteKey];

      if (!apiKey) {
        console.warn(
          `Linked site "${siteKey}" has no API key in VENUE_LINKED_API_KEYS; skipping it`,
        );
        return [];
      }

      try {
        const [site, events] = await Promise.all([
          getJson<Site>(siteKey, apiKey, "site"),
          getJson<{ records?: Array<Event> }>(siteKey, apiKey, "events", query),
        ]);

        return (events.records ?? []).map((event) => ({ event, site }));
      } catch (error) {
        console.error(`Linked site "${siteKey}" events failed to load`, error);
        return [];
      }
    }),
  );

  return perSite.flat();
};
