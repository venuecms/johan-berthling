import { type Event, type Site, getLocalizedContent } from "@venuecms/sdk-next";
import { useLocale, useTranslations } from "next-intl";
import { Fragment, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { VenueImage } from "@/components/VenueImage";
import { truncate } from "@/components/utils/truncate";

import { formatDateRange } from "../utils";
import { toCountryCode } from "../utils/country";
import { resolveEventHref } from "../utils/pageHref";

/** Longer location names are cut to this many characters, then "...". */
const LOCATION_MAX_CHARS = 20;

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
  showDefaultLocation,
  id,
  opacity,
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
  /**
   * Name the venue even when it's the event's site's default location: true
   * for events from a linked site, whose "default" venue isn't this one.
   */
  showDefaultLocation?: boolean;
  id?: string;
  /**
   * The whole row's opacity, in place of isPast's 80%: lets a list fade its
   * past events out the further back they are.
   */
  opacity?: number;
  className?: string;
}) => {
  const locale = useLocale();
  const t = useTranslations("events");
  const { artists } = event;
  const { content } = getLocalizedContent(event.localizedContent, locale);
  const isCancelled = event.publishState === "CANCELLED";
  // Ticket link, else the venue's website, else no link.
  const href = resolveEventHref(event);

  // The venue's own location is implied, so only other venues are named.
  const location =
    event.location && (showDefaultLocation || !event.location.isDefault)
      ? event.location
      : undefined;
  const locationTitle = location
    ? getLocalizedContent(location.localizedContent, locale).content.title
    : undefined;

  const title = (
    <EventLink
      href={href}
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
      <EventLink href={href}>
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
        <a
          href={location.mapLink}
          target="_blank"
          rel="noreferrer"
          title={locationTitle}
        >
          {truncate(locationTitle, LOCATION_MAX_CHARS)}
        </a>
      ) : (
        <span title={locationTitle}>
          {truncate(locationTitle, LOCATION_MAX_CHARS)}
        </span>
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
      id={id}
      style={opacity === undefined ? undefined : { opacity }}
      className={cn(
        "flex break-inside-avoid flex-col gap-8 pb-8 sm:gap-0",
        isPast && "opacity-80",
        className,
      )}
    >
      {withImage ? (
        <div className={cn("w-full pb-3 sm:w-80 sm:max-w-full")}>
          <EventLink href={href}>
            <VenueImage image={displayImage} aspect="video" />
          </EventLink>
        </div>
      ) : null}
      {/* Date / Title / Location / City / Country, on one line that never
          wraps: a long row runs past its column rather than breaking, except
          a past one, which is cut off with an ellipsis at the column edge.
          Missing parts are left out along with their separator. Everything is
          secondary except the title, which sets its own primary colour; the
          next event is all highlight. */}
      <div
        className={cn(
          isPast ? "min-w-0 truncate" : "whitespace-nowrap",
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

/**
 * The event's ticket or venue link, in a new tab; or, when it has neither,
 * the same content unlinked.
 */
const EventLink = ({
  href,
  className,
  children,
}: {
  href: string | undefined;
  className?: string;
  children: ReactNode;
}) =>
  href ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <span className={className}>{children}</span>
  );
