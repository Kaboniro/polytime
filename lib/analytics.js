import getDb from "@/lib/db";

// Only pages that actually exist on the public site are ever recorded or
// reported. Anything else — a removed route like /winners, a 404 probe such as
// /wp-login.php or /.env, /admin, /api — is not a page view worth logging.
// ADD NEW PUBLIC PAGES HERE, or their views will be ignored.
export const PUBLIC_PATHS = ["/", "/timeline", "/links", "/submit", "/about", "/privacy"];

// Path only (no query/hash), no trailing slash except the root.
export function normalizePath(path) {
  if (typeof path !== "string") return "";
  const p = path.split("?")[0].split("#")[0];
  return p.length > 1 ? p.replace(/\/+$/, "") : p;
}

// /events/<id> pages exist only for approved events, so they are checked
// against the database (see recordPageView) rather than listed here.
const EVENT_PATH = /^\/events\/(\d+)$/;

export function isTrackablePath(path) {
  const p = normalizePath(path);
  return PUBLIC_PATHS.includes(p) || EVENT_PATH.test(p);
}

function eventPageExists(path) {
  const m = normalizePath(path).match(EVENT_PATH);
  return Boolean(m && getDb().prepare("SELECT 1 FROM events WHERE id = ? AND status = 'approved'").get(Number(m[1])));
}

// Best-effort location from whatever's already in front of the app — no
// bundled IP-geolocation database. Every such database is either legally
// murky to redistribute (MaxMind's GeoLite2 restricts this) or 100MB+
// unpacked for what only needs a country code, and this project avoids both
// heavy and legally-uncertain dependencies elsewhere for the same reasons
// (see lib/db.js's node:sqlite rationale). Cloudflare (free tier) and Vercel
// both set one of these on every request; a bare VPS with nothing in front
// of it won't set either, and country/region simply stay null — the honest
// answer when nothing told us. Putting Cloudflare in front of a VPS deploy
// is the recommended way to populate this (see README).
function locationFromHeaders(headers) {
  const rawCountry = headers.get("cf-ipcountry") || headers.get("x-vercel-ip-country");
  const country = rawCountry && rawCountry !== "XX" && rawCountry !== "T1" ? rawCountry.toUpperCase() : null;
  // Cloudflare only sends cf-region-code with its free "Add visitor location
  // headers" Managed Transform turned on (Rules > Settings).
  const region = headers.get("cf-region-code") || headers.get("x-vercel-ip-country-region") || null;
  return { country, region };
}

// A same-site referrer, from the standard Referer header — not a custom
// cookie, since a Server Component can read but never set a cookie (only a
// Server Action / Route Handler can), which would make a "last path" cookie
// a chicken-and-egg problem. Cross-site referrers (or none, if the browser
// withholds it) are dropped: only the path is meaningful here, and only when
// it points back at this same site.
function referrerPathFromHeaders(headers) {
  const referer = headers.get("referer");
  const host = headers.get("host");
  if (!referer || !host) return null;
  try {
    const url = new URL(referer);
    return url.host === host ? normalizePath(url.pathname) : null;
  } catch {
    return null;
  }
}

// Writes one page view — only ever called after the visitor has accepted
// the cookie banner (see components/CookieConsent.js and app/layout.js).
// Never stores the request's IP address, only what locationFromHeaders
// derives from it.
export function recordPageView({ visitorId, path, headers }) {
  if (!visitorId || !isTrackablePath(path)) return;
  path = normalizePath(path);
  if (!PUBLIC_PATHS.includes(path) && !eventPageExists(path)) return;
  const { country, region } = locationFromHeaders(headers);
  const db = getDb();
  db.prepare(
    `INSERT INTO page_views (visitor_id, path, referrer_path, country, region) VALUES (?, ?, ?, ?, ?)`
  ).run(visitorId, path, referrerPathFromHeaders(headers), country, region);
}

const toPlain = (row) => (row ? { ...row } : row);

// ---------------------------------------------------------------------------
// Reporting (admin Activity tab and its exports)
// ---------------------------------------------------------------------------

export const RANGES = { "7d": 7, "30d": 30, "90d": 90, "365d": 365, all: null };
export const RANGE_LABELS = { "7d": "7 days", "30d": "30 days", "90d": "90 days", "365d": "1 year", all: "All time" };

export function parseRange(value) {
  return Object.hasOwn(RANGES, value) ? value : "30d";
}

export function parsePageFilter(value) {
  return PUBLIC_PATHS.includes(value) ? value : null;
}

const fmt = (ms) => new Date(ms).toISOString().slice(0, 19).replace("T", " ");
const DAY = 86_400_000;
const startOfUtcDay = (ms) => Math.floor(ms / DAY) * DAY;
const SESSION_GAP_MINUTES = 30;

