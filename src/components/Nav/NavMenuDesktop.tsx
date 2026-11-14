"use client";

import { ReactNode } from "react";

import { SearchInput } from "../Search/SearchInput";
import { useSearchQuery } from "../Search/provider";

export const NavMenuDesktop = ({
  showSearch,
  children,
}: {
  showSearch: boolean;
  children: ReactNode;
}) => {
  const { isActive } = useSearchQuery();

  return (
    <nav className="relative hidden items-baseline gap-8 sm:flex">
      {!isActive ? (
        // Inline list, comma after every item but the last.
        <ol className="flex flex-wrap items-baseline justify-end gap-x-[0.4em] text-sm text-nav [&>li:not(:last-child)]:after:content-[',']">
          {children}
        </ol>
      ) : null}
      {showSearch ? <SearchInput /> : null}
    </nav>
  );
};
