// Finds current 3D-art competitions/events across the web, including
// non-English and regional sites, and files them as *pending* rows so they go
// through the normal admin review queue — nothing the crawler finds is ever
// published on its own.
//
//   npm run crawl                       # full run
//   npm run crawl -- --dry-run          # print what it would add, write nothing
//   npm run crawl -- --locales=KR,CN    # only some countries
//   npm run crawl -- --max-pages=60     # cap total pages fetched
//
// The same code (runCrawl) is what the always-on daemon (crawler/daemon.js)
// runs on a schedule. See crawler/config.json and README "Event crawler".
const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");
const config = require("./config.json");
const { toEnglish } = require("./translate");
const adapters = require("./adapters");

const ROOT = path.join(__dirname, "..");
const UA = "PolyTimeBot/0.1 (3D events aggregator; honours robots.txt; contact via site owner)";

// Options for the run in progress (set by runCrawl). One run at a time.
let opts = { dry: false, only: null, maxPages: 300, minConfidence: 70, recencyDays: 30, pagesPerQuery: 2 };

// ---------- env (.env.local) ----------
function loadEnv() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();

const { fetch: ufetch, ProxyAgent } = require("undici");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- polite fetching ----------
const hostNext = new Map(); // host -> earliest next request time
const robotsCache = new Map(); // origin -> rules
const proxies = new Map(); // proxyEnv -> ProxyAgent
const problems = new Map(); // host -> reason (unreachable / blocked)
let pagesFetched = 0;
let staleSkipped = 0;

function dispatcherFor(locale) {
  const url = locale?.proxyEnv && process.env[locale.proxyEnv];
  if (!url) return undefined;
  if (!proxies.has(locale.proxyEnv)) proxies.set(locale.proxyEnv, new ProxyAgent(url));
  return proxies.get(locale.proxyEnv);
}

async function politeWait(host) {
  const now = Date.now();
  const at = Math.max(now, hostNext.get(host) || 0);
  hostNext.set(host, at + 1000);
  if (at > now) await sleep(at - now);
}

async function rawGet(url, locale, accept = "text/html,application/xhtml+xml") {
  const host = new URL(url).host;
  await politeWait(host);
  const res = await ufetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
    dispatcher: dispatcherFor(locale),
    headers: { "User-Agent": UA, Accept: accept, "Accept-Language": locale?.acceptLanguage || "en;q=0.9" },
  });
  return res;
}

function parseRobots(text) {
  const rules = [];
  let agents = [];
  let inRules = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toLowerCase();
    if (key === "user-agent") {
      if (inRules) agents = [];
      agents.push(m[2].toLowerCase());
      inRules = false;
    } else if (key === "allow" || key === "disallow") {
      inRules = true;
      if (agents.some((a) => a === "*" || "polytimebot".includes(a) || a.includes("polytimebot"))) {
        if (m[2]) rules.push({ allow: key === "allow", path: m[2] });
      }
    }
  }
  return rules;
}

async function allowedByRobots(url, locale) {
  const u = new URL(url);
  if (!robotsCache.has(u.origin)) {
    let rules = [];
    try {
      const res = await rawGet(u.origin + "/robots.txt", locale, "text/plain");
      if (res.ok) rules = parseRobots(await res.text());
    } catch {
      // No robots.txt reachable: the page fetch itself will report the failure.
    }
    robotsCache.set(u.origin, rules);
  }
  const target = u.pathname + u.search;
  let best = null;
  for (const r of robotsCache.get(u.origin)) {
    const pat = r.path.replace(/\*+$/, "").replace(/\$$/, "");
    if (target.startsWith(pat) && (!best || pat.length >= best.len)) best = { len: pat.length, allow: r.allow };
  }
  return !best || best.allow;
}

function decode(buf, contentType) {
  const head = Buffer.from(buf.subarray(0, 4096)).toString("latin1");
  const charset =
    (contentType || "").match(/charset=([\w-]+)/i)?.[1] ||
    head.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1] ||
    "utf-8";
  try {
    return new TextDecoder(charset, { fatal: false }).decode(buf);
  } catch {
    return new TextDecoder("utf-8").decode(buf);
  }
}

