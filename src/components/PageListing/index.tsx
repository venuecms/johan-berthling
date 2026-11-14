import type { LocalizedContent, SearchParams } from "@venuecms/sdk-next";
import { VenueContent } from "@venuecms/sdk-next";
import { Suspense } from "react";

import { cn } from "@/lib/utils";

import { contentImageHandlers } from "@/components/VenueImage";
import {
  ColumnLeft,
  ColumnRight,
  StickyTitle,
  TwoColumnLayout,
  headerRowLayout,
} from "@/components/layout";

import { ProductCoversSkeleton } from "../ListProduct";
import {
  contentComponents,
  pageBodyStyles,
  productListingPageComponents,
  profileListingPageComponents,
} from "../ListingBlock";
import { NewsView } from "../News";
import { hasRenderableContent } from "../utils/pageContent";
import { PRODUCT_ARTIST_PARAM } from "../utils/pageHref";
import type { PageListingLayout } from "../utils/pageLayout";
import {
  ProfileProductCovers,
  ProfileProductsName,
} from "./ProfileProductCovers";

/**
 * A page whose type names a listing.
 *
 * The type picks the frame and nothing else: the records come from a listing
 * block the author placed in the body, which is where the limit, the ordering
 * and whether it pages at all are already decided. That is why this draws no
 * records of its own — a layout that fetched as well would put a second,
 * unasked-for listing on the page.
 */
export const PageListing = ({
  layout,
  title,
  content,
  searchParams,
}: {
  layout: PageListingLayout;
  /** Heads the listing the way its own route does; the shop route has none. */
  title?: string;
  /** The page's own body, which holds the block drawing the records. */
  content?: LocalizedContent;
  /** The body's listing blocks page themselves off these. */
  searchParams: SearchParams;
}) => {
  // This view draws the latest article's body; a second would compete with it.
  if (layout === "news") {
    return <NewsView title={title} searchParams={searchParams} />;
  }

  // Nothing to draw means no frame either, or the page is a screenful of
  // padding above an empty column.
  if (!content || !hasRenderableContent(content)) {
    return null;
  }

  const body = (
    <VenueContent
      components={contentImageHandlers}
      className={pageBodyStyles}
      content={content}
      contentStyles={
        layout === "profiles"
          ? profileListingPageComponents
          : layout === "products"
            ? productListingPageComponents
            : contentComponents
      }
      searchParams={searchParams}
    />
  );

  const artistParam = searchParams[PRODUCT_ARTIST_PARAM];
  const artist = typeof artistParam === "string" ? artistParam : undefined;

  // Each listing type gets the content-page frame, title up in the header
  // row, adapted to how its records lay out.
  switch (layout) {
    case "products":
      // The title on the header row, in column 3, sticking for the whole
      // page; when narrowed to one profile, that profile's name sits beside
      // it in column 4, in the highlight colour, sticking likewise. The covers
      // run across all eight columns below, edge to edge with the logo and
      // nav. Grid items rather than a ColumnLeft, so their containing block is
      // this whole wrapper and not just the first row.
      return (
        <div
          className={cn(
            "flex flex-col gap-10 pb-24 lg:grid lg:grid-cols-8 lg:gap-x-5",
            headerRowLayout,
          )}
        >
          {title ? (
            <div className="lg:sticky lg:top-0 lg:z-10 lg:col-start-3 lg:row-start-1 lg:self-start">
              <StickyTitle>{title}</StickyTitle>
            </div>
          ) : null}
          {artist ? (
            // On mobile, straight under the title rather than a gap away.
            <div className="-mt-10 lg:sticky lg:top-0 lg:z-10 lg:col-start-4 lg:row-start-1 lg:mt-0 lg:self-start">
              <ProfileProductsName slug={artist} />
            </div>
          ) : null}
          <div className="lg:col-span-8 lg:row-start-2">
            {/* Narrowed to one profile (a profile's "/ recordings" link):
                its own products replace the page's listing block. */}
            {/* The covers' records load in here (the listing block suspends
                while the SDK fetches them), so this is where they wait. */}
            <Suspense fallback={<ProductCoversSkeleton />}>
              {artist ? <ProfileProductCovers slug={artist} /> : body}
            </Suspense>
          </div>
        </div>
      );
    case "profiles":
      // The title sits alone on the header row; the profiles start 6rem
      // further down, each its own section with its name in the title column
      // (see ProfileSection).
      //
      // The title gets a row of its own, ending where the profiles begin, so
      // it only sticks until then: as the first profile reaches the top, the
      // end of that row pushes the title up and out, and the profile's name
      // pins in its place. Neither has a background, so they must never
      // share the header row. The 6rem is a height, not padding: a sticky
      // element can't travel into its container's padding.
      return (
        <div>
          <TwoColumnLayout className={cn(headerRowLayout, "pb-0 lg:pb-0")}>
            <ColumnLeft className="pb-6 lg:h-24 lg:pb-0">
              {title ? <StickyTitle>{title}</StickyTitle> : null}
            </ColumnLeft>
          </TwoColumnLayout>
          <TwoColumnLayout className="pt-0 lg:pt-0">
            <ColumnRight>{body}</ColumnRight>
          </TwoColumnLayout>
        </div>
      );
    case "events":
      return (
        // Same frame as a content page: up in the header row, title sticky
        // on the left.
        <TwoColumnLayout className={headerRowLayout}>
          <ColumnLeft>
            {title ? <StickyTitle>{title}</StickyTitle> : null}
          </ColumnLeft>
          <ColumnRight>{body}</ColumnRight>
        </TwoColumnLayout>
      );
  }
};
