import EventTable from "@/components/EventTable";
import { GridSection } from "@/components/EventGrid";
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

// The Timeline's tabs: one table at a time. `marker` matches each tab's colour
// square; `note` explains the two undated kinds.
const VIEWS = [
  { key: "dated", label: "Dated", marker: "bg-band" },
  { key: "ongoing", label: "Ongoing", marker: "bg-go", note: "Open-ended: no fixed dates, join any time." },
  { key: "rolling", label: "Rolling", marker: "bg-cerulean", note: "Recurring: a new round every week, month or season." },
];

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
  const variant = ["category", "type", "geography", "software", "date", "page", "view"].some((k) => sp?.[k]);
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

  // Three tabs: dated events (one-offs, conferences), ongoing and rolling.
  // The query returns start_date ascending (undated last), so each group stays
  // soonest-first. Dated order: running (most time-sensitive), upcoming, then
  // archived (most recently ended first).
  const rows = matching.map(toTableRow);
  const dated = rows.filter((r) => DATED_EVENT_TYPES.includes(r.type));
  const running = dated.filter((r) => r.phase === "running");
  const upcoming = dated.filter((r) => r.phase === "upcoming");
  const archived = dated.filter((r) => r.phase === "archived").reverse();
  const mainRows = [...running, ...upcoming, ...archived];
  const ongoing = rows.filter((r) => r.type === "ongoing");
  const rolling = rows.filter((r) => r.type === "rolling");

  const byView = { dated: mainRows, ongoing, rolling };

  // ?view= picks the tab. Without one, open the first tab that has anything,
  // so a filter like Type: Rolling doesn't land on an empty Dated tab.
  const asked = VIEWS.find((v) => v.key === sp?.view)?.key;
  const view = asked || VIEWS.find((v) => byView[v.key].length > 0)?.key || "dated";
  const viewRows = byView[view];
  const viewInfo = VIEWS.find((v) => v.key === view);

  const totalPages = Math.max(1, Math.ceil(viewRows.length / PAGE_SIZE));
  const page = Math.min(pageNum, totalPages);
  const pageRows = viewRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Plain serializable data, not a function — a Server Component can't hand
  // a function prop to Pagination (a Client Component) at all.
  const pageQuery = {};
  if (category !== "all") pageQuery.category = category;
  if (type !== "all") pageQuery.type = type;
  if (geography !== "all") pageQuery.geography = geography;
  if (software !== "all") pageQuery.software = software;
  if (date !== "all") pageQuery.date = date;
  const keep = view !== "dated" ? { view } : {};
  const viewHref = (key) => {
    const params = new URLSearchParams(pageQuery);
    if (key !== "dated") params.set("view", key);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  // Event markup for events that are live or coming up, on the unfiltered first page only.
  const structured =
    !pageQuery.category && !pageQuery.type && !pageQuery.geography && !pageQuery.software && !pageQuery.date && page === 1
      ? matching
          .filter((e) => ["running", "upcoming"].includes(eventPhase(e)) && e.start_date)
          .slice(0, 30)
          .map(eventJsonLd)
      : [];

  const filters = [
    { name: "category", label: "Category", allLabel: "All categories", options: EVENT_CATEGORIES, value: category },
    { name: "type", label: "Type", allLabel: "All types", options: TYPE_FILTER_OPTIONS, value: type },
    { name: "geography", label: "Where", allLabel: "Anywhere", options: geoOpts, value: geography },
    { name: "software", label: "Software", allLabel: "All software", options: softwareOpts, value: software },
    { name: "date", label: "Date", allLabel: "Current & upcoming", options: DATE_OPTIONS, value: date },
  ];
  const activeFilters = filters.filter((f) => f.value !== "all").length;

  return (
    <div>
      <JsonLd data={structured} />

      {/* Filters: a sticky sidebar from xl up (where it fits beside the table),
          folded into a "Filters" button above the list on smaller screens. */}
      <details className="mb-6 rounded-2xl border border-neutral-800 xl:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-neutral-50">
          <span>
            Filters
            {activeFilters > 0 && <span className="ml-2 font-normal text-neutral-500">{activeFilters} on</span>}
          </span>
          <span aria-hidden="true" className="text-neutral-500">▾</span>
        </summary>
        <div className="border-t border-neutral-800 px-4 py-4">
          <FilterBar basePath="/" filters={filters} keep={keep} vertical />
        </div>
      </details>

      <div className="xl:grid xl:grid-cols-[250px_minmax(0,1fr)] xl:gap-8">
        <aside className="hidden xl:block">
          <div className="sticky top-24 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
            <h2 className="mb-4 text-sm font-semibold text-neutral-50">Filters</h2>
            <FilterBar basePath="/" filters={filters} keep={keep} vertical />
          </div>
        </aside>

        <div className="min-w-0">

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
        <GridSection as="h1" title="Events" count={rows.length} marker={viewInfo.marker}>
          {/* Plain links, not client-side tabs: each tab is a real URL that
              keeps the current filters and can be shared or bookmarked. */}
          <nav aria-label="Event kinds" className="mb-4 flex flex-wrap gap-1 border-b border-neutral-800">
            {VIEWS.map((v) => {
              const active = v.key === view;
              return (
                <a
                  key={v.key}
                  href={viewHref(v.key)}
                  aria-current={active ? "page" : undefined}
                  className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm transition-colors ${
                    active
                      ? "border-neutral-50 font-bold text-neutral-50"
                      : "border-transparent font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-50"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-[2px] ${v.marker}`} aria-hidden="true" />
                  {v.label}
                  <span className="text-xs font-normal text-neutral-500">{byView[v.key].length}</span>
                </a>
              );
            })}
          </nav>
          {viewInfo.note && <p className="mb-3 text-xs text-neutral-500">{viewInfo.note}</p>}
          {viewRows.length === 0 ? (
            <EmptyState>No {viewInfo.label.toLowerCase()} events match these filters.</EmptyState>
          ) : (
            <>
              <EventTable rows={pageRows} />
              <Pagination page={page} totalPages={totalPages} basePath="/" query={{ ...pageQuery, ...keep }} />
            </>
          )}
        </GridSection>
      )}
        </div>
      </div>
    </div>
  );
}
