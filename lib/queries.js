import getDb from "@/lib/db";
import { effectiveEnd } from "@/lib/filters";

// node:sqlite's .all()/.get() return rows with a null prototype (no
// Object.prototype in their chain). That's invisible almost everywhere —
// property access works fine — except when a server component passes the
// row straight into a client component as a prop: React's RSC
// serialization explicitly rejects null-prototype objects ("Only plain
// objects ... can be passed to Client Components"). AdminQueue is a client
// component, so every query result that might reach it has to be
// normalized to a plain object first. Doing it here, once, means every
// caller gets plain objects automatically instead of each page having to
// remember to spread its rows.
function toPlain(row) {
  return row ? { ...row } : row;
}

function allPlain(stmt, ...params) {
  return stmt.all(...params).map(toPlain);
}

export function getApprovedEvents({ category } = {}) {
  const db = getDb();
  if (category && category !== "all") {
    return allPlain(
      db.prepare(
        `SELECT * FROM events WHERE status = 'approved' AND category = ? ORDER BY (start_date IS NULL), start_date ASC`
      ),
      category
    );
  }
  return allPlain(
    db.prepare(
      `SELECT * FROM events WHERE status = 'approved' ORDER BY (start_date IS NULL), start_date ASC`
    )
  );
}

export function getApprovedLinks({ category } = {}) {
  const db = getDb();
  if (category && category !== "all") {
    return allPlain(
      db.prepare(
        `SELECT * FROM links WHERE status = 'approved' AND category = ? ORDER BY title ASC`
      ),
      category
    );
  }
  return allPlain(db.prepare(`SELECT * FROM links WHERE status = 'approved' ORDER BY title ASC`));
}

export function getPending() {
  const db = getDb();
  return {
    events: allPlain(db.prepare(`SELECT * FROM events WHERE status = 'pending' ORDER BY created_at ASC`)),
    links: allPlain(db.prepare(`SELECT * FROM links WHERE status = 'pending' ORDER BY created_at ASC`)),
  };
}


// Background crawler status for the admin dashboard (see crawler/daemon.js).
// "online" means the daemon has heartbeated recently; a stale heartbeat means
// the process died or the app was stopped.
export function getCrawlerStatus() {
  const db = getDb();
  const state = toPlain(db.prepare("SELECT * FROM crawler_state WHERE id = 1").get()) || { state: "stopped", paused: 0 };
  const runs = allPlain(db.prepare("SELECT * FROM crawler_runs ORDER BY id DESC LIMIT 8")).map((r) => {
    let summary = null;
    try {
      summary = r.summary ? JSON.parse(r.summary) : null;
    } catch {
      summary = null;
    }
    return { ...r, summary };
  });
  const online = Boolean(state.heartbeat_at) && state.state !== "stopped" && Date.now() - Date.parse(state.heartbeat_at) < 90000;
  const { n: pendingFromCrawler } = db.prepare("SELECT COUNT(*) AS n FROM events WHERE status = 'pending' AND submitted_by = 'crawler'").get();
  return {
    state: { ...state, online },
    runs,
    pendingFromCrawler,
    searchEnabled: Boolean(process.env.SEARXNG_URL || process.env.BRAVE_API_KEY),
    enabled: process.env.CRAWLER_ENABLED !== "0",
  };
}

// Public Query form messages, open ones first (see /admin/queries).
export function getQueries() {
  return allPlain(getDb().prepare("SELECT * FROM queries ORDER BY (status = 'open') DESC, id DESC"));
}

export function getOpenQueryCount() {
  return getDb().prepare("SELECT COUNT(*) AS n FROM queries WHERE status = 'open'").get().n;
}

// One approved event by id (the public /events/[id] page); null if it does not
// exist or is not approved, so a pending/rejected event is never reachable.
export function getApprovedEventById(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) return null;
  return toPlain(getDb().prepare("SELECT * FROM events WHERE id = ? AND status = 'approved'").get(n)) || null;
}

// Every approved event, for the sitemap. "ended" lets the sitemap rank finished
// events below live ones.
export function getSitemapEvents() {
  return allPlain(
    getDb().prepare("SELECT id, created_at, start_date, end_date, submission_deadline FROM events WHERE status = 'approved' ORDER BY id DESC LIMIT 5000")
  ).map((e) => ({ ...e, ended: Boolean(e.start_date) && effectiveEnd(e) < new Date().toISOString().slice(0, 10) }));
}
