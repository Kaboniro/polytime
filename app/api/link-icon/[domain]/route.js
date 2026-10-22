import fs from "node:fs";
import path from "node:path";
import { getApprovedLinks } from "@/lib/queries";
import { linkDomain } from "@/lib/links";

// Site icons for the Links page cards (/api/link-icon/polyhaven.com). The
// server downloads each linked site's own icon once and stores it under
// data/link-icons/, so visitors' browsers never contact the linked sites and
// a site is only asked once. Only domains of approved links are ever fetched
// (nobody can make the server fetch an arbitrary address through this). A
// site with no usable icon gets a letter tile instead, so a card never shows
// a broken image; that miss is remembered for a day before trying again.

const DIR = path.join(process.cwd(), "data", "link-icons");
const MAX_BYTES = 300_000;
const MISS_RETRY_MS = 24 * 60 * 60 * 1000;
const UA = "Mozilla/5.0 (compatible; PolyTimeIconFetcher/1.0)";
const inflight = (globalThis.__linkIconFetches ||= new Map());

// Strict headers for every icon: an SVG icon is shown as an image, and if
// opened directly it still can't run scripts or load anything.
const HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
};

function sniff(buf) {
  if (buf.length < 4) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00) return "image/x-icon";
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  if (buf.slice(0, 4).toString() === "RIFF" && buf.slice(8, 12).toString() === "WEBP") return "image/webp";
  const head = buf.slice(0, 512).toString("utf8").toLowerCase();
  if (head.includes("<svg")) return "image/svg+xml";
  return null;
}

async function get(url, accept) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: accept },
    redirect: "follow",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES * 4) throw new Error("too large");
  return { buf, url: res.url };
}

// Icon links declared in the page's <head>, best first: apple-touch-icon
// (180px, crisp), then the largest declared size up to 256px, then SVG.
function iconCandidates(html, base) {
  const out = [];
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = (tag.match(/\brel=["']?([^"'>]+)/i) || [])[1]?.toLowerCase() || "";
    if (!/\bicon\b|apple-touch-icon/.test(rel)) continue;
    const href = (tag.match(/\bhref=["']?([^"'\s>]+)/i) || [])[1];
    if (!href || href.startsWith("data:")) continue;
    const sizes = (tag.match(/\bsizes=["']?(\d+)x\d+/i) || [])[1];
    let score = sizes ? Number(sizes) : 32;
    if (rel.includes("apple-touch-icon")) score = Math.max(score, 180);
    if (/\.svg(\?|$)/i.test(href) || /image\/svg/i.test(tag)) score = Math.max(score, 150);
    if (score > 256) score = 256 - score / 1000; // huge images: usable, but last
    try {
      out.push({ url: new URL(href, base).href, score });
    } catch {}
  }
  return out.sort((a, b) => b.score - a.score).map((c) => c.url);
}

async function download(origin) {
  const tries = [];
  try {
    const page = await get(origin, "text/html");
    tries.push(...iconCandidates(page.buf.toString("utf8"), page.url));
  } catch {}
  tries.push(new URL("/favicon.ico", origin).href);
  for (const url of tries.slice(0, 5)) {
    try {
      const { buf } = await get(url, "image/*");
      const type = sniff(buf);
      if (type && buf.length <= MAX_BYTES) return { buf, type };
    } catch {}
  }
  return null;
}

// Letter tile fallback in the link's category color (generated here, so safe).
function letterTile(domain, color) {
  const letter = (domain.replace(/^www\./, "")[0] || "?").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${color}"/><text x="16" y="21.5" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="#fff" text-anchor="middle">${letter}</text></svg>`;
  return new Response(svg, { headers: { ...HEADERS, "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" } });
}

export async function GET(req, { params }) {
  const { domain: raw } = await params;
  const domain = String(raw || "").toLowerCase();
  const color = /^#[0-9a-f]{6}$/i.test(new URL(req.url).searchParams.get("c") || "") ? new URL(req.url).searchParams.get("c") : "#8a8a8a";

  // Only domains of approved links, and only real hostnames.
  const link = /^[a-z0-9.-]{1,253}$/.test(domain) ? getApprovedLinks().find((l) => linkDomain(l.url) === domain) : null;
  if (!link) return letterTile(domain, color);
  let origin;
  try {
    const u = new URL(link.url);
    if (!/^https?:$/.test(u.protocol) || /^(localhost|\d+\.\d+\.\d+\.\d+|\[.*\])$/i.test(u.hostname)) return letterTile(domain, color);
    origin = u.origin;
  } catch {
    return letterTile(domain, color);
  }

  fs.mkdirSync(DIR, { recursive: true });
  const file = path.join(DIR, domain);
  const meta = `${file}.type`;
  const miss = `${file}.miss`;

  if (fs.existsSync(file) && fs.existsSync(meta)) {
    return new Response(fs.readFileSync(file), {
      headers: { ...HEADERS, "Content-Type": fs.readFileSync(meta, "utf8"), "Cache-Control": "public, max-age=604800" },
    });
  }
  if (fs.existsSync(miss) && Date.now() - fs.statSync(miss).mtimeMs < MISS_RETRY_MS) return letterTile(domain, color);

  if (!inflight.has(domain)) {
    inflight.set(
      domain,
      download(origin).finally(() => inflight.delete(domain))
    );
  }
  const got = await inflight.get(domain);
  if (!got) {
    fs.writeFileSync(miss, "");
    return letterTile(domain, color);
  }
  fs.writeFileSync(file, got.buf);
  fs.writeFileSync(meta, got.type);
  fs.rmSync(miss, { force: true });
  return new Response(got.buf, { headers: { ...HEADERS, "Content-Type": got.type, "Cache-Control": "public, max-age=604800" } });
}
