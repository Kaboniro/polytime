module.exports=[22734,(e,t,a)=>{t.exports=e.x("fs",()=>require("fs"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},20635,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},59043,(e,t,a)=>{t.exports=e.x("next/dist/server/runtime-reacts.external.js",()=>require("next/dist/server/runtime-reacts.external.js"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},81111,(e,t,a)=>{t.exports=e.x("node:stream",()=>require("node:stream"))},14747,(e,t,a)=>{t.exports=e.x("path",()=>require("path"))},62646,e=>{"use strict";var t=e.i(89171),a=e.i(80998),r=e.i(982);let n=globalThis.__queryHits||=new Map;async function s(e){var s;let i,o,l=await e.json().catch(()=>null);if(!l||"object"!=typeof l)return t.NextResponse.json({error:"Invalid request."},{status:400});if(l.website)return t.NextResponse.json({ok:!0});if(s=(e.headers.get("x-forwarded-for")||"").split(",")[0].trim()||"local",i=Date.now(),(o=(n.get(s)||[]).filter(e=>i-e<36e5)).push(i),n.set(s,o),o.length>5)return t.NextResponse.json({error:"Too many messages from your connection — please try again later."},{status:429});let T=e=>null==e?"":String(e).trim(),u=T(l.kind),d=T(l.subject),E=T(l.message),c=T(l.page_url),p=T(l.contact),N={};return(r.QUERY_KINDS.some(e=>e.value===u)||(N.kind="Choose what this is about."),d?d.length>200&&(N.subject="Subject is too long (max 200 characters)."):N.subject="Add a short subject.",E.length<10?N.message="Please write a little more (at least 10 characters).":E.length>5e3&&(N.message="Message is too long (max 5,000 characters)."),c&&(c.length>2e3||!(e=>{try{let t=new URL(e);return"http:"===t.protocol||"https:"===t.protocol}catch{return!1}})(c))&&(N.page_url="That must be a full link starting with http:// or https://"),p&&(p.length>320||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p))&&(N.contact="That doesn't look like an email address."),Object.keys(N).length)?t.NextResponse.json({error:"Please fix the highlighted fields.",errors:N},{status:400}):((0,a.default)().prepare("INSERT INTO queries (kind, subject, message, page_url, contact) VALUES (@kind, @subject, @message, @page_url, @contact)").run({kind:u,subject:d,message:E,page_url:c||null,contact:p||null}),t.NextResponse.json({ok:!0}))}e.s(["POST",0,s])},32107,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),n=e.i(59756),s=e.i(61916),i=e.i(74677),o=e.i(69741),l=e.i(16795),T=e.i(87718),u=e.i(95169),d=e.i(47587),E=e.i(66012),c=e.i(70101),p=e.i(26937),N=e.i(10372),h=e.i(93695);e.i(52474);var L=e.i(220);let g=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/submit/query/route",pathname:"/api/submit/query",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/submit/query/route.js",nextConfigOutput:"standalone",userland:()=>e.r(62646),...{}}),{workAsyncStorage:m,workUnitAsyncStorage:v,serverHooks:R}=g;async function A(e,t,r){r.requestMeta&&(0,n.setRequestMeta)(e,r.requestMeta),g.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let m="/api/submit/query/route";m=m.replace(/\/index$/,"")||"/";let v=await g.prepare(e,t,{srcPage:m,multiZoneDraftMode:!1});if(!v)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:R,deploymentId:A,params:b,nextConfig:x,parsedUrl:O,isDraftMode:f,prerenderManifest:U,routerServerContext:I,isOnDemandRevalidate:_,revalidateOnlyGenerated:w,resolvedPathname:y,clientReferenceManifest:X,serverActionsManifest:C}=v,S=(0,o.normalizeAppPath)(m),D=!!(U.dynamicRoutes[S]||U.routes[y]),F=async()=>((null==I?void 0:I.render404)?await I.render404(e,t,O,!1):t.end("This page could not be found"),null);if(D&&!f){let e=!!U.routes[y],t=U.dynamicRoutes[S];if(t&&!1===t.fallback&&!e){if(x.adapterPath)return await F();throw new h.NoFallbackError}}let k=null;!D||g.isDev||f||(k="/index"===(k=y)?"/":k);let q=!0===g.isDev||!D,P=D&&!q;C&&X&&(0,i.setManifestsSingleton)({page:m,clientReferenceManifest:X,serverActionsManifest:C});let j=e.method||"GET",M=(0,s.getTracer)(),G=M.getActiveScopeSpan(),B=!!(null==I?void 0:I.isWrappedByNextServer),H=!!(0,n.getRequestMeta)(e,"minimalMode"),K=(0,n.getRequestMeta)(e,"incrementalCache")||await g.getIncrementalCache(e,x,U,H);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let Y={params:b,previewProps:U.preview,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts,useCacheTimeout:x.experimental.useCacheTimeout},cacheComponents:!!x.cacheComponents,validationLevel:x.experimental.instantInsights.validationLevel,supportsDynamicResponse:q,incrementalCache:K,hmrRefreshHash:(0,n.getRequestMeta)(e,"hmrRefreshHash"),cacheLifeProfiles:x.cacheLife,staticPageGenerationTimeout:x.staticPageGenerationTimeout,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>g.onRequestError(e,t,r,n,I)},sharedContext:{buildId:R,deploymentId:A}},V=new l.NodeNextRequest(e),$=new l.NodeNextResponse(t),z=T.NextRequestAdapter.fromNodeNextRequest(V,(0,T.signalFromNodeResponse)(t)),Q=async({previousCacheEntry:a})=>{try{if(!H&&_&&w&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await g.handle(z,Y);e.fetchMetrics=Y.renderOpts.fetchMetrics;let s=Y.renderOpts.pendingWaitUntil;s&&r.waitUntil&&(r.waitUntil(s),s=void 0);let i=Y.renderOpts.collectedTags;if(!D)return await (0,E.sendResponse)(V,$,n,s),null;{let e=await n.blob(),t=(0,c.toNodeOutgoingHttpHeaders)(n.headers);i&&(t[N.NEXT_CACHE_TAGS_HEADER]=i),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,r=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=N.INFINITE_CACHE?!1!==a&&a>0?x.expireTime:void 0:Y.renderOpts.collectedExpire;return{value:{kind:L.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await g.onRequestError(e,t,{routerKind:"App Router",routePath:m,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:_})},!1,I),t}},W=async(n,i)=>{try{var o,l;let n=await g.handleResponse({req:e,nextConfig:x,cacheKey:k,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:U,isRoutePPREnabled:!1,isOnDemandRevalidate:_,revalidateOnlyGenerated:w,responseGenerator:Q,waitUntil:r.waitUntil,isMinimalMode:H});if(!D)return;if((null==n||null==(o=n.value)?void 0:o.kind)!==L.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==n||null==(l=n.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",_?"REVALIDATED":n.isMiss?"MISS":n.isStale?"STALE":"HIT"),f&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let s=(0,c.fromNodeOutgoingHttpHeaders)(n.value.headers);H&&D||s.delete(N.NEXT_CACHE_TAGS_HEADER),!n.cacheControl||t.getHeader("Cache-Control")||s.get("Cache-Control")||s.set("Cache-Control",(0,p.getCacheControlHeader)(n.cacheControl)),await (0,E.sendResponse)(V,$,new Response(n.value.body,{headers:s,status:n.value.status||200}));return}catch(t){if(t instanceof h.NoFallbackError||await g.onRequestError(e,t,{routerKind:"App Router",routePath:S,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:_})},!1,I),D)throw t;await (0,E.sendResponse)(V,$,new Response(null,{status:500}));return}finally{(()=>{if(!n)return;let e=t.statusCode;n.setAttributes({"http.status_code":e,"next.rsc":!1}),e&&e>=500&&(n.setStatus({code:s.SpanStatusCode.ERROR}),n.setAttribute("error.type",e.toString()));let a=M.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==u.BaseServerSpan.handleRequest)return console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route")||S,o=`${j} ${r}`;n.setAttributes({"next.route":r,"http.route":r,"next.span_name":o}),n.updateName(o),i&&i!==n&&(i.setAttribute("http.route",r),i.updateName(o))})()}};if(B&&G)await W(G,void 0);else{let t=M.getActiveScopeSpan();await M.withPropagatedContext(e.headers,()=>M.trace(u.BaseServerSpan.handleRequest,{spanName:`${j} ${m}`,kind:s.SpanKind.SERVER,attributes:{"http.method":j,"http.target":e.url}},e=>W(e,t)),void 0,!B)}}e.s(["handler",0,A,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:m,workUnitAsyncStorage:v})},"routeModule",0,g,"serverHooks",0,R,"workAsyncStorage",0,m,"workUnitAsyncStorage",0,v])},982,e=>{"use strict";e.s(["EVENT_CATEGORIES",0,[{value:"general",label:"General / Multi-discipline"},{value:"3d",label:"3D Art"},{value:"3d-printing",label:"3D Printing"},{value:"animation",label:"Animation / Motion"},{value:"rendering",label:"3D Fashion"},{value:"archviz",label:"Architectural Visualization"},{value:"game-art",label:"Game Art"},{value:"character",label:"Character / Creature"},{value:"vfx",label:"VFX / Motion"},{value:"product",label:"Product Viz"},{value:"sculpting",label:"Sculpting / ZBrush"},{value:"printing",label:"Stop Motion"},{value:"concept",label:"Concept / Illustration"},{value:"pixel",label:"Pixel Art"},{value:"other",label:"Other"}],"EVENT_TYPES",0,[{value:"event",label:"One-off event / contest deadline"},{value:"conference",label:"Conference"},{value:"ongoing",label:"Ongoing challenge (open-ended, no fixed date)"},{value:"rolling",label:"Rolling / recurring (weekly, monthly, etc.)"}],"LINK_CATEGORIES",0,[{value:"community",label:"Community (Discord, forum, subreddit)"},{value:"tool",label:"Tool / Plugin"},{value:"software",label:"Software"},{value:"asset-library",label:"Asset Library"},{value:"3d-printing",label:"3D Printing (printers, slicers, printable models)"},{value:"tutorial",label:"Tutorials / Learning"},{value:"job-board",label:"Jobs / Freelance"},{value:"other",label:"Other"}],"QUERY_KINDS",0,[{value:"removal",label:"Content removal request"},{value:"correction",label:"Correction"},{value:"question",label:"Question"},{value:"other",label:"Something else"}],"labelFor",0,function(e,t){return e.find(e=>e.value===t)?.label||t}])},80998,e=>{"use strict";let t;var a=e.x("node:sqlite",()=>require("node:sqlite"),!0),r=e.i(14747),n=e.i(22734);let s=r.default.join(process.cwd(),"data");n.default.existsSync(s)||n.default.mkdirSync(s,{recursive:!0});let i=r.default.join(s,"app.db");e.s(["default",0,function(){var e;let r;return t||((t=new a.DatabaseSync(i)).exec("PRAGMA journal_mode = WAL"),(e=t).exec(`
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
  `),(r=e.prepare("PRAGMA table_info(events)").all()).some(e=>"software"===e.name)||e.exec("ALTER TABLE events ADD COLUMN software TEXT"),r.some(e=>"geography"===e.name)||e.exec("ALTER TABLE events ADD COLUMN geography TEXT NOT NULL DEFAULT 'international'"),r.some(e=>"participants"===e.name)||e.exec("ALTER TABLE events ADD COLUMN participants INTEGER"),r.some(e=>"no_ai"===e.name)||e.exec("ALTER TABLE events ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0"),e.prepare("PRAGMA table_info(links)").all().some(e=>"no_ai"===e.name)||e.exec("ALTER TABLE links ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0")),t}])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0bol4gn._.js.map