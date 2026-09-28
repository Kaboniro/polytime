import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { geographyValues } from "@/lib/geography";

export async function POST(req) {
  const body = await req.json();
  const { title, description, url, host, category, software, geography, event_type, start_date, end_date, submission_deadline, location, submitted_by, submitter_note } = body;

  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO events
      (title, description, url, host, category, software, geography, event_type, start_date, end_date, submission_deadline, location, submitted_by, submitter_note, status)
    VALUES
      (@title, @description, @url, @host, @category, @software, @geography, @event_type, @start_date, @end_date, @submission_deadline, @location, @submitted_by, @submitter_note, 'pending')
  `);
  stmt.run({
    title: title.trim(),
    description: description || null,
    url: url || null,
    host: host || null,
    category: category || "general",
    software: software?.trim() || null,
    geography: geographyValues().includes(geography) ? geography : "international",
    event_type: event_type || "event",
    start_date: start_date || null,
    end_date: end_date || null,
    submission_deadline: submission_deadline || null,
    location: location || "online",
    submitted_by: submitted_by || null,
    submitter_note: submitter_note || null,
  });

  return NextResponse.json({ ok: true });
}
