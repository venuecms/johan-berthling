import { Page } from "@venuecms/sdk-next";

export type PageWithParent = Page & { parentId?: string | null };

/**
 * Every page below `parentId`, depth first in CMS order: a child, then its own
 * children, then the next child. This is the order sub-pages render in beneath
 * their parent.
 *
 * LINK pages are left out: they point somewhere else and have no body to show.
 * Visited ids are tracked so a malformed parent loop can't recurse forever.
 */
export const collectDescendants = <T extends PageWithParent>(
  pages: Array<T>,
  parentId: string,
  visited: Set<string> = new Set([parentId]),
): Array<T> =>
  pages
    .filter((page) => page.parentId === parentId && !visited.has(page.id))
    .sort((a, b) => a.order - b.order)
    .flatMap((page) => {
      visited.add(page.id);
      const descendants = collectDescendants(pages, page.id, visited);

      return page.type === "LINK" ? descendants : [page, ...descendants];
    });
