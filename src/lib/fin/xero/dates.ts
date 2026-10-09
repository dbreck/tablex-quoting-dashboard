/**
 * Xero date helpers (pure, no runtime deps — safe for scripts and server code).
 *
 * Xero's Accounting API returns dates in two shapes:
 *   - `DateString` / `DueDateString`: ISO-ish local date-times, "2020-10-05T00:00:00"
 *   - legacy MS-JSON: "/Date(1601856000000+0000)/" (FullyPaidOnDate, UpdatedDateUTC,
 *     and Date/DueDate when the *String twin is absent)
 * Both are accepted by every parser here.
 */

const ISO_DATE_RE = /^(\d{4}-\d{2}-\d{2})/;
const LEGACY_DATE_RE = /^\/Date\((-?\d+)([+-]\d{4})?\)\/$/;

/** Calendar date (YYYY-MM-DD) from either Xero date shape, or null. */
export function parseXeroDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const iso = ISO_DATE_RE.exec(value);
  if (iso) return iso[1];
  const legacy = LEGACY_DATE_RE.exec(value);
  if (legacy) {
    const d = new Date(Number(legacy[1]));
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  return null;
}

/**
 * Full timestamp (ISO 8601, UTC) from either Xero date shape, or null.
 * ISO strings without an offset are treated as UTC (UpdatedDateUTC semantics).
 */
export function parseXeroDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const legacy = LEGACY_DATE_RE.exec(value);
  if (legacy) {
    const d = new Date(Number(legacy[1]));
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  if (ISO_DATE_RE.test(value)) {
    const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value);
    const d = new Date(hasZone ? value : `${value}Z`);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

/** `If-Modified-Since` header value in the format Xero documents: "2026-10-09T14:05:00" (UTC). */
export function toIfModifiedSince(at: Date | string): string {
  const d = typeof at === "string" ? new Date(at) : at;
  return d.toISOString().slice(0, 19);
}

/** Xero `where` literal for a YYYY-MM-DD date: `DateTime(2025,01,31)`. */
export function xeroWhereDateTime(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) throw new Error(`Expected YYYY-MM-DD, got "${ymd}"`);
  return `DateTime(${m[1]},${m[2]},${m[3]})`;
}

/** Last calendar day of a month (month 1–12) as YYYY-MM-DD. */
export function lastDayOfMonth(year: number, month: number): string {
  const d = new Date(Date.UTC(year, month, 0));
  return d.toISOString().slice(0, 10);
}
