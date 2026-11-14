import { Product, Site, getLocalizedContent } from "@venuecms/sdk-next";
import { useLocale } from "next-intl";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { PRODUCT_FRAME, VenueImage } from "@/components/VenueImage";
import { resolveProductHref } from "@/components/utils/pageHref";

/**
 * Product images grow slightly, and slowly, under the pointer (not for
 * visitors who ask for reduced motion). On the link so
 * the frame grows with the image; `block` because a transform needs a box.
 */
const productHover =
  "block transition-transform duration-1000 motion-safe:hover:scale-[1.02]";

export const ListProduct = ({
  product,
  site,
  featured,
  className,
}: {
  product: Product;
  site: Site;
  featured?: boolean;
  className?: string;
}) => {
  const locale = useLocale();

  const { content } = getLocalizedContent(product?.localizedContent, locale);

  return (
    <div
      className={cn(
        "flex break-inside-avoid flex-col gap-8 pb-8 sm:gap-0",
        className,
      )}
    >
      <div className="w-full pb-3 sm:w-auto sm:max-w-full">
        <Link href={`/shop/${product.slug}`} className={productHover}>
          <VenueImage
            image={product.image}
            aspect="square"
            frame={PRODUCT_FRAME}
          />
        </Link>
      </div>
      <div className="flex flex-col">
        {product.author ? (
          <div className="text-secondary">{product.author}</div>
        ) : null}
        <div className="text-primary">
          <Link href={`/shop/${product.slug}`}>{content.title}</Link>
        </div>
      </div>
    </div>
  );
};

/**
 * A product as its cover alone, linking to where it can be bought: the buy
 * link in a new tab, or the product page if there is none. The title is still
 * there for screen readers, as the link's label.
 */
export const ProductCover = ({ product }: { product: Product }) => {
  const locale = useLocale();
  const { content } = getLocalizedContent(product.localizedContent, locale);
  const { href, external } = resolveProductHref(product);
  const label = [product.author, content.title].filter(Boolean).join(" – ");
  const cover = (
    <VenueImage image={product.image} aspect="square" frame={PRODUCT_FRAME} />
  );

  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={productHover}
    >
      {cover}
    </a>
  ) : (
    <Link href={href} aria-label={label} className={productHover}>
      {cover}
    </Link>
  );
};