async function getPage(url, locale) {
  if (pagesFetched >= opts.maxPages) return { ok: false, reason: "page budget reached" };
  const host = new URL(url).host;
  try {
    if (!(await allowedByRobots(url, locale))) return { ok: false, reason: "disallowed by robots.txt" };
    pagesFetched++;
    const res = await rawGet(url, locale);
    if (res.status === 403 || res.status === 451 || res.status === 429) {
      problems.set(host, `HTTP ${res.status} (blocked or geo-restricted)${locale?.country ? " — " + locale.country : ""}`);
      return { ok: false, reason: `HTTP ${res.status}` };
    }
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const type = res.headers.get("content-type") || "";
    if (!/html|xml/i.test(type)) return { ok: false, reason: "not a web page" };
    const buf = new Uint8Array(await res.arrayBuffer()).subarray(0, 1_500_000);
    return { ok: true, url: res.url || url, html: decode(buf, type) };
  } catch (e) {
    const code = e.cause?.code || e.name;
    const tls = /CERT|LEAF_SIGNATURE|SELF_SIGNED|ALTNAME/i.test(code);
    problems.set(
      host,
      tls
        ? `TLS certificate problem (${code}) — the site's own certificate is invalid; not geo-related`
        : `unreachable (${code})${/TIMEOUT|RESET|SOCKET|ENOTFOUND|ECONN/i.test(code) && locale?.country ? " — possibly blocked or slow from here; try CRAWL_PROXY_" + locale.country : ""}`
    );
    return { ok: false, reason: "unreachable" };
  }
}

// ---------- text extraction ----------
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const unent = (s) =>
  s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => {
    if (e[0] === "#") {
      const n = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENT[e.toLowerCase()] ?? m;
  });
const textOf = (html) =>
  unent(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style|noscript|svg|nav|footer)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();

