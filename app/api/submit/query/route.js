import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { QUERY_KINDS } from "@/lib/constants";

// Public endpoint, so it defends itself: length limits, http(s)-only links, a
// hidden honeypot field that only bots fill in, and a small per-address rate
// limit (in memory — resets on restart, which is fine for a single server).
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
const hits = (globalThis.__queryHits ||= new Map());

function tooMany(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
}

const isHttpUrl = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Bots fill every field; pretend it worked and store nothing.
  if (body.website) return NextResponse.json({ ok: true });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (tooMany(ip)) {
    return NextResponse.json({ error: "Too many messages from your connection — please try again later." }, { status: 429 });
  }

  const str = (v) => (v == null ? "" : String(v).trim());
  const kind = str(body.kind);
  const subject = str(body.subject);
  const message = str(body.message);
  const pageUrl = str(body.page_url);
  const contact = str(body.contact);

  const errors = {};
  if (!QUERY_KINDS.some((k) => k.value === kind)) errors.kind = "Choose what this is about.";
  if (!subject) errors.subject = "Add a short subject.";
  else if (subject.length > 200) errors.subject = "Subject is too long (max 200 characters).";
  if (message.length < 10) errors.message = "Please write a little more (at least 10 characters).";
  else if (message.length > 5000) errors.message = "Message is too long (max 5,000 characters).";
  if (pageUrl && (pageUrl.length > 2000 || !isHttpUrl(pageUrl))) errors.page_url = "That must be a full link starting with http:// or https://";
  if (contact && (contact.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact))) errors.contact = "That doesn't look like an email address.";

  if (Object.keys(errors).length) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", errors }, { status: 400 });
  }

  getDb()
    .prepare("INSERT INTO queries (kind, subject, message, page_url, contact) VALUES (@kind, @subject, @message, @page_url, @contact)")
    .run({ kind, subject, message, page_url: pageUrl || null, contact: contact || null });

  return NextResponse.json({ ok: true });
}
