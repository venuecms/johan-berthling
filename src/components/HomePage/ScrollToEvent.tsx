"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Where the nav's text starts on desktop: the header's links have 4px top
 * padding (SiteHeaderDesktop), the same 4px headerRowLayout gives content
 * pages so their first line sits level with the nav.
 */
const NAV_TEXT_TOP = 4;

/** Tailwind's lg breakpoint, where the nav and content share a row. */
const DESKTOP = "(min-width: 1024px)";

/**
 * Starts the home page scrolled so the event row `targetId` sits level with
 * the nav, leaving the past events before it a scroll up away rather than out
 * of reach. Desktop only. Left alone when the visitor has already scrolled,
 * or arrived with a #fragment or a restored scroll position, so it never
 * takes the page from under them.
 *
 * Renders a spacer at the end of the list: when the page is too short to
 * scroll that far, it's grown by just the shortfall so the alignment holds.
 */
export const ScrollToEvent = ({ targetId }: { targetId: string }) => {
  const spacer = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const target = document.getElementById(targetId);

    if (
      !target ||
      !spacer.current ||
      window.location.hash ||
      window.scrollY > 0 ||
      !window.matchMedia(DESKTOP).matches
    ) {
      return;
    }

    const top =
      target.getBoundingClientRect().top + window.scrollY - NAV_TEXT_TOP;
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;

    if (top > scrollable) {
      spacer.current.style.height = `${top - scrollable}px`;
    }

    window.scrollTo({ top, behavior: "instant" });
  }, [targetId]);

  return <div ref={spacer} aria-hidden />;
};