function meta(html, key) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*>`, "i");
  const tag = html.match(re)?.[0];
  return tag ? unent(tag.match(/content=["']([^"']*)["']/i)?.[1] || "").trim() : "";
}

function jsonLdEvent(html) {
  const out = [];
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk = (n) => {
        if (Array.isArray(n)) return n.forEach(walk);
        if (n && typeof n === "object") {
          const t = [].concat(n["@type"] || []);
          if (t.some((x) => /Event$/.test(String(x)))) out.push(n);
          Object.values(n).forEach(walk);
        }
      };
      walk(JSON.parse(m[1]));
    } catch {
      // Malformed JSON-LD is common; ignore it.
    }
  }
  return out[0] || null;
}

// ---------- relevance ----------
const THREE_D = new RegExp(
  [
    "(?<![a-z0-9])3\\s?-?d(?![a-z])", "blender", "zbrush", "cinema ?4d", "(?<![a-z])c4d(?![a-z])", "houdini",
    "substance (painter|designer)", "unreal engine", "3ds max", "keyshot", "octane", "redshift", "vray|v-ray", "marmoset",
    "sculpt", "(?<![a-z])vfx(?![a-z])", "三维", "三維", "建模", "渲染", "数字艺术", "數位藝術", "모델링", "블렌더",
    "3\\s?มิติ", "โมเดล", "เบลนเดอร์", "モデリング", "ブレンダー", "3dcg", "dựng hình", "mô hình 3d", "pemodelan",
  ].join("|"),
  "gi"
);
const EVENT_KW = new RegExp(
  [
    "contest", "competition", "challenge", "game ?jam", "hackathon", "awards?", "call for (entries|artists|submissions)",
    "submissions? (open|deadline)", "prizes?", "大赛", "比赛", "竞赛", "競賽", "征集", "徵件", "评选", "赛事", "공모전", "대회",
    "콘테스트", "챌린지", "공모", "ประกวด", "แข่งขัน", "ชิงรางวัล", "コンテスト", "コンペ", "作品募集", "公募", "応募",
    "cuộc thi", "giải thưởng", "lomba", "kompetisi", "sayembara", "wettbewerb", "ausschreibung", "concours", "concurso", "concorso", "konkurs", "wedstrijd", "prijsvraag", "competi[cç][aã]o", "desafio", "gamejam",
  ].join("|"),
  "i"
);
const NOT_AN_EVENT = new RegExp(
  [
    "获奖", "獲獎", "公示", "名单", "名單", "入围", "당선", "수상", "결과\\s?발표", "합격", "교육\\s?(모집|안내)", "강좌", "수강", "강의", "受賞", "結果発表", "入賞",
    "winners?\\b", "results? (announced|announcement)", "\\bcourse\\b", "\\bwebinar\\b", "tutorial", "gewinner", "preistr[aä]ger", "gagnants?", "laur[eé]ats", "ganadores", "vincitori", "zwyci[eę]zc", "winnaars", "vencedores", "resultados? (del|do)",
  ].join("|"),
  "i"
);
const KITCHEN = /handboogsport|archers|schuetzen|schützen|toernooi|archer|archery|tir (a|à|sur)|concours tir|handboog|boogschiet|bogensport|bogenschie|tiro (con|al) |arco 3d|3d[- ]parcours|schie(ss|ß)en|hunting|jagd|standmixer|batidora|frullatore|mixeur|blender[- ]?(pro|set)|초고속|믹서|다지기|주방|믹서기|smoothie|juicer|kitchen|mixer|榨汁|料理機|ミキサー/i;
const count = (re, s) => (s.match(re) || []).length;

const SOFTWARE = ["Blender", "ZBrush", "Maya", "3ds Max", "Cinema 4D", "Houdini", "Substance", "Unreal Engine", "Unity", "KeyShot", "Octane", "Redshift", "V-Ray", "Marmoset", "Rhino", "SketchUp", "Nomad"];
const CATEGORY_HINTS = [
  ["character", /character|creature|角色|캐릭터|ตัวละคร|キャラクター/i],
  ["archviz", /archviz|architect|建筑|建築|건축|สถาปัตย์|建築/i],
  ["game-art", /game|游戏|遊戲|게임|เกม|ゲーム/i],
  ["vfx", /vfx|motion|animation|特效|動畫|动画|애니메이션|アニメ/i],
  ["sculpting", /sculpt|zbrush|雕刻|조각/i],
  ["product", /product (viz|render|design)|产品/i],
  ["pixel", /pixel/i],
  ["concept", /concept art|illustration|插画|插畫|일러스트/i],
];

// ---------- dates ----------
const MONTHS_EN = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
const MONTHS_TH = { "มกราคม": 1, "ม.ค.": 1, "กุมภาพันธ์": 2, "ก.พ.": 2, "มีนาคม": 3, "มี.ค.": 3, "เมษายน": 4, "เม.ย.": 4, "พฤษภาคม": 5, "พ.ค.": 5, "มิถุนายน": 6, "มิ.ย.": 6, "กรกฎาคม": 7, "ก.ค.": 7, "สิงหาคม": 8, "ส.ค.": 8, "กันยายน": 9, "ก.ย.": 9, "ตุลาคม": 10, "ต.ค.": 10, "พฤศจิกายน": 11, "พ.ย.": 11, "ธันวาคม": 12, "ธ.ค.": 12 };
const iso = (y, m, d) => {
  y = +y; m = +m; d = +d;
  if (y > 2400) y -= 543; // Thai Buddhist year
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1) return null;
  return dt.toISOString().slice(0, 10);
};

const MONTHS_EU = {
  januar: 1, janner: 1, janvier: 1, enero: 1, gennaio: 1, janeiro: 1, januari: 1, stycznia: 1,
  februar: 2, fevrier: 2, febrero: 2, febbraio: 2, fevereiro: 2, februari: 2, lutego: 2,
  marz: 3, maerz: 3, mars: 3, marzo: 3, marco: 3, maart: 3, marca: 3,
  abril: 4, avril: 4, aprile: 4, kwietnia: 4,
  mai: 5, mayo: 5, maggio: 5, maio: 5, mei: 5, maja: 5,
  juni: 6, juin: 6, junio: 6, giugno: 6, junho: 6, czerwca: 6,
  juli: 7, juillet: 7, julio: 7, luglio: 7, julho: 7, lipca: 7,
  augustus: 8, aout: 8, agosto: 8, sierpnia: 8,
  septembre: 9, septiembre: 9, settembre: 9, setembro: 9, wrzesnia: 9,
  oktober: 10, octobre: 10, octubre: 10, ottobre: 10, outubro: 10, pazdziernika: 10,
  novembre: 11, noviembre: 11, novembro: 11, listopada: 11,
  dezember: 12, decembre: 12, diciembre: 12, dicembre: 12, dezembro: 12, grudnia: 12,
};
MONTHS_EU.august = 8;
MONTHS_EU.september = 9;
MONTHS_EU.november = 11;
MONTHS_EU.december = 12;
MONTHS_EU.april = 4;

function findDates(text, dayFirst = true) {
  const found = new Set();
  const add = (v) => v && found.add(v);
  for (const m of text.matchAll(/(\d{4})\s*[-/.]\s*(\d{1,2})\s*[-/.]\s*(\d{1,2})/g)) add(iso(m[1], m[2], m[3]));
  for (const m of text.matchAll(/(\d{4})\s*[年년]\s*(\d{1,2})\s*[月월]\s*(\d{1,2})/g)) add(iso(m[1], m[2], m[3]));
  const en = "(jan|feb|mar|apr|may|jun|jul|aug|sept?|oct|nov|dec)[a-z]*\\.?";
  for (const m of text.matchAll(new RegExp(`${en}\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})`, "gi"))) add(iso(m[3], MONTHS_EN[m[1].toLowerCase()], m[2]));
  for (const m of text.matchAll(new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s+${en},?\\s+(\\d{4})`, "gi"))) add(iso(m[3], MONTHS_EN[m[2].toLowerCase()], m[1]));
  const th = Object.keys(MONTHS_TH).map((k) => k.replace(/\./g, "\\.")).join("|");
  for (const m of text.matchAll(new RegExp(`(\\d{1,2})\\s*(${th})\\s*(\\d{4})`, "g"))) add(iso(m[3], MONTHS_TH[m[2]], m[1]));
  // European languages: "15. Oktober 2026", "15 octobre 2026", "15 de octubre de 2026".
  const plain = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const names = Object.keys(MONTHS_EU).sort((a, b) => b.length - a.length).join("|");
  for (const m of plain.matchAll(new RegExp(`(\\d{1,2})(?:\\.|o|er)?\\s+(?:de |di |do )?(${names})\\.?,?\\s+(?:de |del )?(\\d{4})`, "gi"))) add(iso(m[3], MONTHS_EU[m[2].toLowerCase()], m[1]));
  // Numeric d.m.yyyy / d/m/yyyy: day-first outside North America; otherwise only when unambiguous.
  for (const m of text.matchAll(/(?<![\d./])(\d{1,2})[./](\d{1,2})[./](\d{4})(?![\d])/g)) {
    const a = +m[1];
    const b = +m[2];
    if (a > 12) add(iso(m[3], b, a));
    else if (b > 12) add(iso(m[3], a, b));
    else if (dayFirst) add(iso(m[3], b, a));
  }
  return [...found].sort();
}

