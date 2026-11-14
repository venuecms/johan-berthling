import { cn } from "@/lib/utils";

import {
  ColumnLeft,
  ColumnRight,
  TwoColumnLayout,
  headerRowLayout,
} from "@/components/layout";
import { Skeleton } from "@/components/ui/Input/Skeleton";

/**
 * Row lengths, mostly near the full column: event rows run on one line to
 * the column edge and beyond, so short bars would misrepresent them. Varied
 * so the column reads as a list, not a block.
 */
const ROW_WIDTHS = [
  "w-full",
  "w-[83%]",
  "w-[99%]",
  "w-[89%]",
  "w-full",
  "w-[96%]",
  "w-[97%]",
  "w-[78%]",
];

const ROWS = 24;

/**
 * The home page while its events load: up in the header row like the other
 * pages, a short bar in column 3 and the event rows in columns 4–6, each
 * bar a full 20px line, 8px apart.
 */
export function EventsSkeleton() {
  return (
    <TwoColumnLayout className={headerRowLayout}>
      <ColumnLeft className="hidden sm:flex">
        <Skeleton className="h-5 w-3/4" />
      </ColumnLeft>
      <ColumnRight className="gap-2">
        {Array.from({ length: ROWS }, (_, index) => (
          <Skeleton
            key={index}
            className={cn("h-5", ROW_WIDTHS[index % ROW_WIDTHS.length])}
          />
        ))}
      </ColumnRight>
    </TwoColumnLayout>
  );
}
