import { EventsSkeleton } from "@/components/HomePage/LoadingSkeletons";

// Just the events: the featured events and products sections show nothing
// while they load (see their Suspense fallbacks), so the list starts at the
// top as the loaded page does.
export default function Loading() {
  return <EventsSkeleton />;
}