// ---------- geography ----------
const geoSrc = fs.readFileSync(path.join(ROOT, "lib", "geography.js"), "utf8");
const COUNTRY_BY_NAME = new Map([...geoSrc.matchAll(/code:\s*"([A-Z]{2})",\s*name:\s*"([^"]+)"/g)].map((m) => [m[2].toLowerCase(), m[1]]));
COUNTRY_BY_NAME.set("turkey", "TR");
COUNTRY_BY_NAME.set("united kingdom", "GB");
COUNTRY_BY_NAME.set("usa", "US");
const VALID_CC = new Set([...geoSrc.matchAll(/code:\s*"([A-Z]{2})"/g)].map((m) => m[1]));
const TLD_CC = { cn: "CN", kr: "KR", th: "TH", jp: "JP", tw: "TW", hk: "HK", vn: "VN", id: "ID", sg: "SG", my: "MY", ph: "PH", in: "IN", de: "DE", fr: "FR", uk: "GB", br: "BR", ru: "RU", pl: "PL", es: "ES", it: "IT", au: "AU", ca: "CA" };
// A country is only claimed when the site's own domain (.kr, .de, ...) says so, or
// when the page's language is effectively single-country (Korean, Japanese, Thai,
// Vietnamese, Polish, Indonesian, Chinese). English/Spanish/French/German/...
// .com pages are usually open to everyone, so they stay International; the
// country the *search* ran in says nothing about where an event is.
const SINGLE_COUNTRY_LANGS = new Set(["ko", "ja", "th", "vi", "pl", "id", "zh"]);
function geographyFor(url, locale) {
  const tld = new URL(url).hostname.split(".").pop();
  const cc = TLD_CC[tld] || (SINGLE_COUNTRY_LANGS.has(locale?.lang) ? locale?.country : null);
  return cc && VALID_CC.has(cc) ? `country:${cc}` : "international";
}

// ---------- dedupe ----------
const normUrl = (u) => {
  try {
    const x = new URL(u);
    return (x.hostname.replace(/^www\./, "") + x.pathname.replace(/\/+$/, "")).toLowerCase();
  } catch {
    return "";
  }
};
const normTitle = (t) => t.toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, "");

// Two titles are the same event if their character bigrams overlap heavily.
function bigrams(t) {
  const n = normTitle(t);
  const set = new Set();
  for (let i = 0; i < n.length - 1; i++) set.add(n.slice(i, i + 2));
  return set;
}
function similar(a, b) {
  const A = bigrams(a);
  const B = bigrams(b);
  if (!A.size || !B.size) return false;
  let both = 0;
  for (const g of A) if (B.has(g)) both++;
  return both / (A.size + B.size - both) >= 0.6;
}

// ---------- candidate building ----------
// Newest publish/update date the page or search engine reports, or null.
function freshestDate(html, ld, hint) {
  const raw = [
    hint, ld?.datePublished, ld?.dateModified, ld?.dateCreated,
    meta(html, "article:published_time"), meta(html, "article:modified_time"), meta(html, "og:updated_time"),
    meta(html, "datePublished"), meta(html, "date"),
    html.match(/<time[^>]+datetime=["']([^"']+)["']/i)?.[1],
  ];
  const times = raw.map((d) => Date.parse(String(d || ""))).filter((t) => Number.isFinite(t) && t > Date.parse("2000-01-01") && t < Date.now() + 864e5 * 400);
  return times.length ? Math.max(...times) : null;
}

