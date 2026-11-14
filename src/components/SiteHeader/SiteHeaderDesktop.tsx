import { ReactNode } from "react";

export const SiteHeaderDesktop = async ({
  logo,
  nav,
}: {
  logo: ReactNode;
  nav: ReactNode;
}) => {
  return (
    <header className="hidden items-baseline justify-between gap-12 pb-6 pt-1 text-nav sm:flex lg:pointer-events-none lg:relative lg:z-10 lg:[&>*]:pointer-events-auto">
      {logo}
      {nav}
    </header>
  );
};
