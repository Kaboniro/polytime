import { addDays, endOfMonth, isValid, parseISO, startOfDay } from "date-fns";
import { isPastDate, isTodayOrPast } from "@/lib/dates";
import { DATED_EVENT_TYPES } from "@/lib/constants";
import { parseGeography } from "@/lib/geography";

// Filter values arrive from the URL, so anything that isn't one of the known
// options (typo, stale bookmark, repeated ?param=) falls back to "all".
export function pickOption(value, options) {
  return options.some((o) => o.value === value) ? value : "all";
}

// "Ongoing" and "rolling" entries have no end, and events with no dates are
// treated the same way: they count as open for every date filter except "ended".
export const DATE_OPTIONS = [
  { value: "upcoming", label: "Upcoming & open" },
  { value: "30d", label: "Next 30 days" },
  { value: "month", label: "This month" },
  { value: "ended", label: "Ended" },
];

// One-off events and conferences (see DATED_EVENT_TYPES) move through three phases;
// ongoing/rolling entries have no dates to place on this axis at all, so
// they're outside it (null) — they get their own "Ongoing & rolling"
// treatment elsewhere instead. A single-day event (no end_date) uses its
// start date as its own end, same fallback hasEnded always used.
export function eventPhase(ev) {
  if (!DATED_EVENT_TYPES.includes(ev.event_type)) return null;
  if (!ev.start_date) return "upcoming"; // no date at all yet (TBA) — not archived
  if (isPastDate(ev.end_date || ev.start_date)) return "archived";
  if (isTodayOrPast(ev.start_date)) return "running";
  return "upcoming";
}

export function hasEnded(ev) {
  return eventPhase(ev) === "archived";
}

export function matchesDate(ev, key, now = new Date()) {
  if (key === "all") return true;
  const ended = hasEnded(ev);
  if (key === "ended") return ended;
  if (ended) return false;
  if (key === "upcoming") return true;

  const start = ev.start_date ? parseISO(ev.start_date) : null;
  if (!start || !isValid(start)) return true;
  const horizon = key === "30d" ? addDays(startOfDay(now), 30) : endOfMonth(now);
  return start <= horizon;
}

// Software is free text, comma-separated ("Blender, ZBrush"). "Any" means the
// event doesn't restrict software, so it matches every software filter and is
// never offered as a filter option itself.
const isAny = (s) => s.toLowerCase() === "any";

function splitSoftware(text) {
  return (text || "").split(",").map((s) => s.trim()).filter(Boolean);
}

export function softwareOptions(events) {
  const seen = new Map();
  for (const ev of events) {
    for (const name of splitSoftware(ev.software)) {
      const key = name.toLowerCase();
      if (!isAny(name) && !seen.has(key)) seen.set(key, name);
    }
  }
  return [...seen.values()]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ value: name, label: name }));
}

export function matchesSoftware(ev, selected) {
  if (selected === "all") return true;
  const names = splitSoftware(ev.software).map((s) => s.toLowerCase());
  return names.includes("any") || names.includes(selected.toLowerCase());
}

// Only the geography values actually in use among the given events, not the
// full ~200-country list — same reasoning as softwareOptions: a filter
// dropdown should only offer choices that would return something. Like every
// <select>'s options in this app, a country's label is its plain name with
// no flag prefix — an <option> can't render a flag image, only text (see
// lib/geography.js's geographyIconInfo for where the real flag shows up).
export function geographyFilterOptions(events) {
  const seen = new Map();
  for (const ev of events) {
    const value = ev.geography || "international";
    if (seen.has(value)) continue;
    const g = parseGeography(value);
    seen.set(value, g.scope === "country" ? g.label : `${g.icon} ${g.label}`);
  }
  return [...seen.entries()]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([value, label]) => ({ value, label }));
}

export function matchesGeography(ev, selected) {
  return selected === "all" || (ev.geography || "international") === selected;
}