// The window is whole UTC days, ending now: "30 days" = today plus the 29
// before it, so the daily chart has exactly 30 buckets.
function windowFor(range, db) {
  const days = RANGES[range];
  const now = Date.now();
  if (days) {
    const since = startOfUtcDay(now) - (days - 1) * DAY;
    return { days, since: fmt(since), until: fmt(now + 1000), prevSince: fmt(since - days * DAY), prevUntil: fmt(since) };
  }
  const first = db.prepare("SELECT MIN(created_at) first FROM page_views").get().first;
  const since = first ? startOfUtcDay(Date.parse(first.replace(" ", "T") + "Z")) : startOfUtcDay(now);
  return { days: Math.max(1, Math.round((startOfUtcDay(now) - since) / DAY) + 1), since: fmt(since), until: fmt(now + 1000), prevSince: null, prevUntil: null };
}

const KNOWN = PUBLIC_PATHS.map(() => "?").join(",");
// "This path is a page that exists": a listed public page, or /events/<id> of
// an approved event. Used in every report query.
const EXISTS = `(path IN (${KNOWN}) OR (path LIKE '/events/%' AND CAST(substr(path, 9) AS INTEGER) IN (SELECT id FROM events WHERE status = 'approved')))`;

// WHERE fragment + params shared by every query: the time window, only pages
// that exist, and optionally one page.
function scope(since, until, page) {
  return {
    sql: `created_at >= ? AND created_at < ? AND ${EXISTS}${page ? " AND path = ?" : ""}`,
    params: [since, until, ...PUBLIC_PATHS, ...(page ? [page] : [])],
  };
}

function kpis(db, since, until, page) {
  const s = scope(since, until, page);
  const { views, visitors } = db.prepare(`SELECT COUNT(*) views, COUNT(DISTINCT visitor_id) visitors FROM page_views WHERE ${s.sql}`).get(...s.params);
  // A session is one visitor's run of views with no gap over 30 minutes.
  const sess = db
    .prepare(
      `WITH v AS (
         SELECT visitor_id, created_at,
                LAG(created_at) OVER (PARTITION BY visitor_id ORDER BY created_at) prev
         FROM page_views WHERE ${s.sql}
       ), n AS (
         SELECT visitor_id, created_at,
                SUM(CASE WHEN prev IS NULL OR (julianday(created_at) - julianday(prev)) * 1440 > ${SESSION_GAP_MINUTES} THEN 1 ELSE 0 END)
                  OVER (PARTITION BY visitor_id ORDER BY created_at ROWS UNBOUNDED PRECEDING) sess
         FROM v
       ), g AS (
         SELECT visitor_id, sess, COUNT(*) pages,
                (julianday(MAX(created_at)) - julianday(MIN(created_at))) * 86400 seconds
         FROM n GROUP BY visitor_id, sess
       )
       SELECT COUNT(*) sessions, AVG(pages) avgPages, AVG(seconds) avgSeconds, SUM(pages = 1) bounces FROM g`
    )
    .get(...s.params);
  const sessions = sess.sessions || 0;
  return {
    views,
    visitors,
    sessions,
    pagesPerSession: sessions ? sess.avgPages : 0,
    avgSeconds: sessions ? sess.avgSeconds : 0,
    bounceRate: sessions ? (sess.bounces || 0) / sessions : 0,
  };
}

