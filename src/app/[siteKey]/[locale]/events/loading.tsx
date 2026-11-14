import { EventsListSkeleton } from "@/components/EventsPage/EventsListSection";

// The same skeleton the page's own Suspense boundary shows.
export default function Loading() {
  return <EventsListSkeleton />;
}
