import EventTable from "@/components/EventTable";
import JsonLd from "@/components/JsonLd";
import { eventJsonLd } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import FilterBar from "@/components/FilterBar";
import Pagination from "@/components/Pagination";
import { EmptyState } from "@/components/polytime-ui";
import { DATED_EVENT_TYPES, EVENT_CATEGORIES, EVENT_TYPES, TYPE_FILTER_OPTIONS, labelFor } from "@/lib/constants";
import { getApprovedEvents } from "@/lib/queries";
import { fmtDate, fmtDateRange } from "@/lib/dates";
import {
  DATE_OPTIONS,
  eventPhase,
  geographyFilterOptions,
  hasEnded,
  matchesDate,
  matchesGeography,
  matchesSoftware,
  pickOption,
  softwareOptions,
} from "@/lib/filters";
import { geographyIconInfo, geographyLabel } from "@/lib/geography";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const TYPE_SHORT = { ongoing: "Ongoing", rolling: "Rolling" };

// Shape a DB row into exactly what the table needs. This runs on the server on
// purpose: EventTable is a client component, so anything passed to it is sent
// to the browser, and event rows carry submitter emails and notes that must
// never leave the server.
function toTableRow(e) {
  const range = fmtDateRange(e.start_date, e.end_date);
  return {
    id: e.id,
    href: `/events/${e.id}`,
    type: e.event_type,
    title: e.title,
    dates: range || TYPE_SHORT[e.event_type] || "TBA",
    datesFixed: Boolean(range),
    start: fmtDate(e.start_date),
    end: fmtDate(e.end_date),
    deadline: fmtDate(e.submission_deadline),
    category: labelFor(EVENT_CATEGORIES, e.category),
    software: e.software,
    geo: geographyIconInfo(e.geography),
    geoLabel: geographyLabel(e.geography),
    host: e.host,
    typeLabel: labelFor(EVENT_TYPES, e.event_type),
    location: e.location,
    description: e.description,
    url: e.url,
    phase: eventPhase(e),
  };
}

// Filtered and paginated views are the same content re-sliced; only the
// unfiltered page should rank, so the rest point at it and stay out of the index.
export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const variant = ["category", "type", "geography", "software", "date", "page"].some((k) => sp?.[k]);
  return {
    title: { absolute: `${SITE_NAME} — 3D art events, competitions & challenges` },
    description: SITE_DESCRIPTION,
    alternates: { canonical: "/" },
    ...(variant ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function HomePage({ searchParams }) {
  const sp = await searchParams;

  // Filter in JS rather than SQL: the dataset is small, and the software
  // options need every approved event anyway.
  const everything = getApprovedEvents();
  const softwareOpts = softwareOptions(everything);
  const geoOpts = geographyFilterOptions(everything);
  const category = pickOption(sp?.category, EVENT_CATEGORIES);
  const software = pickOption(sp?.software, softwareOpts);
  const geography = pickOption(sp?.geography, geoOpts);
  const date = pickOption(sp?.date, DATE_OPTIONS);
  const type = pickOption(sp?.type, TYPE_FILTER_OPTIONS);
  const pageNum = Math.max(1, parseInt(sp?.page, 10) || 1);

  const matching = everything.filter(
    (e) =>
      (category === "all" || e.category === category) &&
      (type === "all" || e.event_type === type) &&
      matchesSoftware(e, software) &&
      matchesGeography(e, geography) &&
      matchesDate(e, date) &&
      // Archived events only appear when the Date filter is set (to "Ended").
      (date !== "all" || !hasEnded(e))
  );

  // The query returns start_date ascending (undated last), so each group below
  // stays soonest-first. Order: running (happening right now — most
  // time-sensitive), then upcoming, then ongoing/rolling, then archived
  // (most recently ended first).
  const rows = matching.map(toTableRow);
  const running = rows.filter((r) => r.phase === "running");
  const upcoming = rows.filter((r) => r.phase === "upcoming");
  const undated = rows.filter((r) => !DATED_EVENT_TYPES.includes(r.type));
  const archived = rows.filter((r) => r.phase === "archived").reverse();
  const allRows = [...running, ...upcoming, ...undated, ...archived];

  const totalPages = Math.max(1, Math.ceil(allRows.length / PAGE_SIZE));
  const page = Math.min(pageNum, totalPages);
  const tableRows = allRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Plain serializable data, not a function — a Server Component can't hand
  // a function prop to Pagination (a Client Component) at all.
  const pageQuery = {};
  if (category !== "all") pageQuery.category = category;
  if (type !== "all") pageQuery.type = type;
  if (geography !== "all") pageQuery.geography = geography;
  if (software !== "all") pageQuery.software = software;
  if (date !== "all") pageQuery.date = date;

  // Event markup for events that are live or coming up, on the unfiltered first page only.
  const structured =
    !pageQuery.category && !pageQuery.type && !pageQuery.geography && !pageQuery.software && !pageQuery.date && page === 1
      ? matching
          .filter((e) => ["running", "upcoming"].includes(eventPhase(e)) && e.start_date)
          .slice(0, 30)
          .map(eventJsonLd)
      : [];

  return (
    <div>
      <JsonLd data={structured} />
      <div className="mb-4">
        <h1 className="text-xl font-bold text-neutral-50">3D Art Events</h1>
      </div>

      <FilterBar
        basePath="/"
        filters={[
          { name: "category", label: "Category", allLabel: "All categories", options: EVENT_CATEGORIES, value: category },
          { name: "type", label: "Type", allLabel: "All types", options: TYPE_FILTER_OPTIONS, value: type },
          { name: "geography", label: "Geography", allLabel: "Anywhere", options: geoOpts, value: geography },
          { name: "software", label: "Software", allLabel: "All software", options: softwareOpts, value: software },
          { name: "date", label: "Date", allLabel: "Current & upcoming", options: DATE_OPTIONS, value: date },
        ]}
      />

      {allRows.length === 0 ? (
        <EmptyState>
          {everything.length === 0 ? (
            <>
              Nothing approved here yet.{" "}
              <a href="/submit" className="text-orange-400 hover:underline">
                Be the first to submit one.
              </a>
            </>
          ) : (
            <>
              No events match these filters.{" "}
              <a href="/" className="text-orange-400 hover:underline">
                Clear filters
              </a>
            </>
          )}
        </EmptyState>
      ) : (
        <>
          <EventTable rows={tableRows} />
          <Pagination page={page} totalPages={totalPages} basePath="/" query={pageQuery} />
        </>
      )}
    </div>
  );
}
