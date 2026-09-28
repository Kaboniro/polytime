import { format, isBefore, isValid, parseISO, startOfDay } from "date-fns";

export function fmtDate(iso) {
  if (!iso) return null;
  const d = parseISO(iso);
  if (!isValid(d)) return null;
  return format(d, "MMM d, yyyy");
}

// A date is only "past" once its whole day is over: an event ending today is
// still on today (parseISO gives local midnight, so a plain isPast() would
// flip it to ended at 00:00 on its last day).
export function isPastDate(iso) {
  if (!iso) return false;
  const d = parseISO(iso);
  if (!isValid(d)) return false;
  return isBefore(d, startOfDay(new Date()));
}

// The mirror of isPastDate, for the *other* end of a range: true once
// today has reached this date (today or earlier) — used to detect that an
// event has actually started, not just that it hasn't ended yet.
export function isTodayOrPast(iso) {
  if (!iso) return false;
  const d = parseISO(iso);
  if (!isValid(d)) return false;
  return !isBefore(startOfDay(new Date()), d);
}

// "Oct 21, 2026 – Oct 23, 2026", or a single date when there's no distinct end.
export function fmtDateRange(startIso, endIso) {
  const start = fmtDate(startIso);
  const end = fmtDate(endIso);
  if (start && end && start !== end) return `${start} – ${end}`;
  return start || end;
}
