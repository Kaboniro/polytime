"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";

const selectClass =
  " border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 disabled:opacity-50";

// One dropdown per filter. The selection lives in the URL (?category=x&date=y)
// so a filtered view is a real shareable/bookmarkable link, and the server page
// does the actual filtering.
//
// filters: [{ name, label, allLabel, options: [{ value, label }], value }]
// `vertical`: stacked full-width dropdowns for a sidebar (the Timeline page),
// with a count of active filters and a Clear-all link at the bottom.
// `keep`: other URL params to carry over when a filter changes (the Timeline's
// current tab), as plain strings.
export default function FilterBar({ basePath, filters, vertical = false, keep = {} }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const current = Object.fromEntries(filters.map((f) => [f.name, f.value || "all"]));
  // Show the picked value immediately instead of snapping back to the old one
  // while the server renders the filtered page.
  const [selected, setSelected] = useOptimistic(current);

  function change(name, value) {
    const next = { ...selected, [name]: value };
    const params = new URLSearchParams(keep);
    for (const f of filters) {
      if (next[f.name] !== "all") params.set(f.name, next[f.name]);
    }
    const qs = params.toString();
    startTransition(() => {
      setSelected(next);
      router.push(qs ? `${basePath}?${qs}` : basePath);
    });
  }

  const activeCount = filters.filter((f) => selected[f.name] !== "all").length;
  const anyActive = activeCount > 0;

  if (vertical) {
    return (
      <div className="flex flex-col gap-4">
        {filters.map((f) => (
          <label key={f.name} className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-500">{f.label}</span>
            <select
              className={`${selectClass} w-full`}
              value={selected[f.name]}
              disabled={f.options.length === 0}
              onChange={(e) => change(f.name, e.target.value)}
            >
              <option value="all">{f.allLabel}</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ))}
        {anyActive && (
          <a href={basePath} className="mt-1 text-sm font-medium text-orange-400 hover:underline">
            Clear all filters ({activeCount})
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      {filters.map((f) => (
        <label key={f.name} className="block">
          <span className="block text-xs text-neutral-500 mb-1">{f.label}</span>
          <select
            className={`${selectClass} min-w-40`}
            value={selected[f.name]}
            disabled={f.options.length === 0}
            onChange={(e) => change(f.name, e.target.value)}
          >
            <option value="all">{f.allLabel}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      {anyActive && (
        <a href={basePath} className="pb-2 text-sm text-orange-400 hover:underline">
          Clear filters
        </a>
      )}
    </div>
  );
}
