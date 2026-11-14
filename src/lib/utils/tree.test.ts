import { describe, expect, it } from "vitest";

import { PageWithParent, collectDescendants } from "./tree";

const page = (
  id: string,
  parentId: string | undefined,
  order: number,
  type: PageWithParent["type"] = "CONTENT",
) => ({ id, parentId, order, type }) as PageWithParent;

const ids = (pages: Array<PageWithParent>) => pages.map(({ id }) => id);

describe("collectDescendants", () => {
  it("returns children depth first, in CMS order", () => {
    const pages = [
      page("root", undefined, 0),
      page("b", "root", 2),
      page("a", "root", 1),
      page("a2", "a", 2),
      page("a1", "a", 1),
      page("other", undefined, 1),
      page("other-child", "other", 0),
    ];

    expect(ids(collectDescendants(pages, "root"))).toEqual([
      "a",
      "a1",
      "a2",
      "b",
    ]);
  });

  it("skips LINK pages but keeps what sits under them", () => {
    const pages = [
      page("link", "root", 0, "LINK"),
      page("under-link", "link", 0),
      page("content", "root", 1),
    ];

    expect(ids(collectDescendants(pages, "root"))).toEqual([
      "under-link",
      "content",
    ]);
  });

  it("returns nothing for a page without children", () => {
    expect(collectDescendants([page("root", undefined, 0)], "root")).toEqual(
      [],
    );
  });

  it("survives a parent loop", () => {
    const pages = [page("a", "b", 0), page("b", "a", 0)];

    expect(ids(collectDescendants(pages, "a"))).toEqual(["b"]);
  });
});
