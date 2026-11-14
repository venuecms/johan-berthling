import {
  type SearchParams,
  VenueContent,
  type Page as VenuePage,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { useLocale } from "next-intl";

import { cn } from "@/lib/utils";

import { contentComponents, pageBodyStyles } from "@/components/ListingBlock";
import { VenueImage, contentImageHandlers } from "@/components/VenueImage";

import { ProfileCompact } from "../ProfileCompact";
import {
  ColumnLeft,
  ColumnRight,
  StickyTitle,
  TwoColumnLayout,
  TwoSubColumnLayout,
  headerRowLayout,
} from "../layout";

/**
 * A page and its sub-pages, one after another. Each gets the same layout: its
 * title sticky on the left, its content on the right.
 */
export const Page = ({
  page,
  subPages,
  searchParams,
}: {
  page: VenuePage;
  /** Every page below this one, already in render order (collectDescendants). */
  subPages: Array<VenuePage>;
  /**
   * The route's search params, for the pagers on any listing blocks in this
   * content. Only a route segment can read them, so they are passed down.
   *
   * Required rather than optional: a caller that forgets it costs every listing
   * in this content its pager, and does so silently — the records still render.
   * A surface that genuinely has no URL to page by passes `{}` and says so.
   */
  searchParams: SearchParams;
}) => (
  <div className="flex flex-col gap-12 pb-6 lg:gap-24 lg:pb-24">
    {[page, ...subPages].map((section, index) => (
      <PageSection
        key={section.id}
        page={section}
        searchParams={searchParams}
        // Only the first section is pulled up into the header row.
        className={index === 0 ? headerRowLayout : undefined}
      />
    ))}
  </div>
);

const PageSection = ({
  page,
  searchParams,
  className,
}: {
  page: VenuePage;
  searchParams: SearchParams;
  className?: string;
}) => {
  const locale = useLocale();

  const { artists = [] } = page;
  const { content } = getLocalizedContent(page.localizedContent, locale);

  return (
    // The id makes each sub-page linkable as /p/<parent>#<sub-page>. On mobile
    // the sticky header bar would cover the top of the section, hence the
    // scroll margin; on desktop the title is meant to land on the header row.
    <section id={page.slug} className="scroll-mt-20 lg:scroll-mt-0">
      <TwoColumnLayout className={cn("py-0 lg:py-0", className)}>
        {/* Sticks for as long as this section scrolls past, then hands over
            to the next section's title. */}
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
          <VenueImage image={page.image} />
          {artists.length > 0 && (
            <TwoSubColumnLayout>
              {artists.map(({ profile }) => (
                <ProfileCompact key={profile.slug} profile={profile} />
              ))}
            </TwoSubColumnLayout>
          )}
        </ColumnRight>
      </TwoColumnLayout>
    </section>
  );
};
