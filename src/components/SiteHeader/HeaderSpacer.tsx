/**
 * Holds the header's place while the header itself is still loading, so a
 * skeleton below it starts where the loaded page's content will: 3rem on
 * desktop (SiteHeaderDesktop), and on mobile py-6 around a 20px line
 * (SiteHeaderMobile).
 */
export const HeaderSpacer = () => (
  <div aria-hidden className="h-[4.25rem] sm:h-12" />
);
