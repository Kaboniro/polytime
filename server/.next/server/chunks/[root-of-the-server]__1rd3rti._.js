module.exports=[22734,(e,a,n)=>{a.exports=e.x("fs",()=>require("fs"))},70406,(e,a,n)=>{a.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,a,n)=>{a.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},20635,(e,a,n)=>{a.exports=e.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},24725,(e,a,n)=>{a.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},56704,(e,a,n)=>{a.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,a,n)=>{a.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},59043,(e,a,n)=>{a.exports=e.x("next/dist/server/runtime-reacts.external.js",()=>require("next/dist/server/runtime-reacts.external.js"))},93695,(e,a,n)=>{a.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},81111,(e,a,n)=>{a.exports=e.x("node:stream",()=>require("node:stream"))},14747,(e,a,n)=>{a.exports=e.x("path",()=>require("path"))},982,e=>{"use strict";e.s(["EVENT_CATEGORIES",0,[{value:"general",label:"General / Multi-discipline"},{value:"3d",label:"3D Art"},{value:"animation",label:"Animation / Motion"},{value:"rendering",label:"3D Fashion"},{value:"archviz",label:"Architectural Visualization"},{value:"game-art",label:"Game Art"},{value:"character",label:"Character / Creature"},{value:"vfx",label:"VFX / Motion"},{value:"product",label:"Product Viz"},{value:"sculpting",label:"Sculpting / ZBrush"},{value:"printing",label:"Stop Motion"},{value:"concept",label:"Concept / Illustration"},{value:"pixel",label:"Pixel Art"},{value:"other",label:"Other"}],"EVENT_TYPES",0,[{value:"event",label:"One-off event / contest deadline"},{value:"conference",label:"Conference"},{value:"ongoing",label:"Ongoing challenge (open-ended, no fixed date)"},{value:"rolling",label:"Rolling / recurring (weekly, monthly, etc.)"}],"LINK_CATEGORIES",0,[{value:"community",label:"Community (Discord, forum, subreddit)"},{value:"tool",label:"Tool / Plugin"},{value:"software",label:"Software"},{value:"asset-library",label:"Asset Library"},{value:"tutorial",label:"Tutorials / Learning"},{value:"job-board",label:"Jobs / Freelance"},{value:"other",label:"Other"}],"QUERY_KINDS",0,[{value:"removal",label:"Content removal request"},{value:"correction",label:"Correction"},{value:"question",label:"Question"},{value:"other",label:"Something else"}],"labelFor",0,function(e,a){return e.find(e=>e.value===a)?.label||a}])},80998,e=>{"use strict";let a;var n=e.x("node:sqlite",()=>require("node:sqlite"),!0),t=e.i(14747),o=e.i(22734);let r=t.default.join(process.cwd(),"data");o.default.existsSync(r)||o.default.mkdirSync(r,{recursive:!0});let i=t.default.join(r,"app.db");e.s(["default",0,function(){var e;let t;return a||((a=new n.DatabaseSync(i)).exec("PRAGMA journal_mode = WAL"),(e=a).exec(`
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
  `),(t=e.prepare("PRAGMA table_info(events)").all()).some(e=>"software"===e.name)||e.exec("ALTER TABLE events ADD COLUMN software TEXT"),t.some(e=>"geography"===e.name)||e.exec("ALTER TABLE events ADD COLUMN geography TEXT NOT NULL DEFAULT 'international'"),t.some(e=>"participants"===e.name)||e.exec("ALTER TABLE events ADD COLUMN participants INTEGER"),t.some(e=>"no_ai"===e.name)||e.exec("ALTER TABLE events ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0"),e.prepare("PRAGMA table_info(links)").all().some(e=>"no_ai"===e.name)||e.exec("ALTER TABLE links ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0")),a}])},45019,e=>{"use strict";let a=[{slug:"africa",label:"Africa",icon:"🌍"},{slug:"asia",label:"Asia",icon:"🌏"},{slug:"europe",label:"Europe",icon:"🌍"},{slug:"north-america",label:"North America",icon:"🌎"},{slug:"south-america",label:"South America",icon:"🌎"},{slug:"oceania",label:"Oceania",icon:"🌏"}],n=[{code:"AF",name:"Afghanistan"},{code:"AL",name:"Albania"},{code:"DZ",name:"Algeria"},{code:"AD",name:"Andorra"},{code:"AO",name:"Angola"},{code:"AG",name:"Antigua and Barbuda"},{code:"AR",name:"Argentina"},{code:"AM",name:"Armenia"},{code:"AU",name:"Australia"},{code:"AT",name:"Austria"},{code:"AZ",name:"Azerbaijan"},{code:"BS",name:"Bahamas"},{code:"BH",name:"Bahrain"},{code:"BD",name:"Bangladesh"},{code:"BB",name:"Barbados"},{code:"BY",name:"Belarus"},{code:"BE",name:"Belgium"},{code:"BZ",name:"Belize"},{code:"BJ",name:"Benin"},{code:"BT",name:"Bhutan"},{code:"BO",name:"Bolivia"},{code:"BA",name:"Bosnia and Herzegovina"},{code:"BW",name:"Botswana"},{code:"BR",name:"Brazil"},{code:"BN",name:"Brunei"},{code:"BG",name:"Bulgaria"},{code:"BF",name:"Burkina Faso"},{code:"BI",name:"Burundi"},{code:"KH",name:"Cambodia"},{code:"CM",name:"Cameroon"},{code:"CA",name:"Canada"},{code:"CV",name:"Cape Verde"},{code:"CF",name:"Central African Republic"},{code:"TD",name:"Chad"},{code:"CL",name:"Chile"},{code:"CN",name:"China"},{code:"CO",name:"Colombia"},{code:"KM",name:"Comoros"},{code:"CG",name:"Congo"},{code:"CD",name:"Congo (DRC)"},{code:"CR",name:"Costa Rica"},{code:"HR",name:"Croatia"},{code:"CU",name:"Cuba"},{code:"CY",name:"Cyprus"},{code:"CZ",name:"Czechia"},{code:"DK",name:"Denmark"},{code:"DJ",name:"Djibouti"},{code:"DM",name:"Dominica"},{code:"DO",name:"Dominican Republic"},{code:"EC",name:"Ecuador"},{code:"EG",name:"Egypt"},{code:"SV",name:"El Salvador"},{code:"GQ",name:"Equatorial Guinea"},{code:"ER",name:"Eritrea"},{code:"EE",name:"Estonia"},{code:"SZ",name:"Eswatini"},{code:"ET",name:"Ethiopia"},{code:"FJ",name:"Fiji"},{code:"FI",name:"Finland"},{code:"FR",name:"France"},{code:"GA",name:"Gabon"},{code:"GM",name:"Gambia"},{code:"GE",name:"Georgia"},{code:"DE",name:"Germany"},{code:"GH",name:"Ghana"},{code:"GR",name:"Greece"},{code:"GD",name:"Grenada"},{code:"GT",name:"Guatemala"},{code:"GN",name:"Guinea"},{code:"GW",name:"Guinea-Bissau"},{code:"GY",name:"Guyana"},{code:"HT",name:"Haiti"},{code:"HN",name:"Honduras"},{code:"HK",name:"Hong Kong"},{code:"HU",name:"Hungary"},{code:"IS",name:"Iceland"},{code:"IN",name:"India"},{code:"ID",name:"Indonesia"},{code:"IR",name:"Iran"},{code:"IQ",name:"Iraq"},{code:"IE",name:"Ireland"},{code:"IL",name:"Israel"},{code:"IT",name:"Italy"},{code:"JM",name:"Jamaica"},{code:"JP",name:"Japan"},{code:"JO",name:"Jordan"},{code:"KZ",name:"Kazakhstan"},{code:"KE",name:"Kenya"},{code:"KI",name:"Kiribati"},{code:"KW",name:"Kuwait"},{code:"KG",name:"Kyrgyzstan"},{code:"LA",name:"Laos"},{code:"LV",name:"Latvia"},{code:"LB",name:"Lebanon"},{code:"LS",name:"Lesotho"},{code:"LR",name:"Liberia"},{code:"LY",name:"Libya"},{code:"LI",name:"Liechtenstein"},{code:"LT",name:"Lithuania"},{code:"LU",name:"Luxembourg"},{code:"MO",name:"Macao"},{code:"MG",name:"Madagascar"},{code:"MW",name:"Malawi"},{code:"MY",name:"Malaysia"},{code:"MV",name:"Maldives"},{code:"ML",name:"Mali"},{code:"MT",name:"Malta"},{code:"MH",name:"Marshall Islands"},{code:"MR",name:"Mauritania"},{code:"MU",name:"Mauritius"},{code:"MX",name:"Mexico"},{code:"FM",name:"Micronesia"},{code:"MD",name:"Moldova"},{code:"MC",name:"Monaco"},{code:"MN",name:"Mongolia"},{code:"ME",name:"Montenegro"},{code:"MA",name:"Morocco"},{code:"MZ",name:"Mozambique"},{code:"MM",name:"Myanmar"},{code:"NA",name:"Namibia"},{code:"NR",name:"Nauru"},{code:"NP",name:"Nepal"},{code:"NL",name:"Netherlands"},{code:"NZ",name:"New Zealand"},{code:"NI",name:"Nicaragua"},{code:"NE",name:"Niger"},{code:"NG",name:"Nigeria"},{code:"KP",name:"North Korea"},{code:"MK",name:"North Macedonia"},{code:"NO",name:"Norway"},{code:"OM",name:"Oman"},{code:"PK",name:"Pakistan"},{code:"PW",name:"Palau"},{code:"PS",name:"Palestine"},{code:"PA",name:"Panama"},{code:"PG",name:"Papua New Guinea"},{code:"PY",name:"Paraguay"},{code:"PE",name:"Peru"},{code:"PH",name:"Philippines"},{code:"PL",name:"Poland"},{code:"PT",name:"Portugal"},{code:"QA",name:"Qatar"},{code:"RO",name:"Romania"},{code:"RU",name:"Russia"},{code:"RW",name:"Rwanda"},{code:"KN",name:"Saint Kitts and Nevis"},{code:"LC",name:"Saint Lucia"},{code:"VC",name:"Saint Vincent and the Grenadines"},{code:"WS",name:"Samoa"},{code:"SM",name:"San Marino"},{code:"ST",name:"Sao Tome and Principe"},{code:"SA",name:"Saudi Arabia"},{code:"SN",name:"Senegal"},{code:"RS",name:"Serbia"},{code:"SC",name:"Seychelles"},{code:"SL",name:"Sierra Leone"},{code:"SG",name:"Singapore"},{code:"SK",name:"Slovakia"},{code:"SI",name:"Slovenia"},{code:"SB",name:"Solomon Islands"},{code:"SO",name:"Somalia"},{code:"ZA",name:"South Africa"},{code:"KR",name:"South Korea"},{code:"SS",name:"South Sudan"},{code:"ES",name:"Spain"},{code:"LK",name:"Sri Lanka"},{code:"SD",name:"Sudan"},{code:"SR",name:"Suriname"},{code:"SE",name:"Sweden"},{code:"CH",name:"Switzerland"},{code:"SY",name:"Syria"},{code:"TW",name:"Taiwan"},{code:"TJ",name:"Tajikistan"},{code:"TZ",name:"Tanzania"},{code:"TH",name:"Thailand"},{code:"TL",name:"Timor-Leste"},{code:"TG",name:"Togo"},{code:"TO",name:"Tonga"},{code:"TT",name:"Trinidad and Tobago"},{code:"TN",name:"Tunisia"},{code:"TR",name:"Turkey"},{code:"TM",name:"Turkmenistan"},{code:"TV",name:"Tuvalu"},{code:"UG",name:"Uganda"},{code:"UA",name:"Ukraine"},{code:"AE",name:"United Arab Emirates"},{code:"GB",name:"United Kingdom"},{code:"US",name:"United States"},{code:"UY",name:"Uruguay"},{code:"UZ",name:"Uzbekistan"},{code:"VU",name:"Vanuatu"},{code:"VA",name:"Vatican City"},{code:"VE",name:"Venezuela"},{code:"VN",name:"Vietnam"},{code:"YE",name:"Yemen"},{code:"ZM",name:"Zambia"},{code:"ZW",name:"Zimbabwe"}],t=new Map(n.map(e=>[e.code,e])),o=new Map(a.map(e=>[e.slug,e]));function r(){return[{label:null,options:[{value:"international",label:"🌐 International"}]},{label:"Region",options:a.map(e=>({value:`region:${e.slug}`,label:`${e.icon} ${e.label}`}))},{label:"Country",options:n.map(e=>({value:`country:${e.code}`,label:e.name}))}]}e.s(["geographyGroups",0,r,"geographyLabel",0,function(e){return function(e){if(e?.startsWith("country:")){let a=e.slice(8).toUpperCase(),n=t.get(a);return{scope:"country",code:a,label:n?.name||a}}if(e?.startsWith("region:")){let a=e.slice(7),n=o.get(a);return{scope:"region",icon:n?.icon||"🌐",label:n?.label||a}}return{scope:"international",icon:"🌐",label:"International"}}(e).label},"geographyValues",0,function(){return r().flatMap(e=>e.options.map(e=>e.value))}])},40239,e=>{"use strict";var a=e.i(80998);function n(e){return e?{...e}:e}function t(e,...a){return e.all(...a).map(n)}e.i(45019),e.s(["getCrawlerStatus",0,function(){let e=(0,a.default)(),o=n(e.prepare("SELECT * FROM crawler_state WHERE id = 1").get())||{state:"stopped",paused:0},r=t(e.prepare("SELECT * FROM crawler_runs ORDER BY id DESC LIMIT 8")).map(e=>{let a=null;try{a=e.summary?JSON.parse(e.summary):null}catch{a=null}return{...e,summary:a}}),i=!!o.heartbeat_at&&"stopped"!==o.state&&Date.now()-Date.parse(o.heartbeat_at)<9e4,{n:l}=e.prepare("SELECT COUNT(*) AS n FROM events WHERE status = 'pending' AND submitted_by = 'crawler'").get();return{state:{...o,online:i},runs:r,pendingFromCrawler:l,searchEnabled:!!(process.env.SEARXNG_URL||process.env.BRAVE_API_KEY),enabled:"0"!==process.env.CRAWLER_ENABLED}},"getSitemapEvents",0,function(){return t((0,a.default)().prepare("SELECT id, created_at, start_date, end_date, submission_deadline FROM events WHERE status = 'approved' ORDER BY id DESC LIMIT 5000")).map(e=>({...e,ended:!!e.start_date&&([e.end_date,e.submission_deadline,e.start_date].filter(Boolean).sort().at(-1)||null)<new Date().toISOString().slice(0,10)}))}],40239)},80029,e=>{"use strict";function a(){return(process.env.SITE_URL||process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000").trim().replace(/\/+$/,"")}e.s(["SITE_NAME",0,"PolyTime","SITE_TAGLINE",0,"3D art events, competitions & challenges","absoluteUrl",0,(e="/")=>a()+(e.startsWith("/")?e:"/"+e),"siteUrl",0,a])},70943,(e,a,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0});var t={getOrigin:function(){return l},resolveArray:function(){return r},resolveAsArrayOrUndefined:function(){return i}};for(var o in t)Object.defineProperty(n,o,{enumerable:!0,get:t[o]});function r(e){return Array.isArray(e)?e:[e]}function i(e){if(null!=e)return r(e)}function l(e){let a;if("string"==typeof e)try{a=(e=new URL(e)).origin}catch{}return a}},73853,(e,a,n)=>{"use strict";Object.defineProperty(n,"__esModule",{value:!0});var t={resolveManifest:function(){return s},resolveRobots:function(){return i},resolveRouteData:function(){return d},resolveSitemap:function(){return l}};for(var o in t)Object.defineProperty(n,o,{enumerable:!0,get:t[o]});let r=e.r(70943);function i(e){let a="";for(let n of Array.isArray(e.rules)?e.rules:[e.rules]){for(let e of(0,r.resolveArray)(n.userAgent||["*"]))a+=`User-Agent: ${e}
`;if(n.allow)for(let e of(0,r.resolveArray)(n.allow))a+=`Allow: ${e}
`;if(n.disallow)for(let e of(0,r.resolveArray)(n.disallow))a+=`Disallow: ${e}
`;if(n.crawlDelay&&(a+=`Crawl-delay: ${n.crawlDelay}
`),n.other)for(let e of Object.keys(n.other)){let t=n.other[e];if(null!=t)for(let n of Array.isArray(t)?t:[t])a+=`${e}: ${n}
`}a+="\n"}return e.host&&(a+=`Host: ${e.host}
`),e.sitemap&&(0,r.resolveArray)(e.sitemap).forEach(e=>{a+=`Sitemap: ${e}
`}),a}function l(e){let a=e.some(e=>Object.keys(e.alternates??{}).length>0),n=e.some(e=>{var a;return!!(null==(a=e.images)?void 0:a.length)}),t=e.some(e=>{var a;return!!(null==(a=e.videos)?void 0:a.length)}),o="";for(let s of(o+='<?xml version="1.0" encoding="UTF-8"?>\n',o+='<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',n&&(o+=' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'),t&&(o+=' xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"'),a?o+=' xmlns:xhtml="http://www.w3.org/1999/xhtml">\n':o+=">\n",e)){var r,i,l;o+="<url>\n",o+=`<loc>${s.url}</loc>
`;let e=null==(r=s.alternates)?void 0:r.languages;if(e&&Object.keys(e).length)for(let a in e)o+=`<xhtml:link rel="alternate" hreflang="${a}" href="${e[a]}" />
`;if(null==(i=s.images)?void 0:i.length)for(let e of s.images)o+=`<image:image>
<image:loc>${e}</image:loc>
</image:image>
`;if(null==(l=s.videos)?void 0:l.length)for(let e of s.videos)o+=["<video:video>",`<video:title>${e.title}</video:title>`,`<video:thumbnail_loc>${e.thumbnail_loc}</video:thumbnail_loc>`,`<video:description>${e.description}</video:description>`,e.content_loc&&`<video:content_loc>${e.content_loc}</video:content_loc>`,e.player_loc&&`<video:player_loc>${e.player_loc}</video:player_loc>`,e.duration&&`<video:duration>${e.duration}</video:duration>`,e.view_count&&`<video:view_count>${e.view_count}</video:view_count>`,e.tag&&`<video:tag>${e.tag}</video:tag>`,e.rating&&`<video:rating>${e.rating}</video:rating>`,e.expiration_date&&`<video:expiration_date>${e.expiration_date}</video:expiration_date>`,e.publication_date&&`<video:publication_date>${e.publication_date}</video:publication_date>`,e.family_friendly&&`<video:family_friendly>${e.family_friendly}</video:family_friendly>`,e.requires_subscription&&`<video:requires_subscription>${e.requires_subscription}</video:requires_subscription>`,e.live&&`<video:live>${e.live}</video:live>`,e.restriction&&`<video:restriction relationship="${e.restriction.relationship}">${e.restriction.content}</video:restriction>`,e.platform&&`<video:platform relationship="${e.platform.relationship}">${e.platform.content}</video:platform>`,e.uploader&&`<video:uploader${e.uploader.info&&` info="${e.uploader.info}"`}>${e.uploader.content}</video:uploader>`,`</video:video>
`].filter(Boolean).join("\n");if(s.lastModified){let e=s.lastModified instanceof Date?s.lastModified.toISOString():s.lastModified;o+=`<lastmod>${e}</lastmod>
`}s.changeFrequency&&(o+=`<changefreq>${s.changeFrequency}</changefreq>
`),"number"==typeof s.priority&&(o+=`<priority>${s.priority}</priority>
`),o+="</url>\n"}return o+"</urlset>\n"}function s(e){return JSON.stringify(e)}function d(e,a){return"robots"===a?i(e):"sitemap"===a?l(e):"manifest"===a?s(e):""}}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1rd3rti._.js.map