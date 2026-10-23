import { count } from "@/components/admin/activityFormat";

// Server-rendered building blocks for the Activity tab.

const TONES = { views: "var(--color-orange-500)", visitors: "var(--color-sky-400)", flow: "var(--color-violet-400)" };

// Horizontal bars for a ranked list. `share` is drawn against the largest value,
// so the top row always fills the track and the rest read as proportions.
// `max` and `startRank` let a paged view (PagedBarList) keep bars comparable
// across pages and number rows by their overall rank.
export function BarList({ items, tone = "views", empty = "Nothing to show yet.", max: maxValue, startRank }) {
  if (!items.length) return <p className="text-sm text-neutral-500">{empty}</p>;
  const max = maxValue || Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-2.5">
      {items.map((i, n) => (
        <li key={i.key}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-neutral-100">
              {startRank != null && <span className="mr-2 inline-block w-6 text-right text-xs tabular-nums text-neutral-500">{startRank + n}</span>}
              {i.label}
            </span>
            <span className="shrink-0 tabular-nums text-neutral-200">
              {i.value.toLocaleString()}
              {i.sub && <span className="ml-2 text-xs text-neutral-500">{i.sub}</span>}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-neutral-800" aria-hidden="true">
            <div className="h-full rounded-full" style={{ width: `${Math.max(2, (i.value / max) * 100)}%`, background: TONES[tone] }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Two parts of a whole in one stacked bar with the numbers spelled out.
export function SplitBar({ a, b }) {
  const total = a.value + b.value;
  const pa = total ? (a.value / total) * 100 : 0;
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-neutral-800" role="img" aria-label={`${a.label} ${a.value}, ${b.label} ${b.value}`}>
        <div style={{ width: `${pa}%`, background: TONES.views }} />
        <div style={{ width: `${100 - pa}%`, background: TONES.visitors }} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        {[[a, TONES.views], [b, TONES.visitors]].map(([p, color]) => (
          <div key={p.label}>
            <dt className="flex items-center gap-1.5 text-xs text-neutral-400">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
              {p.label}
            </dt>
            <dd className="font-semibold text-neutral-50 tabular-nums">
              {count(p.value)} <span className="text-xs font-normal text-neutral-500">{total ? Math.round((p.value / total) * 100) : 0}%</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// "▲ 12% vs previous 30 days" — colour is meaning-bearing, so the arrow and
// the words say the same thing. `goodWhenDown` for metrics like bounce rate.
export function Delta({ current, previous, goodWhenDown = false, unit = "%", minBase = 0 }) {
  if (previous == null) return <span className="text-neutral-500">no earlier period</span>;
  // A percentage off a tiny base (3 views -> 300) says nothing; show it only once there is a real baseline.
  if (previous < minBase) return <span className="text-neutral-500">too little earlier data</span>;
  if (previous === 0 && current === 0) return <span className="text-neutral-500">no change</span>;
  const change = previous === 0 ? null : ((current - previous) / previous) * 100;
  if (change == null) return <span className="text-emerald-400">▲ new</span>;
  if (Math.abs(change) < 0.5) return <span className="text-neutral-500">— no change</span>;
  const up = change > 0;
  const good = up !== goodWhenDown;
  return (
    <span className={good ? "text-emerald-400" : "text-red-400"}>
      {up ? "▲" : "▼"} {Math.abs(Math.round(change))}
      {unit}
    </span>
  );
}
