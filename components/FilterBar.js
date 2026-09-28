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
export default function FilterBar({ basePath, filters }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const current = Object.fromEntries(filters.map((f) => [f.name, f.value || "all"]));
  // Show the picked value immediately instead of snapping back to the old one
  // while the server renders the filtered page.
  const [selected, setSelected] = useOptimistic(current);

  function change(name, value) {
    const next = { ...selected, [name]: value };
    const params = new URLSearchParams();
    for (const f of filters) {
      if (next[f.name] !== "all") params.set(f.name, next[f.name]);
    }
    const qs = params.toString();
    startTransition(() => {
      setSelected(next);
      router.push(qs ? `${basePath}?${qs}` : basePath);
    });
  }

  const anyActive = filters.some((f) => selected[f.name] !== "all");

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
