import {
  VenueContent,
  type Profile as VenueProfile,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { useLocale } from "next-intl";
import { Suspense } from "react";

import { ProfileEventList } from "@/components/Profile/ProfileEventList";
import { VenueImage, contentImageHandlers } from "@/components/VenueImage";
import { StickyTitle } from "@/components/layout";
import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

// Plain `renderedStyles`, as ProfileCompact uses: a bio rendered inside a
// profile listing must not be able to nest another profile listing.
import { renderedStyles } from "../utils/styles";
import { ProfilePastConcertsLink } from "./ProfilePastConcertsLink";
import { ProfileRecordingsLink } from "./ProfileRecordingsLink";

/**
 * One profile as a full row of a profile listing page: the name in the page's
 * title column, then its description, upcoming events, image and a link to
 * its past concerts in the content columns.
 *
 * The listing renders inside the page's right-hand column (grid columns 4–6),
 * so on desktop each row reaches one column further left to put the name in
 * column 3. That column plus its gutter is a third of (100% + 20px), with 100%
 * being the right-hand column's width; the row is then four of the 8 grid
 * columns wide, split 1 + 3 with the same 20px gutter.
 */
export const ProfileSection = ({ profile }: { profile: VenueProfile }) => {
  const locale = useLocale();
  const { content } = getLocalizedContent(profile.localizedContent, locale);

  return (
    <section
      id={profile.slug}
      className="flex scroll-mt-20 flex-col gap-6 lg:ml-[calc((100%+20px)/-3)] lg:grid lg:scroll-mt-0 lg:grid-cols-4 lg:gap-x-5"
    >
      {/* The grid cell stretches to the section's full height, so the name
          sticks for as long as its section scrolls past, then hands over to
          the next profile's name. */}
      <div className="text-primary">
        {/* Pins on the header row, where the page title was until this
            section pushed it out (see PageListing). */}
        <StickyTitle>{content.title}</StickyTitle>
      </div>

      <div className="flex flex-col gap-12 lg:col-span-3">
        <VenueContent
          components={contentImageHandlers}
          className="flex flex-col gap-6"
          content={content}
          contentStyles={renderedStyles}
        />

        {/* Fetched per profile. Errors and the wait both render nothing:
            the rest of the section stands without its dates. */}
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <ProfileEventList
              slug={profile.slug}
              filter={{ upcoming: true, dir: "asc" }}
              rowClassName="pb-1"
              highlightNext={false}
            />
          </Suspense>
        </ErrorBoundary>

        <VenueImage image={profile.image} />

        <nav className="flex flex-wrap gap-x-3 text-secondary">
          {/* Each only there when it has something to link to (products,
              past events); each checks for itself, so a failed or slow check
              just leaves that link out. */}
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <ProfileRecordingsLink slug={profile.slug} />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <ProfilePastConcertsLink slug={profile.slug} />
            </Suspense>
          </ErrorBoundary>
        </nav>
      </div>
    </section>
  );
};