function build(page, locale, via, hintDate) {
  const { html, url } = page;
  const ld = jsonLdEvent(html);
  // Recency: if the page itself says when it was posted/updated and that is
  // older than the window, skip it. Pages with no date are kept: the search
  // engine's own time filter already restricted them.
  if (opts.recencyDays) {
    const newest = freshestDate(html, ld, hintDate);
    if (newest && Date.now() - newest > opts.recencyDays * 864e5) {
      staleSkipped++;
      return null;
    }
  }
  const rawTitle = ld?.name || meta(html, "og:title") || unent(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  let title = unent(String(rawTitle)).replace(/\s+/g, " ").trim();
  const parts = title.split(/\s[|\-–—·»]\s/);
  if (parts.length > 1 && parts[0].length >= 8) title = parts[0].trim();
  title = title.slice(0, 160);
  if (title.length < 6) return null;

  const desc = unent(String(ld?.description || meta(html, "og:description") || meta(html, "description"))).replace(/\s+/g, " ").trim();
  const body = textOf(html).slice(0, 8000);
  const lead = `${title} ${desc} ${body.slice(0, 1500)}`;
  const head = `${title} ${desc}`;
  const threeD = count(THREE_D, lead);
  if (!threeD || !THREE_D.test(head) || !EVENT_KW.test(head)) return null;
  THREE_D.lastIndex = 0;
  // Results/winners announcements, courses and videos are not open events.
  if (NOT_AN_EVENT.test(title) || /(^|\.)(youtube\.com|youtu\.be|tiktok\.com)$/.test(new URL(url).hostname)) return null;
  // Product pages that only share a word with 3D software ("blender" the kitchen appliance).
  if (KITCHEN.test(`${head} ${decodeURIComponent(url)}`)) return null;

  const today = new Date().toISOString().slice(0, 10);
  const cutoff = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const horizon = new Date(Date.now() + 2 * 366 * 864e5).toISOString().slice(0, 10);
  let dates = [];
  const ldDates = [ld?.startDate, ld?.endDate].map((d) => String(d || "").slice(0, 10)).filter((d) => /^\d{4}-\d\d-\d\d$/.test(d));
  const usedLd = ldDates.length > 0;
  dates = usedLd ? ldDates : findDates(`${desc} ${body}`, !/^(US|CA)$/.test(locale?.country || ""));
  const seen = dates.length;
  dates = dates.filter((d) => d >= cutoff && d <= horizon);
  if (seen > 0 && dates.length === 0) return null; // every date found is in the past: already ended
  const start = dates[0] || null;
  const end = dates.length > 1 ? dates[dates.length - 1] : null;

  let confidence = 30;
  if (THREE_D.test(title)) confidence += 25;
  THREE_D.lastIndex = 0;
  confidence += Math.min(15, threeD * 3);
  if (EVENT_KW.test(title)) confidence += 10;
  if (start) confidence += 15;
  if (usedLd) confidence += 10;
  confidence = Math.min(100, confidence);
  if (!start && confidence < 75) return null; // undated pages need to be a very clear match
  if (confidence < opts.minConfidence) return null;

  const category = CATEGORY_HINTS.find(([, re]) => re.test(`${title} ${desc}`))?.[0] || "3d";
  const software = SOFTWARE.filter((s) => new RegExp(s.replace(/[-\s]/g, "[-\\s]?"), "i").test(lead)).slice(0, 4).join(", ");
  const notes = [`Found by crawler via ${via} (${locale?.lang || "en"}, confidence ${confidence}%).`];
  notes.push(start ? (usedLd ? "Dates from the page's structured data." : "Dates auto-detected from page text — verify against the page.") : "No dates found — verify before approving.");

  return {
    htmlLang: html.match(/<html[^>]+\blang=["']?([\w-]+)/i)?.[1] || locale?.lang || null,
    title,
    description: (desc || body.slice(0, 400)).slice(0, 600),
    url,
    host: new URL(url).hostname.replace(/^www\./, ""),
    category,
    software: software || null,
    geography: geographyFor(url, locale),
    event_type: start ? "event" : "ongoing",
    start_date: start,
    end_date: end,
    location: "See event page",
    confidence,
    note: notes.join(" "),
  };
}

// ---------- discovery ----------
// Search engines only understand day / week / month / year windows.
function timeRange() {
  const d = opts.recencyDays;
  if (!d) return "year";
  return d <= 1 ? "day" : d <= 7 ? "week" : d <= 31 ? "month" : "year";
}

function searchProvider() {
  if (process.env.SEARXNG_URL) return { name: "SearXNG", run: searxSearch };
  if (process.env.BRAVE_API_KEY) return { name: "Brave", run: braveSearch };
  return null;
}

// Free option: a SearXNG instance you run yourself (it must have the json
// format enabled — see README). Per-locale engines (e.g. naver for Korea,
// baidu for China) come from crawler/config.json "searxEngines".
// Scraped web engines rate-limit quickly (Google CAPTCHAs, Brave "too many
// requests"), so each search uses ONE engine chosen in rotation from the
// locale's list, falls back to the next if it returns nothing, and searches
// are paced a few seconds apart.
const engineTurn = new Map();
// Pages through the results (pageno 1, 2, ...) so a narrow time window still
// yields enough candidates. Returns [{ url, title, published }].
async function searxSearch(query, locale) {
  const all = [];
  const seen = new Set();
  let engineIndex = null;
  for (let pageno = 1; pageno <= Math.max(1, opts.pagesPerQuery); pageno++) {
    const { results, used } = await searxSearchPage(query, locale, pageno, engineIndex);
    engineIndex = used; // keep the engine that worked for the following pages
    let fresh = 0;
    for (const r of results) {
      if (!seen.has(r.url)) {
        seen.add(r.url);
        all.push(r);
        fresh++;
      }
    }
    if (!fresh) break; // no new results: no point going deeper
  }
  return all;
}

async function searxSearchPage(query, locale, pageno, forcedEngine) {
  const list = String(locale.searxEngines || "").split(",").map((e) => e.trim()).filter(Boolean);
  const engines = list.length ? list : [null];
  let start;
  if (forcedEngine == null) {
    start = engineTurn.get(locale.country) || 0;
    engineTurn.set(locale.country, start + 1);
  } else {
    start = forcedEngine;
  }
  let lastError = null;
  for (let i = 0; i < Math.min(3, engines.length); i++) {
    await sleep(2500 + Math.random() * 2000);
    const idx = (start + i) % engines.length;
    try {
      const results = await searxOnce(query, locale, engines[idx], pageno);
      if (results.length) return { results, used: idx };
    } catch (e) {
      lastError = e;
    }
  }
  if (lastError && pageno === 1) throw lastError;
  return { results: [], used: start };
}

async function searxOnce(query, locale, engine, pageno = 1) {
  const base = process.env.SEARXNG_URL.replace(/\/$/, "");
  const lang = locale.country === "TW" ? "zh-TW" : locale.lang === "zh" ? "zh-CN" : locale.lang;
  const params = new URLSearchParams({ q: query, format: "json", language: lang, time_range: timeRange(), safesearch: "0", pageno: String(pageno) });
  if (engine) params.set("engines", engine);
  await politeWait(new URL(base).host);
  const res = await ufetch(`${base}/search?${params}`, {
    headers: { Accept: "application/json", "User-Agent": UA },
    signal: AbortSignal.timeout(40000),
  });
  if (!res.ok) throw new Error(`SearXNG HTTP ${res.status}${res.status === 403 ? " (enable the json format in settings.yml)" : ""}`);
  const data = await res.json();
  return (data.results || []).slice(0, 20).map((r) => ({ url: r.url, title: r.title, published: r.publishedDate || null }));
}

const BRAVE_LANG = { zh: "zh-hans", ja: "jp" };
const BRAVE_COUNTRIES = new Set("AR AU AT BE BR CA CL DK FI FR DE HK IN ID IT JP KR MY MX NL NZ NO CN PL PT PH RU SA ZA ES SE CH TW TR GB US".split(" "));

async function braveSearch(query, locale) {
  const all = [];
  for (let page = 0; page < Math.max(1, opts.pagesPerQuery); page++) {
    const got = await braveSearchPage(query, locale, page);
    if (!got.length) break;
    all.push(...got);
  }
  return all;
}

async function braveSearchPage(query, locale, page) {
  const key = process.env.BRAVE_API_KEY;
  const FRESH = { day: "pd", week: "pw", month: "pm", year: "py" };
  const base = new URLSearchParams({ q: query, count: "20", freshness: FRESH[timeRange()] });
  if (page) base.set("offset", String(page));
  const tuned = new URLSearchParams(base);
  if (BRAVE_COUNTRIES.has(locale.country)) tuned.set("country", locale.country);
  const lang = locale.country === "TW" ? "zh-hant" : BRAVE_LANG[locale.lang] || locale.lang;
  tuned.set("search_lang", lang);
  for (const params of [tuned, base]) {
    await politeWait("api.search.brave.com");
    const res = await ufetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
      headers: { Accept: "application/json", "X-Subscription-Token": key },
      signal: AbortSignal.timeout(20000),
    });
    if (res.status === 422 && params === tuned) continue; // unsupported country/lang combo: retry plain
    if (!res.ok) throw new Error(`Brave Search HTTP ${res.status}`);
    const data = await res.json();
    return (data.web?.results || []).map((r) => ({ url: r.url, title: r.title, published: r.page_age || null }));
  }
  return [];
}

async function pool(items, n, fn) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (queue.length) await fn(queue.shift());
    })
  );
}

