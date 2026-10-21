"use client";

import { useEffect, useId, useRef, useState } from "react";

// The submit form's location field: an Online / In person switch, and for in
// person a city search with suggestions from /api/places (a local GeoNames
// list searched on our own server). `value` is the stored string: "online", or a place such as
// "Berlin, Germany". Typing without picking a suggestion still works — the
// text is kept as-is, so an unlisted venue or a search outage never blocks a
// submission.
export default function LocationPicker({ value, onChange, inputClass }) {
  const online = value === "online";
  const [query, setQuery] = useState(online ? "" : value);
  const [places, setPlaces] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState(null); // null | "loading" | error text
  const listId = useId();
  const picked = useRef(null); // label just chosen, so it doesn't re-trigger a search

  useEffect(() => {
    const q = query.trim();
    if (online || q.length < 2 || q === picked.current) {
      setPlaces([]);
      setStatus(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setStatus("loading");
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setPlaces(data.places);
        setActive(-1);
        setStatus(null);
        setOpen(true);
      } catch (err) {
        if (err.name === "AbortError") return;
        setPlaces([]);
        setStatus(err.message || "Place search is unavailable; type the city instead.");
      }
    }, 150);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, online]);

  function choose(p) {
    picked.current = p.label;
    setQuery(p.label);
    onChange(p.label);
    setOpen(false);
    setPlaces([]);
  }

  function onKeyDown(e) {
    if (!open || places.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % places.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? places.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault(); // pick the suggestion, don't submit the form
      choose(places[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const modeBtn = (on) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
      on ? "bg-neutral-50 text-neutral-950" : "border border-neutral-800 text-neutral-300 hover:bg-neutral-900"
    }`;

  return (
    <div className="space-y-2">
      <div className="flex gap-2" role="group" aria-label="Online or in person">
        <button type="button" aria-pressed={online} className={modeBtn(online)} onClick={() => onChange("online")}>
          Online
        </button>
        <button
          type="button"
          aria-pressed={!online}
          className={modeBtn(!online)}
          onClick={() => onChange(query.trim() || "")}
        >
          In person
        </button>
      </div>

      {!online && (
        <div className="relative">
          <input
            role="combobox"
            aria-expanded={open && places.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            className={inputClass}
            value={query}
            placeholder="Search for a city, e.g. Berlin"
            autoComplete="off"
            onChange={(e) => {
              picked.current = null;
              setQuery(e.target.value);
              onChange(e.target.value);
            }}
            onKeyDown={onKeyDown}
            onFocus={() => places.length > 0 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
          />
          {open && places.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-neutral-800 bg-neutral-950 py-1 shadow-[4px_4px_0_var(--color-neutral-50)]"
            >
              {places.map((p, i) => (
                <li
                  key={p.label + p.hint}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => {
                    e.preventDefault(); // keep focus so blur doesn't close first
                    choose(p);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={`cursor-pointer px-3 py-2 text-sm ${i === active ? "bg-neutral-900" : ""}`}
                >
                  <span className="text-neutral-50">{p.label}</span>
                  {p.hint && <span className="ml-2 text-xs text-neutral-500">{p.hint}</span>}
                </li>
              ))}
            </ul>
          )}
          {status && status !== "loading" && <p className="mt-1 text-xs text-neutral-500">{status}</p>}
          <p className="mt-1 text-[11px] text-neutral-500">
            Place data © GeoNames (CC BY 4.0). Not listed? Just type it.
          </p>
        </div>
      )}
    </div>
  );
}
