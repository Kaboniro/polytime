# PolyTime

An aggregated calendar of 3D art events, ongoing challenges, and rolling contests — plus a
directory of useful links (communities, tools, tutorials). One place to connect 3D artists with
what's happening and what's out there, instead of it being scattered across a dozen Discords and
subreddits. Anyone can submit an addition; nothing goes live until you approve it in `/admin`.

## Why it's built this way

- **Next.js (App Router)** — pages and API routes in one framework, no separate backend to run.
- **SQLite via Node's built-in `node:sqlite`** — the whole dataset is one file at `data/app.db`.
  Zero config, trivial to back up (`cp data/app.db data/app.db.bak`). This project deliberately
  does *not* use the `better-sqlite3` package: that ships a native module that `npm install` has
  to *compile* on your machine (via node-gyp), which on Windows means installing Visual Studio's
  "Desktop development with C++" workload — a multi-GB toolchain most people don't have. Node has
  shipped its own SQLite module since v22.5 (stable-ish/experimental, no separate flag needed
  since v23.4), so `npm install` here never compiles anything. Requires **Node 22.5+** — check
  with `node -v`; if you're on an older Node, update it. It still needs a **persistent disk** —
  it will **not** work on pure-serverless hosting (e.g. default Vercel deploys); use a VPS or a
  host with persistent volumes (Railway, Fly.io, Render, a $5 Hetzner/DigitalOcean box).
- **One shared moderation model** — events and links each have a `status` column
  (`pending` / `approved` / `rejected` / `archived`). Public pages only ever read `approved` rows; the submit
  form always writes `pending`, including anything you add yourself. One review flow to maintain
  instead of two.
- **No auth library** — a password checked against an environment variable, then a one-time code sent
  by email, then a signed cookie (see "Admin login" below). Fine for a single admin account; not meant
  to scale to multiple editors without revisiting.

## Running it locally

```bash
npm install
cp .env.example .env.local   # then edit ADMIN_PASSWORD and ADMIN_SECRET
npm run seed                 # optional: adds a few example rows so it's not blank
npm run dev
```

On Windows, use `copy .env.example .env.local` instead of `cp`, and generate a secret with
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` if you don't have
`openssl`.

Visit `http://localhost:3000`. Log into `/admin` with the password from `.env.local`.

## Deploying