// Everything the Activity tab and its exports use, for one range and
// (optionally) one page. All times are UTC.
export function getActivityReport({ range = "30d", page = null } = {}) {
  range = parseRange(range);
  page = parsePageFilter(page);
  const db = getDb();
  const w = windowFor(range, db);
  const s = scope(w.since, w.until, page);

  const current = kpis(db, w.since, w.until, page);
  const previous = w.prevSince ? kpis(db, w.prevSince, w.prevUntil, page) : null;

  // Daily buckets, or weekly (Monday-start) when the span would be too many bars.
  const weekly = w.days > 120;
  const bucketSql = weekly ? "date(created_at, 'weekday 0', '-6 days')" : "date(created_at)";
  const rows = db
    .prepare(`SELECT ${bucketSql} bucket, COUNT(*) views, COUNT(DISTINCT visitor_id) visitors FROM page_views WHERE ${s.sql} GROUP BY bucket`)
    .all(...s.params);
  const byBucket = new Map(rows.map((r) => [r.bucket, r]));
  const trend = [];
  const step = weekly ? 7 * DAY : DAY;
  let cursor = startOfUtcDay(Date.parse(w.since.replace(" ", "T") + "Z"));
  if (weekly) cursor -= ((new Date(cursor).getUTCDay() + 6) % 7) * DAY; // back to Monday
  for (; cursor <= Date.now(); cursor += step) {
    const key = new Date(cursor).toISOString().slice(0, 10);
    const r = byBucket.get(key);
    trend.push({ date: key, views: r?.views || 0, visitors: r?.visitors || 0 });
  }

  // Weekday x hour heatmap (0 = Sunday), UTC.
  const heat = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const r of db
    .prepare(`SELECT CAST(strftime('%w', created_at) AS INTEGER) d, CAST(strftime('%H', created_at) AS INTEGER) h, COUNT(*) n FROM page_views WHERE ${s.sql} GROUP BY d, h`)
    .all(...s.params)) {
    heat[r.d][r.h] = r.n;
  }

  const topPages = db
    .prepare(`SELECT path, COUNT(*) views, COUNT(DISTINCT visitor_id) visitors FROM page_views WHERE ${s.sql} GROUP BY path ORDER BY views DESC, path ASC`)
    .all(...s.params)
    .map(toPlain);

  // Event pages show the event's title rather than /events/12.
  const eventIds = topPages.filter((t) => t.path.startsWith("/events/")).map((t) => Number(t.path.slice(8)));
  if (eventIds.length) {
    const titles = new Map(db.prepare(`SELECT id, title FROM events WHERE id IN (${eventIds.map(() => "?").join(",")})`).all(...eventIds).map((r) => [r.id, r.title]));
    for (const t of topPages) if (t.path.startsWith("/events/")) t.title = titles.get(Number(t.path.slice(8))) || null;
  }

  // Where people go next: same-site referrer -> page. Limits here (and on
  // countries below) are only safety caps; the Activity tab pages the lists.
  const flows = db
    .prepare(
      `SELECT referrer_path "from", path "to", COUNT(*) n FROM page_views
       WHERE ${s.sql} AND referrer_path IS NOT NULL AND referrer_path != path AND referrer_path IN (${KNOWN})
       GROUP BY referrer_path, path ORDER BY n DESC LIMIT 200`
    )
    .all(...s.params, ...PUBLIC_PATHS)
    .map(toPlain);

  const countries = db
    .prepare(
      `SELECT country, COUNT(*) views, COUNT(DISTINCT visitor_id) visitors FROM page_views
       WHERE ${s.sql} AND country IS NOT NULL GROUP BY country ORDER BY views DESC LIMIT 250`
    )
    .all(...s.params)
    .map(toPlain);
  const locatedViews = countries.reduce((sum, r) => sum + r.views, 0);

  // New = first ever view inside this window; returning = seen before it.
  const nr = db
    .prepare(
      `SELECT COALESCE(SUM(first_seen >= ?), 0) newVisitors, COALESCE(SUM(first_seen < ?), 0) returningVisitors FROM (
         SELECT visitor_id, MIN(created_at) first_seen FROM page_views GROUP BY visitor_id
       ) WHERE visitor_id IN (SELECT DISTINCT visitor_id FROM page_views WHERE ${s.sql})`
    )
    .get(w.since, w.since, ...s.params);

  // Rows for paths that aren't pages on this site (removed routes, 404 probes):
  // never counted above, only reported so the admin knows they're being ignored.
  const hidden = db
    .prepare(
      `SELECT path, COUNT(*) views FROM page_views WHERE created_at >= ? AND created_at < ? AND NOT ${EXISTS}
       GROUP BY path ORDER BY views DESC LIMIT 5`
    )
    .all(w.since, w.until, ...PUBLIC_PATHS)
    .map(toPlain);
  const hiddenViews = db
    .prepare(`SELECT COUNT(*) n FROM page_views WHERE created_at >= ? AND created_at < ? AND NOT ${EXISTS}`)
    .get(w.since, w.until, ...PUBLIC_PATHS).n;

  return {
    range,
    page,
    days: w.days,
    since: w.since,
    until: w.until,
    weekly,
    current,
    previous,
    trend,
    heat,
    topPages,
    flows,
    countries,
    unknownLocationViews: current.views - locatedViews,
    newVisitors: nr.newVisitors,
    returningVisitors: nr.returningVisitors,
    hiddenViews,
    hiddenPaths: hidden,
  };
}

// Raw rows for the CSV/JSON export (same scope as the report).
export function getRawViews({ range = "30d", page = null } = {}) {
  range = parseRange(range);
  page = parsePageFilter(page);
  const db = getDb();
  const w = windowFor(range, db);
  const s = scope(w.since, w.until, page);
  return db
    .prepare(`SELECT id, created_at, path, referrer_path, country, region, visitor_id FROM page_views WHERE ${s.sql} ORDER BY id ASC`)
    .all(...s.params)
    .map(toPlain);
}
