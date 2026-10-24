// Small formatting helpers shared by the Activity tab's server and client parts.

// Friendly names for the public pages (matches the site nav).
export const PAGE_LABELS = {
  "/": "Timeline (home)",
  "/timeline": "Calendar",
  "/links": "Links",
  "/submit": "Submit",
  "/about": "About",
  "/privacy": "Privacy",
  "/terms": "Terms",
};

export const pageLabel = (path) => PAGE_LABELS[path] || path;

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
export const count = (n) => (n < 1000 ? String(Math.round(n)) : compact.format(n));

export function duration(seconds) {
  const s = Math.round(seconds || 0);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ${String(s % 60).padStart(2, "0")}s` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

export const percent = (fraction) => `${Math.round((fraction || 0) * 100)}%`;

// "Nice" axis maximum and tick step for a count chart.
export function niceScale(max) {
  const m = Math.max(max, 1);
  const pow = 10 ** Math.floor(Math.log10(m));
  const step = [1, 2, 5, 10].map((k) => k * pow).find((s) => m / s <= 5) || 10 * pow;
  return { max: Math.ceil(m / step) * step, step };
}
