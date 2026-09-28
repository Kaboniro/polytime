import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function POST(req) {
  const body = await req.json();
  const { title, url, description, category, submitted_by, submitter_note } = body;

  if (!title || !title.trim() || !url || !url.trim()) {
    return NextResponse.json({ error: "Title and URL are required." }, { status: 400 });
  }

  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO links (title, url, description, category, submitted_by, submitter_note, status)
    VALUES (@title, @url, @description, @category, @submitted_by, @submitter_note, 'pending')
  `);
  stmt.run({
    title: title.trim(),
    url: url.trim(),
    description: description || null,
    category: category || "community",
    submitted_by: submitted_by || null,
    submitter_note: submitter_note || null,
  });

  return NextResponse.json({ ok: true });
}
