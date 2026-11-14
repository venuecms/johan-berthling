import {
  type Event,
  LocalizedContent,
  type SearchParams,
  type Site,
  VenueContent,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { getEvents, getSite } from "@venuecms/sdk-next";
import { connection } from "next/server";

import { Link } from "@/lib/i18n";
import { getLinkedEvents, parseLinkedSiteKeys } from "@/lib/utils/linkedEvents";

import { EventsList, ListEvent, findNextEventId } from "@/components/EventList";
import { ScrollToEvent } from "@/components/HomePage/ScrollToEvent";
import { contentComponents } from "@/components/ListingBlock";
import { TranslatedText } from "@/components/TranslatedText";
import { contentImageHandlers } from "@/components/VenueImage";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";

type SiteEvent = { event: Event; site: Site };

/** Unique across sites: event ids are only unique within one. */
const keyOf = ({ event, site }: SiteEvent) => `${site.id}:${event.id}`;

/** Oldest first; undated events last. */
const byStart = (items: Array<SiteEvent>) =>
  items.sort(
    (a, b) =>
      (a.event.startDate ? Date.parse(a.event.startDate) : Infinity) -
      (b.event.startDate ? Date.parse(b.event.startDate) : Infinity),
  );

/**
 * Every upcoming event is shown. The API still needs a limit: without one it
 * sends back 20. This is a ceiling no site's upcoming events will reach.
 */
const UPCOMING_LIMIT = 1000;
const PAST_LIMIT = 12;

/**
 * On desktop the page starts scrolled so this many past events show from the
 * nav down; the rest are above, a scroll up away (ScrollToEvent).
 */
const PAST_IN_VIEW = 5;
const SCROLL_TARGET_ID = "home-scroll-target";

/**
 * Past events fade out the further back they are: the most recent at 60%,
 * each one before it 8% fainter, down to 20%.
 */
const pastOpacity = (stepsBack: number) =>
  Math.max(0.2, 0.6 - stepsBack * 0.08);

export async function EventsContent({
  locale,
  searchParams,
}: {
  locale: string;
  /**
   * Taken as a promise and awaited here rather than in the route, because this
   * component already renders inside the home page's Suspense boundary. Awaiting
   * it up in `Home` would make the whole home page wait on the request; awaiting
   * it here costs nothing extra, since `connection()` above has already opted
   * this subtree out of the prerender.
   */
  searchParams: Promise<SearchParams>;
}) {
  await connection();

  // Rounded down to the minute for better cache hits, as the archive does.
  const now = new Date();
  now.setSeconds(0, 0);

  const [
    { data: events },
    { data: pastEvents },
    { data: site },
    resolvedSearchParams,
  ] = await Promise.all([
    getEvents({ limit: UPCOMING_LIMIT, upcoming: true }),
    getEvents({ limit: PAST_LIMIT, lt: now.getTime(), dir: "desc" }),
    getSite(),
    searchParams,
  ]);

  if (!site) {
    return null;
  }

  // Events from other Venue sites named in the template config, fetched with
  // the same filters as this site's own (see linkedEvents).
  const linkedSiteKeys = parseLinkedSiteKeys(
    site.settings?.publicSite?.template?.config?.linkedSiteKeys,
  );
  const [linkedUpcoming, linkedPast] = await Promise.all([
    getLinkedEvents(linkedSiteKeys, { limit: UPCOMING_LIMIT, upcoming: true }),
    getLinkedEvents(linkedSiteKeys, {
      limit: PAST_LIMIT,
      lt: now.getTime(),
      dir: "desc",
    }),
  ]);

  const own = (records: ReadonlyArray<Event> = []) =>
    records.map((event) => ({ event, site }));

  // One continuous list in date order: the most recent past events leading
  // into all the upcoming ones, this site's and the linked sites' merged, and
  // the past side then cut back to its limit. An event that has started but
  // not ended can come back in both queries; it's kept once, with the upcoming
  // events.
  const upcoming = byStart([...own(events?.records), ...linkedUpcoming]);
  const upcomingKeys = new Set(upcoming.map(keyOf));
  const past = byStart([...own(pastEvents?.records), ...linkedPast])
    .filter((item) => !upcomingKeys.has(keyOf(item)))
    .slice(-PAST_LIMIT);
  const allEvents = [...past, ...upcoming];
  const pastKeys = new Set(past.map(keyOf));
  // The 5th-from-last past event: none when there are 5 or fewer, as nothing
  // would sit above it to scroll past.
  const scrollTarget =
    past.length > PAST_IN_VIEW ? past[past.length - PAST_IN_VIEW] : undefined;
  const nextEventId = findNextEventId(allEvents.map(({ event }) => event));

  const webSiteSettings = site.webSites ? site.webSites[0] : undefined;
  const { content: siteContent } = webSiteSettings?.localizedContent?.length
    ? getLocalizedContent(webSiteSettings.localizedContent, locale)
    : { content: { content: site.description } as LocalizedContent };

  return (
    <TwoColumnLayout>
      <ColumnLeft className="hidden text-sm text-secondary sm:flex">
        {siteContent ? (
          <VenueContent
            components={contentImageHandlers}
            className="flex flex-col gap-6"
            content={siteContent}
            contentStyles={contentComponents}
            searchParams={resolvedSearchParams}
          />
        ) : null}
      </ColumnLeft>
      <ColumnRight>
        {allEvents.length ? (
          // lg:-mt-24: up out of the layout's 96px top padding, so scrolled
          // to the top the "see all past events" link sits 48px below the
          // top of the page (under the 3rem header), the same gap-12 that
          // separates it from the list.
          <section className="flex flex-col gap-12 lg:-mt-24">
            {/* Ahead of the past events: the whole archive, which lists the
                linked sites' past events too. */}
            {past.length ? (
              <div className="text-sm text-secondary">
                <span aria-hidden className="opacity-30">
                  /
                </span>{" "}
                <Link
                  href="/archive"
                  className="text-secondary hover:text-primary"
                >
                  <TranslatedText
                    namespace="events"
                    text="see_all_past_events"
                  />
                </Link>
              </div>
            ) : null}
            <EventsList>
              {allEvents.map((item, index) => (
                // pb-1: a 4px gap between events. Each event is dated in its
                // own site's time zone.
                <ListEvent
                  isNext={item.event.id === nextEventId}
                  isPast={pastKeys.has(keyOf(item))}
                  opacity={
                    pastKeys.has(keyOf(item))
                      ? pastOpacity(past.length - 1 - index)
                      : undefined
                  }
                  key={keyOf(item)}
                  event={item.event}
                  site={item.site}
                  showDefaultLocation={item.site.id !== site.id}
                  id={item === scrollTarget ? SCROLL_TARGET_ID : undefined}
                  className="pb-1"
                />
              ))}
            </EventsList>
            {scrollTarget ? (
              <ScrollToEvent targetId={SCROLL_TARGET_ID} />
            ) : null}
          </section>
        ) : null}

        {siteContent ? (
          <div className="flex sm:hidden">
            <VenueContent
              components={contentImageHandlers}
              className="flex flex-col gap-6"
              content={siteContent}
              contentStyles={contentComponents}
              searchParams={resolvedSearchParams}
            />
          </div>
        ) : null}
      </ColumnRight>
    </TwoColumnLayout>
  );
}
