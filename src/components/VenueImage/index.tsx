import {
  MediaItem,
  type NodeHandlers,
  type NodeProps,
  VenueImage as SdkVenueImage,
} from "@venuecms/sdk-next";

import { type FrameStyle, RoughFrame } from "./RoughFrame";

export { PRODUCT_FRAME, RoughLineFilter } from "./RoughFrame";

const ASPECTS = {
  square: "aspect-square",
  video: "aspect-video",
};

export const VenueImage = ({
  className,
  image,
  aspect,
  props,
  frame,
}: {
  className?: string;
  image?: Partial<MediaItem>;
  aspect?: keyof typeof ASPECTS;
  props?: object;
  /** The frame's look; the site default when left out. */
  frame?: FrameStyle;
}) => {
  const sdkImage = (
    <SdkVenueImage
      className={className}
      image={image}
      aspect={aspect}
      props={props}
    />
  );

  // No URL means the SDK renders nothing, or an empty placeholder box, and
  // neither wants a frame drawn around it.
  if (!image?.url) {
    return sdkImage;
  }

  return (
    <CreditWrapper credit={image.credit}>
      {/* A fixed aspect fills its box, so the frame does too. Otherwise the
          frame shrinks to the image, which may be narrower than the column. */}
      <RoughFrame
        seed={image.url}
        frame={frame}
        className={aspect ? "w-full" : "w-fit"}
      >
        {sdkImage}
      </RoughFrame>
    </CreditWrapper>
  );
};

const CreditWrapper = ({
  children,
  credit,
}: {
  children?: React.ReactNode;
  credit?: string | null;
}) =>
  credit ? (
    <figure className="flex w-fit max-w-full flex-col gap-0.5">
      {children}
      <figcaption className="text-center text-xs">
        {/* Editors sometimes type the symbol themselves; don't double it. */}
        {credit.trimStart().startsWith("©") ? credit : `© ${credit}`}
      </figcaption>
    </figure>
  ) : (
    children
  );

/**
 * Renders images inside rich content through this component rather than the
 * SDK's, so they get the same frame. Mirrors the SDK's own `image` and `img`
 * handlers, which strip the `/media/` prefix the editor stores.
 */
const contentImage = (src: unknown, alt: unknown) => {
  if (typeof src !== "string" || !src) {
    return <></>;
  }

  const altText = typeof alt === "string" ? alt : undefined;

  return (
    <VenueImage
      image={{
        url: src.replace(/^\/media\//, ""),
        altText,
        metadata: { altText },
      }}
    />
  );
};

export const contentImageHandlers: NodeHandlers = {
  image: ({ node }: NodeProps) =>
    contentImage(node.attrs?.src, node.attrs?.alt),
  img: ({ node }: NodeProps) => contentImage(node.src, node.alt),
};
