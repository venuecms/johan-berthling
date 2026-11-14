import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

/**
 * Formats a record date in the venue's zone. `timeZone` is optional because
 * the SDK types it as nullable on Site; TZDate falls back to the runtime zone
 * when it is absent, which is the best available guess.
 */
export const formatDate = ({
  date,
  withTime = true,
  timeZone,
  template,
}: {
  date: string;
  withTime?: boolean;
  timeZone?: string;
  template: string;
}) => {
  if (withTime) {
    return format(new TZDate(date, timeZone), `${template} • h.mmaaa`)
      .split(".00")
      .join("");
  }
  return format(new TZDate(date, timeZone), template);
};

export const formatDateRange = ({
  start,
  end,
  timeZone,
  withTime,
  template = "EEEE d MMMM yyyy",
  monthFormat = "MMM",
}: {
  start: string;
  end: string;
  timeZone: string;
  withTime?: boolean;
  /** For single-day dates. */
  template?: string;
  /**
   * Month token for multi-day ranges, which build their own format rather
   * than using `template`. Short by default: 3—5 Dec 2025 within a month,
   * 3 Oct — 5 Nov 2025 across months.
   */
  monthFormat?: "MMMM" | "MMM";
}) => {
  const startDate = new TZDate(start, timeZone);
  const endDate = new TZDate(end, timeZone);

  const isMultiDay =
    startDate.getDate() !== endDate.getDate() ||
    startDate.getMonth() !== endDate.getMonth() ||
    startDate.getFullYear() !== endDate.getFullYear();

  if (!isMultiDay) {
    return formatDate({ date: start, withTime, template, timeZone });
  }

  const isSameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  if (isSameMonth) {
    return `${format(new TZDate(start, timeZone), "d")}—${formatDate({ date: end, withTime: false, timeZone, template: `d ${monthFormat} yyyy` })}`;
  }

  return `${format(startDate, `d ${monthFormat}`)} — ${format(endDate, `d ${monthFormat} yyyy`)}`;
};
