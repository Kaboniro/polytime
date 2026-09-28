"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { count, niceScale } from "@/components/admin/activityFormat";

const W = 720;
const H = 260;
const M = { top: 14, right: 14, bottom: 28, left: 44 };
const PW = W - M.left - M.right;
const PH = H - M.top - M.bottom;

const VIEWS = "var(--color-orange-500)";
const VISITORS = "var(--color-sky-400)";

const dayLabel = (iso, weekly) => (weekly ? `Week of ${format(parseISO(iso), "MMM d")}` : format(parseISO(iso), "EEE, MMM d, yyyy"));

// Page views as bars (one hue) with unique visitors as a line (a second,
// clearly different hue), on one shared count axis. Hover a column for exact
// numbers; the table under the chart has the same data for keyboard/screen
// reader use.
export function TrendChart({ data, weekly }) {
  const [active, setActive] = useState(null);
  const n = data.length;
  const { max, step } = niceScale(Math.max(...data.map((d) => Math.max(d.views, d.visitors)), 1));
  const slot = PW / Math.max(n, 1);
  const barW = Math.max(1.5, Math.min(28, slot * 0.66));
  const x = (i) => M.left + slot * i + slot / 2;
  const y = (v) => M.top + PH - (v / max) * PH;
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step);
  const labelEvery = Math.max(1, Math.ceil(n / 6));
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.visitors).toFixed(1)}`).join(" ");
  const total = data.reduce((s, d) => s + d.views, 0);
  const a = active == null ? null : data[active];

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-4 text-xs text-neutral-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: VIEWS }} /> Page views
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4" style={{ background: VISITORS }} /> Unique visitors
        </span>
        <span className="ml-auto text-neutral-500">{weekly ? "Weekly" : "Daily"} · UTC</span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full"
          role="img"
          aria-label={`${weekly ? "Weekly" : "Daily"} page views and unique visitors. ${total} views in total. A data table follows.`}
          onPointerLeave={() => setActive(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke="var(--color-neutral-800)" strokeWidth="1" />
              <text x={M.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--color-neutral-500)">
                {count(t)}
              </text>
            </g>
          ))}

          {data.map((d, i) => (
            <rect
              key={d.date}
              x={x(i) - barW / 2}
              y={y(d.views)}
              width={barW}
              height={Math.max(0, PH - (y(d.views) - M.top))}
              rx={Math.min(3, barW / 2)}
              fill={VIEWS}
              opacity={active == null || active === i ? 1 : 0.45}
            />
          ))}

          <path d={line} fill="none" stroke={VISITORS} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {n <= 40 &&
            data.map((d, i) => (
              <circle key={d.date} cx={x(i)} cy={y(d.visitors)} r={active === i ? 4.5 : 3} fill="var(--background)" stroke={VISITORS} strokeWidth="2" />
            ))}

          {data.map((d, i) =>
            i % labelEvery === 0 || i === n - 1 ? (
              <text key={d.date} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--color-neutral-500)">
                {format(parseISO(d.date), "MMM d")}
              </text>
            ) : null
          )}

          {data.map((d, i) => (
            <rect key={d.date} x={M.left + slot * i} y={M.top} width={slot} height={PH} fill="transparent" onPointerEnter={() => setActive(i)} onPointerMove={() => setActive(i)} />
          ))}
        </svg>

        {a && (
          <div
            role="tooltip"
            className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-neutral-700 bg-black px-2.5 py-1.5 text-xs text-white"
            style={{ left: `${Math.min(88, Math.max(12, ((x(active)) / W) * 100))}%` }}
          >
            <div className="font-semibold">{dayLabel(a.date, weekly)}</div>
            <div>{a.views.toLocaleString()} views</div>
            <div>{a.visitors.toLocaleString()} visitors</div>
          </div>
        )}
      </div>

      <details className="mt-2 text-xs text-neutral-400">
        <summary className="cursor-pointer">View as table</summary>
        <div className="mt-2 max-h-64 overflow-auto rounded-xl border border-neutral-800">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 bg-neutral-900">
              <tr>
                <th scope="col" className="px-3 py-1.5 font-semibold">{weekly ? "Week starting" : "Date"}</th>
                <th scope="col" className="px-3 py-1.5 text-right font-semibold">Views</th>
                <th scope="col" className="px-3 py-1.5 text-right font-semibold">Visitors</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.date} className="border-t border-neutral-800">
                  <td className="px-3 py-1">{d.date}</td>
                  <td className="px-3 py-1 text-right tabular-nums">{d.views}</td>
                  <td className="px-3 py-1 text-right tabular-nums">{d.visitors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// When visitors come: weekday x hour of day (UTC). One hue, darker = more
// views; empty hours stay a flat neutral so "none" never looks like "a little".
export function Heatmap({ heat }) {
  const max = Math.max(...heat.flat(), 0);
  const total = heat.flat().reduce((s, v) => s + v, 0);
  // Tab order: Monday first reads more naturally than Sunday first.
  const order = [1, 2, 3, 4, 5, 6, 0];
  const hours = Array.from({ length: 24 }, (_, h) => h);

  return (
    <div>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: "2.25rem repeat(24, minmax(0, 1fr))" }}
        role="img"
        aria-label={`Views by weekday and hour, UTC. ${total} views in total.`}
      >
        {order.map((d) => (
          <div key={d} className="contents">
            <div className="flex items-center text-[11px] text-neutral-500">{DAYS[d]}</div>
            {hours.map((h) => {
              const v = heat[d][h];
              return (
                <div
                  key={h}
                  title={`${DAYS[d]} ${String(h).padStart(2, "0")}:00 UTC — ${v} ${v === 1 ? "view" : "views"}`}
                  className="aspect-square rounded-[3px] bg-neutral-900"
                  style={v ? { background: `color-mix(in oklab, ${VIEWS} ${Math.round(18 + (v / max) * 82)}%, transparent)` } : undefined}
                />
              );
            })}
          </div>
        ))}
        <div />
        {hours.map((h) => (
          <div key={h} className="text-center text-[10px] text-neutral-500">
            {h % 6 === 0 ? String(h).padStart(2, "0") : ""}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-500">
        <span>Fewer</span>
        <span className="h-2 w-24 rounded-full" style={{ background: `linear-gradient(to right, color-mix(in oklab, ${VIEWS} 18%, transparent), ${VIEWS})` }} />
        <span>More</span>
        <span className="ml-auto">Hours in UTC</span>
      </div>
    </div>
  );
}
