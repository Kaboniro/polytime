"use client";

import { Fragment, useState } from "react";
import GeoIcon from "@/components/GeoIcon";

const COLUMNS = [
  { key: "name", label: "Event", className: "w-[25%] min-w-[180px]" },
  { key: "dates", label: "Dates", className: "w-[17%]" },
  { key: "category", label: "Category", className: "w-[14%]" },
  { key: "geography", label: "Where", className: "w-[13%]" },
  { key: "software", label: "Software", className: "w-[13%]" },
  { key: "host", label: "Host", className: "w-[18%]" },
];

// A calm, readable table: soft row dividers instead of a black grid,
// normal-case headers, a gentle zebra and a crosshair hover (see LIT below). Running events get a soft
// "Live now" pill rather than a loud label.
function LiveNow() {
  return (
    <span className="mt-1.5 flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
      Live now
    </span>
  );
}

const cell = "px-4 py-3.5 align-top [overflow-wrap:anywhere] transition-colors duration-150";

// Crosshair highlight: pointing at (or tabbing into) a cell fills its row and
// column with the palette's sea green and the cell itself with the deeper
// shade, so you can follow both lines across the table. Everything inside a
// highlighted cell turns dark ink — the muted greys elsewhere in the table
// would be too faint on green (ink is 7:1 on go, 5.3:1 on go-hover).
const LIT = "bg-go text-ink [&_*]:!text-ink";
const LIT_CELL = "bg-go-hover text-ink [&_*]:!text-ink";

function Detail({ label, children }) {
  if (!children) return null;
  return (
    <div>
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="text-neutral-200">{children}</dd>
    </div>
  );
}

// The expanded details for one event, shown in a row under it.
function DetailsBody({ r }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <p className="whitespace-pre-line text-sm text-neutral-300">
          {r.description || <span className="text-neutral-500">No description provided.</span>}
        </p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Detail label="Type">{r.typeLabel}</Detail>
          <Detail label="Location">{r.location}</Detail>
          <Detail label="Starts">{r.start}</Detail>
          <Detail label="Ends">{r.end}</Detail>
          <Detail label="Deadline">{r.deadline}</Detail>
        </dl>
      </div>
      {r.url && (
        <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-orange-400 hover:underline">
          Visit event page ↗
        </a>
      )}
    </>
  );
}

// Rows arrive already shaped and formatted by the server page (see app/page.js)
// so only public fields cross into this client bundle, and dates are formatted
// once on the server: no client/server "is it past yet?" hydration drift.
export default function EventTable({ rows }) {
  const [open, setOpen] = useState(() => new Set());
  const [hover, setHover] = useState(null); // { row: event id, col: column index }

  // Props for one body cell: track the pointer/focus and pick its highlight.
  // `rest` is the class it has when not highlighted.
  function cellProps(rowId, col, base, rest = "") {
    const inRow = hover?.row === rowId;
    const inCol = hover?.col === col;
    const tone = inRow && inCol ? LIT_CELL : inRow || inCol ? LIT : rest;
    const enter = () => setHover({ row: rowId, col });
    return { onMouseEnter: enter, onFocus: enter, className: `${base} ${tone}` };
  }

  function toggle(id) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
    {/* Same table on every screen. Where it's wider than the screen it
        scrolls sideways (thin visible scrollbar), with the Event column
        pinned so you always know which row you're on. */}
    <p className="mb-2 text-xs text-neutral-500 lg:hidden">Swipe sideways for more columns →</p>
    <div className="overflow-x-auto rounded-2xl border border-neutral-800">
      <table
        onMouseLeave={() => setHover(null)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setHover(null);
        }}
        className="w-full min-w-[860px] table-fixed border-collapse text-sm [&>tbody>tr:last-child]:border-b-0"
      >
        <thead>
          <tr className="bg-neutral-900 text-left text-xs text-neutral-500">
            {COLUMNS.map((c, ci) => (
              <th
                key={c.key}
                scope="col"
                className={`border-b border-neutral-800 px-4 py-2.5 font-medium transition-colors duration-150 ${c.className} ${
                  c.key === "name" ? "sticky left-0 z-10 max-xl:shadow-[6px_0_8px_-4px_rgb(0_0_0_/_0.18)]" : ""
                } ${hover?.col === ci ? "bg-cerulean font-semibold text-white" : c.key === "name" ? "bg-inherit" : ""}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isOpen = open.has(r.id);
            const panelId = `event-details-${r.id}`;
            const running = r.phase === "running";
            return (
              <Fragment key={r.id}>
                <tr
                  className={`border-b border-neutral-800 ${i % 2 ? "bg-neutral-900" : "bg-neutral-950"} ${r.phase === "archived" ? "text-neutral-500" : "text-neutral-100"}`}
                >
                  <td {...cellProps(r.id, 0, `${cell} sticky left-0 z-10 font-medium max-xl:shadow-[6px_0_8px_-4px_rgb(0_0_0_/_0.18)]`, "bg-inherit")}>
                    <a href={r.href} className="hover:underline">{r.title}</a>
                    {running && <LiveNow />}
                    {r.phase === "archived" && <span className="sr-only"> (ended)</span>}
                  </td>
                  <td {...cellProps(r.id, 1, cell)}>
                    <div className={r.datesFixed ? "" : "text-neutral-500"}>{r.dates}</div>
                    {r.deadline && <div className="text-xs text-neutral-500">Deadline {r.deadline}</div>}
                  </td>
                  <td {...cellProps(r.id, 2, cell)}>{r.category}</td>
                  <td {...cellProps(r.id, 3, cell)}>
                    <GeoIcon info={r.geo} /> {r.geoLabel}
                  </td>
                  <td {...cellProps(r.id, 4, cell)}>{r.software || <span className="text-neutral-600">—</span>}</td>
                  <td {...cellProps(r.id, 5, cell)}>
                    <button
                      type="button"
                      onClick={() => toggle(r.id)}
                      aria-expanded={isOpen}
                      aria-controls={isOpen ? panelId : undefined}
                      className="inline-flex items-center gap-1.5 text-left text-neutral-200 underline-offset-2 hover:text-neutral-50 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500/60"
                    >
                      <svg
                        viewBox="0 0 12 12"
                        width="10"
                        height="10"
                        aria-hidden="true"
                        className={`shrink-0 text-neutral-500 transition-transform ${isOpen ? "rotate-90" : ""}`}
                      >
                        <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {r.host || "Details"}
                    </button>
                  </td>
                </tr>
                {isOpen && (
                  <tr id={panelId} className="border-b border-neutral-800 bg-neutral-900">
                    <td colSpan={COLUMNS.length} className="px-4 py-4">
                      <DetailsBody r={r} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
    </>
  );
}
