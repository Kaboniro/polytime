module.exports=[97729,a=>{"use strict";let b;var c=a.x("node:sqlite",()=>require("node:sqlite"),!0),d=a.i(14747),e=a.i(22734);let f=d.default.join(process.cwd(),"data");e.default.existsSync(f)||e.default.mkdirSync(f,{recursive:!0});let g=d.default.join(f,"app.db");a.s(["default",0,function(){var a;let d;return b||((b=new c.DatabaseSync(g)).exec("PRAGMA journal_mode = WAL"),(a=b).exec(`
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
  `),(d=a.prepare("PRAGMA table_info(events)").all()).some(a=>"software"===a.name)||a.exec("ALTER TABLE events ADD COLUMN software TEXT"),d.some(a=>"geography"===a.name)||a.exec("ALTER TABLE events ADD COLUMN geography TEXT NOT NULL DEFAULT 'international'"),d.some(a=>"participants"===a.name)||a.exec("ALTER TABLE events ADD COLUMN participants INTEGER"),d.some(a=>"no_ai"===a.name)||a.exec("ALTER TABLE events ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0"),a.prepare("PRAGMA table_info(links)").all().some(a=>"no_ai"===a.name)||a.exec("ALTER TABLE links ADD COLUMN no_ai INTEGER NOT NULL DEFAULT 0")),b}])},70396,a=>{"use strict";a.i(73727),a.s([])},1567,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"isNextRouterError",{enumerable:!0,get:function(){return f}});let d=a.r(89798),e=a.r(28859);function f(a){return(0,e.isRedirectError)(a)||(0,d.isHTTPAccessFallbackError)(a)}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},20916,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"ReadonlyURLSearchParams",{enumerable:!0,get:function(){return e}});class d extends Error{constructor(){super("Method unavailable on `ReadonlyURLSearchParams`. Read more: https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams"),Object.defineProperty(this,"__NEXT_ERROR_CODE",{value:"E1174",enumerable:!1,configurable:!0})}}class e extends URLSearchParams{append(){throw new d}delete(){throw new d}set(){throw new d}sort(){throw new d}}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},21170,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"RedirectStatusCode",{enumerable:!0,get:function(){return e}});var d,e=((d={})[d.SeeOther=303]="SeeOther",d[d.TemporaryRedirect=307]="TemporaryRedirect",d[d.PermanentRedirect=308]="PermanentRedirect",d);("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},28859,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={REDIRECT_ERROR_CODE:function(){return g},isRedirectError:function(){return h}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(21170),g="NEXT_REDIRECT";function h(a){if("object"!=typeof a||null===a||!("digest"in a)||"string"!=typeof a.digest)return!1;let b=a.digest.split(";"),[c,d]=b,e=b.slice(2,-2).join(";"),h=Number(b.at(-2));return c===g&&("replace"===d||"push"===d)&&"string"==typeof e&&!isNaN(h)&&h in f.RedirectStatusCode}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},92473,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={actionAsyncStorage:function(){return f.actionAsyncStorage},workAsyncStorage:function(){return g.workAsyncStorage},workUnitAsyncStorage:function(){return h.workUnitAsyncStorage}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(20635),g=a.r(56704),h=a.r(32319);("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},44868,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={getRedirectError:function(){return i},getRedirectStatusCodeFromError:function(){return n},getRedirectTypeFromError:function(){return m},getURLFromRedirectError:function(){return l},permanentRedirect:function(){return k},redirect:function(){return j}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(21170),g=a.r(28859),h=a.r(92473);function i(a,b,c=f.RedirectStatusCode.TemporaryRedirect){let d=Object.defineProperty(Error(g.REDIRECT_ERROR_CODE),"__NEXT_ERROR_CODE",{value:"E394",enumerable:!1,configurable:!0});return d.digest=`${g.REDIRECT_ERROR_CODE};${b};${a};${c};`,d}function j(a,b){throw i(a,b??=h.actionAsyncStorage?.getStore()?.isAction?"push":"replace",f.RedirectStatusCode.TemporaryRedirect)}function k(a,b="replace"){throw i(a,b,f.RedirectStatusCode.PermanentRedirect)}function l(a){return(0,g.isRedirectError)(a)?a.digest.split(";").slice(2,-2).join(";"):null}function m(a){if(!(0,g.isRedirectError)(a))throw Object.defineProperty(Error("Not a redirect error"),"__NEXT_ERROR_CODE",{value:"E260",enumerable:!1,configurable:!0});return a.digest.split(";",2)[1]}function n(a){if(!(0,g.isRedirectError)(a))throw Object.defineProperty(Error("Not a redirect error"),"__NEXT_ERROR_CODE",{value:"E260",enumerable:!1,configurable:!0});return Number(a.digest.split(";").at(-2))}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},89798,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={HTTPAccessErrorStatus:function(){return f},HTTP_ERROR_FALLBACK_ERROR_CODE:function(){return h},getAccessFallbackErrorTypeByStatus:function(){return k},getAccessFallbackHTTPStatus:function(){return j},isHTTPAccessFallbackError:function(){return i}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f={NOT_FOUND:404,FORBIDDEN:403,UNAUTHORIZED:401},g=new Set(Object.values(f)),h="NEXT_HTTP_ERROR_FALLBACK";function i(a){if("object"!=typeof a||null===a||!("digest"in a)||"string"!=typeof a.digest)return!1;let[b,c]=a.digest.split(";");return b===h&&g.has(Number(c))}function j(a){return Number(a.digest.split(";")[1])}function k(a){switch(a){case 401:return"unauthorized";case 403:return"forbidden";case 404:return"not-found";default:return}}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},16155,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"notFound",{enumerable:!0,get:function(){return f}});let d=a.r(89798),e=`${d.HTTP_ERROR_FALLBACK_ERROR_CODE};404`;function f(){let a=Object.defineProperty(Error(e),"__NEXT_ERROR_CODE",{value:"E1041",enumerable:!1,configurable:!0});throw a.digest=e,a}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},34557,(a,b,c)=>{"use strict";function d(){throw Object.defineProperty(Error("`forbidden()` is experimental and only allowed to be enabled when `experimental.authInterrupts` is enabled."),"__NEXT_ERROR_CODE",{value:"E488",enumerable:!1,configurable:!0})}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"forbidden",{enumerable:!0,get:function(){return d}}),a.r(89798).HTTP_ERROR_FALLBACK_ERROR_CODE,("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},93845,(a,b,c)=>{"use strict";function d(){throw Object.defineProperty(Error("`unauthorized()` is experimental and only allowed to be used when `experimental.authInterrupts` is enabled."),"__NEXT_ERROR_CODE",{value:"E411",enumerable:!1,configurable:!0})}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"unauthorized",{enumerable:!0,get:function(){return d}}),a.r(89798).HTTP_ERROR_FALLBACK_ERROR_CODE,("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},60968,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"unstable_rethrow",{enumerable:!0,get:function(){return function a(b){if((0,g.isNextRouterError)(b)||(0,f.isBailoutToCSRError)(b)||(0,i.isDynamicServerError)(b)||(0,h.isDynamicPostpone)(b)||(0,e.isPostpone)(b)||(0,d.isHangingPromiseRejectionError)(b)||(0,h.isPrerenderInterruptedError)(b))throw b;b instanceof Error&&"cause"in b&&a(b.cause)}}});let d=a.r(13091),e=a.r(73808),f=a.r(49640),g=a.r(1567),h=a.r(60384),i=a.r(96556);("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},73727,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={ReadonlyURLSearchParams:function(){return f.ReadonlyURLSearchParams},RedirectType:function(){return m},forbidden:function(){return i.forbidden},notFound:function(){return h.notFound},permanentRedirect:function(){return g.permanentRedirect},redirect:function(){return g.redirect},unauthorized:function(){return j.unauthorized},unstable_isUnrecognizedActionError:function(){return l},unstable_rethrow:function(){return k.unstable_rethrow}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(20916),g=a.r(44868),h=a.r(16155),i=a.r(34557),j=a.r(93845),k=a.r(60968);function l(){throw Object.defineProperty(Error("`unstable_isUnrecognizedActionError` can only be used on the client."),"__NEXT_ERROR_CODE",{value:"E776",enumerable:!1,configurable:!0})}let m={push:"push",replace:"replace"};("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},73808,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"isPostpone",{enumerable:!0,get:function(){return e}});let d=Symbol.for("react.postpone");function e(a){return"object"==typeof a&&null!==a&&a.$$typeof===d}}];

//# sourceMappingURL=_1a3g7lw._.js.map