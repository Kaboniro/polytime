"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import GeoIcon from "@/components/GeoIcon";
import Badge from "@/components/Badge";
import { EmptyState } from "@/components/polytime-ui";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DATE_ROW_H = 22; // px, space reserved for the date-number line at the top of each day cell
const LANE_H = 20; // px, one stacked event bar's height
const LANE_GAP = 3; // px, vertical gap between stacked bars in the same week
// Every event gets its own color, stable for that event: the hue steps around
// the wheel by the golden angle per id (137.5 degrees), so consecutive ids are
// always far apart and no two events share a hue until the wheel is full.
// Lightness cycles through three steps so near hues still differ. All are
// light enough for the dark label on the bar (contrast 8:1 or better).
const GOLDEN_ANGLE = 137.508;
const LIGHTNESS = [0.76, 0.7, 0.82];
// An archived (finished) event keeps its own hue but is washed out and hatched
// with diagonal stripes, with a dashed border and a grey label,
// so it reads as "over" at a glance without losing which event it is.
function colorVars(id, archived = false) {
  const n = Math.abs(Number(id)) || 0;
  const hue = (n * GOLDEN_ANGLE) % 360;
  const light = LIGHTNESS[n % LIGHTNESS.length];
  if (archived) {
    return {
      backgroundColor: `oklch(0.9 0.035 ${hue.toFixed(1)})`,
      backgroundImage: `repeating-linear-gradient(135deg, oklch(0.78 0.06 ${hue.toFixed(1)} / 0.55) 0 2px, transparent 2px 6px)`,
      color: "#555",
      borderStyle: "dashed",
      borderColor: `oklch(0.65 0.08 ${hue.toFixed(1)})`,
    };
  }
  return { backgroundColor: `oklch(${light} 0.13 ${hue.toFixed(1)})`, color: "#000" };
}

function chunk7(days) {
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

// Greedy interval-graph coloring: each event gets the first lane whose last
// occupant ends before this one starts, so overlapping events stack into
// separate rows instead of drawing on top of each other.
function layoutWeek(weekStart, weekEnd, rows) {
  const segs = [];
  for (const r of rows) {
    const s = parseISO(r.start);
    const e = parseISO(r.end);
    if (e < weekStart || s > weekEnd) continue;
    segs.push({
      row: r,
      startCol: Math.max(0, differenceInCalendarDays(s, weekStart)),
      endCol: Math.min(6, differenceInCalendarDays(e, weekStart)),
    });
  }
  segs.sort((a, b) => a.startCol - b.startCol || b.endCol - b.startCol - (a.endCol - a.startCol));
  const laneEnds = [];
  for (const seg of segs) {
    let lane = laneEnds.findIndex((end) => end < seg.startCol);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(seg.endCol);
    } else {
      laneEnds[lane] = seg.endCol;
    }
    seg.lane = lane;
  }
  return { segs, lanes: laneEnds.length };
}

