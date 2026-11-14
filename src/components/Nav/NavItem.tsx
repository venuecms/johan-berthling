"use client";

import { ReactNode } from "react";

import { Link, usePathname } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * A nav link that knows whether it points at the current page. A section's
 * child pages (e.g. /events/<slug> under /events) count as active too, so the
 * nav keeps showing where the visitor is.
 */
export const NavItem = ({
  href,
  target,
  children,
}: {
  href: string;
  target: "_blank" | "_self";
  children: ReactNode;
}) => {
  // next-intl's pathname has the locale prefix already stripped, so it
  // compares directly against the unprefixed hrefs the nav is built from.
  const pathname = usePathname();
  const isExternal = /^[a-z][a-z\d+.-]*:/i.test(href);
  const isActive =
    !isExternal && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <li>
      <Link
        href={href}
        target={target}
        aria-current={isActive ? "page" : undefined}
        className={cn(isActive && "text-highlight")}
      >
        {children}
      </Link>
    </li>
  );
};
