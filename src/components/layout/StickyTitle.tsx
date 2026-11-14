import { ReactNode } from "react";

/**
 * Pulls a TwoColumnLayout up into the header row on desktop, so the title and
 * the first line of content sit level with the logo and nav. 3rem is the
 * desktop header's height: 4px top padding + one 20px line + 24px bottom
 * (see SiteHeaderDesktop). Below lg the header has its own row, so this just
 * gives the usual top padding.
 */
export const headerRowLayout = "pt-6 lg:-mt-12 lg:pt-1";

/**
 * A title that sticks level with the header's logo and nav on desktop: py-1
 * matches their padding, and -mt-1 cancels it so the title doesn't move. No
 * background: content scrolls visibly behind it, as it does behind the nav.
 *
 * Put it directly in a ColumnLeft: the column stretches to the full grid row,
 * so the title stays put for as long as its content is scrolling past.
 */
export const StickyTitle = ({ children }: { children: ReactNode }) => (
  // text-balance: titles often outgrow one grid column, and balanced lines
  // read better than a long line with one word left over.
  <div className="text-balance lg:sticky lg:top-0 lg:z-10 lg:-mt-1 lg:py-1">
    {children}
  </div>
);
