"use client";

import { useId, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import GeoIcon from "@/components/GeoIcon";

const selectClass =
  " border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 disabled:opacity-50";

// How many choices a checkbox list shows before "Show all".
const SHORT_LIST = 6;

// The filters. The selection lives in the URL (?category=x&date=y) so a
// filtered view is a real shareable/bookmarkable link, and the server page
// does the actual filtering.
//
// filters: [{ name, label, kind, allLabel, options: [{ value, label, icon? }], value }]
// `kind`: "select" (default) a dropdown with an "all" choice; "radio" one
// choice shown as radio buttons, `allLabel` being the first; "checkbox" any
// number of choices, `value` an array, sent as "a,b" in the URL (nothing
// ticked means no filter). An option's `icon` (geographyIconInfo) shows its
// flag beside the checkbox.
// `vertical`: the sidebar layout (the Timeline page), with a count of active
// filters and a Clear-all link at the bottom; dropdowns only otherwise.
// `keep`: other URL params to carry over when a filter changes (the Timeline's
// current tab), as plain strings.
export default function FilterBar({ basePath, filters, vertical = false, keep = {} }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  // Radio groups need a name unique to this copy of the filters: the Timeline
  // renders two (phone drawer and desktop sidebar), and a shared name would
  // make the browser treat both copies as one group.
  const uid = useId();

  const current = Object.fromEntries(filters.map((f) => [f.name, f.value ?? (f.kind === "checkbox" ? [] : "all")]));
  // Show the picked value immediately instead of snapping back to the old one
  // while the server renders the filtered page.
  const [selected, setSelected] = useOptimistic(current);
  const isActive = (f) => (f.kind === "checkbox" ? selected[f.name].length > 0 : selected[f.name] !== "all");

  function change(name, value) {
    const next = { ...selected, [name]: value };
    const params = new URLSearchParams(keep);
    for (const f of filters) {
      const v = next[f.name];
      if (Array.isArray(v) ? v.length : v !== "all") params.set(f.name, Array.isArray(v) ? v.join(",") : v);
    }
    const qs = params.toString();
    startTransition(() => {
      setSelected(next);
      router.push(qs ? `${basePath}?${qs}` : basePath);
    });
  }

  function toggle(name, value) {
    const list = selected[name];
    change(name, list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const activeCount = filters.filter(isActive).length;
  const anyActive = activeCount > 0;

  if (vertical) {
    return (
      <div className="flex flex-col gap-5">
        {filters.map((f) =>
          f.kind === "checkbox" ? (
            <CheckboxGroup key={f.name} f={f} chosen={selected[f.name]} onToggle={(v) => toggle(f.name, v)} onClear={() => change(f.name, [])} />
          ) : f.kind === "radio" ? (
            <fieldset key={f.name}>
              <legend className="mb-2 text-xs font-semibold text-neutral-500">{f.label}</legend>
              <div className="flex flex-col gap-1.5">
                {[{ value: "all", label: f.allLabel }, ...f.options].map((o) => (
                  <label key={o.value} className={choiceClass}>
                    <input
                      type="radio"
                      name={`${uid}-${f.name}`}
                      value={o.value}
                      checked={selected[f.name] === o.value}
                      onChange={() => change(f.name, o.value)}
                      className="h-4 w-4 shrink-0 accent-go"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <label key={f.name} className="block">
              <span className="mb-1 block text-xs font-semibold text-neutral-500">{f.label}</span>
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
          )
        )}
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

const choiceClass = "flex cursor-pointer items-center gap-2.5 text-sm text-neutral-200 hover:text-neutral-50";

// A checkbox list that shows the first few choices and a "Show all" link.
// It opens already expanded when a ticked choice would otherwise be hidden.
function CheckboxGroup({ f, chosen, onToggle, onClear }) {
  const hiddenPicked = f.options.slice(SHORT_LIST).some((o) => chosen.includes(o.value));
  const [expanded, setExpanded] = useState(hiddenPicked);
  const long = f.options.length > SHORT_LIST;
  const shown = long && !expanded && !hiddenPicked ? f.options.slice(0, SHORT_LIST) : f.options;

  return (
    <fieldset>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <legend className="text-xs font-semibold text-neutral-500">{f.label}</legend>
        {chosen.length > 0 && (
          <button type="button" onClick={onClear} className="text-xs text-orange-400 hover:underline">
            Clear
          </button>
        )}
      </div>
      {f.options.length === 0 ? (
        <p className="text-sm text-neutral-500">None yet</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {shown.map((o) => (
            <label key={o.value} className={choiceClass}>
              <input
                type="checkbox"
                value={o.value}
                checked={chosen.includes(o.value)}
                onChange={() => onToggle(o.value)}
                className="h-4 w-4 shrink-0 accent-go"
              />
              {o.icon && <GeoIcon info={o.icon} />}
              <span className="min-w-0">{o.label}</span>
            </label>
          ))}
          {long && !hiddenPicked && (
            <button
              type="button"
              onClick={() => setExpanded((x) => !x)}
              aria-expanded={expanded}
              className="mt-0.5 w-fit text-sm font-medium text-orange-400 hover:underline"
            >
              {expanded ? "Show fewer" : `Show all ${f.options.length}`}
            </button>
          )}
        </div>
      )}
    </fieldset>
  );
}
