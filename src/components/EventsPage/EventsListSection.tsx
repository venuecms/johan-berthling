import { Suspense } from "react";

import { EventListSkeleton } from "@/components/Skeletons";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";
import { Skeleton } from "@/components/ui/Input/Skeleton";
import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { EventsListContent } from "./EventsListContent";

function EventsListError() {
  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary" />
      <ColumnRight>
        <p className="text-secondary">
          Unable to load events. Please try refreshing the page.
        </p>
      </ColumnRight>
    </TwoColumnLayout>
  );
}

export function EventsListSkeleton() {
  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary">
        <div className="pb-8">
          <Skeleton className="w-32" />
        </div>
      </ColumnLeft>
      <ColumnRight>
        <EventListSkeleton rows={6} withImage className="gap-y-12" />
      </ColumnRight>
    </TwoColumnLayout>
  );
}

export function EventsListSection({ locale }: { locale: string }) {
  return (
    <ErrorBoundary fallback={<EventsListError />}>
      <Suspense fallback={<EventsListSkeleton />}>
        <EventsListContent locale={locale} />
      </Suspense>
    </ErrorBoundary>
  );
}
