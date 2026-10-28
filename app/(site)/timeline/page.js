import GanttChart from "@/components/GanttChart";
import TimelineSpotlight from "@/components/TimelineSpotlight";
import { EVENT_CATEGORIES, labelFor } from "@/lib/constants";
import { getApprovedEvents } from "@/lib/queries";
import { fmtDate, isPastDate } from "@/lib/dates";
import { effectiveEnd, eventPhase } from "@/lib/filters";
import { geographyIconInfo, geographyLabel } from "@/lib/geography";
import { googleCalendarUrl } from "@/lib/calendarLinks";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Event calendar",
  description: "A month-by-month calendar of 3D art competitions, conferences and challenges.",
  alternates: { canonical: "/timeline" },
};

// Shape a DB row for GanttChart, a client component — same reasoning as
// app/page.js's toTableRow: only public fields cross the server/client
// boundary, precomputed here rather than re-derived from raw data in the
// browser. `end` is the resolved end anchor (see below), not necessarily
// e.end_date itself.
function toGanttRow(e, end) {
  // "Add to Google Calendar" links for the details panel: one for the event's
  // dates, one for its submission deadline (often the date that matters most).
  const pageUrl = absoluteUrl(`/events/${e.id}`);
  const details = [e.description, e.url && `Event page: ${e.url}`, `On PolyTime: ${pageUrl}`].filter(Boolean).join("\n\n");
  const where = e.location && !/^(online|tba|see event page)$/i.test(e.location.trim()) ? e.location : "";
  return {
    gcal: googleCalendarUrl({ title: e.title, start: e.start_date, end, details, location: where }),
    gcalDeadline: e.submission_deadline
      ? googleCalendarUrl({ title: `Deadline: ${e.title}`, start: e.submission_deadline, details: `Last day to enter.\n\n${details}` })
      : null,
    id: e.id,
    title: e.title,
    start: e.start_date,
    end,
    startLabel: fmtDate(e.start_date),
    endLabel: fmtDate(end),
    deadline: e.submission_deadline || null,
    deadlineLabel: fmtDate(e.submission_deadline),
    category: labelFor(EVENT_CATEGORIES, e.category),
    geo: geographyIconInfo(e.geography),
    geoLabel: geographyLabel(e.geography),
    host: e.host,
    description: e.description,
    url: e.url,
    phase: eventPhase(e),
  };
}

// The newest approved event (by created_at, id as a tiebreaker), skipping
// ones already over — an archived event isn't worth spotlighting even if it
// was the last one added. Falls back to the whole set if everything's archived.
function pickNewest(events) {
  const eligible = events.filter((e) => eventPhase(e) !== "archived");
  const pool = eligible.length ? eligible : events;
  return pool.reduce((best, e) => {
    if (!best) return e;
    const a = e.created_at || "";
    const b = best.created_at || "";
    return a > b || (a === b && e.id > best.id) ? e : best;
  }, null);
}

// The event whose submission deadline is soonest, among those that haven't
// closed yet. Events with no deadline (or an already-past one) don't qualify.
function pickNextDeadline(events) {
  const upcoming = events.filter((e) => e.submission_deadline && !isPastDate(e.submission_deadline));
  if (upcoming.length === 0) return null;
  return upcoming.reduce((best, e) => (e.submission_deadline < best.submission_deadline ? e : best));
}

// The timeline's welcome popup: the event closing soonest (if any) and the
// most recently added event, merged into one card when they're the same
// event. Built here from data the page already fetched, so the client
// component only has to render it.
function spotlightItems(approved) {
  const nextDeadline = pickNextDeadline(approved);
  const newest = pickNewest(approved);
  const items = [];
  if (nextDeadline) {
    items.push({
      id: nextDeadline.id,
      kind: newest && newest.id === nextDeadline.id ? "both" : "deadline",
      title: nextDeadline.title,
      category: labelFor(EVENT_CATEGORIES, nextDeadline.category),
      meta: `Deadline ${fmtDate(nextDeadline.submission_deadline)}`,
    });
  }
  if (newest && (!nextDeadline || newest.id !== nextDeadline.id)) {
    items.push({
      id: newest.id,
      kind: "new",
      title: newest.title,
      category: labelFor(EVENT_CATEGORIES, newest.category),
      meta: newest.start_date ? `Starts ${fmtDate(newest.start_date)}` : null,
    });
  }
  return items;
}

export default function TimelinePage() {
  const approved = getApprovedEvents();

  // Every event with a start date gets a dated bar, running to its last date
  // (end, submission deadline or start — see effectiveEnd), the same date
  // that decides when it counts as archived. Ongoing/rolling entries have no
  // start date to place, so the calendar leaves them out; they have their own
  // tables on the home page.
  const ganttRows = [];
  for (const e of approved) {
    if (!e.start_date) continue;
    ganttRows.push(toGanttRow(e, effectiveEnd(e)));
  }
  ganttRows.sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div>
      <h1 className="sr-only">3D art event calendar</h1>

      <TimelineSpotlight items={spotlightItems(approved)} />
      <GanttChart rows={ganttRows} />
    </div>
  );
}
