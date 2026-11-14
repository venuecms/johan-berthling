import {
  type SearchParams,
  VenueContent,
  type Page as VenuePage,
  getLocalizedContent,
} from "@venuecms/sdk-next";
import { useLocale } from "next-intl";

import { PageWithParent } from "@/lib/utils/tree";

import { contentComponents, pageBodyStyles } from "@/components/ListingBlock";
import { VenueImage, contentImageHandlers } from "@/components/VenueImage";

import { PageTree } from "../PageTree";
import { ProfileCompact } from "../ProfileCompact";
import {
  ColumnLeft,
  ColumnRight,
  TwoColumnLayout,
  TwoSubColumnLayout,
} from "../layout";

export const Page = ({
  page,
  pages,
  searchParams,
}: {
  page: VenuePage;
  pages: Array<PageWithParent>;
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

  const { artists = [] } = page;
  const { content } = getLocalizedContent(page?.localizedContent, locale);

  return (
    // Pulled up into the header row on desktop, so the title and first line of
    // the body sit level with the logo and nav. 3rem is the header's height:
    // 4px top padding + one 20px line + 24px bottom padding.
    <TwoColumnLayout className="lg:-mt-12 lg:pt-1">
      <ColumnLeft>
        <div className="flex flex-col gap-12">
          <div>
            <div>{content.title}</div>
          </div>
          <PageTree pages={pages} />
        </div>
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
        <TwoSubColumnLayout>
          {artists.map(({ profile }) => (
            <ProfileCompact key={profile.slug} profile={profile} />
          ))}
        </TwoSubColumnLayout>
      </ColumnRight>
    </TwoColumnLayout>
  );
};
