// One-time helper to populate a few example rows so the site isn't blank
// on first run. Safe to run more than once against an empty table only —
// it checks counts first. Run with: node scripts/seed.js
const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, "app.db"));

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
  -- Kept only for backward compatibility with existing installs — see the
  -- matching note in lib/db.js. Nothing here seeds into it anymore.
  CREATE TABLE IF NOT EXISTS winners (
    id INTEGER PRIMARY KEY AUTOINCREMENT, artist_name TEXT NOT NULL, competition_name TEXT NOT NULL,
    year INTEGER, category TEXT NOT NULL DEFAULT 'general', piece_title TEXT, image_url TEXT,
    portfolio_url TEXT, instagram TEXT, x_twitter TEXT, artstation TEXT, other_social TEXT, notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending', submitted_by TEXT, submitter_note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, url TEXT NOT NULL, description TEXT,
    category TEXT NOT NULL DEFAULT 'community', status TEXT NOT NULL DEFAULT 'pending',
    submitted_by TEXT, submitter_note TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT, visitor_id TEXT NOT NULL, path TEXT NOT NULL,
    referrer_path TEXT, country TEXT, region TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Same in-place migrations as lib/db.js, for a database that predates these columns.
const eventCols = db.prepare("PRAGMA table_info(events)").all();
if (!eventCols.some((c) => c.name === "software")) {
  db.exec("ALTER TABLE events ADD COLUMN software TEXT");
}
if (!eventCols.some((c) => c.name === "geography")) {
  db.exec("ALTER TABLE events ADD COLUMN geography TEXT NOT NULL DEFAULT 'international'");
}
if (!eventCols.some((c) => c.name === "participants")) {
  db.exec("ALTER TABLE events ADD COLUMN participants INTEGER");
}

const { count: eventCount } = db.prepare("SELECT COUNT(*) as count FROM events").get();

if (eventCount > 0) {
  console.log("Tables already have data — skipping seed.");
  process.exit(0);
}

const insertEvent = db.prepare(`
  INSERT INTO events (title, description, url, host, category, software, geography, participants, event_type, start_date, end_date, submission_deadline, location, status)
  VALUES (@title, @description, @url, @host, @category, @software, @geography, @participants, @event_type, @start_date, @end_date, @submission_deadline, @location, 'approved')
`);

insertEvent.run({
  title: "Blender Conference 2026",
  description: "The largest event dedicated to open-source 3D creation, bringing together artists, developers, and contributors.",
  url: "https://conference.blender.org/2026/",
  host: "Blender Foundation",
  category: "general",
  software: "Blender",
  geography: "country:NL",
  participants: 412,
  event_type: "event",
  start_date: "2026-10-21",
  end_date: "2026-10-23",
  submission_deadline: null,
  location: "Amsterdam, Netherlands",
});

insertEvent.run({
  title: "CG Award — Annual ArchViz Competition",
  description: "Annual architectural visualization competition recognizing the best individual artists and studios worldwide.",
  url: "https://cgaward.com/cgaward-annual-archviz-competition.html",
  host: "CGAward",
  category: "archviz",
  software: "Any",
  geography: "international",
  participants: 128,
  event_type: "event",
  start_date: "2026-11-01",
  end_date: null,
  submission_deadline: "2026-11-30",
  location: "Online",
});

insertEvent.run({
  title: "CGTrader Digital Art Competition",
  description: "Recurring digital art competition open to 3D artists across categories, with sponsor-backed prize pools.",
  url: "https://www.cgtrader.com/digital-art-competition",
  host: "CGTrader",
  category: "general",
  software: "Any",
  geography: "international",
  event_type: "rolling",
  start_date: null,
  end_date: null,
  submission_deadline: null,
  location: "Online",
});

insertEvent.run({
  title: "Sketchfab Weekly Challenge",
  description: "A themed community challenge that repeats weekly — open to all skill levels.",
  url: "https://sketchfab.com/community/challenges",
  host: "Sketchfab",
  category: "general",
  software: "Any",
  geography: "international",
  event_type: "rolling",
  start_date: null,
  end_date: null,
  submission_deadline: null,
  location: "Online",
});

insertEvent.run({
  title: "PolyHaven Community Render Challenge",
  description: "Open-ended challenge — use PolyHaven assets in a scene and submit any time.",
  url: "https://polyhaven.com/",
  host: "PolyHaven",
  category: "general",
  software: "Any",
  geography: "region:europe",
  participants: null,
  event_type: "ongoing",
  start_date: null,
  end_date: null,
  submission_deadline: null,
  location: "Online",
});

const insertLink = db.prepare(`
  INSERT INTO links (title, url, description, category, status)
  VALUES (@title, @url, @description, @category, 'approved')
`);

insertLink.run({
  title: "Poly Haven",
  url: "https://polyhaven.com/",
  description: "Free, high-quality HDRIs, textures, and models for any use, commercial or otherwise.",
  category: "asset-library",
});
insertLink.run({
  title: "r/3Dmodeling",
  url: "https://www.reddit.com/r/3Dmodeling/",
  description: "General-purpose 3D modeling community for feedback, help, and shares.",
  category: "community",
});
insertLink.run({
  title: "Blender Guru",
  url: "https://www.blenderguru.com/",
  description: "Long-running tutorial resource for learning Blender, from beginner to advanced.",
  category: "tutorial",
});

console.log("Seeded example events and links.");
