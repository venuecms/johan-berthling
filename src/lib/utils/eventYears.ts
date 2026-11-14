/**
 * Events grouped by the year they start in, years in the order they first
 * appear: pass events newest first and the years come out newest first, each
 * year's events keeping that order.
 *
 * The year is read in each event's own time zone (its site's), so a New
 * Year's Eve gig late in the evening stays in the year it was played.
 * Undated events are left out: there's no year to file them under.
 */
export const groupByYear = <T>(
  items: ReadonlyArray<T>,
  startOf: (item: T) => { startDate?: string | null; timeZone?: string },
): Array<{ year: string; items: Array<T> }> => {
  const groups = new Map<string, Array<T>>();

  for (const item of items) {
    const { startDate, timeZone } = startOf(item);

    if (!startDate) {
      continue;
    }

    const year = new Intl.DateTimeFormat("en", {
      year: "numeric",
      timeZone,
    }).format(new Date(startDate));

    groups.set(year, [...(groups.get(year) ?? []), item]);
  }

  return [...groups].map(([year, items]) => ({ year, items }));
};
