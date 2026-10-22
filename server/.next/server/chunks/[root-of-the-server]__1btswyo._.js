module.exports=[22734,(e,a,t)=>{a.exports=e.x("fs",()=>require("fs"))},70406,(e,a,t)=>{a.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,a,t)=>{a.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},20635,(e,a,t)=>{a.exports=e.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},24725,(e,a,t)=>{a.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},56704,(e,a,t)=>{a.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,a,t)=>{a.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},59043,(e,a,t)=>{a.exports=e.x("next/dist/server/runtime-reacts.external.js",()=>require("next/dist/server/runtime-reacts.external.js"))},93695,(e,a,t)=>{a.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},81111,(e,a,t)=>{a.exports=e.x("node:stream",()=>require("node:stream"))},14747,(e,a,t)=>{a.exports=e.x("path",()=>require("path"))},29617,e=>{"use strict";var a=e.i(89171),t=e.i(80998),n=e.i(45019);async function o(e){let{title:o,description:r,url:i,host:s,category:d,software:c,geography:l,event_type:T,start_date:m,end_date:u,submission_deadline:E,location:p,submitted_by:N,submitter_note:L}=await e.json();return o&&o.trim()?((0,t.default)().prepare(`
    INSERT INTO events
      (title, description, url, host, category, software, geography, event_type, start_date, end_date, submission_deadline, location, submitted_by, submitter_note, status)
    VALUES
      (@title, @description, @url, @host, @category, @software, @geography, @event_type, @start_date, @end_date, @submission_deadline, @location, @submitted_by, @submitter_note, 'pending')
  `).run({title:o.trim(),description:r||null,url:i||null,host:s||null,category:d||"general",software:c?.trim()||null,geography:(0,n.geographyValues)().includes(l)?l:"international",event_type:T||"event",start_date:m||null,end_date:u||null,submission_deadline:E||null,location:p||"online",submitted_by:N||null,submitter_note:L||null}),a.NextResponse.json({ok:!0})):a.NextResponse.json({error:"Title is required."},{status:400})}e.s(["POST",0,o])},66299,e=>{"use strict";var a=e.i(47909),t=e.i(74017),n=e.i(96250),o=e.i(59756),r=e.i(61916),i=e.i(74677),s=e.i(69741),d=e.i(16795),c=e.i(87718),l=e.i(95169),T=e.i(47587),m=e.i(66012),u=e.i(70101),E=e.i(26937),p=e.i(10372),N=e.i(93695);e.i(52474);var L=e.i(220);let h=new a.AppRouteRouteModule({definition:{kind:t.RouteKind.APP_ROUTE,page:"/api/submit/event/route",pathname:"/api/submit/event",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/submit/event/route.js",nextConfigOutput:"standalone",userland:()=>e.r(29617),...{}}),{workAsyncStorage:g,workUnitAsyncStorage:A,serverHooks:R}=h;async function v(e,a,n){n.requestMeta&&(0,o.setRequestMeta)(e,n.requestMeta),h.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let g="/api/submit/event/route";g=g.replace(/\/index$/,"")||"/";let A=await h.prepare(e,a,{srcPage:g,multiZoneDraftMode:!1});if(!A)return a.statusCode=400,a.end("Bad Request"),null==n.waitUntil||n.waitUntil.call(n,Promise.resolve()),null;let{buildId:R,deploymentId:v,params:b,nextConfig:U,parsedUrl:I,isDraftMode:S,prerenderManifest:O,routerServerContext:y,isOnDemandRevalidate:_,revalidateOnlyGenerated:x,resolvedPathname:C,clientReferenceManifest:w,serverActionsManifest:f}=A,M=(0,s.normalizeAppPath)(g),X=!!(O.dynamicRoutes[M]||O.routes[C]),D=async()=>((null==y?void 0:y.render404)?await y.render404(e,a,I,!1):a.end("This page could not be found"),null);if(X&&!S){let e=!!O.routes[C],a=O.dynamicRoutes[M];if(a&&!1===a.fallback&&!e){if(U.adapterPath)return await D();throw new N.NoFallbackError}}let G=null;!X||h.isDev||S||(G="/index"===(G=C)?"/":G);let F=!0===h.isDev||!X,P=X&&!F;f&&w&&(0,i.setManifestsSingleton)({page:g,clientReferenceManifest:w,serverActionsManifest:f});let B=e.method||"GET",k=(0,r.getTracer)(),q=k.getActiveScopeSpan(),K=!!(null==y?void 0:y.isWrappedByNextServer),j=!!(0,o.getRequestMeta)(e,"minimalMode"),H=(0,o.getRequestMeta)(e,"incrementalCache")||await h.getIncrementalCache(e,U,O,j);null==H||H.resetRequestCache(),globalThis.__incrementalCache=H;let Y={params:b,previewProps:O.preview,renderOpts:{experimental:{authInterrupts:!!U.experimental.authInterrupts,useCacheTimeout:U.experimental.useCacheTimeout},cacheComponents:!!U.cacheComponents,validationLevel:U.experimental.instantInsights.validationLevel,supportsDynamicResponse:F,incrementalCache:H,hmrRefreshHash:(0,o.getRequestMeta)(e,"hmrRefreshHash"),cacheLifeProfiles:U.cacheLife,staticPageGenerationTimeout:U.staticPageGenerationTimeout,waitUntil:n.waitUntil,onClose:e=>{a.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(a,t,n,o)=>h.onRequestError(e,a,n,o,y)},sharedContext:{buildId:R,deploymentId:v}},V=new d.NodeNextRequest(e),Z=new d.NodeNextResponse(a),W=c.NextRequestAdapter.fromNodeNextRequest(V,(0,c.signalFromNodeResponse)(a)),z=async({previousCacheEntry:t})=>{try{if(!j&&_&&x&&!t)return a.statusCode=404,a.setHeader("x-nextjs-cache","REVALIDATED"),a.end("This page could not be found"),null;let o=await h.handle(W,Y);e.fetchMetrics=Y.renderOpts.fetchMetrics;let r=Y.renderOpts.pendingWaitUntil;r&&n.waitUntil&&(n.waitUntil(r),r=void 0);let i=Y.renderOpts.collectedTags;if(!X)return await (0,m.sendResponse)(V,Z,o,r),null;{let e=await o.blob(),a=(0,u.toNodeOutgoingHttpHeaders)(o.headers);i&&(a[p.NEXT_CACHE_TAGS_HEADER]=i),!a["content-type"]&&e.type&&(a["content-type"]=e.type);let t=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=p.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,n=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=p.INFINITE_CACHE?!1!==t&&t>0?U.expireTime:void 0:Y.renderOpts.collectedExpire;return{value:{kind:L.CachedRouteKind.APP_ROUTE,status:o.status,body:Buffer.from(await e.arrayBuffer()),headers:a},cacheControl:{revalidate:t,expire:n}}}}catch(a){throw(null==t?void 0:t.isStale)&&await h.onRequestError(e,a,{routerKind:"App Router",routePath:g,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:_})},!1,y),a}},J=async(o,i)=>{try{var s,d;let o=await h.handleResponse({req:e,nextConfig:U,cacheKey:G,routeKind:t.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:O,isRoutePPREnabled:!1,isOnDemandRevalidate:_,revalidateOnlyGenerated:x,responseGenerator:z,waitUntil:n.waitUntil,isMinimalMode:j});if(!X)return;if((null==o||null==(s=o.value)?void 0:s.kind)!==L.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==o||null==(d=o.value)?void 0:d.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});j||a.setHeader("x-nextjs-cache",_?"REVALIDATED":o.isMiss?"MISS":o.isStale?"STALE":"HIT"),S&&a.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let r=(0,u.fromNodeOutgoingHttpHeaders)(o.value.headers);j&&X||r.delete(p.NEXT_CACHE_TAGS_HEADER),!o.cacheControl||a.getHeader("Cache-Control")||r.get("Cache-Control")||r.set("Cache-Control",(0,E.getCacheControlHeader)(o.cacheControl)),await (0,m.sendResponse)(V,Z,new Response(o.value.body,{headers:r,status:o.value.status||200}));return}catch(a){if(a instanceof N.NoFallbackError||await h.onRequestError(e,a,{routerKind:"App Router",routePath:M,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:_})},!1,y),X)throw a;await (0,m.sendResponse)(V,Z,new Response(null,{status:500}));return}finally{(()=>{if(!o)return;let e=a.statusCode;o.setAttributes({"http.status_code":e,"next.rsc":!1}),e&&e>=500&&(o.setStatus({code:r.SpanStatusCode.ERROR}),o.setAttribute("error.type",e.toString()));let t=k.getRootSpanAttributes();if(!t)return;if(t.get("next.span_type")!==l.BaseServerSpan.handleRequest)return console.warn(`Unexpected root span type '${t.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=t.get("next.route")||M,s=`${B} ${n}`;o.setAttributes({"next.route":n,"http.route":n,"next.span_name":s}),o.updateName(s),i&&i!==o&&(i.setAttribute("http.route",n),i.updateName(s))})()}};if(K&&q)await J(q,void 0);else{let a=k.getActiveScopeSpan();await k.withPropagatedContext(e.headers,()=>k.trace(l.BaseServerSpan.handleRequest,{spanName:`${B} ${g}`,kind:r.SpanKind.SERVER,attributes:{"http.method":B,"http.target":e.url}},e=>J(e,a)),void 0,!K)}}e.s(["handler",0,v,"patchFetch",0,function(){return(0,n.patchFetch)({workAsyncStorage:g,workUnitAsyncStorage:A})},"routeModule",0,h,"serverHooks",0,R,"workAsyncStorage",0,g,"workUnitAsyncStorage",0,A])},80998,e=>{"use strict";let a;var t=e.x("node:sqlite",()=>require("node:sqlite"),!0),n=e.i(14747),o=e.i(22734);let r=n.default.join(process.cwd(),"data");o.default.existsSync(r)||o.default.mkdirSync(r,{recursive:!0});let i=n.default.join(r,"app.db");e.s(["default",0,function(){var e;let n;return a||((a=new t.DatabaseSync(i)).exec("PRAGMA journal_mode = WAL"),(e=a).exec(`
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
  `),(n=e.prepare("PRAGMA table_info(events)").all()).some(e=>"software"===e.name)||e.exec("ALTER TABLE events ADD COLUMN software TEXT"),n.some(e=>"geography"===e.name)||e.exec("ALTER TABLE events ADD COLUMN geography TEXT NOT NULL DEFAULT 'international'"),n.some(e=>"participants"===e.name)||e.exec("ALTER TABLE events ADD COLUMN participants INTEGER"),n.some(e=>"no_ai"===e.name)||e.exec("ALTER TABLE events ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0"),e.prepare("PRAGMA table_info(links)").all().some(e=>"no_ai"===e.name)||e.exec("ALTER TABLE links ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0")),a}])},45019,e=>{"use strict";let a=[{slug:"africa",label:"Africa",icon:"🌍"},{slug:"asia",label:"Asia",icon:"🌏"},{slug:"europe",label:"Europe",icon:"🌍"},{slug:"north-america",label:"North America",icon:"🌎"},{slug:"south-america",label:"South America",icon:"🌎"},{slug:"oceania",label:"Oceania",icon:"🌏"}],t=[{code:"AF",name:"Afghanistan"},{code:"AL",name:"Albania"},{code:"DZ",name:"Algeria"},{code:"AD",name:"Andorra"},{code:"AO",name:"Angola"},{code:"AG",name:"Antigua and Barbuda"},{code:"AR",name:"Argentina"},{code:"AM",name:"Armenia"},{code:"AU",name:"Australia"},{code:"AT",name:"Austria"},{code:"AZ",name:"Azerbaijan"},{code:"BS",name:"Bahamas"},{code:"BH",name:"Bahrain"},{code:"BD",name:"Bangladesh"},{code:"BB",name:"Barbados"},{code:"BY",name:"Belarus"},{code:"BE",name:"Belgium"},{code:"BZ",name:"Belize"},{code:"BJ",name:"Benin"},{code:"BT",name:"Bhutan"},{code:"BO",name:"Bolivia"},{code:"BA",name:"Bosnia and Herzegovina"},{code:"BW",name:"Botswana"},{code:"BR",name:"Brazil"},{code:"BN",name:"Brunei"},{code:"BG",name:"Bulgaria"},{code:"BF",name:"Burkina Faso"},{code:"BI",name:"Burundi"},{code:"KH",name:"Cambodia"},{code:"CM",name:"Cameroon"},{code:"CA",name:"Canada"},{code:"CV",name:"Cape Verde"},{code:"CF",name:"Central African Republic"},{code:"TD",name:"Chad"},{code:"CL",name:"Chile"},{code:"CN",name:"China"},{code:"CO",name:"Colombia"},{code:"KM",name:"Comoros"},{code:"CG",name:"Congo"},{code:"CD",name:"Congo (DRC)"},{code:"CR",name:"Costa Rica"},{code:"HR",name:"Croatia"},{code:"CU",name:"Cuba"},{code:"CY",name:"Cyprus"},{code:"CZ",name:"Czechia"},{code:"DK",name:"Denmark"},{code:"DJ",name:"Djibouti"},{code:"DM",name:"Dominica"},{code:"DO",name:"Dominican Republic"},{code:"EC",name:"Ecuador"},{code:"EG",name:"Egypt"},{code:"SV",name:"El Salvador"},{code:"GQ",name:"Equatorial Guinea"},{code:"ER",name:"Eritrea"},{code:"EE",name:"Estonia"},{code:"SZ",name:"Eswatini"},{code:"ET",name:"Ethiopia"},{code:"FJ",name:"Fiji"},{code:"FI",name:"Finland"},{code:"FR",name:"France"},{code:"GA",name:"Gabon"},{code:"GM",name:"Gambia"},{code:"GE",name:"Georgia"},{code:"DE",name:"Germany"},{code:"GH",name:"Ghana"},{code:"GR",name:"Greece"},{code:"GD",name:"Grenada"},{code:"GT",name:"Guatemala"},{code:"GN",name:"Guinea"},{code:"GW",name:"Guinea-Bissau"},{code:"GY",name:"Guyana"},{code:"HT",name:"Haiti"},{code:"HN",name:"Honduras"},{code:"HK",name:"Hong Kong"},{code:"HU",name:"Hungary"},{code:"IS",name:"Iceland"},{code:"IN",name:"India"},{code:"ID",name:"Indonesia"},{code:"IR",name:"Iran"},{code:"IQ",name:"Iraq"},{code:"IE",name:"Ireland"},{code:"IL",name:"Israel"},{code:"IT",name:"Italy"},{code:"JM",name:"Jamaica"},{code:"JP",name:"Japan"},{code:"JO",name:"Jordan"},{code:"KZ",name:"Kazakhstan"},{code:"KE",name:"Kenya"},{code:"KI",name:"Kiribati"},{code:"KW",name:"Kuwait"},{code:"KG",name:"Kyrgyzstan"},{code:"LA",name:"Laos"},{code:"LV",name:"Latvia"},{code:"LB",name:"Lebanon"},{code:"LS",name:"Lesotho"},{code:"LR",name:"Liberia"},{code:"LY",name:"Libya"},{code:"LI",name:"Liechtenstein"},{code:"LT",name:"Lithuania"},{code:"LU",name:"Luxembourg"},{code:"MO",name:"Macao"},{code:"MG",name:"Madagascar"},{code:"MW",name:"Malawi"},{code:"MY",name:"Malaysia"},{code:"MV",name:"Maldives"},{code:"ML",name:"Mali"},{code:"MT",name:"Malta"},{code:"MH",name:"Marshall Islands"},{code:"MR",name:"Mauritania"},{code:"MU",name:"Mauritius"},{code:"MX",name:"Mexico"},{code:"FM",name:"Micronesia"},{code:"MD",name:"Moldova"},{code:"MC",name:"Monaco"},{code:"MN",name:"Mongolia"},{code:"ME",name:"Montenegro"},{code:"MA",name:"Morocco"},{code:"MZ",name:"Mozambique"},{code:"MM",name:"Myanmar"},{code:"NA",name:"Namibia"},{code:"NR",name:"Nauru"},{code:"NP",name:"Nepal"},{code:"NL",name:"Netherlands"},{code:"NZ",name:"New Zealand"},{code:"NI",name:"Nicaragua"},{code:"NE",name:"Niger"},{code:"NG",name:"Nigeria"},{code:"KP",name:"North Korea"},{code:"MK",name:"North Macedonia"},{code:"NO",name:"Norway"},{code:"OM",name:"Oman"},{code:"PK",name:"Pakistan"},{code:"PW",name:"Palau"},{code:"PS",name:"Palestine"},{code:"PA",name:"Panama"},{code:"PG",name:"Papua New Guinea"},{code:"PY",name:"Paraguay"},{code:"PE",name:"Peru"},{code:"PH",name:"Philippines"},{code:"PL",name:"Poland"},{code:"PT",name:"Portugal"},{code:"QA",name:"Qatar"},{code:"RO",name:"Romania"},{code:"RU",name:"Russia"},{code:"RW",name:"Rwanda"},{code:"KN",name:"Saint Kitts and Nevis"},{code:"LC",name:"Saint Lucia"},{code:"VC",name:"Saint Vincent and the Grenadines"},{code:"WS",name:"Samoa"},{code:"SM",name:"San Marino"},{code:"ST",name:"Sao Tome and Principe"},{code:"SA",name:"Saudi Arabia"},{code:"SN",name:"Senegal"},{code:"RS",name:"Serbia"},{code:"SC",name:"Seychelles"},{code:"SL",name:"Sierra Leone"},{code:"SG",name:"Singapore"},{code:"SK",name:"Slovakia"},{code:"SI",name:"Slovenia"},{code:"SB",name:"Solomon Islands"},{code:"SO",name:"Somalia"},{code:"ZA",name:"South Africa"},{code:"KR",name:"South Korea"},{code:"SS",name:"South Sudan"},{code:"ES",name:"Spain"},{code:"LK",name:"Sri Lanka"},{code:"SD",name:"Sudan"},{code:"SR",name:"Suriname"},{code:"SE",name:"Sweden"},{code:"CH",name:"Switzerland"},{code:"SY",name:"Syria"},{code:"TW",name:"Taiwan"},{code:"TJ",name:"Tajikistan"},{code:"TZ",name:"Tanzania"},{code:"TH",name:"Thailand"},{code:"TL",name:"Timor-Leste"},{code:"TG",name:"Togo"},{code:"TO",name:"Tonga"},{code:"TT",name:"Trinidad and Tobago"},{code:"TN",name:"Tunisia"},{code:"TR",name:"Turkey"},{code:"TM",name:"Turkmenistan"},{code:"TV",name:"Tuvalu"},{code:"UG",name:"Uganda"},{code:"UA",name:"Ukraine"},{code:"AE",name:"United Arab Emirates"},{code:"GB",name:"United Kingdom"},{code:"US",name:"United States"},{code:"UY",name:"Uruguay"},{code:"UZ",name:"Uzbekistan"},{code:"VU",name:"Vanuatu"},{code:"VA",name:"Vatican City"},{code:"VE",name:"Venezuela"},{code:"VN",name:"Vietnam"},{code:"YE",name:"Yemen"},{code:"ZM",name:"Zambia"},{code:"ZW",name:"Zimbabwe"}],n=new Map(t.map(e=>[e.code,e])),o=new Map(a.map(e=>[e.slug,e]));function r(){return[{label:null,options:[{value:"international",label:"🌐 International"}]},{label:"Region",options:a.map(e=>({value:`region:${e.slug}`,label:`${e.icon} ${e.label}`}))},{label:"Country",options:t.map(e=>({value:`country:${e.code}`,label:e.name}))}]}e.s(["geographyGroups",0,r,"geographyLabel",0,function(e){return function(e){if(e?.startsWith("country:")){let a=e.slice(8).toUpperCase(),t=n.get(a);return{scope:"country",code:a,label:t?.name||a}}if(e?.startsWith("region:")){let a=e.slice(7),t=o.get(a);return{scope:"region",icon:t?.icon||"🌐",label:t?.label||a}}return{scope:"international",icon:"🌐",label:"International"}}(e).label},"geographyValues",0,function(){return r().flatMap(e=>e.options.map(e=>e.value))}])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1btswyo._.js.map