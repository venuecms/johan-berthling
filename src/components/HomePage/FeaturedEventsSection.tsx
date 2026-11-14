import { Suspense } from "react";

import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

import { FeaturedEventsError } from "./ErrorFallbacks";
import { FeaturedEventsContent } from "./FeaturedEventsContent";

export function FeaturedEventsSection({ locale }: { locale: string }) {
  return (
    <ErrorBoundary fallback={<FeaturedEventsError />}>
      {/* Nothing while loading: most of the time there are no featured
          events, and a placeholder would push the events list down from
          the top only to collapse again. */}
      <Suspense fallback={null}>
        <FeaturedEventsContent locale={locale} />
      </Suspense>
    </ErrorBoundary>
  );
}
