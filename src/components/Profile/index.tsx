import {
  type SearchParams,
  VenueContent,
  type Profile as VenueProfile,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { useLocale, useTranslations } from "next-intl";
import { Suspense } from "react";

import { contentComponents, pageBodyStyles } from "@/components/ListingBlock";
import { VenueImage, contentImageHandlers } from "@/components/VenueImage";

import {
  ColumnLeft,
  ColumnRight,
  StickyTitle,
  TwoColumnLayout,
  headerRowLayout,
} from "../layout";
import { ErrorBoundary } from "../utils/ErrorBoundary";
import { ProfileEventList, ProfileEventListSkeleton } from "./ProfileEventList";

export const Profile = ({
  profile,
  searchParams,
}: {
  profile: VenueProfile;
  /**
   * The route's search params, for the pagers on any listing blocks in this
   * content. Only a route segment can read them, so they are passed down.
   *
   * Required rather than optional: a caller that forgets it costs every listing
   * in this content its pager, and does so silently — the records still render.
   * A surface that genuinely has no URL to page by passes `{}` and says so.
   */
  searchParams: SearchParams;
}) => {
  const locale = useLocale();
  const t = useTranslations("events");

  const { content } = getLocalizedContent(profile?.localizedContent, locale);

  return (
    // Same layout as a page: title sticky on the left in the header row,
    // content on the right. Unlike a page, the image goes below the upcoming
    // events rather than straight after the content.
    <TwoColumnLayout className={headerRowLayout}>
      <ColumnLeft>
        <StickyTitle>{content.title}</StickyTitle>
      </ColumnLeft>

      <ColumnRight>
        <VenueContent
          components={contentImageHandlers}
          className={pageBodyStyles}
          content={content}
          contentStyles={contentComponents}
          searchParams={searchParams}
        />
        <ErrorBoundary fallback={null}>
          <Suspense fallback={<ProfileEventListSkeleton numElements={1} />}>
            <ProfileEventList
              header={t("upcoming_events")}
              slug={profile.slug}
              filter={{ upcoming: true, dir: "asc" }}
            />
          </Suspense>
        </ErrorBoundary>
        <VenueImage image={profile.image} />
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <ProfileEventList
              header={t("past_events")}
              id="past-events"
              slug={profile.slug}
              filter={{ lt: Date.now(), dir: "desc" }}
            />
          </Suspense>
        </ErrorBoundary>
      </ColumnRight>
    </TwoColumnLayout>
  );
};
