import {
  type Event,
  LocalizedContent,
  type SearchParams,
  type Site,
  VenueContent,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { getEvents, getSite } from "@venuecms/sdk-next";
import { ArrowRight } from "lucide-react";
import { connection } from "next/server";

import { Link } from "@/lib/i18n";
import { getLinkedEvents, parseLinkedSiteKeys } from "@/lib/utils/linkedEvents";

import { EventsList, ListEvent, findNextEventId } from "@/components/EventList";
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

const UPCOMING_LIMIT = 6;
const PAST_LIMIT = 12;

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
  // into the upcoming ones, this site's and the linked sites' merged, each
  // side then cut back to its limit. An event that has started but not ended
  // can come back in both queries; it's kept once, with the upcoming events.
  const upcoming = byStart([...own(events?.records), ...linkedUpcoming]).slice(
    0,
    UPCOMING_LIMIT,
  );
  const upcomingKeys = new Set(upcoming.map(keyOf));
  const past = byStart([...own(pastEvents?.records), ...linkedPast])
    .filter((item) => !upcomingKeys.has(keyOf(item)))
    .slice(-PAST_LIMIT);
  const allEvents = [...past, ...upcoming];
  const pastKeys = new Set(past.map(keyOf));
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
          <section className="flex flex-col gap-3">
            <EventsList>
              {allEvents.map((item) => (
                // pb-1: a 4px gap between events. Each event is dated in its
                // own site's time zone.
                <ListEvent
                  isNext={item.event.id === nextEventId}
                  isPast={pastKeys.has(keyOf(item))}
                  key={keyOf(item)}
                  event={item.event}
                  site={item.site}
                  showDefaultLocation={item.site.id !== site.id}
                  className="pb-1"
                />
              ))}
            </EventsList>
            {/* /events lists this site's own events only, so this goes by
                those alone. */}
            {(events?.records.length ?? 0) >= UPCOMING_LIMIT ? (
              <div className="w-full grid-cols-1 gap-0 sm:grid">
                <span></span>
                <Link
                  className="flex w-full items-center gap-2 hover:brightness-125 sm:relative sm:flex-row"
                  href="/events"
                >
                  <ArrowRight className="h-4" />{" "}
                  <TranslatedText
                    namespace="events"
                    text="see_all_upcoming_events"
                  />
                </Link>
              </div>
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
