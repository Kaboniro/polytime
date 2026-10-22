"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import GeoIcon from "@/components/GeoIcon";
import { EmptyState } from "@/components/polytime-ui";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DATE_ROW_H = 22; // px, space reserved for the date-number line at the top of each day cell
const LANE_H = 20; // px, a bar that starts or ends in this week
const THRU_H = 14; // px, a slimmer bar for an event just passing through the week
const LANE_GAP = 3; // px, vertical gap between stacked bars in the same week
// Every event gets its own color, stable for that event: the hue steps around
// the wheel by the golden angle per id (137.5 degrees), so consecutive ids are
// always far apart and no two events share a hue until the wheel is full.
// Lightness cycles through three steps so near hues still differ. All are
// light enough for the dark label on the bar (contrast 8:1 or better).
const GOLDEN_ANGLE = 137.508;
const LIGHTNESS = [0.76, 0.7, 0.82];
const hueOf = (id) => ((Math.abs(Number(id)) || 0) * GOLDEN_ANGLE) % 360;

// An archived (finished) event keeps its own hue but is washed out and hatched
// with diagonal stripes, with a dashed border and a grey label, so it reads as
// "over" at a glance without losing which event it is. A `thru` bar (the event
// started before this week and carries on after it) is a paler, quieter tint
// of the same hue, so long events don't dominate every week they span.
function colorVars(id, { archived = false, thru = false } = {}) {
  const n = Math.abs(Number(id)) || 0;
  const hue = hueOf(id).toFixed(1);
  if (archived) {
    return {
      backgroundColor: `oklch(0.9 0.035 ${hue})`,
      backgroundImage: `repeating-linear-gradient(135deg, oklch(0.78 0.06 ${hue} / 0.55) 0 2px, transparent 2px 6px)`,
      color: "#555",
      borderStyle: "dashed",
      borderColor: `oklch(0.65 0.08 ${hue})`,
    };
  }
  if (thru) return { backgroundColor: `oklch(0.9 0.06 ${hue})`, color: "#333" };
  return { backgroundColor: `oklch(${LIGHTNESS[n % LIGHTNESS.length]} 0.13 ${hue})`, color: "#000" };
}

function chunk7(days) {
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

// One week's bars. An event that neither starts nor ends this week is a
// slim "thru" bar across all seven days, each on its own lane at the top.
// The rest (those starting and/or ending here) are packed below with greedy
// interval-graph coloring: each takes the first lane whose last occupant ends
// before it starts, so overlapping events stack instead of drawing over each
// other. Each segment records whether its start and end fall in this week,
// so the bar can show rounded (real) or flat, arrowed (continuing) ends.
function layoutWeek(weekStart, weekEnd, rows) {
  const thru = [];
  const segs = [];
  for (const r of rows) {
    const s = parseISO(r.start);
    const e = parseISO(r.end);
    if (e < weekStart || s > weekEnd) continue;
    const startsHere = s >= weekStart;
    const endsHere = e <= weekEnd;
    const seg = {
      row: r,
      startCol: Math.max(0, differenceInCalendarDays(s, weekStart)),
      endCol: Math.min(6, differenceInCalendarDays(e, weekStart)),
      startsHere,
      endsHere,
    };
    (startsHere || endsHere ? segs : thru).push(seg);
  }
  thru.forEach((seg, i) => {
    seg.top = i * (THRU_H + LANE_GAP);
    seg.height = THRU_H;
  });
  const thruH = thru.length * (THRU_H + LANE_GAP);

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
    seg.top = thruH + lane * (LANE_H + LANE_GAP);
    seg.height = LANE_H;
  }
  return { segs: [...thru, ...segs], height: thruH + laneEnds.length * (LANE_H + LANE_GAP) };
}

// Soft "Live now" pill, the same one the home page table uses.
function LiveNow() {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
      Live now
    </span>
  );
}

const rangeLabel = (r) => (r.startLabel === r.endLabel ? r.startLabel : `${r.startLabel} – ${r.endLabel}`);