export default function GanttChart({ rows, ongoingRows = [] }) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedId, setSelectedId] = useState(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!selectedId) return;
    closeBtnRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedId]);

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
    let order = 0;
    return chunk7(days).map((weekDays) => {
      const { segs, lanes } = layoutWeek(weekDays[0], weekDays[6], rows);
      segs.forEach((s) => {
        s.order = order++;
      });
      return { days: weekDays, segs, lanes };
    });
  }, [rows, currentMonth]);

  const monthKey = format(currentMonth, "yyyy-MM");
  const allRows = useMemo(() => [...rows, ...ongoingRows], [rows, ongoingRows]);
  const selected = selectedId ? allRows.find((r) => r.id === selectedId) : null;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-neutral-100">{format(currentMonth, "MMMM yyyy")}</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              aria-label="Previous month"
              className="rounded-lg border border-neutral-700 px-2.5 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-neutral-800"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth(startOfMonth(new Date()))}
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-neutral-800"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              aria-label="Next month"
              className="rounded-lg border border-neutral-700 px-2.5 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-neutral-800"
            >
              ›
            </button>
          </div>
        </div>

        <p className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
          <span
            className="inline-block h-3 w-8 rounded-sm border border-dashed"
            style={{ ...colorVars(0, true), borderWidth: 1 }}
            aria-hidden="true"
          />
          Hatched, faded bars are archived: the event has already finished.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-neutral-700">
          <div
            className="flex min-w-[640px] flex-col"
            style={{
              height: "60vh",
              minHeight: 30 + weeks.reduce((sum, w) => sum + DATE_ROW_H + Math.max(w.lanes, 1) * (LANE_H + LANE_GAP) + 4, 0),
            }}
          >
            <div className="grid shrink-0 grid-cols-7 border-b border-neutral-700 bg-black text-center text-[11px] font-semibold uppercase tracking-wide text-white">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-1.5">
                  {d}
                </div>
              ))}
            </div>

            {weeks.map((week, wi) => {
            const rowH = DATE_ROW_H + Math.max(week.lanes, 1) * (LANE_H + LANE_GAP) + 4;
            return (
              <div
                key={wi}
                className="relative border-b border-neutral-800 last:border-b-0"
                style={{ flex: "1 1 0", minHeight: rowH }}
              >
                <div className="absolute inset-0 grid grid-cols-7">
                  {week.days.map((day) => {
                    const inMonth = isSameMonth(day, currentMonth);
                    const today = isToday(day);
                    return (
                      <div
                        key={day.toISOString()}
                        className="border-r border-neutral-800 px-1.5 pt-1 text-xs last:border-r-0"
                      >
                        <span
                          className={
                            today
                              ? "inline-flex h-5 w-5 items-center justify-center bg-orange-500 font-semibold text-black"
                              : inMonth
                                ? "text-neutral-400"
                                : "text-neutral-700"
                          }
                        >
                          {format(day, "d")}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pointer-events-none absolute inset-x-0" style={{ top: DATE_ROW_H }}>
                  {week.segs.map((seg) => (
                    <button
                      key={`${monthKey}-${wi}-${seg.row.id}`}
                      type="button"
                      onClick={() => setSelectedId((id) => (id === seg.row.id ? null : seg.row.id))}
                      title={
                        seg.row.phase === "archived"
                          ? `${seg.row.title} (Archived)`
                          : seg.row.phase === "running"
                            ? `${seg.row.title} (Running)`
                            : seg.row.title
                      }
                      aria-current={selectedId === seg.row.id ? "true" : undefined}
                      className={`pointer-events-auto absolute flex items-center overflow-hidden border border-black/15 px-1.5 text-[11px] font-medium transition-all ease-out hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-orange-500/70 motion-reduce:animate-none ${
                        selectedId === seg.row.id ? "outline outline-2 outline-offset-1" : ""
                      } animate-[gantt-grow_420ms_ease-out_both]`}
                      style={{
                        left: `calc(${(seg.startCol / 7) * 100}% + 2px)`,
                        width: `calc(${((seg.endCol - seg.startCol + 1) / 7) * 100}% - 4px)`,
                        top: seg.lane * (LANE_H + LANE_GAP),
                        height: LANE_H,
                        transformOrigin: "left center",
                        animationDelay: `${Math.min(seg.order * 30, 420)}ms`,
                        ...colorVars(seg.row.id, seg.row.phase === "archived"),
                        ...(selectedId === seg.row.id ? { outlineColor: "var(--foreground)" } : undefined),
                      }}
                    >
                      <span className="truncate">{seg.row.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {rows.length === 0 && <EmptyState className="mt-3">No dated events yet.</EmptyState>}
      </div>

      <aside className="shrink-0 lg:w-64">
        <h3 className="mb-3 text-sm font-semibold text-neutral-100">Ongoing &amp; rolling</h3>
        {ongoingRows.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing open-ended or recurring right now.</p>
        ) : (
          <ul className="space-y-2">
            {ongoingRows.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId((id) => (id === r.id ? null : r.id))}
                  aria-current={selectedId === r.id ? "true" : undefined}
                  className={`flex w-full items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-left text-sm text-neutral-100 transition-colors hover:border-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500/70 ${
                    selectedId === r.id ? "border-neutral-500" : ""
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: colorVars(r.id).backgroundColor }}
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    {r.kind === "rolling" ? "↻ " : "∞ "}
                    {r.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-[2px]"
          onClick={() => setSelectedId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="gantt-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-[6px_6px_0_var(--color-neutral-100)]"
          >
            <div className="overflow-y-auto p-5 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {(selected.phase === "running" || selected.phase === "archived") && (
                    <div className="mb-1">
                      {selected.phase === "running" ? <Badge tone="green">Running</Badge> : <Badge tone="neutral">Archived</Badge>}
                    </div>
                  )}
                  <h4 id="gantt-modal-title" className="text-lg font-bold leading-snug text-neutral-50">
                    {selected.title}
                  </h4>
                  {selected.host && <p className="mt-0.5 text-neutral-400">Hosted by {selected.host}</p>}
                </div>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={() => setSelectedId(null)}
                  aria-label="Close"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-700 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500/60"
                >
                  ✕
                </button>
              </div>

              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl bg-neutral-900 px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-neutral-500">When</dt>
                <dd className="font-medium text-neutral-100">
                  {selected.dateLabel ?? (selected.startLabel === selected.endLabel ? selected.startLabel : `${selected.startLabel} – ${selected.endLabel}`)}
                </dd>
                {selected.category && (
                  <>
                    <dt className="text-xs uppercase tracking-wide text-neutral-500">Category</dt>
                    <dd className="text-neutral-200">{selected.category}</dd>
                  </>
                )}
                <dt className="text-xs uppercase tracking-wide text-neutral-500">Where</dt>
                <dd className="inline-flex items-center gap-1.5 text-neutral-200">
                  <GeoIcon info={selected.geo} /> {selected.geoLabel}
                </dd>
              </dl>

              {selected.description && (
                <p className="mt-4 whitespace-pre-line leading-relaxed text-neutral-300">{selected.description}</p>
              )}

              {selected.url && (
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 font-semibold text-black transition-colors hover:bg-orange-400"
                >
                  Visit event page <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