function linksOf(page, limit, pattern) {
  const re = pattern ? new RegExp(pattern, "i") : null;
  const out = [];
  const seen = new Set();
  for (const m of page.html.matchAll(/<a\s[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let abs;
    try {
      abs = new URL(unent(m[1]), page.url).href;
    } catch {
      continue;
    }
    if (!/^https?:/.test(abs) || seen.has(abs)) continue;
    const label = textOf(m[2]);
    THREE_D.lastIndex = 0;
    if (re ? re.test(`${label} ${abs}`) : THREE_D.test(`${label} ${decodeURIComponent(abs)}`)) {
      seen.add(abs);
      out.push(abs);
    }
    if (out.length >= limit) break;
  }
  THREE_D.lastIndex = 0;
  return out;
}

function resetRunState() {
  hostNext.clear();
  robotsCache.clear();
  problems.clear();
  pagesFetched = 0;
  staleSkipped = 0;
}

// Runs one full crawl. Returns stats; never publishes anything — rows are
// inserted as status 'pending' for the admin review queue.
//   options: { dry, only: ['KR'], maxPages, minConfidence }
//   ctx:     { db (optional), log (optional), onProgress(note) (optional) }
async function runCrawl(options = {}, ctx = {}) {
  const log = ctx.log || console.log;
  const note = ctx.onProgress || (() => {});
  opts = { dry: false, only: null, maxPages: 300, minConfidence: 70, recencyDays: config.search?.recencyDays ?? 30, pagesPerQuery: config.search?.pagesPerQuery ?? 2, ...options };
  resetRunState();

  const dbFile = path.join(ROOT, "data", "app.db");
  let db = ctx.db;
  if (!db) {
    if (!fs.existsSync(dbFile)) {
      throw new Error("No database yet — start the app once (npm run dev) or run `npm run seed`, then re-run the crawler.");
    }
    db = new DatabaseSync(dbFile);
    db.exec("PRAGMA busy_timeout = 5000");
  }
  const existing = db.prepare("SELECT title, url FROM events").all();
  const knownUrls = new Set(existing.map((e) => normUrl(e.url || "")).filter(Boolean));
  const knownTitles = new Set(existing.map((e) => normTitle(e.title)));

  const locales = config.locales.filter((l) => !opts.only || opts.only.includes(l.country));
  const jobs = []; // { url, locale, via }
  const localeByCountry = Object.fromEntries(config.locales.map((l) => [l.country, l]));
  let searches = 0;

  const provider = searchProvider();
  let searchFailures = 0;
  const adapterCandidates = []; // finished candidates from structured calendars (no page fetch needed)
  if (provider) {
    search: for (const locale of locales) {
      for (const q of locale.queries) {
        note(`Searching [${locale.country}] ${q}`);
        try {
          const results = await provider.run(q, locale);
          searches++;
          searchFailures = 0;
          log(`search [${locale.country}] "${q}" -> ${results.length} results`);
          results.forEach((r) => jobs.push({ url: r.url, locale, via: `search "${q}"`, published: r.published }));
        } catch (e) {
          log(`search [${locale.country}] "${q}" failed: ${e.message}`);
          if (++searchFailures >= 3) {
            log(`${provider.name} looks unreachable — skipping the remaining searches this run.`);
            break search;
          }
        }
      }
    }
  } else {
    log("No search provider configured (SEARXNG_URL or BRAVE_API_KEY) — scanning seed sites only. (See README 'Event crawler'.)");
  }

  for (const src of config.sources) {
    if (opts.only && src.country && !opts.only.includes(src.country)) continue;
    if (src.disabled) {
      log(`source ${src.name}: skipped (${src.disabled})`);
      continue;
    }
    const locale = localeByCountry[src.country] || { lang: src.lang, acceptLanguage: `${src.lang};q=0.9` };
    note(`Scanning ${src.name}`);
    const page = await getPage(src.url, locale);
    if (!page.ok) {
      log(`source ${src.name}: ${page.reason}`);
      continue;
    }
    if (src.adapter) {
      const read = adapters[src.adapter];
      const found = read
        ? read(page.html, {
            today: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
            countryCode: (name) => COUNTRY_BY_NAME.get(String(name || "").toLowerCase()) || null,
            text: (h) => textOf(h),
            sourceName: src.name,
          })
        : [];
      log(`source ${src.name}: ${found.length} upcoming event(s) read directly`);
      adapterCandidates.push(...found);
      continue;
    }
    const links = linksOf(page, src.limit || 15, src.linkPattern);
    log(`source ${src.name}: ${links.length} 3D-looking links`);
    links.forEach((u) => jobs.push({ url: u, locale, via: src.name }));
  }

  // Interleave jobs across locales/sources so every country gets a fair share
  // of the page budget, instead of the first ones in config order using it all.
  const byGroup = new Map();
  for (const j of jobs) {
    const key = j.locale?.country || j.via;
    if (!byGroup.has(key)) byGroup.set(key, []);
    byGroup.get(key).push(j);
  }
  const groups = [...byGroup.values()];
  jobs.length = 0;
  for (let i = 0; groups.some((g) => i < g.length); i++) for (const g of groups) if (i < g.length) jobs.push(g[i]);

  const queued = new Set();
  const unique = jobs.filter((j) => {
    const k = normUrl(j.url);
    if (!k || knownUrls.has(k) || queued.has(k)) return false;
    queued.add(k);
    return true;
  });
  log(`\n${unique.length} new pages to examine (budget ${opts.maxPages}).`);

  const accepted = [];
  for (const cand of adapterCandidates) {
    const uk = normUrl(cand.url);
    const tk = normTitle(cand.title);
    if (knownUrls.has(uk) || knownTitles.has(tk) || accepted.some((a) => similar(a.title, cand.title))) continue;
    knownUrls.add(uk);
    knownTitles.add(tk);
    accepted.push(cand);
  }
  let examined = 0;
  await pool(unique, 4, async (job) => {
    examined++;
    if (examined % 10 === 0) note(`Examining pages (${examined}/${unique.length})`);
    const page = await getPage(job.url, job.locale);
    if (!page.ok) return;
    const cand = build(page, job.locale, job.via, job.published);
    if (!cand) return;
    const uk = normUrl(cand.url);
    const tk = normTitle(cand.title);
    if (knownUrls.has(uk) || knownTitles.has(tk)) return;
    if (accepted.some((a) => similar(a.title, cand.title))) return;
    knownUrls.add(uk);
    knownTitles.add(tk);
    accepted.push(cand);
  });

  accepted.sort((a, b) => b.confidence - a.confidence);
  if (opts.recencyDays) log(`Skipped ${staleSkipped} page(s) last posted/updated more than ${opts.recencyDays} days ago.`);
  log(`\n${accepted.length} candidate event(s):`);
  for (const c of accepted) {
    log(` [${c.confidence}%] ${c.title}\n       ${c.start_date || "no date"}${c.end_date ? " → " + c.end_date : ""} · ${c.geography} · ${c.url}`);
  }

  // Descriptions only (titles are left as written), and only for candidates
  // that survived filtering, to keep free-translation quotas small.
  let translatedCount = 0;
  for (const c of accepted) {
    if (!c.description) continue;
    note("Translating descriptions");
    const original = c.description;
    const r = await toEnglish(original, c.htmlLang);
    if (r.translated) {
      c.description = r.text;
      c.note += ` Description auto-translated from ${r.from}; original: "${original.slice(0, 300)}"`;
      translatedCount++;
    } else if (r.error) {
      c.note += ` Description not translated (${r.from}: ${r.error}).`;
    }
  }
  if (translatedCount) log(`Translated ${translatedCount} description(s) to English.`);

  let added = 0;
  if (!opts.dry && accepted.length) {
    const insert = db.prepare(`
      INSERT INTO events (title, description, url, host, category, software, geography, event_type, start_date, end_date, location, submitted_by, submitter_note, status)
      VALUES (@title, @description, @url, @host, @category, @software, @geography, @event_type, @start_date, @end_date, @location, 'crawler', @note, 'pending')
    `);
    for (const c of accepted) {
      const { confidence, htmlLang, ...row } = c;
      insert.run(row);
      added++;
    }
    log(`\nAdded ${added} to the review queue (status: pending).`);
  } else if (opts.dry) {
    log("\nDry run — nothing written.");
  }

  if (problems.size) {
    log(`\n${problems.size} site(s) could not be read:`);
    for (const [host, why] of problems) log(` - ${host}: ${why}`);
    log("For sites blocked outside their own country, set the matching CRAWL_PROXY_<CC> in .env.local (see README).");
  }

  return {
    pages: pagesFetched,
    searches,
    candidates: accepted.length,
    added,
    unreachable: [...problems].map(([host, why]) => ({ host, why })),
    found: accepted.slice(0, 20).map((c) => ({ title: c.title, url: c.url, confidence: c.confidence, geography: c.geography })),
  };
}

module.exports = { runCrawl, config };

if (require.main === module) {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v === undefined ? true : v];
    })
  );
  runCrawl({
    dry: Boolean(args["dry-run"]),
    only: args.locales ? String(args.locales).toUpperCase().split(",") : null,
    maxPages: Number(args["max-pages"]) || 300,
    minConfidence: Number(args["min-confidence"]) || 70,
    ...(args["recency-days"] !== undefined ? { recencyDays: Number(args["recency-days"]) } : {}),
    ...(args["pages-per-query"] ? { pagesPerQuery: Number(args["pages-per-query"]) } : {}),
  }).catch((e) => {
    console.error(e.message || e);
    process.exit(1);
  });
}
