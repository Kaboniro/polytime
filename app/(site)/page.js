import EventTable from "@/components/EventTable";
import { CompactEventTable, GridSection } from "@/components/EventGrid";
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

// Shape a DB row into exactly what the tables need. This runs on the server on
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

  // Three tables: dated events (one-offs, conferences) in the main one,
  // ongoing and rolling entries in their own small tables. The query returns
  // start_date ascending (undated last), so each group stays soonest-first.
  // Main table order: running (most time-sensitive), upcoming, then archived
  // (most recently ended first). Only the main table is paginated; the other
  // two are short lists.
  const rows = matching.map(toTableRow);
  const dated = rows.filter((r) => DATED_EVENT_TYPES.includes(r.type));
  const running = dated.filter((r) => r.phase === "running");
  const upcoming = dated.filter((r) => r.phase === "upcoming");
  const archived = dated.filter((r) => r.phase === "archived").reverse();
  const mainRows = [...running, ...upcoming, ...archived];
  const ongoing = rows.filter((r) => r.type === "ongoing");
  const rolling = rows.filter((r) => r.type === "rolling");

  const totalPages = Math.max(1, Math.ceil(mainRows.length / PAGE_SIZE));
  const page = Math.min(pageNum, totalPages);
  const pageRows = mainRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
      <h1 className="sr-only">3D Art Events</h1>
      <p className="mb-6 text-base text-neutral-400">Find 3D art contests, challenges and events from around the world.</p>

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

      {rows.length === 0 ? (
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
        <div className="flex flex-col gap-10">
          {mainRows.length > 0 && (
            <GridSection title="Events" count={mainRows.length}>
              <EventTable rows={pageRows} />
              <Pagination page={page} totalPages={totalPages} basePath="/" query={pageQuery} />
            </GridSection>
          )}

          {(ongoing.length > 0 || rolling.length > 0) && (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-8">
              {ongoing.length > 0 && (
                <GridSection title="Ongoing" count={ongoing.length} note="Open-ended: no fixed dates, join any time.">
                  <CompactEventTable rows={ongoing} />
                </GridSection>
              )}
              {rolling.length > 0 && (
                <GridSection title="Rolling" count={rolling.length} note="Recurring: a new round every week, month or season.">
                  <CompactEventTable rows={rolling} />
                </GridSection>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