**What you need.** A host with a **persistent disk** and either Docker or Node 22.5+ — the whole site is one
SQLite file, so this **will not work on serverless hosting** (a default Vercel deploy, for example). A small
VPS (1 GB RAM is enough for the site; give it more if the crawler's search engine runs on the same box)
from Hetzner, DigitalOcean, Fly.io, Railway or Render with a volume all work.

**Make the bundle.** `npm run bundle` writes `dist/polytime-<date>.tar.gz` (about 0.4 MB): the source plus
the Docker files, and **never** your `.env.local`, your database (`data/`), `node_modules`, or the build
cache. It refuses to write the archive if any of those slip in. (`npm run bundle -- --with-build` also
includes `.next` for hosts that can't build.) Upload and extract it on the server.

### Option A: Docker Compose (recommended)

Runs the app (with its crawler) and the SearXNG search engine the crawler uses; the search engine is not
reachable from outside.

1. `cp deploy/env.production.example .env.production` and fill it in (see the checklist below).
2. `docker compose up -d --build`. The site is on port 3000.
3. **HTTPS on your domain:** point the domain's DNS at the server, put `SITE_DOMAIN=your-domain.example` in a
   file named `.env` next to `docker-compose.yml`, and run `docker compose --profile https up -d --build`.
   Caddy gets and renews the certificate automatically. Then bind the app to `127.0.0.1:3000:3000` in
   `docker-compose.yml` so it's only reachable through Caddy.

Your content lives in the `polytime-data` Docker volume; **back it up** (below). `docker compose logs -f app`
shows startup warnings, including the crawler starting.

### Option B: plain Node (no Docker)

```bash
npm ci
npm run build
NODE_ENV=production npm start        # PORT=3000 by default; put your env vars in the environment
```

Run it under a process manager (a systemd unit or pm2) and put a reverse proxy with TLS in front (Caddy or
nginx). The crawler still starts with the app. It needs a search engine: run SearXNG separately (for
example `docker run -d -p 127.0.0.1:8888:8080 -v ./deploy/searxng:/etc/searxng searxng/searxng`) and set
`SEARXNG_URL=http://127.0.0.1:8888`, or leave `SEARXNG_URL` empty to crawl only the seed sites. Windows +
WSL is only for local development (`SEARXNG_AUTOSTART=wsl`).

### Checklist before you go live

- [ ] `SITE_URL` is your real address (canonical links, sitemap and share cards use it).
- [ ] `ADMIN_PASSWORD` (12+ characters) and a fresh 64-character `ADMIN_SECRET` are set; don't reuse local ones.
- [ ] `ADMIN_EMAIL` and an email provider (`SMTP_*` or `EMAILJS_*`) work: **production refuses to sign in
  without them**, so try a login right after deploying. The server prints `PRODUCTION WARNING` lines at
  startup for anything missing (localhost `SITE_URL`, short secrets, no email provider).
- [ ] The site is served over HTTPS (admin cookies are `secure` in production and won't be sent over HTTP).
- [ ] `GET /api/health` returns `{"ok":true}` (the Docker healthcheck and most hosts can use it).
- [ ] Submit `https://your-domain/sitemap.xml` to Google Search Console and Bing Webmaster Tools.

### Moving your local data to the server

Stop the app, then copy `data/app.db` (and `app.db-wal` / `app.db-shm` if present) into the server's data
folder (`/app/data` in the container's volume, or `data/` for plain Node), and start it again. It includes
visitor submissions, submitter emails and analytics, so treat it as private. Starting fresh works too: the
database is created empty on first start.

### Backups

Everything is `data/app.db`. With the app running, take a consistent copy with SQLite's backup command:
`sqlite3 data/app.db ".backup 'backup-$(date +%F).db'"`, or stop the app and copy the three `app.db*` files.
In Docker: `docker compose exec app node -e "new (require('node:sqlite').DatabaseSync)('data/app.db').exec(\"VACUUM INTO '/app/data/backup.db'\")"`
then `docker cp` it out. Do this on a schedule (cron) and keep copies off the server.

### Updating

Make a new bundle, upload and extract it over the old files (your `.env.production` and data are untouched
because the bundle doesn't contain them), then `docker compose up -d --build` (or `npm ci && npm run build` and
restart). Database changes are applied automatically at startup.

> The production build and `npm start` were tested locally (all pages, health check, security headers, admin
> protection). The Docker and Compose files were **not built or run here** (no Docker on this machine), so do
> a first `docker compose up --build` on a test server before pointing your domain at it.

## How content flows

1. Anyone visits `/submit` and fills in an event or a link. It's written to the
   database with `status = 'pending'` — invisible on the public pages.
2. You log into `/admin` and see every pending item, with an **Approve**, **Reject**, or
   **Delete** button.
3. Approving flips `status` to `'approved'`, and it immediately appears on `/` or `/links`.
   Rejecting keeps a record but hides it; Delete removes the row entirely.
4. You can also manage everything directly from `/admin` (see below), which skips the queue.

## Managing content as the admin

`/admin` (password from `.env.local`) has five tabs:

- **Review queue** — visitor submissions waiting for a decision (approve / reject / edit / delete).
  Only pending items live here; once something's been approved or rejected it moves to its own
  resource tab below instead of sitting in a growing "recently reviewed" backlog.
- **Events**, **Links** — every row in that table whatever its status, with search and
  a status filter. From here you can **create** an entry (it defaults to Approved, so it goes live
  immediately — set Status to Pending to keep it hidden), **edit** any field, approve or reject it,
  or **delete** it. Edits show up on the public pages straight away. Events also carries
  **Participants** — a plain column (not its own table or tab), entered on an event's own edit form
  once a competition wraps up and the count is known; the Events tab shows a one-line running total
  above the table. An event's **Type** is one of *one-off*, *conference*, *rolling* or *ongoing*; the
  public Timeline page has a **Type** filter for them. One-offs and conferences have dates and move
  through upcoming / running / archived; rolling and ongoing entries don't. Conference is a separate
  type from one-off, so existing events stay one-off until you change their Type in the edit form.
- **Queries** — messages from the **Query** tab on the public `/submit` page (content removal requests,
  corrections, questions, other). They are not content, so they skip the review queue and are never shown
  publicly; each has a subject, message, optional page/link it concerns and optional reply-to email
  (stored in the `queries` table). You can mark one resolved (or reopen it) or delete it, and reply by
  email straight from the entry. The Review queue page shows a banner when any are open. To act on a
  valid removal request, delete or reject the event/link in its own tab, then mark the message resolved.
  The public endpoint is rate-limited (5 messages per hour per address, in memory) and has a hidden
  honeypot field to catch bots. Note the message and email are personal data: mention them in your
  privacy policy (`/privacy`) if you use this form.
- **Activity** — visitor traffic for 7 days / 30 days / 90 days / 1 year / all time, optionally filtered
  to one page. It shows page views, unique visitors, sessions, pages per session, bounce rate and average
  session length, each compared with the previous period of the same length (percentages only once the
  earlier period has at least 10 to compare); a traffic chart (daily bars for views, a line for visitors;
  weekly buckets beyond 120 days) with a table view; a weekday-by-hour heatmap; new vs returning visitors;
  top pages; where visitors go next (same-site referrer → page); and countries. **Export** offers raw page
  views, daily totals, pages, countries and navigation paths as CSV, and the whole report as JSON, all for
  the range and page currently on screen (`/api/admin/activity/export`, admin login required; cells that
  could run as spreadsheet formulas are neutralized). Times are UTC. A session is one visitor's run of
  views with no gap over 30 minutes. See "Site activity & cookies" below for what this is built on and
  what it deliberately doesn't collect.

Admin writes are validated on the server: required fields, choices from the known category/type/
status lists, real dates (an end date can't precede its start), years 1900–2100, participant counts
0 and up, and links must be full `http(s)` URLs. Every admin page and API route re-checks the login
cookie, so being logged out means no access even to a direct URL.

### Admin panel is a separate app shell

`/admin/*` and the public pages are two independent [Next.js root layouts](https://nextjs.org/docs/app/api-reference/file-conventions/layout#root-layout),
split with a route group: `app/(site)/layout.js` (public nav, footer, cookie banner) and
`app/(admin)/layout.js` (the same header as the public site — the hex-clock logo and pill-style tabs,
marked "Admin" — with the admin tabs (Review queue, Events, Links, Queries, Activity), a public-site link
and Log out in it; no footer or cookie banner). The route group folder name doesn't appear in the URL, so `/admin` still resolves
from `app/(admin)/admin/page.js`. Neither layout renders the other's chrome: the admin panel never
shows the public nav/footer/cookie banner, and the public site never shows admin tabs or controls —
except one deliberate crossover, a small **Admin** link that's appended to the public nav, but only
when `isAdminRequest()` (`lib/auth.js`) confirms the visitor already has a valid admin session
cookie. It's a shortcut back to the panel for whoever's already signed in, never a way to discover
or reach admin as a logged-out visitor — the login page still requires the real password either way.

## Admin login

Signing in to `/admin` takes two steps.

1. **Password** (`/admin/login`). The password is `ADMIN_PASSWORD`. A correct password does not log you
   in; it emails a one-time code to `ADMIN_EMAIL` and hands the browser a short-lived "pending" cookie.
2. **Emailed code** (`/admin/verify`). Type the 8-character code (case and dashes don't matter) to get the
   real session cookie. A code works once, expires after 10 minutes, and allows 5 tries (10 across
   re-sends; at most 4 emails per login, 30 seconds apart). Codes are stored only as an HMAC keyed with
   `ADMIN_SECRET`, never in plain text. The pending cookie cannot open the panel by itself, and the
   password step is rate-limited (8 tries per 15 minutes per address, in memory). Wrong codes get a mocking
   message and a cartoon face (original SVG drawings in `components/admin/FunnyFaces.js`, no emoji); after
   too many misses the face is knocked out and you start over from the password.

Set it up in `.env.local` (see `.env.example`): `ADMIN_PASSWORD`, `ADMIN_SECRET`, `ADMIN_EMAIL` and an email
provider (`lib/mail.js`). **SMTP** is preferred (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, optionally
`SMTP_FROM` / `SMTP_SECURE`). For Gmail that is `smtp.gmail.com`, port 465 and an **app password** (Google Account
> Security > 2-Step Verification > App passwords), not your normal password; the spaces Google shows in it
are ignored. **EmailJS** is the alternative, used only when SMTP isn't set: create a service and a template
whose *To Email* is `{{to_email}}` and whose body uses `{{subject}}`, `{{code}}` and `{{expires_in}}`, set
`EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY` and `EMAILJS_PRIVATE_KEY`, and turn on
"Allow EmailJS API for non-browser applications" under Account > Security. **With no provider**, development
prints the code in the server console so you can still sign in; **production refuses to sign anyone in** rather
than silently skipping the second step. If `ADMIN_PASSWORD` or `ADMIN_EMAIL` is empty, admin login shows an error.
Keep `.env.local` out of version control (`.gitignore` already covers `.env*`) and rotate the app password if
it is ever exposed.

## Event crawler

A background crawler looks for current 3D-art competitions and events, including obscure and
non-English ones (Chinese, Korean, Thai, Japanese, Vietnamese, Indonesian, ...), and adds what it finds to the
**Review queue** as `pending` rows with `submitted_by = crawler` — nothing it finds is ever
published without you approving it. Its note on each row says where it was found, the detected
language, a confidence score, and whether the dates came from the page's structured data or were
guessed from its text (verify those; the category guess is also rough).

- **Coverage.** Countries searched (each in its own language): China, Korea, Thailand, Japan, Taiwan, Vietnam,
  Indonesia, the US and UK (English), Germany, France, Spain, Italy, the Netherlands, Poland and Brazil. Add
  a country by adding a locale block to `crawler/config.json`; the page budget per run (300 pages, in
  `schedule.maxPagesPerRun`) is split evenly across countries so none is starved. Dates are read in Asian and
  European formats (Thai Buddhist years, `15. Oktober 2026`, `15 octobre 2026`, day-first `15.10.2026` outside
  North America).
- **How it finds things.** (1) If a search provider is configured, it runs the local-language queries per
  country from `crawler/config.json`, restricted to pages posted or updated in the **last 30 days**
  (`search.recencyDays` in the config; 0 removes the limit) and paged through two result pages deep
  (`search.pagesPerQuery`). On top of the search engine's own time filter, a page that states its publish or
  update date (structured data, `article:published_time`, a `<time>` tag, or the engine's date) and is older
  than the window is skipped; pages that state no date are kept. This is about when the announcement was
  posted, not the event's own dates: a contest posted or updated this month that runs until spring still
  qualifies, and one whose dates have all passed still doesn't. The free provider is
  **SearXNG** (`SEARXNG_URL`), a meta-search engine you run yourself; it can query Naver (Korea), Baidu/Sogou
  (China) and others per country via each locale's `searxEngines`. **Brave Search** (`BRAVE_API_KEY`) is
  the alternative if you'd rather not self-host; it is credit-based, not truly free. (2) It scans the seed
  pages in the same file and follows links that look 3D-related. Edit `config.json` freely to add queries,
  countries or seed sites.
- **Seed sources.** Besides Blender events and CGTrader, the config includes 80 Level's events calendar
  (read directly: its page embeds every event with dates, place and official link, via the `80lv` reader in
  `crawler/adapters.js`, so those come in as conferences with real dates), RenderHub contests and blog,
  KitBash3D, Reallusion Magazine, Daz 3D (blog and art-studio forum), the render farms Fox Renderfarm,
  ReBusFarm, GarageFarm and iRender, and itch.io game jams (upcoming and in progress). A source may set
  `linkPattern` (follow every link whose URL matches), `limit`, or `adapter`. Some of these pages list no
  contests at the moment; the US search locale also has brand queries (Reallusion, Daz, KitBash3D, Fox
  Renderfarm, ArtStation, itch.io) to catch what the pages don't show. **ArtStation is listed but disabled**:
  it answers automated readers with HTTP 403, so it can't be crawled; its challenges surface through search
  and press coverage instead.
- **Running SearXNG (free).** This project is set up with SearXNG running natively inside **WSL2
  (Ubuntu)** — no Docker — in `~/searxng` inside that distro: the SearXNG source (`src/`), a Python 3.12
  virtualenv (`venv/`, created with `uv`), and `settings.yml`. That file turns on the `json` output the
  crawler needs, sets `limiter: false`, binds to `127.0.0.1:8888`, and enables the regional engines
  (Google, Bing, Naver, Yahoo, Baidu, Sogou). `.env.local` has `SEARXNG_URL=http://localhost:8888` and
  `SEARXNG_AUTOSTART=wsl`, so **starting the app also starts SearXNG** (`instrumentation-node.js`) and
  stopping the app stops it; if something already answers on that address it is left alone. Other setups:
  run it yourself with Docker (`docker run -d -p 8888:8080 -v ./searxng:/etc/searxng searxng/searxng`, with
  `search: formats: [html, json]` and `server: limiter: false` in `settings.yml`) and just set
  `SEARXNG_URL`; on Linux/macOS leave `SEARXNG_AUTOSTART` unset and run it as a service. Public SearXNG
  instances aren't suitable (rate limits, JSON disabled). Web engines scraped through SearXNG rate-limit quickly (Google shows a CAPTCHA, Brave answers "too many
  requests", Baidu and Sogou are already blocked, Bing returns nothing with the past-year filter). So each
  query uses **one** engine from the locale's `searxEngines` list in `crawler/config.json`, in rotation, falls
  back to the next if it gets nothing, and searches are paced a few seconds apart. Startpage, Mojeek, Brave
  and Yahoo (plus Naver for Korea) are what currently work. If a run finds nothing, an engine is probably
  suspended: query SearXNG directly and look at `unresponsive_engines` in the JSON.
- **Translation.** Each candidate's *description* is machine-translated to English (titles are left as
  written), only for candidates that passed filtering. The language comes from the page's `lang`
  attribute, falling back to the script (Hangul, kana, Han, Thai, Vietnamese letters). The default is the
  free MyMemory service (no key; ~5,000 characters/day, ~50,000 if `TRANSLATE_EMAIL` is set); for unlimited
  use, self-host LibreTranslate and set `LIBRETRANSLATE_URL`. The queue note keeps the original text (first
  300 characters) so you can check the translation, and says so if translation failed or ran out of quota.
  Machine translation is approximate — treat it as a summary, not the organizer's wording.
- **What it keeps.** A page's title or description must mention both 3D-art terms and contest terms
  (multilingual keyword lists in `crawler/crawl.js`); it must not look like a results/winners notice,
  course, video or kitchen-appliance page; it must not have all its dates in the past; and it must reach a
  confidence of 70% (`--min-confidence`). Near-identical titles from different sites are merged. Anything already in `events` in any status — including rejected and archived — is skipped by
  URL or title, so rejecting something means it doesn't come back.
- **Options.** `--dry-run` prints candidates and writes nothing (recommended first run); `--locales=KR,CN`
  limits countries; `--max-pages=60` caps pages fetched (default 300); `--recency-days=90` widens (or `0`
  removes) the recency window; `--pages-per-query=3` pages deeper through search results.
- **Politeness.** It identifies itself as `PolyTimeBot`, obeys `robots.txt`, waits 1 second between
  requests to the same host, and caps page size and time.
- **Geo-restricted sites.** A site that can't be reached from your network is listed at the end of a run
  as unreachable or blocked (HTTP 403/451). To read such sites, set that country's `CRAWL_PROXY_<CC>` in
  `.env.local` to an HTTP proxy you operate or rent there; the crawler then fetches that locale's sites
  through it. It does not include any proxy or block-evasion of its own. Respect each site's terms.
- **Not covered.** Pages that only render in JavaScript (no server-rendered text or JSON-LD), sites behind
  logins or captchas, and dates written only as day/month/year numbers without a month name.
- **Always running.** When the app starts (`npm run dev` or `npm run start`), `instrumentation-node.js`
  launches `crawler/daemon.js` as a child process, which then sleeps between runs and crawls every
  24 hours (`schedule.intervalMinutes` in `crawler/config.json`, or `CRAWL_INTERVAL_MINUTES`). After a
  restart it resumes from its last finished run rather than crawling again immediately. It stops with
  the app; if you run the site some other way, start it yourself with `npm run crawl:watch`. Set
  `CRAWLER_ENABLED=0` to keep it from starting with the app. Only one daemon runs at a time. Each daily run
  makes roughly 30 searches, which fits the Brave Search API's free monthly allowance; a shorter
  interval will use more.
- **On the admin dashboard.** The **Review queue** page has an **Event crawler** panel next to the queue:
  live status (running / idle with the next run time / paused / not running), **Run now**, **Pause /
  Resume**, last-run stats, recent runs, and any sites that couldn't be reached. Crawler finds appear in the
  queue tagged **Crawler** and the queue refreshes itself when a run adds items. The panel talks to the
  daemon through the `crawler_state` and `crawler_runs` tables (`lib/db.js`); "not running" means the
  daemon hasn't heartbeated for 90 seconds.
- **One-off runs.** `npm run crawl` (with the options above) still runs a single crawl from the terminal.

## SEO

- **Set `SITE_URL`** (`.env.local` / your host's environment) to the address the site is served from, e.g.
  `https://polytime.example`. Canonical URLs, the sitemap, share cards and structured data are all built
  from it (`lib/site.js`); the `localhost` default is for development only and must not be deployed.
- **Every event has its own page** at `/events/<id>` (`app/(site)/events/[id]/page.js`): a real heading,
  dates, category, location, description and a link to the official page, with its own title and meta
  description, canonical URL, share card and `Event` structured data. Titles in the events table link to
  it, so crawlers and people can reach it. Only *approved* events exist there; pending, rejected and
  unknown ids return a real 404. Events with no start date (rolling / ongoing) get no `Event` markup rather
  than invented dates, and placeholder locations like "See event page" are never treated as a place.
- **Structured data** (JSON-LD, `lib/seo.js`): `WebSite` and `Organization` on every page, `Event` for
  live/upcoming events on the unfiltered home page, and `Event` + `BreadcrumbList` on each event page. Google
  can show event rich results only for pages whose primary subject is the event, so the event pages are the
  ones that count; check them with Google's Rich Results Test after deploying.
- **Metadata**: a title template (`Page — PolyTime`), a description, canonical URL, Open Graph and Twitter
  cards on every public page. The share image (`app/(site)/opengraph-image.js`) is generated from the site
  palette. The favicon is `app/(site)/icon.svg` (`public/logo.svg` is the same file, for the Organization logo).
- **Crawling**: `/robots.txt` allows the site, blocks `/admin` and `/api/`, and points at `/sitemap.xml`
  (the public pages plus every approved event, regenerated on each request). The admin panel also sends
  `noindex, nofollow`. Filtered and paginated views of the home page (`?type=`, `?category=`, `?page=`...)
  are `noindex, follow` with a canonical pointing at `/`, so re-sliced copies of the same list don't compete
  with it.
- **After deploying**: submit `https://your-site/sitemap.xml` in Google Search Console and Bing Webmaster
  Tools. Keep event descriptions specific and original; thin or copied descriptions are what search engines
  rank poorly.

## Site activity & cookies

The Activity tab in `/admin` is fed by a small first-party analytics system — no third-party
service, nothing sent off this server:

- **Opt-in only.** Every visitor sees a cookie banner once (`components/CookieConsent.js`) and
  nothing is recorded before they accept it. Accepting sets two cookies — a consent flag and a
  random visitor id, both plain (not `HttpOnly`, unlike the admin session cookie) since neither is
  a secret. Declining sets only the consent flag, so nothing is ever recorded for that visitor.
  Anyone can change their mind later from **Cookie preferences** in the footer.
- **Only real pages are counted.** `PUBLIC_PATHS` in `lib/analytics.js` lists the public pages
  (`/`, `/timeline`, `/links`, `/submit`, `/privacy`). A view is recorded only for those, so removed routes
  (an old `/winners`) and 404 probes (`/wp-login.php`, `/.env`) never appear, and rows already recorded for
  paths that aren't in the list are ignored by every report (the Activity tab says how many). **When you add
  a public page, add its path to `PUBLIC_PATHS`** or its views won't be recorded.
- **No client-side beacon script.** A page view is logged server-side, during the normal render of
  `app/(site)/layout.js` — this only works because the site navigates with plain `<a href>` links rather
  than client-side routing (see `components/FilterBar.js`), so every navigation is a real request
  the server sees. `proxy.js` (Next's replacement for `middleware.js`) forwards the current
  pathname as a request header, since that's the one thing a Server Component can't otherwise know
  about the request.
- **Location is best-effort, from whatever's already in front of the app** — `cf-ipcountry`
  (Cloudflare; plus `cf-region-code` with its free "Add visitor location headers" transform on) or
  `x-vercel-ip-country` (Vercel), read directly as request headers. There's no
  bundled IP-geolocation database: those either restrict redistribution (MaxMind's GeoLite2 license
  does) or run 100MB+ for a country code, and this project avoids both for the same reasons
  `lib/db.js` gives for using `node:sqlite` over `better-sqlite3`. A plain VPS with nothing in front
  of it won't set either header, and location just stays empty for those visitors — that's the
  honest answer, not a bug. **Put Cloudflare's free tier in front of a VPS deploy** if you want this
  populated; it's the standard, zero-cost way to get it.
- **The IP address itself is never stored** — only the country/region it resolves to, at write time.
  See `lib/analytics.js` for the whole thing, and `/privacy` for the visitor-facing explanation.
- `/admin/*` and `/api/*` paths are never logged as page views — the admin's own use of the site
  isn't "visitor activity."

## Privacy & corrections

`/privacy` (linked in the footer) explains what the site collects and how to get a listing
corrected or removed. Set `CONTACT_EMAIL` in `.env.local` to a real address you check — until it's
set, `/privacy` says no contact address is configured (a dev-only reminder makes that obvious
locally) instead of silently showing a broken link.

## Extending it

- **Admin fields** (what the create/edit forms show, what gets validated, and the only columns the
  admin API will write) live in `lib/resources.js`. A new column needs adding there, in the
  `ALTER TABLE` migration in `lib/db.js`, and in the public queries/pages that display it.
- **Categories** live in `lib/constants.js` — add or rename them there and every dropdown/filter
  picks it up.
- **Schema** lives in `lib/db.js` (`init()`). SQLite will happily add columns via
  `ALTER TABLE ... ADD COLUMN` if you need more fields later; there's no migration framework here
  on purpose, given the size of the project — for a bigger schema change, write a one-off script
  like `scripts/seed.js` that runs the `ALTER TABLE` once. A `winners` table is still created for
  backward compatibility (an existing install's data isn't dropped by an update), but nothing in
  the app reads or writes it — the Winners feature was removed to keep the site focused on events
  and resources. Drop it by hand (`DELETE FROM winners` or removing the `CREATE TABLE`/index lines
  in `lib/db.js`) if you don't need the old data.
- **Timeline tab** (`/`, labeled "Timeline" in the nav — despite the file path, this is the plain
  table, not the Gantt view): a single spreadsheet-style table (Name, Dates, Category, Software,
  Host). Clicking a host expands that row in place to show the description, type, location, exact
  dates, and a link to the event page. Every dated event is in one of three phases —
  `eventPhase()` in `lib/filters.js` — **running** (started, not yet ended), **upcoming** (hasn't
  started), or **archived** (ended); ongoing/rolling entries sit outside this axis entirely (no
  dates to place them on it). The table sorts running first (most time-sensitive), then upcoming,
  then ongoing/rolling, then archived (most recently ended first) — the full list, not a truncated
  preview; past 25 rows it's paginated instead (see below). Only running and archived rows get an
  explicit tag (`components/Badge.js` — green "Running", neutral "Archived") next to the title;
  upcoming is the default and stays untagged. Filtering is three dropdowns — Category, Software and
  Date — whose values live in the URL (`/?category=archviz&date=30d`), so a filtered view is
  shareable. `components/EventTable.js` and `components/FilterBar.js` are the client components
  involved; `app/(site)/page.js` picks the public fields it passes on, so submitter emails never
  reach the browser.
- **Pagination** (`components/Pagination.js`) kicks in past 25 items, on the Timeline table, the
  Links grid, and each admin resource table. The public pages are server-driven — `?page=2` lives
  in the URL alongside the other filters, so a specific page is a real, shareable link, same
  reasoning as `FilterBar`. Admin's `ResourceTable` is the other case: its search box and status
  filter are already local component state, not URL state, so its page number is too (plain
  `useState`, reset to 1 whenever the search or filter changes, so a narrower result never leaves
  you stranded on a now-empty page). One thing to know if you touch this: `Pagination` never
  receives a function prop from a Server Component — React can't send a function across that
  boundary at all — so the public pages hand it `basePath` + a plain object of the current filter
  values instead, and it builds each page's URL itself.
- **Calendar tab** (`/timeline`, labeled "Calendar" in the nav) is a **Gantt view** built entirely
  from this site's own event data
  (`components/GanttChart.js`) — a real month calendar grid (weekday header, navigable by month) on
  the left, with a narrow **"Ongoing & rolling" panel beside it** on the right (stacked below on
  narrow screens). Only events with a fixed date go on the calendar itself, drawn as bars spanning
  their days (falling back to the submission deadline, then a single-day marker, when there's no
  `end_date` to use), stacked into separate lanes within a week when they overlap so nothing draws
  on top of anything else — ongoing/rolling entries have no date to place there at all, so they
  never touch the calendar; they're just rows in the side panel instead (a "↻"/"∞" prefix and a
  small color swatch matching their calendar-bar color, if they had one). Bars animate in on load
  and on every month change (a CSS `@keyframes` grow-from-left in `app/globals.css`, skipped under
  `prefers-reduced-motion`). Clicking any bar *or* a side panel row opens a **modal** (not an inline
  panel — the calendar itself never grows or shifts underneath it) showing just the title at first;
  an "i" button next to the close button expands it in place to reveal the date range, category,
  geography, host, description and event link. A running or archived event also gets the same
  green "Running" / neutral "Archived" tag the Timeline tab's table uses (`eventPhase()`,
  `lib/filters.js`) — shown in the modal, and appended to the bar's hover tooltip, since there's no
  room for it on the bar itself; an upcoming event's bar and tooltip are unmarked. Every new
  selection starts collapsed again, even switching directly from one item to another. The modal
  closes on Escape, on a backdrop click, or the close button. This replaced an
  earlier Google Calendar embed, which only ever showed a duplicate of the same data one step
  removed, couldn't place undated entries either, and required a separately-maintained public
  calendar.
- **Every event gets its own solid, unique color** on the Gantt view — no activity-based recoloring
  (past vs. upcoming) and no fill texture, just one flat color per event everywhere it appears. The
  8 hues in `app/globals.css` (`--gantt-1` through `--gantt-8`, both the dark-mode `:root` block and
  the light-mode override) are a validated categorical palette — a fixed, colorblind-safe order,
  not eyeballed; re-validate before changing any hex (contrast vs. surface, CVD separation between
  adjacent slots, normal-vision separation). `colorVars()` in
  `components/GanttChart.js` picks an event's slot by `id % 8`, so a color is stable everywhere
  that event appears (including across month navigation) — ids are unbounded, so past 8 concurrent
  events a hue can repeat, which is only ever ambiguous if two same-slot events land in the same
  week, and the bar's own label (always visible, truncated) disambiguates that. Each slot also
  carries a precomputed text color (`--gantt-N-ink`, WCAG contrast against black and white, not
  eyeballed — most hues read better with black text, green always needs white).
- **Visual design started deliberately flat and sharp** and has since picked up a "playful" accent
  layer (`components/polytime-ui/`, below) on cards, the Gantt chart's chrome — nav buttons, side
  panel rows, the modal, its i/close buttons — and links: rounded corners, hover tilt, a bobbing
  sticker. The calendar grid itself, table layout, and form inputs stay sharp on purpose, so the
  playful touches read as accents on top of a still-mostly-flat site rather than a full redesign.
  Table/grid column headers and the admin panel's top-bar title are literal white-on-black
  (`bg-black` + `text-white`, not the neutral scale, so they don't flip in light mode — see
  `app/globals.css`'s note on why `bg-orange-500` et al. are left alone the same way).
  `components/Badge.js` renders a tag as plain colored text, not a filled/bordered pill —
  category/type tags sit *below* the title they describe (see `LinkCard.js`), not beside it in a
  box.
- **The empty right-hand column of `/submit` and of every `/events/<id>` page** (hidden below the
  `lg` breakpoint) holds a decorative photo (`components/SideImage.js`). Submit always uses
  `emma-candy1.jpg`; event pages rotate through the photos in `SIDE_IMAGES` by event id (add a photo to
  `images/`, copy it to `public/images/`, and list it there). Originals live
  in `images/`; only copies under `public/images/` are served. The photo stretches to the row's
  height and is faded with a CSS mask on every edge, much more on the left. `components/PhysicsPlayground.js` (a matter-js avalanche toy that
  used to fill this column) is kept but no longer used anywhere.
- **The site palette** (`app/globals.css`, top of the file) is five hex colors — cerulean,
  light-sea-green, apricot-cream, floral-white, grapefruit-pink — converted to OKLCH by hand (see
  the file's own comment for the reasoning) and used to derive every neutral and accent CSS
  variable Tailwind's utility classes resolve through (`--color-neutral-50..950`,
  `--color-orange-400/500`, `--color-red-400`, `--color-sky-400`, `--color-violet-400`,
  `--color-emerald-*`). Dark mode's neutral scale is tinted toward cerulean, light mode's toward
  floral-white — the palette's own two temperature extremes, one per theme, instead of one tint
  reused for both. The site currently always renders the floral-white (off-white) theme regardless
  of system preference — the light block in `app/globals.css` is wrapped in `@media all`; change it
  back to `(prefers-color-scheme: light)` to follow the visitor's system again. The `--gantt-1..8` categorical palette described above is deliberately **not**
  derived from these five colors — five hues isn't enough to keep it colorblind-safe, so it stays
  its own validated instance. Body text uses **Nunito** (`next/font/google`, wired as
  `--font-sans-ui` in both root layouts) instead of the system sans, and heading sizes were pulled
  down a step across the board (`components/HeadingInfo.js`'s `SIZE` map, admin page `h1`s,
  `StatTile.js`) to suit the smaller, rounder letterforms.
- **Participants** is an admin-only headcount column on events (`participants`, nullable — blank
  means unknown, not zero). Not on the public submit form; it's meant to be filled in by the admin,
  from the event's own edit form, once a competition wraps up and the number is known. It's a
  column on Events, not its own resource — see it and its running total on the Events tab.
- **Software** is free text on each event (e.g. `Blender, ZBrush`). Existing databases get the
  column added automatically on next start; rows created before that show `—` until filled in.
  Write `Any` for events that don't restrict software: they match every Software filter.
- **Geography** is where a competition is centered: a specific country, a continent-level region,
  or International. Stored as one column (`international`, `region:europe`, `country:DE`, ...) —
  see `lib/geography.js`. Existing databases get the column added automatically (defaulting
  existing rows to International) on next start.
- **Country flags** use the [`flag-icons`](https://github.com/lipis/flag-icons) package (real SVG
  images, MIT licensed) instead of Unicode flag emoji. A flag emoji is two "regional indicator"
  letters, and Windows' emoji font doesn't draw those as a picture — it falls back to showing the
  bare two-letter code, which looks broken; an actual image renders identically everywhere. Its
  stylesheet is imported in both root layouts (`app/(site)/layout.js` and `app/(admin)/layout.js` —
  see "Admin panel is a separate app shell" below); Next.js resolves and bundles the flag SVGs it
  references automatically, the same as importing any other package's CSS — no extra install step.
  Region/International icons stay plain globe emoji, which (unlike a flag) render fine everywhere.
  See `components/GeoIcon.js` and `lib/geography.js`.
- **`components/polytime-ui/`** is a small kit ported from a reference `polytime-ui` package
  (kept at the project root, unused by the app — nothing imports from it, it's just the original
  source in case you want it for another project): `EventCard` (a countdown/progress-bar card,
  `useCountdown.js`), `CategoryIcon` (low-poly pyramid/cube/torus per kind), `HexClockLogo`,
  `AxisGizmo`, `ViewportGrid` (the faint grid-paper background), and `EmptyState`/`EmptyGem` — a
  piece not from the source package, added in the same spirit for the one kind of screen that
  stayed plain everywhere: "nothing here yet." The *shapes and motion* are kept as designed —
  rounded corners, a hover tilt + hard-edge shadow on card-like content, a bobbing "closing soon"
  sticker, a slowly turning clock hand — deliberately different from the rest of the site's
  flat/sharp language; that's this kit's accent, not a site-wide redesign (the admin panel and
  `/privacy` are untouched on purpose — a working tool and a policy page both benefit from staying
  plain). The *colors* aren't: every hardcoded hex from the source (violet/crimson/mustard/cream)
  was swapped for this site's existing palette instead — `HexClockLogo`'s wedges and `EmptyGem`'s
  facets reuse the validated `--gantt-1..8` categorical colors, everything else reuses the orange
  accent plus Badge's sky/violet tones — so no new colors exist anywhere in the app. Wired in:
  `HexClockLogo` as the header brand mark; an "Up next" `EventCard` strip on the Timeline tab
  showing up to 3 running/upcoming events with both a start and end date (ongoing/rolling and
  end-less events can't draw a progress bar, so they're correctly left out); `LinkCard` gets the
  same hover tilt+shadow as `EventCard`; the Links grid and the Calendar tab's `GanttChart` both
  sit inside `ViewportGrid`; `AxisGizmo` appears next to the Calendar and Submit page headings; and
  `EmptyState` replaces the plain "nothing here yet" boxes on the Timeline, Links, and Calendar
  tabs.
