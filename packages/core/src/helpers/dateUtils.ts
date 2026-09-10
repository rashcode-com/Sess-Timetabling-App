/**
 * dateUtils.ts
 *
 * Standalone utilities for Persian (Solar Hijri) date and time formatting
 * using standard ECMAScript Intl.DateTimeFormat APIs.
 */

export interface PersianDateOptions {
  includeYear?: boolean;
  prefix?: string;
  timeZone?: string;
}

/**
 * Formats an ISO 8601 date string or Date object into Persian date text.
 * Example: "2023-08-31T07:48:00.000Z" -> "۹ شهریور ۱۴۰۲" (with year) or "۹ شهریور"
 *
 * @param isoOrDate - ISO timestamp or Date object
 * @param options - Configuration options (includeYear, prefix, timeZone)
 * @returns Persian formatted date string
 */
export function formatPersianDate(
  isoOrDate?: string | Date | null,
  options: PersianDateOptions = {}
): string {
  if (!isoOrDate) return "";

  const {
    includeYear = true,
    prefix = "",
    timeZone = "Asia/Tehran",
  } = options;

  try {
    const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
    if (isNaN(d.getTime())) return "";

    const formatterOptions: Intl.DateTimeFormatOptions = {
      calendar: "persian",
      day: "numeric",
      month: "long",
      timeZone,
    };

    if (includeYear) {
      formatterOptions.year = "numeric";
    }

    const formatter = new Intl.DateTimeFormat("fa-IR", formatterOptions);
    const formatted = formatter.format(d);

    return prefix ? `${prefix} ${formatted}` : formatted;
  } catch {
    return "";
  }
}

/**
 * Formats an ISO 8601 date string or Date object into Persian 24-hour clock time.
 * Example: "2023-08-31T07:48:00.000Z" -> "۱۱:۱۸"
 *
 * @param isoOrDate - ISO timestamp or Date object
 * @param timeZone - Target time zone (default: "Asia/Tehran")
 * @returns Persian formatted time string
 */
export function formatPersianTime(
  isoOrDate?: string | Date | null,
  timeZone = "Asia/Tehran"
): string {
  if (!isoOrDate) return "";

  try {
    const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
    if (isNaN(d.getTime())) return "";

    const formatter = new Intl.DateTimeFormat("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    });

    return formatter.format(d);
  } catch {
    return "";
  }
}

/**
 * Convenience helper that formats an ISO timestamp into the exact header chip strings.
 * Date Chip: "به‌روز شده در ۹ شهریور ۱۴۰۲"
 * Clock Chip: "ساعت ۱۱:۱۸"
 */
export function formatPersianUpdateHeader(
  isoOrDate?: string | Date | null,
  options: { includeYear?: boolean; timeZone?: string } = {}
): { dateText: string; clockText: string } {
  if (!isoOrDate) {
    return { dateText: "", clockText: "" };
  }

  const includeYear = options.includeYear !== undefined ? options.includeYear : true;
  const timeZone = options.timeZone || "Asia/Tehran";

  const dateStr = formatPersianDate(isoOrDate, { includeYear, timeZone });
  const timeStr = formatPersianTime(isoOrDate, timeZone);

  return {
    dateText: dateStr ? `به‌روز شده در ${dateStr}` : "",
    clockText: timeStr ? `ساعت ${timeStr}` : "",
  };
}
