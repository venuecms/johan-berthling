import { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A hand-drawn border: four separate lines with a rough edge, each running a
 * few pixels past the corners by a different amount.
 *
 * The lines sit on the image's edges and only overshoot along their own
 * direction, so the image itself stays put and its left edge still lines up
 * with the grid column.
 */

/** Line thickness, and how far each line runs past a corner (px). */
export type FrameStyle = {
  weight: string;
  minOvershoot: number;
  maxOvershoot: number;
};

export const DEFAULT_FRAME: FrameStyle = {
  weight: "1px",
  minOvershoot: 1,
  maxOvershoot: 4.5,
};

/**
 * Product images (covers) take a lighter frame: the same 1px line, but
 * corners that overshoot a quarter as far.
 */
export const PRODUCT_FRAME: FrameStyle = {
  weight: "1px",
  minOvershoot: 0.25,
  maxOvershoot: 1.125,
};

export const ROUGH_LINE_FILTER_ID = "rough-line";

/**
 * The displacement filter that roughens the lines. Rendered once per page (in
 * the root layout) and referenced by id from every frame.
 *
 * userSpaceOnUse with a generous region: the lines are only 1px thick, so the
 * default region (10% of the element's box) would clip the displacement.
 */
export const RoughLineFilter = () => (
  <svg aria-hidden className="absolute h-0 w-0" focusable="false">
    <filter
      id={ROUGH_LINE_FILTER_ID}
      filterUnits="userSpaceOnUse"
      x="-20"
      y="-20"
      width="10000"
      height="10000"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.45"
        numOctaves="2"
        seed="7"
        result="noise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale="1"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);

/**
 * Deterministic per image: the same overshoots on the server and the client
 * (so no hydration mismatch) and on every visit, but different between images.
 */
const overshoots = (
  key: string,
  { minOvershoot, maxOvershoot }: FrameStyle,
) => {
  // FNV-1a hash of the key seeds a mulberry32 generator.
  let seed = 2166136261;
  for (let i = 0; i < key.length; i++) {
    seed = Math.imul(seed ^ key.charCodeAt(i), 16777619);
  }

  return Array.from({ length: 8 }, () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    const random = ((t ^ (t >>> 14)) >>> 0) / 4294967296;

    return `-${(minOvershoot + random * (maxOvershoot - minOvershoot)).toFixed(2)}px`;
  });
};

const line: CSSProperties = {
  position: "absolute",
  background: "currentColor",
  filter: `url(#${ROUGH_LINE_FILTER_ID})`,
};

export const RoughFrame = ({
  children,
  seed,
  className,
  frame = DEFAULT_FRAME,
}: {
  children: ReactNode;
  className?: string;
  frame?: FrameStyle;
  /** Anything stable and unique to the image; its URL does. */
  seed: string;
}) => {
  const [topL, topR, bottomL, bottomR, leftT, leftB, rightT, rightB] =
    overshoots(seed, frame);

  return (
    <div className={cn("relative max-w-full text-primary", className)}>
      {children}
      <span aria-hidden className="pointer-events-none">
        <span
          style={{
            ...line,
            top: 0,
            height: frame.weight,
            left: topL,
            right: topR,
          }}
        />
        <span
          style={{
            ...line,
            bottom: 0,
            height: frame.weight,
            left: bottomL,
            right: bottomR,
          }}
        />
        <span
          style={{
            ...line,
            left: 0,
            width: frame.weight,
            top: leftT,
            bottom: leftB,
          }}
        />
        <span
          style={{
            ...line,
            right: 0,
            width: frame.weight,
            top: rightT,
            bottom: rightB,
          }}
        />
      </span>
    </div>
  );
};
