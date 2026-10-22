module.exports=[54799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},22734,(e,t,r)=>{t.exports=e.x("fs",()=>require("fs"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},20635,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},59043,(e,t,r)=>{t.exports=e.x("next/dist/server/runtime-reacts.external.js",()=>require("next/dist/server/runtime-reacts.external.js"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},74533,(e,t,r)=>{t.exports=e.x("node:child_process",()=>require("node:child_process"))},2157,(e,t,r)=>{t.exports=e.x("node:fs",()=>require("node:fs"))},50227,(e,t,r)=>{t.exports=e.x("node:path",()=>require("node:path"))},81111,(e,t,r)=>{t.exports=e.x("node:stream",()=>require("node:stream"))},27028,(e,t,r)=>{t.exports=e.x("node:zlib",()=>require("node:zlib"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},1746,e=>{"use strict";var t=e.i(89171),r=e.i(71650),n=e.i(39041),a=e.i(48467),s=e.i(92772);async function i(e){let i;if((0,s.rateLimited)(`login:${(0,s.clientIp)(e)}`,8,9e5))return t.NextResponse.json({error:"Too many attempts. Wait a few minutes and try again."},{status:429});let{password:o}=await e.json().catch(()=>({}))||{},l=!1;try{l="string"==typeof o&&o.length>0&&(0,r.checkPassword)(o)}catch(e){return t.NextResponse.json({error:e.message},{status:500})}if(!l)return await new Promise(e=>setTimeout(e,300)),t.NextResponse.json({error:"Wrong password."},{status:401});try{i=(0,n.createChallenge)();let e=await (0,a.sendAdminCode)(i.code,n.CODE_MINUTES),s=(0,r.makePendingCookie)(i.id),o=t.NextResponse.json({ok:!0,next:"/admin/verify",devMode:e.dev});return o.cookies.set(s.name,s.value,s.options),o}catch(e){return i&&(0,n.discardChallenge)(i.id),console.error("[admin login] could not send the sign-in code:",e.message),t.NextResponse.json({error:`Couldn't send the sign-in email. ${e.message}`},{status:502})}}e.s(["POST",0,i])},9473,e=>{"use strict";var t=e.i(47909),r=e.i(74017),n=e.i(96250),a=e.i(59756),s=e.i(61916),i=e.i(74677),o=e.i(69741),l=e.i(16795),d=e.i(87718),u=e.i(95169),T=e.i(47587),E=e.i(66012),c=e.i(70101),p=e.i(26937),N=e.i(10372),m=e.i(93695);e.i(52474);var h=e.i(220);let f=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/admin/login/route",pathname:"/api/admin/login",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/admin/login/route.js",nextConfigOutput:"standalone",userland:()=>e.r(1746),...{}}),{workAsyncStorage:g,workUnitAsyncStorage:L,serverHooks:R}=f;async function A(e,t,n){n.requestMeta&&(0,a.setRequestMeta)(e,n.requestMeta),f.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let g="/api/admin/login/route";g=g.replace(/\/index$/,"")||"/";let L=await f.prepare(e,t,{srcPage:g,multiZoneDraftMode:!1});if(!L)return t.statusCode=400,t.end("Bad Request"),null==n.waitUntil||n.waitUntil.call(n,Promise.resolve()),null;let{buildId:R,deploymentId:A,params:_,nextConfig:x,parsedUrl:v,isDraftMode:O,prerenderManifest:I,routerServerContext:U,isOnDemandRevalidate:w,revalidateOnlyGenerated:C,resolvedPathname:y,clientReferenceManifest:S,serverActionsManifest:X}=L,D=(0,o.normalizeAppPath)(g),b=!!(I.dynamicRoutes[D]||I.routes[y]),F=async()=>((null==U?void 0:U.render404)?await U.render404(e,t,v,!1):t.end("This page could not be found"),null);if(b&&!O){let e=!!I.routes[y],t=I.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(x.adapterPath)return await F();throw new m.NoFallbackError}}let M=null;!b||f.isDev||O||(M="/index"===(M=y)?"/":M);let k=!0===f.isDev||!b,P=b&&!k;X&&S&&(0,i.setManifestsSingleton)({page:g,clientReferenceManifest:S,serverActionsManifest:X});let q=e.method||"GET",j=(0,s.getTracer)(),G=j.getActiveScopeSpan(),B=!!(null==U?void 0:U.isWrappedByNextServer),H=!!(0,a.getRequestMeta)(e,"minimalMode"),K=(0,a.getRequestMeta)(e,"incrementalCache")||await f.getIncrementalCache(e,x,I,H);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let Y={params:_,previewProps:I.preview,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts,useCacheTimeout:x.experimental.useCacheTimeout},cacheComponents:!!x.cacheComponents,validationLevel:x.experimental.instantInsights.validationLevel,supportsDynamicResponse:k,incrementalCache:K,hmrRefreshHash:(0,a.getRequestMeta)(e,"hmrRefreshHash"),cacheLifeProfiles:x.cacheLife,staticPageGenerationTimeout:x.staticPageGenerationTimeout,waitUntil:n.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,n,a)=>f.onRequestError(e,t,n,a,U)},sharedContext:{buildId:R,deploymentId:A}},W=new l.NodeNextRequest(e),$=new l.NodeNextResponse(t),z=d.NextRequestAdapter.fromNodeNextRequest(W,(0,d.signalFromNodeResponse)(t)),V=async({previousCacheEntry:r})=>{try{if(!H&&w&&C&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let a=await f.handle(z,Y);e.fetchMetrics=Y.renderOpts.fetchMetrics;let s=Y.renderOpts.pendingWaitUntil;s&&n.waitUntil&&(n.waitUntil(s),s=void 0);let i=Y.renderOpts.collectedTags;if(!b)return await (0,E.sendResponse)(W,$,a,s),null;{let e=await a.blob(),t=(0,c.toNodeOutgoingHttpHeaders)(a.headers);i&&(t[N.NEXT_CACHE_TAGS_HEADER]=i),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,n=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=N.INFINITE_CACHE?!1!==r&&r>0?x.expireTime:void 0:Y.renderOpts.collectedExpire;return{value:{kind:h.CachedRouteKind.APP_ROUTE,status:a.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:n}}}}catch(t){throw(null==r?void 0:r.isStale)&&await f.onRequestError(e,t,{routerKind:"App Router",routePath:g,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:w})},!1,U),t}},Z=async(a,i)=>{try{var o,l;let a=await f.handleResponse({req:e,nextConfig:x,cacheKey:M,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:I,isRoutePPREnabled:!1,isOnDemandRevalidate:w,revalidateOnlyGenerated:C,responseGenerator:V,waitUntil:n.waitUntil,isMinimalMode:H});if(!b)return;if((null==a||null==(o=a.value)?void 0:o.kind)!==h.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==a||null==(l=a.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});H||t.setHeader("x-nextjs-cache",w?"REVALIDATED":a.isMiss?"MISS":a.isStale?"STALE":"HIT"),O&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let s=(0,c.fromNodeOutgoingHttpHeaders)(a.value.headers);H&&b||s.delete(N.NEXT_CACHE_TAGS_HEADER),!a.cacheControl||t.getHeader("Cache-Control")||s.get("Cache-Control")||s.set("Cache-Control",(0,p.getCacheControlHeader)(a.cacheControl)),await (0,E.sendResponse)(W,$,new Response(a.value.body,{headers:s,status:a.value.status||200}));return}catch(t){if(t instanceof m.NoFallbackError||await f.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,T.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:w})},!1,U),b)throw t;await (0,E.sendResponse)(W,$,new Response(null,{status:500}));return}finally{(()=>{if(!a)return;let e=t.statusCode;a.setAttributes({"http.status_code":e,"next.rsc":!1}),e&&e>=500&&(a.setStatus({code:s.SpanStatusCode.ERROR}),a.setAttribute("error.type",e.toString()));let r=j.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=r.get("next.route")||D,o=`${q} ${n}`;a.setAttributes({"next.route":n,"http.route":n,"next.span_name":o}),a.updateName(o),i&&i!==a&&(i.setAttribute("http.route",n),i.updateName(o))})()}};if(B&&G)await Z(G,void 0);else{let t=j.getActiveScopeSpan();await j.withPropagatedContext(e.headers,()=>j.trace(u.BaseServerSpan.handleRequest,{spanName:`${q} ${g}`,kind:s.SpanKind.SERVER,attributes:{"http.method":q,"http.target":e.url}},e=>Z(e,t)),void 0,!B)}}e.s(["handler",0,A,"patchFetch",0,function(){return(0,n.patchFetch)({workAsyncStorage:g,workUnitAsyncStorage:L})},"routeModule",0,f,"serverHooks",0,R,"workAsyncStorage",0,g,"workUnitAsyncStorage",0,L])},39041,e=>{"use strict";var t=e.i(54799),r=e.i(80998);let n="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",a=(e,r)=>t.default.createHmac("sha256",(()=>{if(!process.env.ADMIN_SECRET)throw Error("ADMIN_SECRET is not set.");return process.env.ADMIN_SECRET})()).update(`${e}:${r}`).digest("hex");function s(){return Array.from({length:8},()=>n[t.default.randomInt(n.length)]).join("")}function i(e){if(!/^[0-9a-f]{32}$/.test(e||""))return null;let t=(0,r.default)().prepare("SELECT * FROM admin_login_codes WHERE id = ?").get(e);return t&&!t.consumed?{...t}:null}e.s(["CODE_MINUTES",0,10,"checkCode",0,function(e,n){let s=(0,r.default)(),o=i(e);if(!o)return{error:"missing"};if(Date.now()>o.expires_at)return{error:"expired"};if(o.attempts>=5||o.total_attempts>=10)return{error:"locked",attemptsLeft:0};let l=Buffer.from(a(e,String(n||"").toUpperCase().replace(/[^A-Z0-9]/g,""))),d=Buffer.from(o.code_hash);if(l.length===d.length&&t.default.timingSafeEqual(l,d))return s.prepare("UPDATE admin_login_codes SET consumed = 1 WHERE id = ?").run(e),{ok:!0};let u=o.attempts+1;s.prepare("UPDATE admin_login_codes SET attempts = ?, total_attempts = total_attempts + 1 WHERE id = ?").run(u,e);let T=Math.max(0,5-u),E=0===T||o.total_attempts+1>=10;return{error:E?"locked":"wrong",attempt:u,attemptsLeft:E?0:T}},"createChallenge",0,function(){let e=(0,r.default)();e.prepare("DELETE FROM admin_login_codes WHERE created_at < ?").run(Date.now()-864e5);let n=t.default.randomBytes(16).toString("hex"),i=s(),o=Date.now();return e.prepare("INSERT INTO admin_login_codes (id, code_hash, created_at, expires_at, last_sent_at) VALUES (?, ?, ?, ?, ?)").run(n,a(n,i),o,o+6e5,o),{id:n,code:i}},"discardChallenge",0,function(e){(0,r.default)().prepare("DELETE FROM admin_login_codes WHERE id = ?").run(e)},"reissueCode",0,function(e){let t=(0,r.default)(),n=i(e);if(!n)return{error:"missing"};if(n.sent_count>=4||n.total_attempts>=10)return{error:"limit"};let o=n.last_sent_at+3e4-Date.now();if(o>0)return{error:"wait",retryInMs:o};let l=s(),d=Date.now();return t.prepare("UPDATE admin_login_codes SET code_hash = ?, expires_at = ?, attempts = 0, sent_count = sent_count + 1, last_sent_at = ? WHERE id = ?").run(a(e,l),d+6e5,d,e),{code:l}}])},71650,e=>{"use strict";var t=e.i(54799);let r="cg_admin";function n(e){let r=function(){let e=process.env.ADMIN_SECRET;if(!e)throw Error("ADMIN_SECRET is not set. Add it to .env.local before using admin login.");return e}(),n=t.default.createHmac("sha256",r).update(e).digest("hex");return`${e}.${n}`}let a="cg_admin_pending",s=e=>({httpOnly:!0,sameSite:"lax",secure:!0,path:"/",maxAge:e});e.s(["checkPassword",0,function(e){let r=process.env.ADMIN_PASSWORD;if(!r)throw Error("ADMIN_PASSWORD is not set. Add it to .env.local before using admin login.");return e.length===r.length&&t.default.timingSafeEqual(Buffer.from(e),Buffer.from(r))},"clearedCookie",0,function(){return{name:r,value:"",options:{httpOnly:!0,sameSite:"lax",secure:!0,path:"/",maxAge:0}}},"clearedPendingCookie",0,function(){return{name:a,value:"",options:s(0)}},"isAdminRequest",0,function(e){var a=e.get(r)?.value;if(!a)return!1;let s=a.lastIndexOf(".");if(-1===s)return!1;let i=a.slice(0,s),o=a.slice(s+1),l=n(i).split(".")[1];try{return"admin"===i&&t.default.timingSafeEqual(Buffer.from(o),Buffer.from(l))}catch{return!1}},"makePendingCookie",0,function(e){return{name:a,value:n(`pending:${e}`),options:s(900)}},"makeSessionCookie",0,function(){return{name:r,value:n("admin"),options:{httpOnly:!0,sameSite:"lax",secure:!0,path:"/",maxAge:1209600}}},"readPendingChallenge",0,function(e){let r=e.get(a)?.value;if(!r)return null;let s=r.lastIndexOf(".");if(-1===s)return null;let i=r.slice(0,s),o=r.slice(s+1);try{let e=n(i).split(".")[1];if(!i.startsWith("pending:")||!t.default.timingSafeEqual(Buffer.from(o),Buffer.from(e)))return null}catch{return null}return i.slice(8)}])},80998,e=>{"use strict";let t;var r=e.x("node:sqlite",()=>require("node:sqlite"),!0),n=e.i(14747),a=e.i(22734);let s=n.default.join(process.cwd(),"data");a.default.existsSync(s)||a.default.mkdirSync(s,{recursive:!0});let i=n.default.join(s,"app.db");e.s(["default",0,function(){var e;let n;return t||((t=new r.DatabaseSync(i)).exec("PRAGMA journal_mode = WAL"),(e=t).exec(`
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
  `),(n=e.prepare("PRAGMA table_info(events)").all()).some(e=>"software"===e.name)||e.exec("ALTER TABLE events ADD COLUMN software TEXT"),n.some(e=>"geography"===e.name)||e.exec("ALTER TABLE events ADD COLUMN geography TEXT NOT NULL DEFAULT 'international'"),n.some(e=>"participants"===e.name)||e.exec("ALTER TABLE events ADD COLUMN participants INTEGER"),n.some(e=>"no_ai"===e.name)||e.exec("ALTER TABLE events ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0"),e.prepare("PRAGMA table_info(links)").all().some(e=>"no_ai"===e.name)||e.exec("ALTER TABLE links ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0")),t}])},92772,e=>{"use strict";let t=globalThis.__rateBuckets||=new Map;e.s(["clientIp",0,function(e){return(e.headers.get("x-forwarded-for")||"").split(",")[0].trim()||"local"},"rateLimited",0,function(e,r,n){let a=Date.now(),s=(t.get(e)||[]).filter(e=>a-e<n);if(s.push(a),t.set(e,s),t.size>5e3)for(let[e,r]of t)r.some(e=>a-e<n)||t.delete(e);return s.length>r}])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__01f67bt._.js.map