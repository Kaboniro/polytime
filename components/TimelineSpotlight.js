"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Four site accent colors, each paired with the text color that already
// reads well on it elsewhere on the site (Badge/GanttChart's "today" marker
// use the same -ink/white pairings) — reused here instead of the Gantt
// categorical palette, which is reserved for telling calendar events apart.
const PALETTE = [
  { bg: "var(--color-band)", fg: "var(--color-ink)" },
  { bg: "var(--color-go)", fg: "var(--color-ink)" },
  { bg: "var(--color-cerulean)", fg: "#fff" },
  { bg: "var(--color-apricot)", fg: "var(--color-ink)" },
];

const KIND_LABEL = {
  both: "New & closing soon",
  new: "Just added",
  deadline: "Closing soon",
};

// Steps a counter in localStorage so the popup's accent color is different
// on every visit (not just the first) instead of picking randomly and
// risking the same color twice in a row.
function nextPaletteColor() {
  try {
    const i = Number(localStorage.getItem("pt_spotlight_i") || "0") % PALETTE.length;
    localStorage.setItem("pt_spotlight_i", String((i + 1) % PALETTE.length));
    return PALETTE[i];
  } catch {
    return PALETTE[Math.floor(Math.random() * PALETTE.length)];
  }
}

// A one-time-per-visit popup on the timeline surfacing whatever's most
// worth noticing right now: the event with the soonest open submission
// deadline, the most recently added event, or both when they're the same
// event. `items` is built server-side in timeline/page.js from data it
// already fetched.
export default function TimelineSpotlight({ items }) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(PALETTE[0]);
  const closeBtnRef = useRef(null);
  const hasItems = items && items.length > 0;
  // Strict Mode fires this effect twice on mount; without this guard that
  // would advance the localStorage color counter by two instead of one,
  // silently skipping half the palette every other visit in dev.
  const pickedColorRef = useRef(false);

  useEffect(() => {
    if (!hasItems) return;
    if (!pickedColorRef.current) {
      pickedColorRef.current = true;
      setColor(nextPaletteColor());
    }
    const t = setTimeout(() => setOpen(true), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasItems]);

  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open || !hasItems) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-[2px]"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="spotlight-title"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-[6px_6px_0_var(--color-neutral-100)] animate-[gantt-grow_280ms_ease-out_both] motion-reduce:animate-none"
        style={{ transformOrigin: "center" }}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4" style={{ backgroundColor: color.bg, color: color.fg }}>
          <div className="min-w-0">
            <p id="spotlight-title" className="text-xs font-bold uppercase tracking-wide">
              On the calendar
            </p>
            <p className="text-sm font-medium">What&apos;s new on the timeline</p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current/20 transition-colors hover:bg-black/10"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col divide-y divide-neutral-800 p-2">
          {items.map((it) => (
            <Link
              key={it.id}
              href={`/events/${it.id}`}
              onClick={() => setOpen(false)}
              className="flex flex-col gap-1 rounded-xl p-4 text-left transition-colors hover:bg-neutral-900"
            >
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: color.bg }}>
                {KIND_LABEL[it.kind]}
              </span>
              <span className="font-semibold text-neutral-50">{it.title}</span>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-400">
                {it.meta && <span>{it.meta}</span>}
                {it.category && <span>{it.category}</span>}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
