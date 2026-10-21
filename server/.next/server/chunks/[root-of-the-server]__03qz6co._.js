module.exports=[54799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},22734,(e,t,r)=>{t.exports=e.x("fs",()=>require("fs"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},20635,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},59043,(e,t,r)=>{t.exports=e.x("next/dist/server/runtime-reacts.external.js",()=>require("next/dist/server/runtime-reacts.external.js"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},81111,(e,t,r)=>{t.exports=e.x("node:stream",()=>require("node:stream"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},22736,e=>{"use strict";var t=e.i(93458);e.i(79509);var r=e.i(89171),n=e.i(71650);async function o(){let e=await (0,t.cookies)();return(0,n.isAdminRequest)(e)?null:r.NextResponse.json({error:"Not authorized."},{status:401})}e.s(["requireAdminApi",0,o],22736)},71650,e=>{"use strict";var t=e.i(54799);let r="cg_admin";function n(e){let r=function(){let e=process.env.ADMIN_SECRET;if(!e)throw Error("ADMIN_SECRET is not set. Add it to .env.local before using admin login.");return e}(),n=t.default.createHmac("sha256",r).update(e).digest("hex");return`${e}.${n}`}let o="cg_admin_pending",a=e=>({httpOnly:!0,sameSite:"lax",secure:!0,path:"/",maxAge:e});e.s(["checkPassword",0,function(e){let r=process.env.ADMIN_PASSWORD;if(!r)throw Error("ADMIN_PASSWORD is not set. Add it to .env.local before using admin login.");return e.length===r.length&&t.default.timingSafeEqual(Buffer.from(e),Buffer.from(r))},"clearedCookie",0,function(){return{name:r,value:"",options:{httpOnly:!0,sameSite:"lax",secure:!0,path:"/",maxAge:0}}},"clearedPendingCookie",0,function(){return{name:o,value:"",options:a(0)}},"isAdminRequest",0,function(e){var o=e.get(r)?.value;if(!o)return!1;let a=o.lastIndexOf(".");if(-1===a)return!1;let i=o.slice(0,a),s=o.slice(a+1),u=n(i).split(".")[1];try{return"admin"===i&&t.default.timingSafeEqual(Buffer.from(s),Buffer.from(u))}catch{return!1}},"makePendingCookie",0,function(e){return{name:o,value:n(`pending:${e}`),options:a(900)}},"makeSessionCookie",0,function(){return{name:r,value:n("admin"),options:{httpOnly:!0,sameSite:"lax",secure:!0,path:"/",maxAge:1209600}}},"readPendingChallenge",0,function(e){let r=e.get(o)?.value;if(!r)return null;let a=r.lastIndexOf(".");if(-1===a)return null;let i=r.slice(0,a),s=r.slice(a+1);try{let e=n(i).split(".")[1];if(!i.startsWith("pending:")||!t.default.timingSafeEqual(Buffer.from(s),Buffer.from(e)))return null}catch{return null}return i.slice(8)}])},80998,e=>{"use strict";let t;var r=e.x("node:sqlite",()=>require("node:sqlite"),!0),n=e.i(14747),o=e.i(22734);let a=n.default.join(process.cwd(),"data");o.default.existsSync(a)||o.default.mkdirSync(a,{recursive:!0});let i=n.default.join(a,"app.db");e.s(["default",0,function(){var e;let n;return t||((t=new r.DatabaseSync(i)).exec("PRAGMA journal_mode = WAL"),(e=t).exec(`
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
  `),(n=e.prepare("PRAGMA table_info(events)").all()).some(e=>"software"===e.name)||e.exec("ALTER TABLE events ADD COLUMN software TEXT"),n.some(e=>"geography"===e.name)||e.exec("ALTER TABLE events ADD COLUMN geography TEXT NOT NULL DEFAULT 'international'"),n.some(e=>"participants"===e.name)||e.exec("ALTER TABLE events ADD COLUMN participants INTEGER"),n.some(e=>"no_ai"===e.name)||e.exec("ALTER TABLE events ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0"),e.prepare("PRAGMA table_info(links)").all().some(e=>"no_ai"===e.name)||e.exec("ALTER TABLE links ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0")),t}])},62782,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"isNextRouterError",{enumerable:!0,get:function(){return a}});let n=e.r(12053),o=e.r(19334);function a(e){return(0,o.isRedirectError)(e)||(0,n.isHTTPAccessFallbackError)(e)}("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},8595,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"ReadonlyURLSearchParams",{enumerable:!0,get:function(){return o}});class n extends Error{constructor(){super("Method unavailable on `ReadonlyURLSearchParams`. Read more: https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams"),Object.defineProperty(this,"__NEXT_ERROR_CODE",{value:"E1174",enumerable:!1,configurable:!0})}}class o extends URLSearchParams{append(){throw new n}delete(){throw new n}set(){throw new n}sort(){throw new n}}("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},50723,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"RedirectStatusCode",{enumerable:!0,get:function(){return o}});var n,o=((n={})[n.SeeOther=303]="SeeOther",n[n.TemporaryRedirect=307]="TemporaryRedirect",n[n.PermanentRedirect=308]="PermanentRedirect",n);("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},19334,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n={REDIRECT_ERROR_CODE:function(){return i},isRedirectError:function(){return s}};for(var o in n)Object.defineProperty(r,o,{enumerable:!0,get:n[o]});let a=e.r(50723),i="NEXT_REDIRECT";function s(e){if("object"!=typeof e||null===e||!("digest"in e)||"string"!=typeof e.digest)return!1;let t=e.digest.split(";"),[r,n]=t,o=t.slice(2,-2).join(";"),s=Number(t.at(-2));return r===i&&("replace"===n||"push"===n)&&"string"==typeof o&&!isNaN(s)&&s in a.RedirectStatusCode}("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},15458,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n={actionAsyncStorage:function(){return a.actionAsyncStorage},workAsyncStorage:function(){return i.workAsyncStorage},workUnitAsyncStorage:function(){return s.workUnitAsyncStorage}};for(var o in n)Object.defineProperty(r,o,{enumerable:!0,get:n[o]});let a=e.r(20635),i=e.r(56704),s=e.r(32319);("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},22349,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n={getRedirectError:function(){return u},getRedirectStatusCodeFromError:function(){return E},getRedirectTypeFromError:function(){return T},getURLFromRedirectError:function(){return c},permanentRedirect:function(){return l},redirect:function(){return d}};for(var o in n)Object.defineProperty(r,o,{enumerable:!0,get:n[o]});let a=e.r(50723),i=e.r(19334),s=e.r(15458);function u(e,t,r=a.RedirectStatusCode.TemporaryRedirect){let n=Object.defineProperty(Error(i.REDIRECT_ERROR_CODE),"__NEXT_ERROR_CODE",{value:"E394",enumerable:!1,configurable:!0});return n.digest=`${i.REDIRECT_ERROR_CODE};${t};${e};${r};`,n}function d(e,t){throw u(e,t??=s.actionAsyncStorage?.getStore()?.isAction?"push":"replace",a.RedirectStatusCode.TemporaryRedirect)}function l(e,t="replace"){throw u(e,t,a.RedirectStatusCode.PermanentRedirect)}function c(e){return(0,i.isRedirectError)(e)?e.digest.split(";").slice(2,-2).join(";"):null}function T(e){if(!(0,i.isRedirectError)(e))throw Object.defineProperty(Error("Not a redirect error"),"__NEXT_ERROR_CODE",{value:"E260",enumerable:!1,configurable:!0});return e.digest.split(";",2)[1]}function E(e){if(!(0,i.isRedirectError)(e))throw Object.defineProperty(Error("Not a redirect error"),"__NEXT_ERROR_CODE",{value:"E260",enumerable:!1,configurable:!0});return Number(e.digest.split(";").at(-2))}("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},12053,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n={HTTPAccessErrorStatus:function(){return a},HTTP_ERROR_FALLBACK_ERROR_CODE:function(){return s},getAccessFallbackErrorTypeByStatus:function(){return l},getAccessFallbackHTTPStatus:function(){return d},isHTTPAccessFallbackError:function(){return u}};for(var o in n)Object.defineProperty(r,o,{enumerable:!0,get:n[o]});let a={NOT_FOUND:404,FORBIDDEN:403,UNAUTHORIZED:401},i=new Set(Object.values(a)),s="NEXT_HTTP_ERROR_FALLBACK";function u(e){if("object"!=typeof e||null===e||!("digest"in e)||"string"!=typeof e.digest)return!1;let[t,r]=e.digest.split(";");return t===s&&i.has(Number(r))}function d(e){return Number(e.digest.split(";")[1])}function l(e){switch(e){case 401:return"unauthorized";case 403:return"forbidden";case 404:return"not-found";default:return}}("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},2507,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"notFound",{enumerable:!0,get:function(){return a}});let n=e.r(12053),o=`${n.HTTP_ERROR_FALLBACK_ERROR_CODE};404`;function a(){let e=Object.defineProperty(Error(o),"__NEXT_ERROR_CODE",{value:"E1041",enumerable:!1,configurable:!0});throw e.digest=o,e}("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},47658,(e,t,r)=>{"use strict";function n(){throw Object.defineProperty(Error("`forbidden()` is experimental and only allowed to be enabled when `experimental.authInterrupts` is enabled."),"__NEXT_ERROR_CODE",{value:"E488",enumerable:!1,configurable:!0})}Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"forbidden",{enumerable:!0,get:function(){return n}}),e.r(12053).HTTP_ERROR_FALLBACK_ERROR_CODE,("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},35458,(e,t,r)=>{"use strict";function n(){throw Object.defineProperty(Error("`unauthorized()` is experimental and only allowed to be used when `experimental.authInterrupts` is enabled."),"__NEXT_ERROR_CODE",{value:"E411",enumerable:!1,configurable:!0})}Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"unauthorized",{enumerable:!0,get:function(){return n}}),e.r(12053).HTTP_ERROR_FALLBACK_ERROR_CODE,("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},9811,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"unstable_rethrow",{enumerable:!0,get:function(){return function e(t){if((0,i.isNextRouterError)(t)||(0,a.isBailoutToCSRError)(t)||(0,u.isDynamicServerError)(t)||(0,s.isDynamicPostpone)(t)||(0,o.isPostpone)(t)||(0,n.isHangingPromiseRejectionError)(t)||(0,s.isPrerenderInterruptedError)(t))throw t;t instanceof Error&&"cause"in t&&e(t.cause)}}});let n=e.r(4642),o=e.r(67539),a=e.r(31584),i=e.r(62782),s=e.r(68665),u=e.r(65252);("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},79509,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n={ReadonlyURLSearchParams:function(){return a.ReadonlyURLSearchParams},RedirectType:function(){return T},forbidden:function(){return u.forbidden},notFound:function(){return s.notFound},permanentRedirect:function(){return i.permanentRedirect},redirect:function(){return i.redirect},unauthorized:function(){return d.unauthorized},unstable_isUnrecognizedActionError:function(){return c},unstable_rethrow:function(){return l.unstable_rethrow}};for(var o in n)Object.defineProperty(r,o,{enumerable:!0,get:n[o]});let a=e.r(8595),i=e.r(22349),s=e.r(2507),u=e.r(47658),d=e.r(35458),l=e.r(9811);function c(){throw Object.defineProperty(Error("`unstable_isUnrecognizedActionError` can only be used on the client."),"__NEXT_ERROR_CODE",{value:"E776",enumerable:!1,configurable:!0})}let T={push:"push",replace:"replace"};("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},67539,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"isPostpone",{enumerable:!0,get:function(){return o}});let n=Symbol.for("react.postpone");function o(e){return"object"==typeof e&&null!==e&&e.$$typeof===n}}];

//# sourceMappingURL=%5Broot-of-the-server%5D__03qz6co._.js.map