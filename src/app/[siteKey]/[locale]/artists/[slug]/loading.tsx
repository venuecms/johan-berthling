import { PageSkeleton } from "@/components/Skeletons";

// Shaped like the content-page layout: title on the header row in column 3,
// body in columns 4–6. Without this the home page's skeleton showed here.
export default function Loading() {
  return <PageSkeleton />;
}
