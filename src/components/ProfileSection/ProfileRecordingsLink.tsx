import { getPages, getProfileProducts } from "@venuecms/sdk-next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/lib/i18n";

import { resolveProfileProductsHref } from "@/components/utils/pageHref";

/**
 * "/ recordings": the site's product listing page narrowed to this profile.
 * Only drawn when the profile has products and the site has such a page to
 * send them to; it's found by type rather than slug, so renaming the page in
 * the CMS doesn't break the link.
 */
export const ProfileRecordingsLink = async ({ slug }: { slug: string }) => {
  const [{ data: products }, { data: pages }, t] = await Promise.all([
    getProfileProducts({ slug, limit: 1 }),
    getPages(),
    getTranslations("profiles"),
  ]);

  const listingPage = pages?.records.find(
    (page) => page.type === "PRODUCTLIST",
  );

  if (!products?.records.length || !listingPage) {
    return null;
  }

  return (
    <span>
      <span aria-hidden className="opacity-30">
        /
      </span>{" "}
      <Link
        href={resolveProfileProductsHref(listingPage, slug)}
        className="hover:text-primary"
      >
        {t("recordings")}
      </Link>
    </span>
  );
};
