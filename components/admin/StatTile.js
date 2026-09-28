// One headline number: label (sentence case, no colon) + value, set in the
// same sans as the rest of the UI at a size that reads as a stat, not body
// text. Proportional figures (the browser default — no tabular-nums here),
// since a standalone big number is compared to nothing beside it; reserve
// tabular-nums for columns of numbers that must align (see the tables these
// tiles sit above).
export default function StatTile({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:-rotate-[0.35deg] hover:shadow-[4px_4px_0_var(--color-neutral-100)] motion-reduce:!transform-none">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-neutral-50">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] leading-snug">{sub}</p>}
    </div>
  );
}

// 1,284 / 12.9K / 4.2M — auto-compact, exact below 1,000.
const compact = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });
export function formatCount(n) {
  return compact.format(n);
}
