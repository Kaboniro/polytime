module.exports=[22734,(e,t,r)=>{t.exports=e.x("fs",()=>require("fs"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},20635,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},59043,(e,t,r)=>{t.exports=e.x("next/dist/server/runtime-reacts.external.js",()=>require("next/dist/server/runtime-reacts.external.js"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},81111,(e,t,r)=>{t.exports=e.x("node:stream",()=>require("node:stream"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},238,e=>{"use strict";var t=e.i(89171),r=e.i(80998);async function a(){try{return(0,r.default)().prepare("SELECT 1").get(),t.NextResponse.json({ok:!0},{headers:{"Cache-Control":"no-store"}})}catch{return t.NextResponse.json({ok:!1},{status:503,headers:{"Cache-Control":"no-store"}})}}e.s(["GET",0,a,"dynamic",0,"force-dynamic"])},53716,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),s=e.i(61916),i=e.i(74677),o=e.i(69741),T=e.i(16795),d=e.i(87718),l=e.i(95169),E=e.i(47587),u=e.i(66012),p=e.i(70101),c=e.i(26937),N=e.i(10372),L=e.i(93695);e.i(52474);var h=e.i(220);let R=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/health/route",pathname:"/api/health",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/health/route.js",nextConfigOutput:"standalone",userland:()=>e.r(238),...{}}),{workAsyncStorage:A,workUnitAsyncStorage:m,serverHooks:g}=R;async function v(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),R.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let A="/api/health/route";A=A.replace(/\/index$/,"")||"/";let m=await R.prepare(e,t,{srcPage:A,multiZoneDraftMode:!1});if(!m)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:g,deploymentId:v,params:x,nextConfig:U,parsedUrl:O,isDraftMode:I,prerenderManifest:_,routerServerContext:f,isOnDemandRevalidate:X,revalidateOnlyGenerated:w,resolvedPathname:y,clientReferenceManifest:C,serverActionsManifest:b}=m,D=(0,o.normalizeAppPath)(A),S=!!(_.dynamicRoutes[D]||_.routes[y]),F=async()=>((null==f?void 0:f.render404)?await f.render404(e,t,O,!1):t.end("This page could not be found"),null);if(S&&!I){let e=!!_.routes[y],t=_.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(U.adapterPath)return await F();throw new L.NoFallbackError}}let k=null;!S||R.isDev||I||(k="/index"===(k=y)?"/":k);let q=!0===R.isDev||!S,M=S&&!q;b&&C&&(0,i.setManifestsSingleton)({page:A,clientReferenceManifest:C,serverActionsManifest:b});let P=e.method||"GET",G=(0,s.getTracer)(),j=G.getActiveScopeSpan(),B=!!(null==f?void 0:f.isWrappedByNextServer),H=!!(0,n.getRequestMeta)(e,"minimalMode"),K=(0,n.getRequestMeta)(e,"incrementalCache")||await R.getIncrementalCache(e,U,_,H);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let Y={params:x,previewProps:_.preview,renderOpts:{experimental:{authInterrupts:!!U.experimental.authInterrupts,useCacheTimeout:U.experimental.useCacheTimeout},cacheComponents:!!U.cacheComponents,validationLevel:U.experimental.instantInsights.validationLevel,supportsDynamicResponse:q,incrementalCache:K,hmrRefreshHash:(0,n.getRequestMeta)(e,"hmrRefreshHash"),cacheLifeProfiles:U.cacheLife,staticPageGenerationTimeout:U.staticPageGenerationTimeout,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>R.onRequestError(e,t,a,n,f)},sharedContext:{buildId:g,deploymentId:v}},$=new T.NodeNextRequest(e),W=new T.NodeNextResponse(t),V=d.NextRequestAdapter.fromNodeNextRequest($,(0,d.signalFromNodeResponse)(t)),z=async({previousCacheEntry:r})=>{try{if(!H&&X&&w&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await R.handle(V,Y);e.fetchMetrics=Y.renderOpts.fetchMetrics;let s=Y.renderOpts.pendingWaitUntil;s&&a.waitUntil&&(a.waitUntil(s),s=void 0);let i=Y.renderOpts.collectedTags;if(!S)return await (0,u.sendResponse)($,W,n,s),null;{let e=await n.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(n.headers);i&&(t[N.NEXT_CACHE_TAGS_HEADER]=i),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,a=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=N.INFINITE_CACHE?!1!==r&&r>0?U.expireTime:void 0:Y.renderOpts.collectedExpire;return{value:{kind:h.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await R.onRequestError(e,t,{routerKind:"App Router",routePath:A,routeType:"route",revalidateReason:(0,E.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:X})},!1,f),t}},J=async(n,i)=>{try{var o,T;let n=await R.handleResponse({req:e,nextConfig:U,cacheKey:k,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:_,isRoutePPREnabled:!1,isOnDemandRevalidate:X,revalidateOnlyGenerated:w,responseGenerator:z,waitUntil:a.waitUntil,isMinimalMode:H});if(!S)return;if((null==n||null==(o=n.value)?void 0:o.kind)!==h.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==n||null==(T=n.value)?void 0:T.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",X?"REVALIDATED":n.isMiss?"MISS":n.isStale?"STALE":"HIT"),I&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let s=(0,p.fromNodeOutgoingHttpHeaders)(n.value.headers);H&&S||s.delete(N.NEXT_CACHE_TAGS_HEADER),!n.cacheControl||t.getHeader("Cache-Control")||s.get("Cache-Control")||s.set("Cache-Control",(0,c.getCacheControlHeader)(n.cacheControl)),await (0,u.sendResponse)($,W,new Response(n.value.body,{headers:s,status:n.value.status||200}));return}catch(t){if(t instanceof L.NoFallbackError||await R.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,E.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:X})},!1,f),S)throw t;await (0,u.sendResponse)($,W,new Response(null,{status:500}));return}finally{(()=>{if(!n)return;let e=t.statusCode;n.setAttributes({"http.status_code":e,"next.rsc":!1}),e&&e>=500&&(n.setStatus({code:s.SpanStatusCode.ERROR}),n.setAttribute("error.type",e.toString()));let r=G.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==l.BaseServerSpan.handleRequest)return console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route")||D,o=`${P} ${a}`;n.setAttributes({"next.route":a,"http.route":a,"next.span_name":o}),n.updateName(o),i&&i!==n&&(i.setAttribute("http.route",a),i.updateName(o))})()}};if(B&&j)await J(j,void 0);else{let t=G.getActiveScopeSpan();await G.withPropagatedContext(e.headers,()=>G.trace(l.BaseServerSpan.handleRequest,{spanName:`${P} ${A}`,kind:s.SpanKind.SERVER,attributes:{"http.method":P,"http.target":e.url}},e=>J(e,t)),void 0,!B)}}e.s(["handler",0,v,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:m})},"routeModule",0,R,"serverHooks",0,g,"workAsyncStorage",0,A,"workUnitAsyncStorage",0,m])},80998,e=>{"use strict";let t;var r=e.x("node:sqlite",()=>require("node:sqlite"),!0),a=e.i(14747),n=e.i(22734);let s=a.default.join(process.cwd(),"data");n.default.existsSync(s)||n.default.mkdirSync(s,{recursive:!0});let i=a.default.join(s,"app.db");e.s(["default",0,function(){var e;let a;return t||((t=new r.DatabaseSync(i)).exec("PRAGMA journal_mode = WAL"),(e=t).exec(`
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
  `),(a=e.prepare("PRAGMA table_info(events)").all()).some(e=>"software"===e.name)||e.exec("ALTER TABLE events ADD COLUMN software TEXT"),a.some(e=>"geography"===e.name)||e.exec("ALTER TABLE events ADD COLUMN geography TEXT NOT NULL DEFAULT 'international'"),a.some(e=>"participants"===e.name)||e.exec("ALTER TABLE events ADD COLUMN participants INTEGER"),a.some(e=>"no_ai"===e.name)||e.exec("ALTER TABLE events ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0"),e.prepare("PRAGMA table_info(links)").all().some(e=>"no_ai"===e.name)||e.exec("ALTER TABLE links ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0")),t}])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1j9i2k_._.js.map