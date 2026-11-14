import { getProfileEvents, getSite } from "@venuecms/sdk-next";
import { connection } from "next/server";

import { EventsList, ListEvent, findNextEventId } from "@/components/EventList";
import { EventListSkeleton } from "@/components/Skeletons";
import { Skeleton } from "@/components/ui/Input/Skeleton";

export const ProfileEventList = async ({
  header,
  slug,
  filter,
  id,
  rowClassName,
  highlightNext = true,
}: {
  /** Leave out for a bare list, as the profile listing sections draw it. */
  header?: string;
  slug: string;
  /** For linking straight to this list, e.g. #past-events. */
  id?: string;
  /** Passed to each row, e.g. to tighten the spacing between events. */
  rowClassName?: string;
  /** Draw the next upcoming event in the highlight colour. */
  highlightNext?: boolean;
  filter?: { upcoming?: boolean; lt?: number; dir?: "asc" | "desc" };
}) => {
  await connection();

  const [{ data: events }, { data: site }] = await Promise.all([
    getProfileEvents({ slug, limit: 60, ...filter }),
    getSite(),
  ]);

  if (!site) {
    return null;
  }

  return events?.records.length ? (
    <div id={id} className="flex flex-col gap-6">
      {header ? (
        <h2 className="m-0 py-0 text-sm text-primary">{header}</h2>
      ) : null}
      <EventsList>
        {events.records.map((event, _, list) => (
          <ListEvent
            isNext={highlightNext && event.id === findNextEventId(list)}
            key={event.id}
            event={event}
            site={site}
            className={rowClassName}
          />
        ))}
      </EventsList>
    </div>
  ) : null;
};

export const ProfileEventListSkeleton = ({
  numElements = 2,
}: {
  numElements?: number;
}) => {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-3 w-1/4" />
      <EventListSkeleton rows={numElements} />
    </div>
  );
};
