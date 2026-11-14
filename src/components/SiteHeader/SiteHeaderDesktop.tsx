import { ReactNode } from "react";

export const SiteHeaderDesktop = async ({
  logo,
  nav,
}: {
  logo: ReactNode;
  nav: ReactNode;
}) => {
  return (
    // Sticky, with no background: content scrolls visibly behind the logo
    // and nav. From lg up, /p pages pull their title into this row, so the
    // header is click-through except for the logo and nav themselves. The
    // logo and nav take the top padding (py-1) so that, with lg:pb-5, the
    // header stays 3rem tall, which headerRowLayout relies on.
    <header className="hidden items-baseline justify-between gap-12 pb-6 pt-1 text-nav sm:sticky sm:top-0 sm:z-10 sm:flex lg:pointer-events-none lg:pb-5 lg:pt-0 lg:[&>*]:pointer-events-auto lg:[&>*]:py-1">
      {logo}
      {nav}
    </header>
  );
};
