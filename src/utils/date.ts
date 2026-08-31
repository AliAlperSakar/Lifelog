import {
  format,
  parseISO,
  differenceInMinutes,
  startOfDay,
  addDays,
  subDays,
  isSameDay,
  formatISO,
} from 'date-fns'

/**
 * Timezone strategy: every LogEntry stores an absolute `timestamp` (ISO 8601
 * with the device's UTC offset baked in) AND a `localDate` (YYYY-MM-DD)
 * computed once, at entry time, from that same device/timezone context.
 *
 * We deliberately do NOT recompute localDate from timestamp elsewhere with
 * `new Date().toISOString().slice(0,10)` (which normalizes to UTC and would
 * shift entries made near midnight to the wrong day for users west of UTC).
 * All "which day does this belong to" logic must go through `toLocalDate`.
 */

export function nowIso(): string {
  return formatISO(new Date())
}

export function toLocalDate(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Extracts the calendar date directly from the ISO string's own characters
 * rather than going through `parseISO` + `format`. That round-trip converts
 * to a `Date` (an absolute instant) and re-renders it in whatever timezone
 * the *current* JS runtime happens to be in — which is correct only when
 * the code re-rendering an entry happens to run in the same timezone the
 * entry was recorded in. A backup restored on a different machine, or a
 * test suite running in UTC, would otherwise silently shift entries made
 * near midnight onto the wrong day. Our timestamps are always written with
 * an explicit offset (see `nowIso`), so the date/time characters in the
 * string already ARE the correct local wall-clock values — no conversion
 * needed or wanted.
 */
export function localDateFromTimestamp(timestamp: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(timestamp)
  if (match) return match[1]
  return format(parseISO(timestamp), 'yyyy-MM-dd')
}

export function formatTime(timestamp: string): string {
  const match = /^\d{4}-\d{2}-\d{2}T(\d{2}:\d{2})/.exec(timestamp)
  if (match) return match[1]
  return format(parseISO(timestamp), 'HH:mm')
}

export function formatDayHeading(localDate: string): string {
  const d = parseISO(localDate)
  return format(d, 'EEEE, d MMMM')
}

export function formatShortDate(localDate: string): string {
  return format(parseISO(localDate), 'd MMM')
}

export function todayLocalDate(): string {
  return toLocalDate(new Date())
}

export function isToday(localDate: string): boolean {
  return isSameDay(parseISO(localDate), new Date())
}

export function shiftLocalDate(localDate: string, days: number): string {
  const d = days >= 0 ? addDays(parseISO(localDate), days) : subDays(parseISO(localDate), -days)
  return toLocalDate(d)
}

export function localDateRange(endLocalDate: string, days: number): string[] {
  const out: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    out.push(shiftLocalDate(endLocalDate, -i))
  }
  return out
}

export function minutesBetween(startIso: string, endIso: string): number {
  let mins = differenceInMinutes(parseISO(endIso), parseISO(startIso))
  // Sleep can cross midnight (bedtime 23:xx, wake 07:xx) — if negative,
  // assume wake happened the following calendar day.
  if (mins < 0) mins += 24 * 60
  return mins
}

export function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = Math.round(totalMinutes % 60)
  if (h <= 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function dayStart(localDate: string): Date {
  return startOfDay(parseISO(localDate))
}
