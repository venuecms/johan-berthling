import { type Event, type Site, getLocalizedContent } from "@venuecms/sdk-next";
import { useLocale, useTranslations } from "next-intl";
import { Fragment, ReactNode } from "react";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { VenueImage } from "@/components/VenueImage";

import { formatDateRange } from "../utils";
import { toCountryCode } from "../utils/country";
import { resolveEventHref } from "../utils/pageHref";

export const EventsList = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        // One event per row. Every list sits in a ColumnRight, so on desktop
        // each row spans its full 3 of the 8 grid columns.
        "flex flex-col text-sm",
        className,
      )}
    >
      {children}
    </div>
  );
};

/**
 * The soonest event in a list that hasn't finished yet, which the list calls
 * out in the highlight colour. Lists come in either order (upcoming ascending,
 * past descending), so this looks at dates rather than position. An event
 * counts until it ends; one without an end date until it starts.
 */
export const findNextEventId = (
  events: ReadonlyArray<Pick<Event, "id" | "startDate" | "endDate">>,
  now = Date.now(),
) => {
  let next: { id: string; start: number } | undefined;

  for (const { id, startDate, endDate } of events) {
    if (!startDate) {
      continue;
    }

    const start = new Date(startDate).getTime();
    const end = endDate ? new Date(endDate).getTime() : start;

    if (end >= now && (!next || start < next.start)) {
      next = { id, start };
    }
  }

  return next?.id;
};

export const ListEvent = ({
  event,
  site,
  withImage,
  withTime = true,
  dateTemplate,
  isNext,
  isPast,
  className,
}: {
  event: Event;
  site: Site;
  withImage?: boolean;
  withTime?: boolean;
  dateTemplate?: string;
  /** The next event in its list (findNextEventId): drawn in the highlight. */
  isNext?: boolean;
  /** Recedes: secondary title and the whole row at 80% opacity. */
  isPast?: boolean;
  className?: string;
}) => {
  const locale = useLocale();
  const t = useTranslations("events");
  const { artists } = event;
  const { content } = getLocalizedContent(event.localizedContent, locale);
  const isCancelled = event.publishState === "CANCELLED";
  // Ticket link, else the venue's website, else the event page.
  const link = resolveEventHref(event);

  // The venue's own location is implied, so only other venues are named.
  const location =
    event.location && !event.location.isDefault ? event.location : undefined;
  const locationTitle = location
    ? getLocalizedContent(location.localizedContent, locale).content.title
    : undefined;

  const title = (
    <EventLink
      {...link}
      className={cn(
        isNext ? "text-highlight" : isPast ? "text-secondary" : "text-primary",
        "hover:brightness-150",
        isCancelled && "line-through",
      )}
    >
      {content.title}
    </EventLink>
  );

  const segments: Array<ReactNode> = [
    event.startDate ? (
      <EventLink {...link}>
        {formatDateRange({
          start: event.startDate,
          end: event.endDate,
          withTime: withTime && event.hasTime,
          // e.g. 13 Dec 2025: short month, no weekday.
          template: dateTemplate ?? "d MMM yyyy",
          timeZone: site.timeZone!,
        })}
      </EventLink>
    ) : null,
    title,
    locationTitle ? (
      location?.mapLink ? (
        <a href={location.mapLink} target="_blank" rel="noreferrer">
          {locationTitle}
        </a>
      ) : (
        locationTitle
      )
    ) : null,
    location?.city,
    location?.country ? toCountryCode(location.country, locale) : null,
    isCancelled ? t("cancelled") : null,
  ].filter((segment) => segment != null && segment !== "");

  const displayImage =
    event.image ??
    event.relations?.parents?.[0]?.image ??
    artists?.find((artist) => !!artist.profile?.image)?.profile.image;

  return (
    <div
      className={cn(
        "flex break-inside-avoid flex-col gap-8 pb-8 sm:gap-0",
        isPast && "opacity-80",
        className,
      )}
    >
      {withImage ? (
        <div className={cn("w-full pb-3 sm:w-80 sm:max-w-full")}>
          <EventLink {...link}>
            <VenueImage image={displayImage} aspect="video" />
          </EventLink>
        </div>
      ) : null}
      {/* Date / Title / Location / City / Country, on one line that wraps.
          Missing parts are left out along with their separator. Everything is
          secondary except the title, which sets its own primary colour; the
          next event is all highlight. */}
      <div
        className={cn(
          "text-balance",
          isNext ? "text-highlight" : "text-secondary",
        )}
      >
        {segments.map((segment, index) => (
          <Fragment key={index}>
            {index > 0 ? (
              <>
                {" "}
                <span aria-hidden className="opacity-30">
                  /
                </span>{" "}
              </>
            ) : null}
            {/* The title at full strength; every other detail recedes. */}
            {segment === title ? (
              segment
            ) : (
              <span className="opacity-60">{segment}</span>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

/** An internal link for the event page; a new-tab anchor for anywhere else. */
const EventLink = ({
  href,
  external,
  className,
  children,
}: {
  href: string;
  external: boolean;
  className?: string;
  children: ReactNode;
}) =>
  external ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
