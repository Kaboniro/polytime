import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminRequest } from "@/lib/auth";
import getDb from "@/lib/db";

const TABLES = new Set(["events", "links"]);

export async function POST(req) {
  const cookieStore = await cookies();
  if (!isAdminRequest(cookieStore)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { table, id, action } = await req.json();
  if (!TABLES.has(table)) {
    return NextResponse.json({ error: "Unknown table." }, { status: 400 });
  }
  if (!["approve", "reject", "delete", "archive", "unarchive"].includes(action)) {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  if ((action === "archive" || action === "unarchive") && table !== "events") {
    return NextResponse.json({ error: "Only events can be archived." }, { status: 400 });
  }

  const db = getDb();
  if (action === "delete") {
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
  } else {
    // Archiving hides an approved event from the public site but keeps the row
    // (so the crawler still recognises it and never re-adds it); unarchive
    // puts it back to approved.
    const status = { approve: "approved", unarchive: "approved", reject: "rejected", archive: "archived" }[action];
    db.prepare(`UPDATE ${table} SET status = ? WHERE id = ?`).run(status, id);
  }

  return NextResponse.json({ ok: true });
}
