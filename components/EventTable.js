"use client";

import { Fragment, useState } from "react";
import GeoIcon from "@/components/GeoIcon";

const COLUMNS = [
  { key: "name", label: "Event", className: "w-[26%]" },
  { key: "dates", label: "Dates", className: "w-[18%]" },
  { key: "category", label: "Category", className: "w-[15%]" },
  { key: "geography", label: "Where", className: "w-[15%]" },
  { key: "software", label: "Software", className: "w-[12%]" },
  { key: "host", label: "Host", className: "w-[14%]" },
];

// A calm, readable table: soft row dividers instead of a black grid,
// normal-case headers, a gentle zebra and hover. Running events get a soft
// "Live now" pill rather than a loud label.
function LiveNow() {
  return (
    <span className="mt-1.5 flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
      Live now
    </span>
  );
}

const cell = "px-4 py-3.5 align-top";

function Detail({ label, children }) {
  if (!children) return null;
  return (
    <div>
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="text-neutral-200">{children}</dd>
    </div>
  );
}

// Rows arrive already shaped and formatted by the server page (see app/page.js)
// so only public fields cross into this client bundle, and dates are formatted
// once on the server: no client/server "is it past yet?" hydration drift.
export default function EventTable({ rows }) {
  const [open, setOpen] = useState(() => new Set());

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
    <div className="overflow-x-auto rounded-2xl border border-neutral-800">
      <table className="w-full min-w-[860px] border-collapse text-sm [&>tbody>tr:last-child]:border-b-0">
        <thead>
          <tr className="bg-neutral-900 text-left text-xs text-neutral-500">
            {COLUMNS.map((c) => (
              <th key={c.key} scope="col" className={`border-b border-neutral-800 px-4 py-2.5 font-medium ${c.className}`}>
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
                  className={`border-b border-neutral-800 transition-colors hover:bg-neutral-900 ${i % 2 ? "bg-neutral-900/40" : "bg-neutral-950"} ${r.phase === "archived" ? "text-neutral-500" : "text-neutral-100"}`}
                >
                  <td className={`${cell} font-medium`}>
                    <a href={r.href} className="hover:underline">{r.title}</a>
                    {running && <LiveNow />}
                    {r.phase === "archived" && <span className="sr-only"> (ended)</span>}
                  </td>
                  <td className={cell}>
                    <div className={r.datesFixed ? "" : "text-neutral-500"}>{r.dates}</div>
                    {r.deadline && <div className="text-xs text-neutral-500">Deadline {r.deadline}</div>}
                  </td>
                  <td className={cell}>{r.category}</td>
                  <td className={cell}>
                    <GeoIcon info={r.geo} /> {r.geoLabel}
                  </td>
                  <td className={cell}>{r.software || <span className="text-neutral-600">—</span>}</td>
                  <td className={cell}>
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
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-sm text-orange-400 hover:underline"
                        >
                          Visit event page ↗
                        </a>
                      )}
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
