import { Product, Site, getLocalizedContent } from "@venuecms/sdk-next";
import { useLocale } from "next-intl";
import type { CSSProperties } from "react";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { PRODUCT_FRAME, VenueImage } from "@/components/VenueImage";
import { Skeleton } from "@/components/ui/Input/Skeleton";
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

/**
 * Column classes by count, spelled out in full so Tailwind finds them.
 * Index 0 is unused.
 */
/** Gap between consecutive covers starting to fade in. */
const STAGGER_MS = 50;

const MOBILE_COLUMNS = ["", "grid-cols-1", "grid-cols-2"];
const DESKTOP_COLUMNS = [
  "",
  "lg:grid-cols-1",
  "lg:grid-cols-2",
  "lg:grid-cols-3",
  "lg:grid-cols-4",
  "lg:grid-cols-5",
];

/**
 * Covers five across on desktop, two on mobile, 8px apart. With fewer covers
 * than that, the columns drop to match, so a short list fills the width
 * rather than leaving empty columns.
 *
 * Each cover fades in over 50ms, 50ms after the one before it: left to right
 * along a row, then on to the next row once that one is in. In reading order
 * that's simply its index × 50ms, whatever the column count.
 */
export const ProductCoversGrid = ({
  products,
}: {
  products: ReadonlyArray<Product>;
}) => {
  const count = products.length;
  const mobileColumns = Math.min(count, 2);
  const desktopColumns = Math.min(count, 5);

  return (
    <div
      className={cn(
        "grid gap-2",
        MOBILE_COLUMNS[mobileColumns],
        DESKTOP_COLUMNS[desktopColumns],
      )}
    >
      {products.map((product, index) => (
        <div
          key={product.slug}
          className="motion-safe:animate-fade-in-fast"
          style={
            {
              "--delay": `${index * STAGGER_MS}ms`,
            } as CSSProperties
          }
        >
          <ProductCover product={product} />
        </div>
      ))}
    </div>
  );
};

/**
 * Stands in for ProductCoversGrid while the covers load: the same grid, gaps
 * and square tiles, two full rows on desktop (five on mobile).
 */
export const ProductCoversSkeleton = () => (
  <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
    {Array.from({ length: 10 }, (_, index) => (
      <Skeleton key={index} className="aspect-square h-auto" />
    ))}
  </div>
);
