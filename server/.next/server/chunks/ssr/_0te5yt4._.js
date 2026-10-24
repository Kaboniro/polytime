module.exports=[16095,a=>{"use strict";var b=a.i(7997);a.s(["default",0,function({info:a}){return"flag"===a.kind?(0,b.jsx)("span",{className:`fi ${a.className}`,"aria-hidden":"true"}):(0,b.jsx)("span",{"aria-hidden":"true",children:a.glyph})}])},24376,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/components/HeadingInfo.js from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/components/HeadingInfo.js","default")},73326,a=>{"use strict";var b=a.i(24376);a.n(b)},39622,a=>{"use strict";a.s(["Heatmap",()=>c,"TrendChart",()=>d]);var b=a.i(11857);let c=(0,b.registerClientReference)(function(){throw Error("Attempted to call Heatmap() from the server but Heatmap is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/components/admin/ActivityCharts.js","Heatmap"),d=(0,b.registerClientReference)(function(){throw Error("Attempted to call TrendChart() from the server but TrendChart is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/components/admin/ActivityCharts.js","TrendChart")},74965,a=>{"use strict";var b=a.i(39622);a.n(b)},27818,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/components/admin/ActivityControls.js from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/components/admin/ActivityControls.js","default")},8982,a=>{"use strict";var b=a.i(27818);a.n(b)},62427,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/components/admin/PagedBarList.js from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/components/admin/PagedBarList.js","default")},18130,a=>{"use strict";var b=a.i(62427);a.n(b)},90899,a=>{"use strict";var b=a.i(7997),c=a.i(11615),d=a.i(7008),e=a.i(73235),f=a.i(16095),g=a.i(73326);function h({label:a,value:c,sub:d}){return(0,b.jsxs)("div",{className:"rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:-rotate-[0.35deg] hover:shadow-[4px_4px_0_var(--color-neutral-100)] motion-reduce:!transform-none",children:[(0,b.jsx)("p",{className:"text-xs text-neutral-500",children:a}),(0,b.jsx)("p",{className:"mt-1 text-xl font-semibold text-neutral-50",children:c}),d&&(0,b.jsx)("p",{className:"mt-0.5 text-[11px] leading-snug",children:d})]})}new Intl.NumberFormat(void 0,{notation:"compact",maximumFractionDigits:1});var i=a.i(8982),j=a.i(74965);let k={"/":"Timeline (home)","/timeline":"Calendar","/links":"Links","/submit":"Submit","/about":"About","/privacy":"Privacy","/terms":"Terms"},l=a=>k[a]||a,m=new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1}),n=a=>a<1e3?String(Math.round(a)):m.format(a),o=a=>`${Math.round(100*(a||0))}%`,p="var(--color-orange-500)",q="var(--color-sky-400)";function r({a,b:c}){let d=a.value+c.value,e=d?a.value/d*100:0;return(0,b.jsxs)("div",{children:[(0,b.jsxs)("div",{className:"flex h-3 overflow-hidden rounded-full bg-neutral-800",role:"img","aria-label":`${a.label} ${a.value}, ${c.label} ${c.value}`,children:[(0,b.jsx)("div",{style:{width:`${e}%`,background:p}}),(0,b.jsx)("div",{style:{width:`${100-e}%`,background:q}})]}),(0,b.jsx)("dl",{className:"mt-3 grid grid-cols-2 gap-3 text-sm",children:[[a,p],[c,q]].map(([a,c])=>(0,b.jsxs)("div",{children:[(0,b.jsxs)("dt",{className:"flex items-center gap-1.5 text-xs text-neutral-400",children:[(0,b.jsx)("span",{className:"h-2.5 w-2.5 rounded-sm",style:{background:c}}),a.label]}),(0,b.jsxs)("dd",{className:"font-semibold text-neutral-50 tabular-nums",children:[n(a.value)," ",(0,b.jsxs)("span",{className:"text-xs font-normal text-neutral-500",children:[d?Math.round(a.value/d*100):0,"%"]})]})]},a.label))})]})}function s({current:a,previous:c,goodWhenDown:d=!1,unit:e="%",minBase:f=0}){if(null==c)return(0,b.jsx)("span",{className:"text-neutral-500",children:"no earlier period"});if(c<f)return(0,b.jsx)("span",{className:"text-neutral-500",children:"too little earlier data"});if(0===c&&0===a)return(0,b.jsx)("span",{className:"text-neutral-500",children:"no change"});let g=0===c?null:(a-c)/c*100;if(null==g)return(0,b.jsx)("span",{className:"text-emerald-400",children:"▲ new"});if(.5>Math.abs(g))return(0,b.jsx)("span",{className:"text-neutral-500",children:"— no change"});let h=g>0;return(0,b.jsxs)("span",{className:h!==d?"text-emerald-400":"text-red-400",children:[h?"▲":"▼"," ",Math.abs(Math.round(g)),e]})}var t=a.i(18130);function u({title:a,note:c,children:d,className:e=""}){return(0,b.jsxs)("section",{className:`min-w-0 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 ${e}`,children:[(0,b.jsx)("h2",{className:"text-sm font-semibold text-neutral-50",children:a}),c&&(0,b.jsx)("p",{className:"mt-0.5 mb-3 text-xs text-neutral-500",children:c}),!c&&(0,b.jsx)("div",{className:"mb-3"}),d]})}async function v({searchParams:a}){await (0,c.requireAdminPage)();let k=await a,m=(0,d.parseRange)(k?.range),p=(0,d.parsePageFilter)(k?.page),q=(0,d.getActivityReport)({range:m,page:p}),{current:w,previous:x}=q,y=x?`vs previous ${d.RANGE_LABELS[m].toLowerCase()}`:"",z=(a,c,d)=>(0,b.jsxs)("span",{className:"inline-flex flex-wrap gap-x-1.5",children:[(0,b.jsx)(s,{current:a,previous:c,...d}),x&&(0,b.jsx)("span",{className:"text-neutral-500",children:y})]});return(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{className:"mb-5",children:(0,b.jsxs)(g.default,{as:"h1",title:"Activity",children:["Visitors who accepted the cookie banner — a fraction of total traffic, not all of it. Nothing here is tied to a name or account, only a random id. Times are UTC. A ",(0,b.jsx)("em",{children:"session"})," is one visitor's run of page views with no gap over 30 minutes; a ",(0,b.jsx)("em",{children:"bounce"})," is a session of a single page. See"," ",(0,b.jsx)("a",{href:"/privacy",className:"text-orange-400 hover:underline",children:"/privacy"})," for what's collected."]})}),(0,b.jsx)(i.default,{range:m,page:p,pages:d.PUBLIC_PATHS}),q.hiddenViews>0&&(0,b.jsxs)("p",{className:"mb-5 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-400",children:[q.hiddenViews.toLocaleString()," recorded view",1===q.hiddenViews?"":"s"," of pages that don't exist on the site (",q.hiddenPaths.map((a,c)=>(0,b.jsxs)("span",{children:[c>0&&", ",(0,b.jsx)("code",{className:"text-neutral-200",children:a.path})," ×",a.views]},a.path)),") are ignored in every number below."]}),0===w.views?(0,b.jsxs)("div",{className:"rounded-2xl border border-dashed border-neutral-800 p-10 text-center text-neutral-500",children:["No activity in this period",p?` on ${l(p)}`:""," — either nobody visited, or nobody has accepted the cookie banner yet. Try a longer range."]}):(0,b.jsxs)("div",{className:"space-y-6",children:[(0,b.jsxs)("div",{className:"grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6",children:[(0,b.jsx)(h,{label:"Page views",value:n(w.views),sub:z(w.views,x?.views,{minBase:10})}),(0,b.jsx)(h,{label:"Unique visitors",value:n(w.visitors),sub:z(w.visitors,x?.visitors,{minBase:10})}),(0,b.jsx)(h,{label:"Sessions",value:n(w.sessions),sub:z(w.sessions,x?.sessions,{minBase:10})}),(0,b.jsx)(h,{label:"Pages per session",value:w.pagesPerSession.toFixed(1),sub:z(w.pagesPerSession,x?.pagesPerSession)}),(0,b.jsx)(h,{label:"Bounce rate",value:o(w.bounceRate),sub:z(w.bounceRate,x?.bounceRate,{goodWhenDown:!0})}),(0,b.jsx)(h,{label:"Avg. session",value:function(a){let b=Math.round(a||0);if(b<60)return`${b}s`;let c=Math.floor(b/60);return c<60?`${c}m ${String(b%60).padStart(2,"0")}s`:`${Math.floor(c/60)}h ${c%60}m`}(w.avgSeconds),sub:z(w.avgSeconds,x?.avgSeconds)})]}),(0,b.jsx)(u,{title:"Traffic over time",note:`${d.RANGE_LABELS[m]}${p?` \xb7 ${l(p)}`:""}`,children:(0,b.jsx)(j.TrendChart,{data:q.trend,weekly:q.weekly})}),(0,b.jsxs)("div",{className:"grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]",children:[(0,b.jsx)(u,{title:"When visitors come",note:"Page views by weekday and hour of day (UTC).",children:(0,b.jsx)(j.Heatmap,{heat:q.heat})}),(0,b.jsx)(u,{title:"New vs returning",note:"New = first ever visit falls in this period.",children:(0,b.jsx)(r,{a:{label:"New visitors",value:q.newVisitors},b:{label:"Returning visitors",value:q.returningVisitors}})})]}),(0,b.jsxs)("div",{className:"grid gap-6 lg:grid-cols-2 2xl:grid-cols-3",children:[(0,b.jsx)(u,{title:"Top pages",note:p?"Filtered to one page.":"Only pages that exist on the site.",children:(0,b.jsx)(t.default,{items:q.topPages.map(a=>({key:a.path,label:(0,b.jsxs)(b.Fragment,{children:[a.title||l(a.path)," ",(0,b.jsx)("code",{className:"ml-1 text-xs text-neutral-500",children:a.path})]}),value:a.views,sub:`${n(a.visitors)} visitor${1===a.visitors?"":"s"} \xb7 ${o(a.views/w.views)}`}))})}),(0,b.jsx)(u,{title:"Where visitors go next",note:"Moves from one page to another on this site.",children:(0,b.jsx)(t.default,{tone:"flow",empty:"No navigation between pages recorded yet.",items:q.flows.map(a=>({key:`${a.from}>${a.to}`,label:`${l(a.from)} → ${l(a.to)}`,value:a.n}))})}),(0,b.jsxs)(u,{title:"Visitors by country",note:"Best-effort, from a header Cloudflare or Vercel add to each request.",children:[0===q.countries.length?(0,b.jsx)("p",{className:"text-sm text-neutral-500",children:"No location data in this period. Countries come from the header Cloudflare adds to each visit, so only visits made through Cloudflare (and with the cookie banner accepted) have one."}):(0,b.jsx)(t.default,{tone:"visitors",items:q.countries.map(a=>{let c=`country:${a.country}`;return{key:a.country,label:(0,b.jsxs)("span",{className:"inline-flex items-center gap-1.5",children:[(0,b.jsx)(f.default,{info:(0,e.geographyIconInfo)(c)})," ",(0,e.geographyLabel)(c)]}),value:a.views,sub:`${n(a.visitors)} visitor${1===a.visitors?"":"s"}`}})}),q.unknownLocationViews>0&&q.countries.length>0&&(0,b.jsxs)("p",{className:"mt-3 text-xs text-neutral-500",children:[n(q.unknownLocationViews)," view(s) had no location."]})]})]})]})]})}a.s(["default",0,v,"dynamic",0,"force-dynamic","metadata",0,{title:"Activity — PolyTime Admin"}],90899)},64490,function(a){a.n(a.i(90899))},7008,a=>{"use strict";var b=a.i(97729);let c=["/","/timeline","/links","/submit","/about","/privacy","/terms"];function d(a){if("string"!=typeof a)return"";let b=a.split("?")[0].split("#")[0];return b.length>1?b.replace(/\/+$/,""):b}let e=/^\/events\/(\d+)$/,f=a=>a?{...a}:a,g={"7d":7,"30d":30,"90d":90,"365d":365,all:null};function h(a){return Object.hasOwn(g,a)?a:"30d"}function i(a){return c.includes(a)?a:null}let j=a=>new Date(a).toISOString().slice(0,19).replace("T"," "),k=a=>864e5*Math.floor(a/864e5),l=c.map(()=>"?").join(","),m=`(path IN (${l}) OR (path LIKE '/events/%' AND CAST(substr(path, 9) AS INTEGER) IN (SELECT id FROM events WHERE status = 'approved')))`;function n(a,b,d){return{sql:`created_at >= ? AND created_at < ? AND ${m}${d?" AND path = ?":""}`,params:[a,b,...c,...d?[d]:[]]}}function o(a,b,c,d){let e=n(b,c,d),{views:f,visitors:g}=a.prepare(`SELECT COUNT(*) views, COUNT(DISTINCT visitor_id) visitors FROM page_views WHERE ${e.sql}`).get(...e.params),h=a.prepare(`WITH v AS (
         SELECT visitor_id, created_at,
                LAG(created_at) OVER (PARTITION BY visitor_id ORDER BY created_at) prev
         FROM page_views WHERE ${e.sql}
       ), n AS (
         SELECT visitor_id, created_at,
                SUM(CASE WHEN prev IS NULL OR (julianday(created_at) - julianday(prev)) * 1440 > 30 THEN 1 ELSE 0 END)
                  OVER (PARTITION BY visitor_id ORDER BY created_at ROWS UNBOUNDED PRECEDING) sess
         FROM v
       ), g AS (
         SELECT visitor_id, sess, COUNT(*) pages,
                (julianday(MAX(created_at)) - julianday(MIN(created_at))) * 86400 seconds
         FROM n GROUP BY visitor_id, sess
       )
       SELECT COUNT(*) sessions, AVG(pages) avgPages, AVG(seconds) avgSeconds, SUM(pages = 1) bounces FROM g`).get(...e.params),i=h.sessions||0;return{views:f,visitors:g,sessions:i,pagesPerSession:i?h.avgPages:0,avgSeconds:i?h.avgSeconds:0,bounceRate:i?(h.bounces||0)/i:0}}a.s(["PUBLIC_PATHS",0,c,"RANGE_LABELS",0,{"7d":"7 days","30d":"30 days","90d":"90 days","365d":"1 year",all:"All time"},"getActivityReport",0,function({range:a="30d",page:d=null}={}){a=h(a),d=i(d);let e=(0,b.default)(),p=function(a,b){let c=g[a],d=Date.now();if(c){let a=k(d)-(c-1)*864e5;return{days:c,since:j(a),until:j(d+1e3),prevSince:j(a-864e5*c),prevUntil:j(a)}}let e=b.prepare("SELECT MIN(created_at) first FROM page_views").get().first,f=e?k(Date.parse(e.replace(" ","T")+"Z")):k(d);return{days:Math.max(1,Math.round((k(d)-f)/864e5)+1),since:j(f),until:j(d+1e3),prevSince:null,prevUntil:null}}(a,e),q=n(p.since,p.until,d),r=o(e,p.since,p.until,d),s=p.prevSince?o(e,p.prevSince,p.prevUntil,d):null,t=p.days>120,u=new Map(e.prepare(`SELECT ${t?"date(created_at, 'weekday 0', '-6 days')":"date(created_at)"} bucket, COUNT(*) views, COUNT(DISTINCT visitor_id) visitors FROM page_views WHERE ${q.sql} GROUP BY bucket`).all(...q.params).map(a=>[a.bucket,a])),v=[],w=t?6048e5:864e5,x=k(Date.parse(p.since.replace(" ","T")+"Z"));for(t&&(x-=(new Date(x).getUTCDay()+6)%7*864e5);x<=Date.now();x+=w){let a=new Date(x).toISOString().slice(0,10),b=u.get(a);v.push({date:a,views:b?.views||0,visitors:b?.visitors||0})}let y=Array.from({length:7},()=>Array(24).fill(0));for(let a of e.prepare(`SELECT CAST(strftime('%w', created_at) AS INTEGER) d, CAST(strftime('%H', created_at) AS INTEGER) h, COUNT(*) n FROM page_views WHERE ${q.sql} GROUP BY d, h`).all(...q.params))y[a.d][a.h]=a.n;let z=e.prepare(`SELECT path, COUNT(*) views, COUNT(DISTINCT visitor_id) visitors FROM page_views WHERE ${q.sql} GROUP BY path ORDER BY views DESC, path ASC`).all(...q.params).map(f),A=z.filter(a=>a.path.startsWith("/events/")).map(a=>Number(a.path.slice(8)));if(A.length){let a=new Map(e.prepare(`SELECT id, title FROM events WHERE id IN (${A.map(()=>"?").join(",")})`).all(...A).map(a=>[a.id,a.title]));for(let b of z)b.path.startsWith("/events/")&&(b.title=a.get(Number(b.path.slice(8)))||null)}let B=e.prepare(`SELECT referrer_path "from", path "to", COUNT(*) n FROM page_views
       WHERE ${q.sql} AND referrer_path IS NOT NULL AND referrer_path != path AND referrer_path IN (${l})
       GROUP BY referrer_path, path ORDER BY n DESC LIMIT 200`).all(...q.params,...c).map(f),C=e.prepare(`SELECT country, COUNT(*) views, COUNT(DISTINCT visitor_id) visitors FROM page_views
       WHERE ${q.sql} AND country IS NOT NULL GROUP BY country ORDER BY views DESC LIMIT 250`).all(...q.params).map(f),D=C.reduce((a,b)=>a+b.views,0),E=e.prepare(`SELECT COALESCE(SUM(first_seen >= ?), 0) newVisitors, COALESCE(SUM(first_seen < ?), 0) returningVisitors FROM (
         SELECT visitor_id, MIN(created_at) first_seen FROM page_views GROUP BY visitor_id
       ) WHERE visitor_id IN (SELECT DISTINCT visitor_id FROM page_views WHERE ${q.sql})`).get(p.since,p.since,...q.params),F=e.prepare(`SELECT path, COUNT(*) views FROM page_views WHERE created_at >= ? AND created_at < ? AND NOT ${m}
       GROUP BY path ORDER BY views DESC LIMIT 5`).all(p.since,p.until,...c).map(f),G=e.prepare(`SELECT COUNT(*) n FROM page_views WHERE created_at >= ? AND created_at < ? AND NOT ${m}`).get(p.since,p.until,...c).n;return{range:a,page:d,days:p.days,since:p.since,until:p.until,weekly:t,current:r,previous:s,trend:v,heat:y,topPages:z,flows:B,countries:C,unknownLocationViews:r.views-D,newVisitors:E.newVisitors,returningVisitors:E.returningVisitors,hiddenViews:G,hiddenPaths:F}},"parsePageFilter",0,i,"parseRange",0,h,"recordPageView",0,function({visitorId:a,path:f,headers:g}){let h,i,j;if(!a||(h=d(f),!(c.includes(h)||e.test(h))))return;if(f=d(f),!c.includes(f)&&!((i=d(f).match(e))&&(0,b.default)().prepare("SELECT 1 FROM events WHERE id = ? AND status = 'approved'").get(Number(i[1]))))return;let{country:k,region:l}={country:(j=g.get("cf-ipcountry")||g.get("x-vercel-ip-country"))&&"XX"!==j&&"T1"!==j?j.toUpperCase():null,region:g.get("cf-region-code")||g.get("x-vercel-ip-country-region")||null};(0,b.default)().prepare("INSERT INTO page_views (visitor_id, path, referrer_path, country, region) VALUES (?, ?, ?, ?, ?)").run(a,f,function(a){let b=a.get("referer"),c=a.get("host");if(!b||!c)return null;try{let a=new URL(b);return a.host===c?d(a.pathname):null}catch{return null}}(g),k,l)}])},97729,a=>{"use strict";let b;var c=a.x("node:sqlite",()=>require("node:sqlite"),!0),d=a.i(14747),e=a.i(22734);let f=d.default.join(process.cwd(),"data");e.default.existsSync(f)||e.default.mkdirSync(f,{recursive:!0});let g=d.default.join(f,"app.db");a.s(["default",0,function(){var a;let d;return b||((b=new c.DatabaseSync(g)).exec("PRAGMA journal_mode = WAL"),(a=b).exec(`
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
  `),(d=a.prepare("PRAGMA table_info(events)").all()).some(a=>"software"===a.name)||a.exec("ALTER TABLE events ADD COLUMN software TEXT"),d.some(a=>"geography"===a.name)||a.exec("ALTER TABLE events ADD COLUMN geography TEXT NOT NULL DEFAULT 'international'"),d.some(a=>"participants"===a.name)||a.exec("ALTER TABLE events ADD COLUMN participants INTEGER"),d.some(a=>"no_ai"===a.name)||a.exec("ALTER TABLE events ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0"),a.prepare("PRAGMA table_info(links)").all().some(a=>"no_ai"===a.name)||a.exec("ALTER TABLE links ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0")),b}])},73235,a=>{"use strict";let b=[{slug:"africa",label:"Africa",icon:"🌍"},{slug:"asia",label:"Asia",icon:"🌏"},{slug:"europe",label:"Europe",icon:"🌍"},{slug:"north-america",label:"North America",icon:"🌎"},{slug:"south-america",label:"South America",icon:"🌎"},{slug:"oceania",label:"Oceania",icon:"🌏"}],c=[{code:"AF",name:"Afghanistan"},{code:"AL",name:"Albania"},{code:"DZ",name:"Algeria"},{code:"AD",name:"Andorra"},{code:"AO",name:"Angola"},{code:"AG",name:"Antigua and Barbuda"},{code:"AR",name:"Argentina"},{code:"AM",name:"Armenia"},{code:"AU",name:"Australia"},{code:"AT",name:"Austria"},{code:"AZ",name:"Azerbaijan"},{code:"BS",name:"Bahamas"},{code:"BH",name:"Bahrain"},{code:"BD",name:"Bangladesh"},{code:"BB",name:"Barbados"},{code:"BY",name:"Belarus"},{code:"BE",name:"Belgium"},{code:"BZ",name:"Belize"},{code:"BJ",name:"Benin"},{code:"BT",name:"Bhutan"},{code:"BO",name:"Bolivia"},{code:"BA",name:"Bosnia and Herzegovina"},{code:"BW",name:"Botswana"},{code:"BR",name:"Brazil"},{code:"BN",name:"Brunei"},{code:"BG",name:"Bulgaria"},{code:"BF",name:"Burkina Faso"},{code:"BI",name:"Burundi"},{code:"KH",name:"Cambodia"},{code:"CM",name:"Cameroon"},{code:"CA",name:"Canada"},{code:"CV",name:"Cape Verde"},{code:"CF",name:"Central African Republic"},{code:"TD",name:"Chad"},{code:"CL",name:"Chile"},{code:"CN",name:"China"},{code:"CO",name:"Colombia"},{code:"KM",name:"Comoros"},{code:"CG",name:"Congo"},{code:"CD",name:"Congo (DRC)"},{code:"CR",name:"Costa Rica"},{code:"HR",name:"Croatia"},{code:"CU",name:"Cuba"},{code:"CY",name:"Cyprus"},{code:"CZ",name:"Czechia"},{code:"DK",name:"Denmark"},{code:"DJ",name:"Djibouti"},{code:"DM",name:"Dominica"},{code:"DO",name:"Dominican Republic"},{code:"EC",name:"Ecuador"},{code:"EG",name:"Egypt"},{code:"SV",name:"El Salvador"},{code:"GQ",name:"Equatorial Guinea"},{code:"ER",name:"Eritrea"},{code:"EE",name:"Estonia"},{code:"SZ",name:"Eswatini"},{code:"ET",name:"Ethiopia"},{code:"FJ",name:"Fiji"},{code:"FI",name:"Finland"},{code:"FR",name:"France"},{code:"GA",name:"Gabon"},{code:"GM",name:"Gambia"},{code:"GE",name:"Georgia"},{code:"DE",name:"Germany"},{code:"GH",name:"Ghana"},{code:"GR",name:"Greece"},{code:"GD",name:"Grenada"},{code:"GT",name:"Guatemala"},{code:"GN",name:"Guinea"},{code:"GW",name:"Guinea-Bissau"},{code:"GY",name:"Guyana"},{code:"HT",name:"Haiti"},{code:"HN",name:"Honduras"},{code:"HK",name:"Hong Kong"},{code:"HU",name:"Hungary"},{code:"IS",name:"Iceland"},{code:"IN",name:"India"},{code:"ID",name:"Indonesia"},{code:"IR",name:"Iran"},{code:"IQ",name:"Iraq"},{code:"IE",name:"Ireland"},{code:"IL",name:"Israel"},{code:"IT",name:"Italy"},{code:"JM",name:"Jamaica"},{code:"JP",name:"Japan"},{code:"JO",name:"Jordan"},{code:"KZ",name:"Kazakhstan"},{code:"KE",name:"Kenya"},{code:"KI",name:"Kiribati"},{code:"KW",name:"Kuwait"},{code:"KG",name:"Kyrgyzstan"},{code:"LA",name:"Laos"},{code:"LV",name:"Latvia"},{code:"LB",name:"Lebanon"},{code:"LS",name:"Lesotho"},{code:"LR",name:"Liberia"},{code:"LY",name:"Libya"},{code:"LI",name:"Liechtenstein"},{code:"LT",name:"Lithuania"},{code:"LU",name:"Luxembourg"},{code:"MO",name:"Macao"},{code:"MG",name:"Madagascar"},{code:"MW",name:"Malawi"},{code:"MY",name:"Malaysia"},{code:"MV",name:"Maldives"},{code:"ML",name:"Mali"},{code:"MT",name:"Malta"},{code:"MH",name:"Marshall Islands"},{code:"MR",name:"Mauritania"},{code:"MU",name:"Mauritius"},{code:"MX",name:"Mexico"},{code:"FM",name:"Micronesia"},{code:"MD",name:"Moldova"},{code:"MC",name:"Monaco"},{code:"MN",name:"Mongolia"},{code:"ME",name:"Montenegro"},{code:"MA",name:"Morocco"},{code:"MZ",name:"Mozambique"},{code:"MM",name:"Myanmar"},{code:"NA",name:"Namibia"},{code:"NR",name:"Nauru"},{code:"NP",name:"Nepal"},{code:"NL",name:"Netherlands"},{code:"NZ",name:"New Zealand"},{code:"NI",name:"Nicaragua"},{code:"NE",name:"Niger"},{code:"NG",name:"Nigeria"},{code:"KP",name:"North Korea"},{code:"MK",name:"North Macedonia"},{code:"NO",name:"Norway"},{code:"OM",name:"Oman"},{code:"PK",name:"Pakistan"},{code:"PW",name:"Palau"},{code:"PS",name:"Palestine"},{code:"PA",name:"Panama"},{code:"PG",name:"Papua New Guinea"},{code:"PY",name:"Paraguay"},{code:"PE",name:"Peru"},{code:"PH",name:"Philippines"},{code:"PL",name:"Poland"},{code:"PT",name:"Portugal"},{code:"QA",name:"Qatar"},{code:"RO",name:"Romania"},{code:"RU",name:"Russia"},{code:"RW",name:"Rwanda"},{code:"KN",name:"Saint Kitts and Nevis"},{code:"LC",name:"Saint Lucia"},{code:"VC",name:"Saint Vincent and the Grenadines"},{code:"WS",name:"Samoa"},{code:"SM",name:"San Marino"},{code:"ST",name:"Sao Tome and Principe"},{code:"SA",name:"Saudi Arabia"},{code:"SN",name:"Senegal"},{code:"RS",name:"Serbia"},{code:"SC",name:"Seychelles"},{code:"SL",name:"Sierra Leone"},{code:"SG",name:"Singapore"},{code:"SK",name:"Slovakia"},{code:"SI",name:"Slovenia"},{code:"SB",name:"Solomon Islands"},{code:"SO",name:"Somalia"},{code:"ZA",name:"South Africa"},{code:"KR",name:"South Korea"},{code:"SS",name:"South Sudan"},{code:"ES",name:"Spain"},{code:"LK",name:"Sri Lanka"},{code:"SD",name:"Sudan"},{code:"SR",name:"Suriname"},{code:"SE",name:"Sweden"},{code:"CH",name:"Switzerland"},{code:"SY",name:"Syria"},{code:"TW",name:"Taiwan"},{code:"TJ",name:"Tajikistan"},{code:"TZ",name:"Tanzania"},{code:"TH",name:"Thailand"},{code:"TL",name:"Timor-Leste"},{code:"TG",name:"Togo"},{code:"TO",name:"Tonga"},{code:"TT",name:"Trinidad and Tobago"},{code:"TN",name:"Tunisia"},{code:"TR",name:"Turkey"},{code:"TM",name:"Turkmenistan"},{code:"TV",name:"Tuvalu"},{code:"UG",name:"Uganda"},{code:"UA",name:"Ukraine"},{code:"AE",name:"United Arab Emirates"},{code:"GB",name:"United Kingdom"},{code:"US",name:"United States"},{code:"UY",name:"Uruguay"},{code:"UZ",name:"Uzbekistan"},{code:"VU",name:"Vanuatu"},{code:"VA",name:"Vatican City"},{code:"VE",name:"Venezuela"},{code:"VN",name:"Vietnam"},{code:"YE",name:"Yemen"},{code:"ZM",name:"Zambia"},{code:"ZW",name:"Zimbabwe"}],d=new Map(c.map(a=>[a.code,a])),e=new Map(b.map(a=>[a.slug,a]));function f(a){if(a?.startsWith("country:")){let b=a.slice(8).toUpperCase(),c=d.get(b);return{scope:"country",code:b,label:c?.name||b}}if(a?.startsWith("region:")){let b=a.slice(7),c=e.get(b);return{scope:"region",icon:c?.icon||"🌐",label:c?.label||b}}return{scope:"international",icon:"🌐",label:"International"}}a.s(["geographyGroups",0,function(){return[{label:null,options:[{value:"international",label:"🌐 International"}]},{label:"Region",options:b.map(a=>({value:`region:${a.slug}`,label:`${a.icon} ${a.label}`}))},{label:"Country",options:c.map(a=>({value:`country:${a.code}`,label:a.name}))}]},"geographyIconInfo",0,function(a){let b=f(a);return"country"===b.scope?{kind:"flag",className:`fi fi-${b.code.toLowerCase()}`}:{kind:"emoji",glyph:b.icon}},"geographyLabel",0,function(a){return f(a).label},"parseGeography",0,f])}];

//# sourceMappingURL=_0te5yt4._.js.map