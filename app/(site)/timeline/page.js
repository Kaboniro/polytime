import GanttChart from "@/components/GanttChart";
import { EVENT_CATEGORIES, labelFor } from "@/lib/constants";
import { getApprovedEvents } from "@/lib/queries";
import { fmtDate } from "@/lib/dates";
import { eventPhase } from "@/lib/filters";
import { geographyIconInfo, geographyLabel } from "@/lib/geography";

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

export default function TimelinePage() {
  const approved = getApprovedEvents();

  // Every event with a start date gets a dated bar, even ones missing a
  // fixed end — a bar just needs *some* end anchor, not necessarily
  // event.end_date: fall back to the submission deadline (a real, meaningful
  // end for an entry window), then to the start date itself (a single-day
  // marker). Ongoing/rolling entries have no start date to place, so the
  // calendar leaves them out; they have their own tables on the home page.
  const ganttRows = [];
  for (const e of approved) {
    if (!e.start_date) continue;
    const end =
      e.end_date || (e.submission_deadline && e.submission_deadline >= e.start_date ? e.submission_deadline : e.start_date);
    ganttRows.push(toGanttRow(e, end));
  }
  ganttRows.sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div>
      <h1 className="sr-only">3D art event calendar</h1>

      <GanttChart rows={ganttRows} />
    </div>
  );
}
