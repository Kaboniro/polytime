module.exports=[60038,a=>{"use strict";a.s(["DATED_EVENT_TYPES",0,["event","conference"],"EVENT_CATEGORIES",0,[{value:"general",label:"General / Multi-discipline"},{value:"3d",label:"3D Art"},{value:"animation",label:"Animation / Motion"},{value:"rendering",label:"3D Fashion"},{value:"archviz",label:"Architectural Visualization"},{value:"game-art",label:"Game Art"},{value:"character",label:"Character / Creature"},{value:"vfx",label:"VFX / Motion"},{value:"product",label:"Product Viz"},{value:"sculpting",label:"Sculpting / ZBrush"},{value:"printing",label:"Stop Motion"},{value:"concept",label:"Concept / Illustration"},{value:"pixel",label:"Pixel Art"},{value:"other",label:"Other"}],"EVENT_TYPES",0,[{value:"event",label:"One-off event / contest deadline"},{value:"conference",label:"Conference"},{value:"ongoing",label:"Ongoing challenge (open-ended, no fixed date)"},{value:"rolling",label:"Rolling / recurring (weekly, monthly, etc.)"}],"LINK_CATEGORIES",0,[{value:"community",label:"Community (Discord, forum, subreddit)"},{value:"tool",label:"Tool / Plugin"},{value:"software",label:"Software"},{value:"asset-library",label:"Asset Library"},{value:"tutorial",label:"Tutorials / Learning"},{value:"job-board",label:"Jobs / Freelance"},{value:"other",label:"Other"}],"TYPE_FILTER_OPTIONS",0,[{value:"event",label:"One-off"},{value:"conference",label:"Conference"},{value:"rolling",label:"Rolling"},{value:"ongoing",label:"Ongoing"}],"labelFor",0,function(a,b){return a.find(a=>a.value===b)?.label||b}])},97729,a=>{"use strict";let b;var c=a.x("node:sqlite",()=>require("node:sqlite"),!0),d=a.i(14747),e=a.i(22734);let f=d.default.join(process.cwd(),"data");e.default.existsSync(f)||e.default.mkdirSync(f,{recursive:!0});let g=d.default.join(f,"app.db");a.s(["default",0,function(){var a;let d;return b||((b=new c.DatabaseSync(g)).exec("PRAGMA journal_mode = WAL"),(a=b).exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT,
      host TEXT,
      category TEXT NOT NULL DEFAULT 'general',
      software TEXT,     -- free text, e.g. "Blender, Substance Painter"
      geography TEXT NOT NULL DEFAULT 'international', -- 'international' | 'region:<slug>' | 'country:<ISO2>' — see lib/geography.js
      participants INTEGER, -- admin-tracked headcount, not self-reported; NULL means unknown, not zero
      event_type TEXT NOT NULL DEFAULT 'event', -- 'event' | 'ongoing' | 'rolling'
      start_date TEXT,   -- ISO date, nullable for 'ongoing'/'rolling' with no fixed date
      end_date TEXT,
      submission_deadline TEXT,
      location TEXT DEFAULT 'online',
      no_ai INTEGER NOT NULL DEFAULT 0, -- 1 = the event prohibits AI-generated work
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected' | 'archived'
      submitted_by TEXT,
      submitter_note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- No longer surfaced anywhere in the app (the Winners feature was
    -- removed — the site's focus is events + resources, not a winners
    -- showcase). Left in place, not dropped, only so any rows a prior
    -- install already had aren't destroyed by an update; nothing reads
    -- from or writes to this table anymore.
    CREATE TABLE IF NOT EXISTS winners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      artist_name TEXT NOT NULL,
      competition_name TEXT NOT NULL,
      year INTEGER,
      category TEXT NOT NULL DEFAULT 'general',
      piece_title TEXT,
      image_url TEXT,
      portfolio_url TEXT,
      instagram TEXT,
      x_twitter TEXT,
      artstation TEXT,
      other_social TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      submitted_by TEXT,
      submitter_note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'community', -- tool | community | tutorial | asset-library | software | other
      no_ai INTEGER NOT NULL DEFAULT 0, -- 1 = an AI-free resource
      status TEXT NOT NULL DEFAULT 'pending',
      submitted_by TEXT,
      submitter_note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- One row per page view, written only for visitors who accepted the
    -- cookie banner (see components/CookieConsent.js) — nothing here is
    -- collected before that. visitor_id is a random id from that consent
    -- cookie, not tied to a real identity. country/region are resolved
    -- server-side from the request's IP at write time (see lib/analytics.js)
    -- and that's *all* that's kept of it — the IP address itself is never
    -- written to the database.
    CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id TEXT NOT NULL,
      path TEXT NOT NULL,
      referrer_path TEXT,
      country TEXT,
      region TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Background crawler (crawler/daemon.js). One state row (id = 1) that the
    -- daemon heartbeats into and the admin dashboard reads/flags, plus one
    -- row per crawl run. The daemon creates the same tables itself, since it
    -- can start before the web app has opened the database.
    CREATE TABLE IF NOT EXISTS crawler_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      state TEXT NOT NULL DEFAULT 'stopped', -- 'idle' | 'running' | 'stopped'
      paused INTEGER NOT NULL DEFAULT 0,
      run_requested INTEGER NOT NULL DEFAULT 0,
      heartbeat_at TEXT,
      next_run_at TEXT,
      pid INTEGER,
      current_note TEXT
    );
    CREATE TABLE IF NOT EXISTS crawler_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      trigger TEXT NOT NULL DEFAULT 'schedule', -- 'schedule' | 'manual' | 'startup'
      status TEXT NOT NULL DEFAULT 'running',   -- 'running' | 'ok' | 'error'
      pages INTEGER NOT NULL DEFAULT 0,
      searches INTEGER NOT NULL DEFAULT 0,
      candidates INTEGER NOT NULL DEFAULT 0,
      added INTEGER NOT NULL DEFAULT 0,
      error TEXT,
      summary TEXT -- JSON: { found: [...], unreachable: [...] }
    );

    -- Messages from the public Query form (content removal requests,
    -- corrections, questions). Not moderated content: nothing here is ever
    -- shown publicly, it is only for the admin to read and resolve.
    CREATE TABLE IF NOT EXISTS queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL DEFAULT 'question', -- removal | correction | question | other
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      page_url TEXT,  -- the page/link/event the message is about
      contact TEXT,   -- optional email to reply to
      status TEXT NOT NULL DEFAULT 'open', -- open | resolved
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Second admin login step: one row per emailed sign-in code. Only an HMAC
    -- of the code is kept (never the code itself); see lib/adminLogin.js.
    CREATE TABLE IF NOT EXISTS admin_login_codes (
      id TEXT PRIMARY KEY,
      code_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      total_attempts INTEGER NOT NULL DEFAULT 0,
      sent_count INTEGER NOT NULL DEFAULT 1,
      last_sent_at INTEGER NOT NULL,
      consumed INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
    CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_date);
    CREATE INDEX IF NOT EXISTS idx_winners_status ON winners(status);
    CREATE INDEX IF NOT EXISTS idx_links_status ON links(status);
    CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);
    CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views(visitor_id);
  `),(d=a.prepare("PRAGMA table_info(events)").all()).some(a=>"software"===a.name)||a.exec("ALTER TABLE events ADD COLUMN software TEXT"),d.some(a=>"geography"===a.name)||a.exec("ALTER TABLE events ADD COLUMN geography TEXT NOT NULL DEFAULT 'international'"),d.some(a=>"participants"===a.name)||a.exec("ALTER TABLE events ADD COLUMN participants INTEGER"),d.some(a=>"no_ai"===a.name)||a.exec("ALTER TABLE events ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0"),a.prepare("PRAGMA table_info(links)").all().some(a=>"no_ai"===a.name)||a.exec("ALTER TABLE links ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0")),b}])},73235,a=>{"use strict";let b=[{slug:"africa",label:"Africa",icon:"🌍"},{slug:"asia",label:"Asia",icon:"🌏"},{slug:"europe",label:"Europe",icon:"🌍"},{slug:"north-america",label:"North America",icon:"🌎"},{slug:"south-america",label:"South America",icon:"🌎"},{slug:"oceania",label:"Oceania",icon:"🌏"}],c=[{code:"AF",name:"Afghanistan"},{code:"AL",name:"Albania"},{code:"DZ",name:"Algeria"},{code:"AD",name:"Andorra"},{code:"AO",name:"Angola"},{code:"AG",name:"Antigua and Barbuda"},{code:"AR",name:"Argentina"},{code:"AM",name:"Armenia"},{code:"AU",name:"Australia"},{code:"AT",name:"Austria"},{code:"AZ",name:"Azerbaijan"},{code:"BS",name:"Bahamas"},{code:"BH",name:"Bahrain"},{code:"BD",name:"Bangladesh"},{code:"BB",name:"Barbados"},{code:"BY",name:"Belarus"},{code:"BE",name:"Belgium"},{code:"BZ",name:"Belize"},{code:"BJ",name:"Benin"},{code:"BT",name:"Bhutan"},{code:"BO",name:"Bolivia"},{code:"BA",name:"Bosnia and Herzegovina"},{code:"BW",name:"Botswana"},{code:"BR",name:"Brazil"},{code:"BN",name:"Brunei"},{code:"BG",name:"Bulgaria"},{code:"BF",name:"Burkina Faso"},{code:"BI",name:"Burundi"},{code:"KH",name:"Cambodia"},{code:"CM",name:"Cameroon"},{code:"CA",name:"Canada"},{code:"CV",name:"Cape Verde"},{code:"CF",name:"Central African Republic"},{code:"TD",name:"Chad"},{code:"CL",name:"Chile"},{code:"CN",name:"China"},{code:"CO",name:"Colombia"},{code:"KM",name:"Comoros"},{code:"CG",name:"Congo"},{code:"CD",name:"Congo (DRC)"},{code:"CR",name:"Costa Rica"},{code:"HR",name:"Croatia"},{code:"CU",name:"Cuba"},{code:"CY",name:"Cyprus"},{code:"CZ",name:"Czechia"},{code:"DK",name:"Denmark"},{code:"DJ",name:"Djibouti"},{code:"DM",name:"Dominica"},{code:"DO",name:"Dominican Republic"},{code:"EC",name:"Ecuador"},{code:"EG",name:"Egypt"},{code:"SV",name:"El Salvador"},{code:"GQ",name:"Equatorial Guinea"},{code:"ER",name:"Eritrea"},{code:"EE",name:"Estonia"},{code:"SZ",name:"Eswatini"},{code:"ET",name:"Ethiopia"},{code:"FJ",name:"Fiji"},{code:"FI",name:"Finland"},{code:"FR",name:"France"},{code:"GA",name:"Gabon"},{code:"GM",name:"Gambia"},{code:"GE",name:"Georgia"},{code:"DE",name:"Germany"},{code:"GH",name:"Ghana"},{code:"GR",name:"Greece"},{code:"GD",name:"Grenada"},{code:"GT",name:"Guatemala"},{code:"GN",name:"Guinea"},{code:"GW",name:"Guinea-Bissau"},{code:"GY",name:"Guyana"},{code:"HT",name:"Haiti"},{code:"HN",name:"Honduras"},{code:"HK",name:"Hong Kong"},{code:"HU",name:"Hungary"},{code:"IS",name:"Iceland"},{code:"IN",name:"India"},{code:"ID",name:"Indonesia"},{code:"IR",name:"Iran"},{code:"IQ",name:"Iraq"},{code:"IE",name:"Ireland"},{code:"IL",name:"Israel"},{code:"IT",name:"Italy"},{code:"JM",name:"Jamaica"},{code:"JP",name:"Japan"},{code:"JO",name:"Jordan"},{code:"KZ",name:"Kazakhstan"},{code:"KE",name:"Kenya"},{code:"KI",name:"Kiribati"},{code:"KW",name:"Kuwait"},{code:"KG",name:"Kyrgyzstan"},{code:"LA",name:"Laos"},{code:"LV",name:"Latvia"},{code:"LB",name:"Lebanon"},{code:"LS",name:"Lesotho"},{code:"LR",name:"Liberia"},{code:"LY",name:"Libya"},{code:"LI",name:"Liechtenstein"},{code:"LT",name:"Lithuania"},{code:"LU",name:"Luxembourg"},{code:"MO",name:"Macao"},{code:"MG",name:"Madagascar"},{code:"MW",name:"Malawi"},{code:"MY",name:"Malaysia"},{code:"MV",name:"Maldives"},{code:"ML",name:"Mali"},{code:"MT",name:"Malta"},{code:"MH",name:"Marshall Islands"},{code:"MR",name:"Mauritania"},{code:"MU",name:"Mauritius"},{code:"MX",name:"Mexico"},{code:"FM",name:"Micronesia"},{code:"MD",name:"Moldova"},{code:"MC",name:"Monaco"},{code:"MN",name:"Mongolia"},{code:"ME",name:"Montenegro"},{code:"MA",name:"Morocco"},{code:"MZ",name:"Mozambique"},{code:"MM",name:"Myanmar"},{code:"NA",name:"Namibia"},{code:"NR",name:"Nauru"},{code:"NP",name:"Nepal"},{code:"NL",name:"Netherlands"},{code:"NZ",name:"New Zealand"},{code:"NI",name:"Nicaragua"},{code:"NE",name:"Niger"},{code:"NG",name:"Nigeria"},{code:"KP",name:"North Korea"},{code:"MK",name:"North Macedonia"},{code:"NO",name:"Norway"},{code:"OM",name:"Oman"},{code:"PK",name:"Pakistan"},{code:"PW",name:"Palau"},{code:"PS",name:"Palestine"},{code:"PA",name:"Panama"},{code:"PG",name:"Papua New Guinea"},{code:"PY",name:"Paraguay"},{code:"PE",name:"Peru"},{code:"PH",name:"Philippines"},{code:"PL",name:"Poland"},{code:"PT",name:"Portugal"},{code:"QA",name:"Qatar"},{code:"RO",name:"Romania"},{code:"RU",name:"Russia"},{code:"RW",name:"Rwanda"},{code:"KN",name:"Saint Kitts and Nevis"},{code:"LC",name:"Saint Lucia"},{code:"VC",name:"Saint Vincent and the Grenadines"},{code:"WS",name:"Samoa"},{code:"SM",name:"San Marino"},{code:"ST",name:"Sao Tome and Principe"},{code:"SA",name:"Saudi Arabia"},{code:"SN",name:"Senegal"},{code:"RS",name:"Serbia"},{code:"SC",name:"Seychelles"},{code:"SL",name:"Sierra Leone"},{code:"SG",name:"Singapore"},{code:"SK",name:"Slovakia"},{code:"SI",name:"Slovenia"},{code:"SB",name:"Solomon Islands"},{code:"SO",name:"Somalia"},{code:"ZA",name:"South Africa"},{code:"KR",name:"South Korea"},{code:"SS",name:"South Sudan"},{code:"ES",name:"Spain"},{code:"LK",name:"Sri Lanka"},{code:"SD",name:"Sudan"},{code:"SR",name:"Suriname"},{code:"SE",name:"Sweden"},{code:"CH",name:"Switzerland"},{code:"SY",name:"Syria"},{code:"TW",name:"Taiwan"},{code:"TJ",name:"Tajikistan"},{code:"TZ",name:"Tanzania"},{code:"TH",name:"Thailand"},{code:"TL",name:"Timor-Leste"},{code:"TG",name:"Togo"},{code:"TO",name:"Tonga"},{code:"TT",name:"Trinidad and Tobago"},{code:"TN",name:"Tunisia"},{code:"TR",name:"Turkey"},{code:"TM",name:"Turkmenistan"},{code:"TV",name:"Tuvalu"},{code:"UG",name:"Uganda"},{code:"UA",name:"Ukraine"},{code:"AE",name:"United Arab Emirates"},{code:"GB",name:"United Kingdom"},{code:"US",name:"United States"},{code:"UY",name:"Uruguay"},{code:"UZ",name:"Uzbekistan"},{code:"VU",name:"Vanuatu"},{code:"VA",name:"Vatican City"},{code:"VE",name:"Venezuela"},{code:"VN",name:"Vietnam"},{code:"YE",name:"Yemen"},{code:"ZM",name:"Zambia"},{code:"ZW",name:"Zimbabwe"}],d=new Map(c.map(a=>[a.code,a])),e=new Map(b.map(a=>[a.slug,a]));function f(a){if(a?.startsWith("country:")){let b=a.slice(8).toUpperCase(),c=d.get(b);return{scope:"country",code:b,label:c?.name||b}}if(a?.startsWith("region:")){let b=a.slice(7),c=e.get(b);return{scope:"region",icon:c?.icon||"🌐",label:c?.label||b}}return{scope:"international",icon:"🌐",label:"International"}}a.s(["geographyGroups",0,function(){return[{label:null,options:[{value:"international",label:"🌐 International"}]},{label:"Region",options:b.map(a=>({value:`region:${a.slug}`,label:`${a.icon} ${a.label}`}))},{label:"Country",options:c.map(a=>({value:`country:${a.code}`,label:a.name}))}]},"geographyIconInfo",0,function(a){let b=f(a);return"country"===b.scope?{kind:"flag",className:`fi fi-${b.code.toLowerCase()}`}:{kind:"emoji",glyph:b.icon}},"geographyLabel",0,function(a){return f(a).label},"parseGeography",0,f])},52549,35289,a=>{"use strict";var b=a.i(97729),c=a.i(18956),d=a.i(99602),e=a.i(29366),f=a.i(49497),g=a.i(48461),h=a.i(70716),i=a.i(60038),j=a.i(73235);function k(a){return i.DATED_EVENT_TYPES.includes(a.event_type)?a.start_date?(0,h.isPastDate)(l(a))?"archived":(0,h.isTodayOrPast)(a.start_date)?"running":"upcoming":"upcoming":null}function l(a){return[a.end_date,a.submission_deadline,a.start_date].filter(Boolean).sort().at(-1)||null}function m(a){return"archived"===k(a)}let n=a=>"any"===a.toLowerCase();function o(a){return(a||"").split(",").map(a=>a.trim()).filter(Boolean)}function p(a){return a?{...a}:a}function q(a,...b){return a.all(...b).map(p)}a.s(["DATE_OPTIONS",0,[{value:"upcoming",label:"Upcoming & open"},{value:"30d",label:"Next 30 days"},{value:"month",label:"This month"},{value:"ended",label:"Ended"}],"effectiveEnd",0,l,"eventPhase",0,k,"geographyFilterOptions",0,function(a){let b=new Map;for(let c of a){let a=c.geography||"international";if(b.has(a))continue;let d=(0,j.parseGeography)(a);b.set(a,"country"===d.scope?d.label:`${d.icon} ${d.label}`)}return[...b.entries()].sort((a,b)=>a[1].localeCompare(b[1])).map(([a,b])=>({value:a,label:b}))},"hasEnded",0,m,"matchesDate",0,function(a,b,h=new Date){var i;let j,k,l;if("all"===b)return!0;let n=m(a);if("ended"===b)return n;if(n)return!1;if("upcoming"===b)return!0;let o=a.start_date?(0,f.parseISO)(a.start_date):null;return!(o&&(0,e.isValid)(o))||o<=("30d"===b?(i=(0,g.startOfDay)(h),j=(0,d.toDate)(i,void 0),isNaN(30)?(0,c.constructFrom)(i,NaN):(j.setDate(j.getDate()+30),j)):(l=(k=(0,d.toDate)(h,void 0)).getMonth(),k.setFullYear(k.getFullYear(),l+1,0),k.setHours(23,59,59,999),k))},"matchesGeography",0,function(a,b){return"all"===b||(a.geography||"international")===b},"matchesSoftware",0,function(a,b){if("all"===b)return!0;let c=o(a.software).map(a=>a.toLowerCase());return c.includes("any")||c.includes(b.toLowerCase())},"pickOption",0,function(a,b){return b.some(b=>b.value===a)?a:"all"},"softwareOptions",0,function(a){let b=new Map;for(let c of a)for(let a of o(c.software)){let c=a.toLowerCase();n(a)||b.has(c)||b.set(c,a)}return[...b.values()].sort((a,b)=>a.localeCompare(b)).map(a=>({value:a,label:a}))}],35289),a.s(["getApprovedEventById",0,function(a){let c=Number(a);return!Number.isInteger(c)||c<1?null:p((0,b.default)().prepare("SELECT * FROM events WHERE id = ? AND status = 'approved'").get(c))||null},"getApprovedEvents",0,function({category:a}={}){let c=(0,b.default)();return a&&"all"!==a?q(c.prepare("SELECT * FROM events WHERE status = 'approved' AND category = ? ORDER BY (start_date IS NULL), start_date ASC"),a):q(c.prepare("SELECT * FROM events WHERE status = 'approved' ORDER BY (start_date IS NULL), start_date ASC"))},"getApprovedLinks",0,function({category:a}={}){let c=(0,b.default)();return a&&"all"!==a?q(c.prepare("SELECT * FROM links WHERE status = 'approved' AND category = ? ORDER BY title ASC"),a):q(c.prepare("SELECT * FROM links WHERE status = 'approved' ORDER BY title ASC"))},"getCrawlerStatus",0,function(){let a=(0,b.default)(),c=p(a.prepare("SELECT * FROM crawler_state WHERE id = 1").get())||{state:"stopped",paused:0},d=q(a.prepare("SELECT * FROM crawler_runs ORDER BY id DESC LIMIT 8")).map(a=>{let b=null;try{b=a.summary?JSON.parse(a.summary):null}catch{b=null}return{...a,summary:b}}),e=!!c.heartbeat_at&&"stopped"!==c.state&&Date.now()-Date.parse(c.heartbeat_at)<9e4,{n:f}=a.prepare("SELECT COUNT(*) AS n FROM events WHERE status = 'pending' AND submitted_by = 'crawler'").get();return{state:{...c,online:e},runs:d,pendingFromCrawler:f,searchEnabled:!!(process.env.SEARXNG_URL||process.env.BRAVE_API_KEY),enabled:"0"!==process.env.CRAWLER_ENABLED}},"getOpenQueryCount",0,function(){return(0,b.default)().prepare("SELECT COUNT(*) AS n FROM queries WHERE status = 'open'").get().n},"getPending",0,function(){let a=(0,b.default)();return{events:q(a.prepare("SELECT * FROM events WHERE status = 'pending' ORDER BY created_at ASC")),links:q(a.prepare("SELECT * FROM links WHERE status = 'pending' ORDER BY created_at ASC"))}},"getQueries",0,function(){return q((0,b.default)().prepare("SELECT * FROM queries ORDER BY (status = 'open') DESC, id DESC"))}],52549)}];

//# sourceMappingURL=lib_1jgfh8b._.js.map