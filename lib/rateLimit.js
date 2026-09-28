// A small in-memory sliding-window limiter for endpoints that must not be
// hammered (admin login). It lives in the server process, so it resets on
// restart and isn't shared between servers — fine for a single admin site.
const buckets = (globalThis.__rateBuckets ||= new Map());

// Returns true if this call is over the limit (and records the call either way).
export function rateLimited(key, limit, windowMs) {
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  return recent.length > limit;
}

export function clientIp(req) {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
}
