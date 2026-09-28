// Always-on crawler worker. Started automatically alongside the web app (see
// instrumentation.js) or on its own with `npm run crawl:watch`.
//
// It sleeps between runs, crawls on a schedule (config.json "schedule"), and
// reports into the database — a heartbeat plus one row per run — which the
// admin dashboard reads. The dashboard can also pause it or ask for a run
// right now by setting flags in the same table; the daemon polls them.
//
// Everything it finds is inserted as a *pending* event (the review queue).
const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");
const { runCrawl, config } = require("./crawl");

const ROOT = path.join(__dirname, "..");
const TICK_MS = 5000;
const schedule = { intervalMinutes: 1440, maxPagesPerRun: 150, startDelaySeconds: 30, ...(config.schedule || {}) };
if (process.env.CRAWL_INTERVAL_MINUTES) schedule.intervalMinutes = Number(process.env.CRAWL_INTERVAL_MINUTES) || schedule.intervalMinutes;

const say = (...a) => console.log("[crawler]", ...a);
const nowIso = () => new Date().toISOString();
const later = (ms) => new Date(Date.now() + ms).toISOString();

const dataDir = path.join(ROOT, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, "app.db"));
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA busy_timeout = 5000");
// Same events table as lib/db.js — created here only so the daemon can start
// before the web app has ever opened the database.
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, url TEXT,
    host TEXT, category TEXT NOT NULL DEFAULT 'general', software TEXT,
    geography TEXT NOT NULL DEFAULT 'international', participants INTEGER,
    event_type TEXT NOT NULL DEFAULT 'event',
    start_date TEXT, end_date TEXT, submission_deadline TEXT, location TEXT DEFAULT 'online',
    status TEXT NOT NULL DEFAULT 'pending', submitted_by TEXT, submitter_note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS crawler_state (
    id INTEGER PRIMARY KEY CHECK (id = 1), state TEXT NOT NULL DEFAULT 'stopped',
    paused INTEGER NOT NULL DEFAULT 0, run_requested INTEGER NOT NULL DEFAULT 0,
    heartbeat_at TEXT, next_run_at TEXT, pid INTEGER, current_note TEXT
  );
  CREATE TABLE IF NOT EXISTS crawler_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, started_at TEXT NOT NULL, finished_at TEXT,
    trigger TEXT NOT NULL DEFAULT 'schedule', status TEXT NOT NULL DEFAULT 'running',
    pages INTEGER NOT NULL DEFAULT 0, searches INTEGER NOT NULL DEFAULT 0,
    candidates INTEGER NOT NULL DEFAULT 0, added INTEGER NOT NULL DEFAULT 0, error TEXT, summary TEXT
  );
`);
db.exec("INSERT OR IGNORE INTO crawler_state (id) VALUES (1)");

const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === "EPERM";
  }
};

// One daemon at a time. When the app restarts, its previous crawler process
// may still be shutting down (it notices its parent died within a few
// seconds), so wait for it rather than giving up immediately.
async function otherDaemonRunning() {
  for (let i = 0; i < 8; i++) {
    const prior = db.prepare("SELECT pid, heartbeat_at, state FROM crawler_state WHERE id = 1").get();
    const live =
      prior.pid && prior.pid !== process.pid && prior.state !== "stopped" && alive(prior.pid) && Date.now() - Date.parse(prior.heartbeat_at || 0) < 30000;
    if (!live) return false;
    if (i === 0) say(`another crawler daemon (pid ${prior.pid}) is heartbeating; waiting in case it is shutting down...`);
    await new Promise((r) => setTimeout(r, 2500));
  }
  return true;
}

async function start() {
  if (await otherDaemonRunning()) {
    say("another crawler daemon is already running; exiting.");
    process.exit(0);
  }

  const setState = (fields) => {
    const sets = [...Object.keys(fields).map((c) => `${c} = @${c}`), "heartbeat_at = @hb"].join(", ");
    db.prepare(`UPDATE crawler_state SET ${sets} WHERE id = 1`).run({ ...fields, hb: nowIso() });
  };

  // Resume the schedule from the last finished run, so restarting the app (or
  // this process) doesn't trigger a fresh crawl every time.
  const lastRun = db.prepare("SELECT finished_at FROM crawler_runs WHERE finished_at IS NOT NULL ORDER BY id DESC LIMIT 1").get();
  const dueAt = lastRun ? Date.parse(lastRun.finished_at) + schedule.intervalMinutes * 60000 : Date.now() + schedule.startDelaySeconds * 1000;
  setState({ state: "idle", pid: process.pid, next_run_at: new Date(Math.max(dueAt, Date.now() + 5000)).toISOString(), current_note: null });
  say(`started (pid ${process.pid}); next run ${db.prepare("SELECT next_run_at FROM crawler_state WHERE id = 1").get().next_run_at}, then every ${schedule.intervalMinutes} min.`);

  let running = false;

  async function doRun(trigger) {
    running = true;
    const runId = Number(db.prepare("INSERT INTO crawler_runs (started_at, trigger) VALUES (?, ?)").run(nowIso(), trigger).lastInsertRowid);
    setState({ state: "running", run_requested: 0, current_note: "Starting" });
    say(`run ${runId} started (${trigger}).`);
    try {
      const stats = await runCrawl(
        { maxPages: schedule.maxPagesPerRun },
        {
          db,
          log: () => {},
          onProgress: (note) => setState({ current_note: note }),
        }
      );
      db.prepare("UPDATE crawler_runs SET finished_at = ?, status = 'ok', pages = ?, searches = ?, candidates = ?, added = ?, summary = ? WHERE id = ?").run(
        nowIso(), stats.pages, stats.searches, stats.candidates, stats.added, JSON.stringify({ found: stats.found, unreachable: stats.unreachable }), runId
      );
      say(`run ${runId} done: ${stats.pages} pages, ${stats.added} added to the review queue.`);
      setState({ state: "idle", current_note: null, next_run_at: later(schedule.intervalMinutes * 60000 * (0.9 + Math.random() * 0.2)) });
    } catch (e) {
      db.prepare("UPDATE crawler_runs SET finished_at = ?, status = 'error', error = ? WHERE id = ?").run(nowIso(), String(e.message || e).slice(0, 500), runId);
      say(`run ${runId} failed: ${e.message || e}`);
      // Retry sooner than a full interval, but not in a tight loop.
      setState({ state: "idle", current_note: null, next_run_at: later(Math.min(schedule.intervalMinutes, 30) * 60000) });
    } finally {
      running = false;
    }
  }

  const parentPid = Number(process.env.CRAWLER_PARENT_PID) || null;

  async function tick() {
    if (parentPid && !alive(parentPid)) {
      say("parent process is gone; shutting down.");
      shutdown();
      return;
    }
    setState({}); // heartbeat, also while a run is in progress
    if (running) return;
    const s = db.prepare("SELECT paused, run_requested, next_run_at FROM crawler_state WHERE id = 1").get();
    if (s.run_requested) return doRun("manual");
    if (!s.paused && s.next_run_at && Date.now() >= Date.parse(s.next_run_at)) return doRun(lastRun ? "schedule" : "startup");
  }

  function shutdown() {
    try {
      setState({ state: "stopped", current_note: null });
    } catch {
      // Database may already be closing; nothing more to do.
    }
    process.exit(0);
  }
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  setInterval(() => tick().catch((e) => say("tick error:", e.message)), TICK_MS);
}

start().catch((e) => {
  console.error("[crawler] failed to start:", e);
  process.exit(1);
});
