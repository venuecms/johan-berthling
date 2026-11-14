import { ReactNode } from "react";

export const SiteHeaderMobile = async ({
  logo,
  nav,
}: {
  logo: ReactNode;
  nav: ReactNode;
}) => {
  return (
    // Sticky, with no background: content scrolls visibly behind it.
    <header className="sticky top-0 z-10 flex items-center justify-between py-6 text-nav sm:hidden">
      {logo}
      {nav}
    </header>
  );
};
