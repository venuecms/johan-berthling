import type {
  Event as VenueEvent,
  Page as VenuePage,
  Product as VenueProduct,
} from "@venuecms/sdk-next";

/**
 * Root slugs that own a real route. The CMS still holds a page record for each
 * so it can carry a title and a nav position, but linking to /p/<slug> would
 * land on an empty stub instead of the index that actually renders them.
 *
 * Only reserved at the root: a nested page is free to be slugged "shop", and
 * /p/shop is where it lives.
 */
const StaticRootSlugs = ["artists", "events", "archive", "shop"];

// `type` and `parentId` are optional because the page tree reads its records
// out of a loosely typed tree-view metadata bag.
type PageLink = Pick<VenuePage, "slug"> & {
  type?: VenuePage["type"];
  parentId?: string | null;
  linkUrl?: string | null;
  openInNewTab?: boolean;
};

/**
 * Where a page record links, and whether it opens in a new tab. The single
 * resolver for page routing — the nav, the page tree and the page listing
 * block all render the same records and previously disagreed about reserved
 * slugs and about honouring `openInNewTab`.
 *
 * Note this deliberately does not route NEWS pages to /news/<slug>: a NEWS
 * *page* record is a news landing page, which /p/<slug> renders as the news
 * view. Individual articles come from the news endpoint, and the news listing
 * block routes those itself.
 */
export const resolvePageHref = ({
  slug,
  type,
  parentId,
  linkUrl,
  openInNewTab,
}: PageLink): { href: string; target: "_blank" | "_self" } => {
  if (type === "LINK" && linkUrl) {
    return { href: linkUrl, target: openInNewTab ? "_blank" : "_self" };
  }

  const isRoot = parentId == null;

  return {
    href: isRoot && StaticRootSlugs.includes(slug) ? `/${slug}` : `/p/${slug}`,
    target: "_self",
  };
};

/** A news article has its own route, separate from the page it may also be. */
export const resolveNewsArticleHref = (slug: string) => `/news/${slug}`;

type EventLink = Pick<VenueEvent, "slug" | "tickets"> & {
  location?: Pick<NonNullable<VenueEvent["location"]>, "externalLink"> | null;
};

/**
 * Where an event links from a list, first available of:
 *   1. a ticket's external link, to buy straight away;
 *   2. the location's web URL;
 *   3. the event's own page, so a row with neither still goes somewhere.
 * The first two leave the site, so they open in a new tab.
 */
export const resolveEventHref = ({
  slug,
  tickets,
  location,
}: EventLink): { href: string; external: boolean } => {
  const ticketLink = tickets?.find(
    ({ externalLink }) => externalLink,
  )?.externalLink;
  const externalHref = ticketLink || location?.externalLink;

  return externalHref
    ? { href: externalHref, external: true }
    : { href: `/events/${slug}`, external: false };
};

/**
 * Where a product's cover links: the first variant's buy link, off-site in a
 * new tab, or the product's own page when no variant has one.
 */
export const resolveProductHref = ({
  slug,
  variants,
}: Pick<VenueProduct, "slug" | "variants">): {
  href: string;
  external: boolean;
} => {
  const buyLink = variants?.find(
    ({ externalLink }) => externalLink,
  )?.externalLink;

  return buyLink
    ? { href: buyLink, external: true }
    : { href: `/shop/${slug}`, external: false };
};

/** The search param that narrows a product listing page to one profile. */
export const PRODUCT_ARTIST_PARAM = "artist";

/**
 * A product listing page (e.g. Recordings) narrowed to one profile's products.
 */
export const resolveProfileProductsHref = (
  listingPage: Parameters<typeof resolvePageHref>[0],
  profileSlug: string,
) =>
  `${resolvePageHref(listingPage).href}?${new URLSearchParams({
    [PRODUCT_ARTIST_PARAM]: profileSlug,
  })}`;
