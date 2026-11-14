import {
  LocalizedContent,
  type SearchParams,
  VenueContent,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { getEvents, getSite } from "@venuecms/sdk-next";
import { ArrowRight } from "lucide-react";
import { connection } from "next/server";

import { Link } from "@/lib/i18n";

import { EventsList, ListEvent, findNextEventId } from "@/components/EventList";
import { contentComponents } from "@/components/ListingBlock";
import { TranslatedText } from "@/components/TranslatedText";
import { contentImageHandlers } from "@/components/VenueImage";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";

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

  const upcoming = events?.records ?? [];
  // One continuous list in date order: the most recent past events, fetched
  // newest first and flipped, leading into the upcoming ones. An event that
  // has started but not ended can come back in both queries; it's kept once,
  // with the upcoming events.
  const upcomingIds = new Set(upcoming.map(({ id }) => id));
  const past = (pastEvents?.records ?? [])
    .filter(({ id }) => !upcomingIds.has(id))
    .reverse();
  const allEvents = [...past, ...upcoming];
  const pastIds = new Set(past.map(({ id }) => id));
  const nextEventId = findNextEventId(allEvents);

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
              {allEvents.map((event) => (
                // pb-1: a 4px gap between events.
                <ListEvent
                  isNext={event.id === nextEventId}
                  isPast={pastIds.has(event.id)}
                  key={event.id}
                  event={event}
                  site={site}
                  className="pb-1"
                />
              ))}
            </EventsList>
            {upcoming.length >= UPCOMING_LIMIT ? (
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
