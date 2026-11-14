import {
  getLocalizedContent,
  getProfile,
  getProfileProducts,
} from "@venuecms/sdk-next";
import { getLocale } from "next-intl/server";

import { ProductCoversGrid } from "@/components/ListProduct";
import { StickyTitle } from "@/components/layout";

// Generous: a profile's catalogue fits on one page, so there is no pager.
const LIMIT = 200;

/**
 * One profile's products as covers, for a product listing page opened with
 * ?artist=<slug> (the "/ recordings" link on a profile section). Stands in for
 * the page's own listing block, whose records can't be filtered from here.
 */
export const ProfileProductCovers = async ({ slug }: { slug: string }) => {
  const { data: products } = await getProfileProducts({ slug, limit: LIMIT });

  return products?.records.length ? (
    <ProductCoversGrid products={products.records} />
  ) : null;
};

/**
 * The name of the profile a product listing page is narrowed to, shown beside
 * the page title in the highlight colour. Nothing if the profile can't be
 * found, so a bad ?artist= leaves just the page title.
 */
export const ProfileProductsName = async ({ slug }: { slug: string }) => {
  const [{ data: profile }, locale] = await Promise.all([
    getProfile({ slug }),
    getLocale(),
  ]);

  if (!profile) {
    return null;
  }

  const { content } = getLocalizedContent(profile.localizedContent, locale);

  return (
    <div className="text-highlight">
      <StickyTitle>{content.title}</StickyTitle>
    </div>
  );
};