// The same month's events as a readable list: everything already running when
// the month began first, then each week's new starts, in date order. Nothing
// is truncated here, so it's also the default view on phones.
function MonthList({ rows, monthStart, monthEnd, onOpen }) {
  const inMonth = rows
    .filter((r) => parseISO(r.end) >= monthStart && parseISO(r.start) <= monthEnd)
    .sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title));
  if (inMonth.length === 0) return null;

  const groups = [];
  for (const r of inMonth) {
    const s = parseISO(r.start);
    const key = s < monthStart ? "before" : format(startOfWeek(s, { weekStartsOn: 0 }), "yyyy-MM-dd");
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = {
        key,
        label: key === "before" ? `Already running in ${format(monthStart, "MMMM")}` : `Starting the week of ${format(parseISO(key), "MMM d")}`,
        rows: [],
      };
      groups.push(g);
    }
    g.rows.push(r);
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((g) => (
        <section key={g.key}>
          <h3 className="mb-2 text-sm font-semibold text-neutral-400">{g.label}</h3>
          <ul className="overflow-hidden rounded-2xl border border-neutral-800">
            {g.rows.map((r, i) => {
              const deadlineSoon = r.deadline && parseISO(r.deadline) >= monthStart && parseISO(r.deadline) <= monthEnd;
              return (
                <li key={r.id} className={`border-b border-neutral-800 last:border-b-0 ${i % 2 ? "bg-neutral-900/40" : ""}`}>
                  <button
                    type="button"
                    onClick={() => onOpen(r.id)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-orange-500/70"
                  >
                    <span
                      className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: colorVars(r.id, { archived: r.phase === "archived" }).backgroundColor }}
                      aria-hidden="true"
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="font-medium text-neutral-50">{r.title}</span>
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-400">
                        <span>{rangeLabel(r)}</span>
                        {r.deadlineLabel && (
                          <span className={deadlineSoon ? "font-medium text-orange-400" : ""}>
                            <span aria-hidden="true">◆ </span>Deadline {r.deadlineLabel}
                          </span>
                        )}
                        {r.host && <span>{r.host}</span>}
                        <span className="inline-flex items-center gap-1">
                          <GeoIcon info={r.geo} /> {r.geoLabel}
                        </span>
                        {r.category && <span>{r.category}</span>}
                      </span>
                      {r.phase === "running" && <LiveNow />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

const pill = (on) =>
  `rounded-md px-3 py-1 text-sm transition-colors ${on ? "bg-neutral-50 font-medium text-neutral-950" : "text-neutral-300 hover:bg-neutral-800"}`;

export default function GanttChart({ rows }) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedId, setSelectedId] = useState(null);
  // Running & upcoming by default; finished events only when asked for.
  const [show, setShow] = useState("current"); // "current" | "archived"
  // Month grid on wide screens, the list on phones (where seven columns can't
  // fit). Decided after mount, so server and first client render match.
  const [view, setView] = useState("month"); // "month" | "list"
  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) setView("list");
  }, []);
  const visibleRows = useMemo(
    () => rows.filter((r) => (show === "archived" ? r.phase === "archived" : r.phase !== "archived")),
    [rows, show]
  );
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

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const weeks = useMemo(() => {
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
    let order = 0;
    return chunk7(days).map((weekDays) => {
      const { segs, height } = layoutWeek(weekDays[0], weekDays[6], visibleRows);
      segs.forEach((s) => {
        s.order = order++;
      });
      // Submission deadlines falling on each day of this week.
      const deadlines = weekDays.map((d) => visibleRows.filter((r) => r.deadline && isSameDay(parseISO(r.deadline), d)));
      return { days: weekDays, segs, height, deadlines };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleRows, currentMonth]);

  const monthKey = format(currentMonth, "yyyy-MM");
  const selected = selectedId ? rows.find((r) => r.id === selectedId) : null;
  const open = (id) => setSelectedId((cur) => (cur === id ? null : id));

  return (
    <div>
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-50">{format(currentMonth, "MMMM yyyy")}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-neutral-700 p-0.5" role="group" aria-label="View">
              {[
                ["month", "Month"],
                ["list", "List"],
              ].map(([key, label]) => (
                <button key={key} type="button" aria-pressed={view === key} onClick={() => setView(key)} className={pill(view === key)}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg border border-neutral-700 p-0.5" role="group" aria-label="Which events to show">
              {[
                ["current", "Running & upcoming"],
                ["archived", "Archived"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={show === key}
                  onClick={() => {
                    setShow(key);
                    setSelectedId(null);
                  }}
                  className={pill(show === key)}
                >
                  {label}
                </button>
              ))}
            </div>
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

        {show === "archived" && (
          <p className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
            <span
              className="inline-block h-3 w-8 rounded-sm border border-dashed"
              style={{ ...colorVars(0, { archived: true }), borderWidth: 1 }}
              aria-hidden="true"
            />
            Showing finished events only. Switch to Running &amp; upcoming for what&apos;s on now.
          </p>
        )}

        {view === "list" ? (
          <MonthList rows={visibleRows} monthStart={monthStart} monthEnd={monthEnd} onOpen={open} />
        ) : (
          <>
            <p className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="text-sm leading-none text-orange-500" aria-hidden="true">◆</span> Submission deadline
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-6 rounded-sm" style={{ backgroundColor: "oklch(0.9 0.06 230)" }} aria-hidden="true" />
                Slim bar: continues through the whole week
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="text-sm leading-none" aria-hidden="true">›</span> Flat end: continues into the next week
              </span>
            </p>

            <div className="overflow-x-auto rounded-2xl border border-neutral-700">
              <div
                className="flex min-w-[640px] flex-col"
                style={{
                  height: "60vh",
                  minHeight: 30 + weeks.reduce((sum, w) => sum + DATE_ROW_H + Math.max(w.height, LANE_H) + 6, 0),
                }}
              >
                <div className="grid shrink-0 grid-cols-7 border-b border-neutral-800 bg-neutral-900 text-center text-xs font-medium text-neutral-500">
                  {WEEKDAYS.map((d) => (
                    <div key={d} className="py-2">
                      {d}
                    </div>
                  ))}
                </div>

                {weeks.map((week, wi) => {
                  const rowH = DATE_ROW_H + Math.max(week.height, LANE_H) + 6;
                  return (
                    <div key={wi} className="relative border-b border-neutral-800 last:border-b-0" style={{ flex: "1 1 0", minHeight: rowH }}>
                      <div className="absolute inset-0 grid grid-cols-7">
                        {week.days.map((day, di) => {
                          const inMonth = isSameMonth(day, currentMonth);
                          const today = isToday(day);
                          const due = week.deadlines[di];
                          return (
                            <div
                              key={day.toISOString()}
                              aria-current={today ? "date" : undefined}
                              className={`flex items-start justify-between border-r border-neutral-800 px-1.5 pt-1 text-xs last:border-r-0 ${
                                today ? "bg-orange-500/15 ring-2 ring-inset ring-orange-500" : ""
                              }`}
                            >
                              {today ? (
                                // Fits the DATE_ROW_H line above the bars.
                                <span className="inline-flex h-[18px] items-center gap-1 rounded-full bg-orange-500 px-2 text-[11px] font-bold text-black">
                                  {format(day, "d")}
                                  <span className="font-semibold uppercase tracking-wide">Today</span>
                                </span>
                              ) : (
                                <span className={inMonth ? "text-neutral-400" : "text-neutral-700"}>{format(day, "d")}</span>
                              )}
                              {due.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => open(due[0].id)}
                                  title={`Submission deadline:\n${due.map((r) => `• ${r.title}`).join("\n")}`}
                                  aria-label={`Submission deadline for ${due.map((r) => r.title).join(", ")}`}
                                  className="relative z-10 inline-flex h-[18px] items-center gap-0.5 rounded-full px-1 text-[11px] font-bold leading-none text-orange-500 hover:bg-orange-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500/70"
                                >
                                  <span aria-hidden="true">◆</span>
                                  {due.length > 1 && <span>{due.length}</span>}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="pointer-events-none absolute inset-x-0" style={{ top: DATE_ROW_H }}>
                        {week.segs.map((seg) => {
                          const r = seg.row;
                          const thru = !seg.startsHere && !seg.endsHere;
                          const radius = `${seg.startsHere ? "6px" : "0"} ${seg.endsHere ? "6px" : "0"} ${seg.endsHere ? "6px" : "0"} ${seg.startsHere ? "6px" : "0"}`;
                          const status = r.phase === "archived" ? " (ended)" : r.phase === "running" ? " (live now)" : "";
                          return (
                            <button
                              key={`${monthKey}-${wi}-${r.id}`}
                              type="button"
                              onClick={() => open(r.id)}
                              title={`${r.title}${status}\n${rangeLabel(r)}${r.deadlineLabel ? `\nDeadline ${r.deadlineLabel}` : ""}`}
                              aria-current={selectedId === r.id ? "true" : undefined}
                              className={`pointer-events-auto absolute flex items-center gap-1 overflow-hidden px-1.5 text-left font-medium transition-all ease-out hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-orange-500/70 motion-reduce:animate-none ${
                                thru ? "text-[10px]" : "border border-black/10 text-[11px]"
                              } ${selectedId === r.id ? "outline outline-2 outline-offset-1" : ""} animate-[gantt-grow_420ms_ease-out_both]`}
                              style={{
                                left: `calc(${(seg.startCol / 7) * 100}% + ${seg.startsHere ? 2 : 0}px)`,
                                width: `calc(${((seg.endCol - seg.startCol + 1) / 7) * 100}% - ${(seg.startsHere ? 2 : 0) + (seg.endsHere ? 2 : 0)}px)`,
                                top: seg.top,
                                height: seg.height,
                                borderRadius: radius,
                                transformOrigin: "left center",
                                animationDelay: `${Math.min(seg.order * 30, 420)}ms`,
                                ...colorVars(r.id, { archived: r.phase === "archived", thru }),
                                ...(selectedId === r.id ? { outlineColor: "var(--foreground)" } : undefined),
                              }}
                            >
                              {!seg.startsHere && <span aria-hidden="true" className="shrink-0 opacity-60">‹</span>}
                              <span className="min-w-0 flex-1 truncate">{r.title}</span>
                              {!seg.endsHere && <span aria-hidden="true" className="shrink-0 opacity-60">›</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {visibleRows.length === 0 && (
          <EmptyState className="mt-3">
            {show === "archived" ? "No finished events yet." : "Nothing running or coming up right now."}
          </EmptyState>
        )}
        {visibleRows.length > 0 &&
          view === "list" &&
          !visibleRows.some((r) => parseISO(r.end) >= monthStart && parseISO(r.start) <= monthEnd) && (
            <EmptyState className="mt-3">Nothing in {format(currentMonth, "MMMM")}. Try the next month.</EmptyState>
          )}
      </div>

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
                  {selected.phase === "running" && (
                    <div className="mb-2">
                      <LiveNow />
                    </div>
                  )}
                  {selected.phase === "archived" && <p className="mb-1 text-xs text-neutral-500">Ended</p>}
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
                <dt className="text-xs text-neutral-500">When</dt>
                <dd className="font-medium text-neutral-100">{rangeLabel(selected)}</dd>
                {selected.deadlineLabel && (
                  <>
                    <dt className="text-xs text-neutral-500">Deadline</dt>
                    <dd className="font-medium text-orange-400">
                      <span aria-hidden="true">◆ </span>
                      {selected.deadlineLabel}
                    </dd>
                  </>
                )}
                {selected.category && (
                  <>
                    <dt className="text-xs text-neutral-500">Category</dt>
                    <dd className="text-neutral-200">{selected.category}</dd>
                  </>
                )}
                <dt className="text-xs text-neutral-500">Where</dt>
                <dd className="inline-flex items-center gap-1.5 text-neutral-200">
                  <GeoIcon info={selected.geo} /> {selected.geoLabel}
                </dd>
              </dl>

              {selected.description && <p className="mt-4 whitespace-pre-line leading-relaxed text-neutral-300">{selected.description}</p>}

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
