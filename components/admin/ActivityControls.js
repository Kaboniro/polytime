"use client";

import { pageLabel } from "@/components/admin/activityFormat";

const RANGES = [
  ["7d", "7 days"],
  ["30d", "30 days"],
  ["90d", "90 days"],
  ["365d", "1 year"],
  ["all", "All time"],
];

const EXPORTS = [
  ["views", "csv", "Raw page views (CSV)"],
  ["daily", "csv", "Daily totals (CSV)"],
  ["pages", "csv", "Pages (CSV)"],
  ["countries", "csv", "Countries (CSV)"],
  ["flows", "csv", "Navigation paths (CSV)"],
  ["report", "json", "Full report (JSON)"],
];

// Range tabs, a per-page filter, and the export menu. Everything is expressed
// in the URL (?range=&page=), so views are linkable and the exports below use
// exactly what is on screen.
export default function ActivityControls({ range, page, pages }) {
  const qs = (next) => {
    const p = new URLSearchParams();
    const r = next.range ?? range;
    const pg = "page" in next ? next.page : page;
    if (r !== "30d") p.set("range", r);
    if (pg) p.set("page", pg);
    const s = p.toString();
    return `/admin/activity${s ? "?" + s : ""}`;
  };
  const exportHref = (type, format) => {
    const p = new URLSearchParams({ type, format, range });
    if (page) p.set("page", page);
    return `/api/admin/activity/export?${p}`;
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <nav className="flex flex-wrap gap-1 rounded-full border border-neutral-800 p-1" aria-label="Date range">
        {RANGES.map(([value, label]) => (
          <a
            key={value}
            href={qs({ range: value })}
            aria-current={range === value ? "page" : undefined}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              range === value ? "bg-orange-500 text-black" : "text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            {label}
          </a>
        ))}
      </nav>

      <label className="flex items-center gap-2 text-xs text-neutral-400">
        Page
        <select
          value={page || ""}
          onChange={(e) => (window.location.href = qs({ page: e.target.value || null }))}
          className="rounded-xl border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-100"
        >
          <option value="">All pages</option>
          {pages.map((p) => (
            <option key={p} value={p}>
              {pageLabel(p)}
            </option>
          ))}
        </select>
      </label>

      <details className="relative ml-auto">
        <summary className="cursor-pointer list-none rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-800">
          Export ▾
        </summary>
        <ul className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-neutral-700 bg-neutral-950 p-1 shadow-lg">
          {EXPORTS.map(([type, format, label]) => (
            <li key={type}>
              <a href={exportHref(type, format)} download className="block rounded-lg px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
