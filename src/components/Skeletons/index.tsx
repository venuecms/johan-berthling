import { cn } from "@/lib/utils";

import { EventsList } from "@/components/EventList";
import {
  ColumnLeft,
  ColumnRight,
  TwoColumnLayout,
  headerRowLayout,
} from "@/components/layout";
import { Skeleton } from "@/components/ui/Input/Skeleton";

/**
 * Loading placeholders shaped like the layouts they stand in for. Text lines
 * are h-3 with a gap-2 between them, close to the 20px line height they
 * replace.
 */

// Varied so a column of placeholder rows reads as text, not a bar chart.
const LINE_WIDTHS = ["w-3/4", "w-2/3", "w-5/6", "w-1/2", "w-3/5", "w-4/5"];

const lineWidth = (index: number) => LINE_WIDTHS[index % LINE_WIDTHS.length];

/** A paragraph's worth of text lines, the last one short. */
export const TextSkeleton = ({ lines = 4 }: { lines?: number }) => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: lines }, (_, index) => (
      <Skeleton
        key={index}
        className={cn("h-3", index === lines - 1 ? "w-1/3" : "w-full")}
      />
    ))}
  </div>
);

/**
 * One event row: Date / Title / Location / City / Country on a single line,
 * optionally under its image as on /events.
 */
export const EventRowSkeleton = ({
  index,
  withImage,
  className,
}: {
  /** Position in the list, to vary the line length. */
  index: number;
  withImage?: boolean;
  /** Row spacing, as passed to the ListEvent it stands in for. */
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-3 pb-8", className)}>
    {withImage ? <Skeleton className="aspect-video h-auto sm:w-80" /> : null}
    <Skeleton className={cn("my-1 h-3", lineWidth(index))} />
  </div>
);

/** A list of event rows, as EventsList lays them out. */
export const EventListSkeleton = ({
  rows,
  withImage,
  rowClassName,
  className,
}: {
  rows: number;
  withImage?: boolean;
  rowClassName?: string;
  className?: string;
}) => (
  <EventsList className={className}>
    {Array.from({ length: rows }, (_, index) => (
      <EventRowSkeleton
        key={index}
        index={index}
        withImage={withImage}
        className={rowClassName}
      />
    ))}
  </EventsList>
);

/**
 * A content page (/p/*, artist pages): the title in column 3 on the header
 * row, then body text and an image in columns 4–6.
 */
export const PageSkeleton = () => (
  <TwoColumnLayout className={headerRowLayout}>
    <ColumnLeft>
      <Skeleton className="my-1 h-3 w-24" />
    </ColumnLeft>
    <ColumnRight>
      <div className="flex flex-col gap-6 pt-1">
        <TextSkeleton lines={5} />
        <TextSkeleton lines={3} />
      </div>
      <Skeleton className="aspect-video h-auto" />
    </ColumnRight>
  </TwoColumnLayout>
);
