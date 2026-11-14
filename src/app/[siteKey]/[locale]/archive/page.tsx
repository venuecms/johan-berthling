import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { type Event, type Site, getLocalizedContent } from "@venuecms/sdk-next";
import { getEvents, getPage, getSite } from "@venuecms/sdk-next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { cn } from "@/lib/utils";
import { groupByYear } from "@/lib/utils/eventYears";
import { getLinkedEvents, parseLinkedSiteKeys } from "@/lib/utils/linkedEvents";

import { EventsList, ListEvent } from "@/components/EventList";
import {
  ColumnLeft,
  ColumnRight,
  StickyTitle,
  TwoColumnLayout,
  headerRowLayout,
} from "@/components/layout";
import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(() =>
  getPage({ slug: "archive" }),
);

/**
 * Every past event is listed, this site's and the linked sites' together, so
 * there's no paging: one page can't be split across several sites' results.
 * The API needs a limit all the same (without one it sends 20); this is a
 * ceiling per site that an archive won't reach for a long while.
 */
const PAST_LIMIT = 1000;

type SiteEvent = { event: Event; site: Site };

/** Unique across sites: event ids are only unique within one. */
const keyOf = ({ event, site }: SiteEvent) => `${site.id}:${event.id}`;

const ArchivePage = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  await setupSSR({ params });
  await connection();

  // Round down to nearest minute for better cache hits
  const now = new Date();
  now.setSeconds(0, 0);
  const query = { limit: PAST_LIMIT, lt: now.getTime(), dir: "desc" as const };

  const [{ data: events }, { data: page }, { data: site }, t] =
    await Promise.all([
      getEvents(query),
      getPage({ slug: "archive" }),
      getSite(),
      getTranslations("events"),
    ]);

  if (!site) {
    notFound();
  }

  // The linked sites' past events too, as on the home page (see
  // linkedEvents); a linked site that fails to load is left out.
  const linked = await getLinkedEvents(
    parseLinkedSiteKeys(
      site.settings?.publicSite?.template?.config?.linkedSiteKeys,
    ),
    query,
  );

  const pageTitle = page
    ? getLocalizedContent(page.localizedContent, locale).content.title
    : t("archive");

  // Newest first, then a section per year.
  const years = groupByYear(
    [...(events?.records ?? []).map((event) => ({ event, site })), ...linked]
      .filter(({ event }) => event.startDate)
      .sort(
        (a, b) =>
          Date.parse(b.event.startDate!) - Date.parse(a.event.startDate!),
      ),
    ({ event, site }) => ({
      startDate: event.startDate,
      timeZone: site.timeZone ?? undefined,
    }),
  );

  if (!years.length) {
    return (
      <TwoColumnLayout className={headerRowLayout}>
        <ColumnLeft>
          <StickyTitle>
            <h1>{pageTitle}</h1>
          </StickyTitle>
        </ColumnLeft>
        <ColumnRight>
          <p className="text-sm text-secondary">{t("no_events_found")}</p>
        </ColumnRight>
      </TwoColumnLayout>
    );
  }

  // A section per year, gap-12 apart, laid out as a content page's sections
  // are: the year where a page title goes, sticky until the next year's
  // section takes over; the first section up in the header row. Rows as the
  // home page's past events, which link here: one line each, 4px apart,
  // receded and cut off at the column edge.
  return (
    <div className="flex flex-col gap-12 pb-6 lg:pb-24">
      <h1 className="sr-only">{pageTitle}</h1>
      {years.map(({ year, items }, index) => (
        <section key={year} aria-label={year}>
          <TwoColumnLayout
            className={cn("py-0 lg:py-0", index === 0 && headerRowLayout)}
          >
            <ColumnLeft>
              <StickyTitle>{year}</StickyTitle>
            </ColumnLeft>
            <ColumnRight>
              <EventsList>
                {items.map((item) => (
                  <ListEvent
                    isPast
                    key={keyOf(item)}
                    event={item.event}
                    site={item.site}
                    showDefaultLocation={item.site.id !== site.id}
                    withTime={false}
                    className="pb-1"
                  />
                ))}
              </EventsList>
            </ColumnRight>
          </TwoColumnLayout>
        </section>
      ))}
    </div>
  );
};

export default ArchivePage;
