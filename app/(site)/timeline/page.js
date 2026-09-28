import GanttChart from "@/components/GanttChart";
import { EVENT_CATEGORIES, labelFor } from "@/lib/constants";
import { getApprovedEvents } from "@/lib/queries";
import { fmtDate } from "@/lib/dates";
import { eventPhase } from "@/lib/filters";
import { geographyIconInfo, geographyLabel } from "@/lib/geography";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Event calendar",
  description: "A month-by-month calendar of 3D art competitions, conferences and challenges, with ongoing and rolling contests listed alongside.",
  alternates: { canonical: "/timeline" },
};

const ONGOING_LABEL = { ongoing: "Ongoing challenge — no fixed date", rolling: "Rolling — recurring" };

// Shape a DB row for GanttChart, a client component — same reasoning as
// app/page.js's toTableRow: only public fields cross the server/client
// boundary, precomputed here rather than re-derived from raw data in the
// browser. `end` is the resolved end anchor (see below), not necessarily
// e.end_date itself.
function toGanttRow(e, end) {
  return {
    id: e.id,
    title: e.title,
    start: e.start_date,
    end,
    startLabel: fmtDate(e.start_date),
    endLabel: fmtDate(end),
    category: labelFor(EVENT_CATEGORIES, e.category),
    geo: geographyIconInfo(e.geography),
    geoLabel: geographyLabel(e.geography),
    host: e.host,
    description: e.description,
    url: e.url,
    phase: eventPhase(e),
  };
}

// Ongoing/rolling entries have no start or end date at all, so they can't be
// placed as a dated bar — GanttChart instead draws them as an always-on bar
// in every week it renders (see its `ongoingRows` prop).
function toOngoingRow(e) {
  return {
    id: e.id,
    title: e.title,
    kind: e.event_type,
    typeLabel: ONGOING_LABEL[e.event_type] || "No fixed date",
    dateLabel: ONGOING_LABEL[e.event_type] || "No fixed date",
    category: labelFor(EVENT_CATEGORIES, e.category),
    geo: geographyIconInfo(e.geography),
    geoLabel: geographyLabel(e.geography),
    host: e.host,
    description: e.description,
    url: e.url,
  };
}

export default function TimelinePage() {
  const approved = getApprovedEvents();

  // Every event with a start date gets a dated bar, even ones missing a
  // fixed end — a bar just needs *some* end anchor, not necessarily
  // event.end_date: fall back to the submission deadline (a real, meaningful
  // end for an entry window), then to the start date itself (a single-day
  // marker). Only events with no start date at all — ongoing/rolling
  // entries, genuinely open-ended — have nothing to anchor a dated bar to;
  // those go to GanttChart as `ongoingRows` instead, drawn as an always-on
  // lane rather than dropped from the calendar.
  const ganttRows = [];
  const ongoingRows = [];
  for (const e of approved) {
    if (!e.start_date) {
      ongoingRows.push(toOngoingRow(e));
      continue;
    }
    const end =
      e.end_date || (e.submission_deadline && e.submission_deadline >= e.start_date ? e.submission_deadline : e.start_date);
    ganttRows.push(toGanttRow(e, end));
  }
  ganttRows.sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div>
      <h1 className="sr-only">3D art event calendar</h1>

      <GanttChart rows={ganttRows} ongoingRows={ongoingRows} />
    </div>
  );
}
