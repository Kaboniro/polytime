"use client";

import { Fragment, useState } from "react";
import GeoIcon from "@/components/GeoIcon";

const COLUMNS = [
  { key: "name", label: "Name", className: "w-[26%]" },
  { key: "dates", label: "Dates", className: "w-[18%]" },
  { key: "category", label: "Category", className: "w-[15%]" },
  { key: "geography", label: "Geography", className: "w-[15%]" },
  { key: "software", label: "Software", className: "w-[12%]" },
  { key: "host", label: "Host", className: "w-[14%]" },
];

// Row backgrounds. Ordinary rows alternate plain / a faint left-to-right
// wash so records separate without hard stripes; running rows get a teal
// wash and a solid teal bar on the left edge instead of a "Running" tag.
const ROW_BG = {
  even: "none",
  odd: "linear-gradient(90deg, var(--color-neutral-950), var(--color-neutral-900))",
  running:
    "linear-gradient(90deg, color-mix(in oklch, var(--color-emerald-400) 24%, transparent), color-mix(in oklch, var(--color-emerald-400) 7%, transparent) 55%, transparent)",
};

const cell = "border-r border-neutral-50 px-2.5 py-3 align-top last:border-r-0";

function Detail({ label, children }) {
  if (!children) return null;
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</dt>
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

  const anyRunning = rows.some((r) => r.phase === "running");
  return (
    <>
    {anyRunning && (
      <p className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
        <span
          className="inline-block h-3 w-8 rounded-sm shadow-[inset_4px_0_0_var(--color-emerald-400)]"
          style={{ backgroundImage: ROW_BG.running }}
          aria-hidden="true"
        />
        Highlighted rows are running now.
      </p>
    )}
    <div className="overflow-x-auto rounded-2xl border-2 border-neutral-50">
      <table className="w-full min-w-[860px] border-collapse text-sm [&>tbody>tr:last-child]:border-b-0">
        <thead>
          <tr className="bg-neutral-950 text-left text-xs uppercase tracking-wide text-neutral-50">
            {COLUMNS.map((c) => (
              <th key={c.key} scope="col" className={`border-b-2 border-r border-neutral-50 px-2.5 py-2 font-semibold last:border-r-0 ${c.className}`}>
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
                  className={`border-b border-neutral-50 bg-neutral-950 hover:bg-neutral-900 ${r.phase === "archived" ? "text-neutral-500" : "text-neutral-100"}`}
                  style={{ backgroundImage: running ? ROW_BG.running : i % 2 ? ROW_BG.odd : ROW_BG.even }}
                >
                  <td className={`${cell} font-medium ${running ? "font-semibold shadow-[inset_5px_0_0_var(--color-emerald-400)]" : ""}`}>
                    <a href={r.href} className="hover:underline">{r.title}</a>
                    {running && <span className="sr-only"> (running now)</span>}
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
                      className="inline-flex items-center gap-1.5 text-left text-orange-400 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500/60"
                    >
                      <svg
                        viewBox="0 0 12 12"
                        width="10"
                        height="10"
                        aria-hidden="true"
                        className={`shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
                      >
                        <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {r.host || "Details"}
                    </button>
                  </td>
                </tr>
                {isOpen && (
                  <tr id={panelId} className="bg-orange-500/20">
                    <td colSpan={COLUMNS.length} className="px-3 py-3">
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
